import os
import re
import json
import sqlite3
import asyncio
from datetime import datetime, timedelta
from contextlib import contextmanager

# Use the Async version of telebot for high-concurrency hackathon scaling
from telebot.async_telebot import AsyncTeleBot
from openai import OpenAI
from pydantic import BaseModel, Field
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# ==================== CONFIGURATION ====================
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
GRAFILAB_API_KEY = os.getenv("GRAFILAB_API_KEY")
TIMEZONE_STR = "Asia/Kuala_Lumpur"
DB_PATH = "interactions.db"
TARGET_CALENDAR_ID = "shawnsoon.ss@gmail.com"

bot = AsyncTeleBot(TELEGRAM_TOKEN)
ai_client = OpenAI(
    base_url="https://console-api.grafilab.ai/api/oai/v1",
    api_key=GRAFILAB_API_KEY
)


# ==================== GUARANTEED STRUCTURED OUTPUT SCHEMAS ====================
class BookingSchema(BaseModel):
    action: str = Field(
        description="The action type. Can be 'book' to schedule, 'cancel' to delete, 'reschedule' to change date/time, or 'none' for general support chat.")
    summary: str = Field(
        description="Short meeting title or user request description. Empty if action is 'none' or 'cancel'.")
    time: str = Field(
        description="ISO 8601 string (YYYY-MM-DDTHH:MM:SS) parsed relative to current time. Empty if action is 'none' or 'cancel'.")
    conversational_response: str = Field(
        description="Friendly, fluid response answering questions or confirming details.")


# ==================== CONTEXT DRIVEN DB ENGINE ====================
@contextmanager
def db_session():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    try:
        yield conn.cursor()
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def init_db():
    with db_session() as cursor:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS clients (
                telegram_id TEXT PRIMARY KEY,
                username TEXT,
                last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                follow_up_sent INTEGER DEFAULT 0
            )
        ''')


def track_interaction(telegram_id, username):
    with db_session() as cursor:
        cursor.execute('''
            INSERT INTO clients (telegram_id, username, last_interaction, follow_up_sent)
            VALUES (?, ?, CURRENT_TIMESTAMP, 0)
            ON CONFLICT(telegram_id) DO UPDATE SET 
                last_interaction=CURRENT_TIMESTAMP,
                follow_up_sent=0
        ''', (str(telegram_id), username))


# ==================== ASYNC THIRD-PARTY WRAPPERS ====================
async def cancel_booking_async(telegram_id):
    """Searches upcoming events containing the unique Telegram ID in description and deletes them."""

    def _execute():
        SCOPES = ['https://www.googleapis.com/auth/calendar']
        if not os.path.exists('credentials.json'):
            return False
        creds = Credentials.from_service_account_file('credentials.json', scopes=SCOPES)
        service = build('calendar', 'v3', credentials=creds)

        # Get list of upcoming events from now onwards
        now_iso = datetime.now().astimezone().isoformat()
        events_result = service.events().list(
            calendarId=TARGET_CALENDAR_ID,
            timeMin=now_iso,
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        events = events_result.get('items', [])
        deleted_any = False

        for event in events:
            description = event.get('description', '')
            # Match the unique Telegram ID identifier in the description
            if f"Telegram ID: {telegram_id}" in description:
                service.events().delete(calendarId=TARGET_CALENDAR_ID, eventId=event['id']).execute()
                deleted_any = True

        return deleted_any

    return await asyncio.to_thread(_execute)


async def create_booking_async(summary, start_time_str, telegram_id):
    """Executes the Google Calendar blocking operation on a thread pool to avoid freezing the bot loop."""

    def _execute():
        SCOPES = ['https://www.googleapis.com/auth/calendar']
        if not os.path.exists('credentials.json'):
            return False
        creds = Credentials.from_service_account_file('credentials.json', scopes=SCOPES)
        service = build('calendar', 'v3', credentials=creds)

        start_dt = datetime.fromisoformat(start_time_str)
        end_dt = start_dt + timedelta(minutes=45)

        event = {
            'summary': summary,
            # We embed the Telegram ID directly in the description to uniquely identify it later for cancel/reschedule
            'description': f'Automated booking completed by Production-Grade Bot Core System.\nTelegram ID: {telegram_id}',
            'start': {'dateTime': start_dt.isoformat(), 'timeZone': TIMEZONE_STR},
            'end': {'dateTime': end_dt.isoformat(), 'timeZone': TIMEZONE_STR},
        }

        service.events().insert(calendarId=TARGET_CALENDAR_ID, body=event).execute()
        return True

    return await asyncio.to_thread(_execute)


# ==================== TELEGRAM CONTROLLERS ====================
@bot.message_handler(commands=['start', 'help'])
async def send_welcome(message):
    track_interaction(message.chat.id, message.from_user.username or "Client")
    welcome_text = (
        "🚀 **Welcome to the Aether Financial Digital Assistant**\n\n"
        "I can help you manage your insurance portfolio, guide you through claims, "
        "troubleshoot the Aether+ mobile app, or schedule/reschedule/cancel appointments directly with our consultants.\n\n"
        "_*Example Inquiries:*_\n"
        "• 'How do I submit an accident claim?'\n"
        "• 'Book a portfolio review session for tomorrow at 2 PM.'\n"
        "• 'Actually, please reschedule my meeting to this Friday at 3 PM.'\n"
        "• 'I need to cancel my scheduled meeting.'"
    )
    await bot.reply_to(message, welcome_text, parse_mode="Markdown")


@bot.message_handler(func=lambda message: True)
async def handle_incoming_text(message):
    user_id = message.chat.id
    username = message.from_user.username or "Client"
    user_text = message.text

    track_interaction(user_id, username)
    await bot.send_chat_action(user_id, 'typing')

    # Full Customer Support & Agency Rules Engine (With neutral branding and routing)
    system_instruction = """You are an elite automated Customer Service Specialist & Scheduling Engine for Aether Financial Agency. Analyze the user's input carefully. You must provide customer service answers or handle booking routes based on these guidelines:

1. Policy & Portfolio Administration:
   - Policy Servicing: Updates to life, medical, or critical illness plans (updating contact details, changing beneficiaries, adjusting coverage).
   - Claims Assistance: Walk through filing medical/accident/life claims and clarify documentation checks.
   - Premium Management: Billing inquiries, setting up GIRO/auto-debits, or resolving failed transactions.
2. Client Relationship & Digital Support:
   - Aether+ App Navigation: Help users log in, track investments, or view policy details online.
   - Onboarding Support: Guide new applicants through digital paperwork, health declarations, and compliance checks.
3. Recruitment & Agent Inquiries:
   - Guide entrepreneurial young professionals, interns, or financial planner applicants through our onboarding framework.

CRITICAL BEHAVIOR RULES:
- If the user wants to book or schedule a fresh appointment, set 'action' to 'book', generate a brief 'summary' (e.g., 'Aether Policy Review Meeting'), parse the date/time into a valid ISO 8601 string, and provide a short booking confirmation sentence inside 'conversational_response'.
- If the user wants to cancel their upcoming appointment, set 'action' to 'cancel', leave 'summary' and 'time' empty, and write a polite cancel response in 'conversational_response'.
- If the user explicitly wants to change, move, or reschedule their existing appointment, set 'action' to 'reschedule', generate a brief 'summary', parse the new date/time into a valid ISO 8601 string, and write a friendly rescheduling response in 'conversational_response'.
- For all pure informational queries (e.g., questions about claims tracking, app problems, payment guidelines), set 'action' to 'none', leave 'summary' and 'time' empty, and provide your full structured, helpful answer within 'conversational_response'.

OUTPUT FORMAT REQUIREMENT:
You MUST respond ONLY with a raw JSON object string matching this exact layout. Do not use markdown wraps like ```json or any text outside the object structure:
{
  "action": "book" | "cancel" | "reschedule" | "none",
  "summary": "string",
  "time": "ISO 8601 string",
  "conversational_response": "string"
}"""

    try:
        def call_llm():
            return ai_client.chat.completions.create(
                model="grafilab/qwen3.6-flash",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user",
                     "content": f"Context: Local Clock Time is {datetime.now().isoformat()}. User input: '{user_text}'"}
                ],
                temperature=0.1,
                top_p=0.9
            )

        response = await asyncio.to_thread(call_llm)
        raw_content = response.choices[0].message.content.strip()

        # Clean markdown wrappers out if accidentally generated
        raw_content = re.sub(r"^```json\s*|```$", "", raw_content, flags=re.MULTILINE).strip()

        data_dict = json.loads(raw_content)

        action = data_dict.get("action", "none")
        summary = data_dict.get("summary", "")
        booking_time = data_dict.get("time", "")
        conv_response = data_dict.get("conversational_response", "Processing request...")

        if action == "book":
            success = await create_booking_async(f"{summary} ({username})", booking_time, user_id)
            if success:
                success_msg = f"✅ **Booking Confirmed!**\n\n🗓️ **Event:** {summary}\n⏰ **Time:** `{booking_time}`\n\n{conv_response}"
                await bot.send_message(user_id, success_msg, parse_mode="Markdown")
            else:
                await bot.send_message(user_id,
                                       "❌ Infrastructure mapping error. Please check credentials.json configuration.")

        elif action == "cancel":
            deleted_any = await cancel_booking_async(user_id)
            if deleted_any:
                await bot.send_message(user_id, f"🗑️ **Appointment Canceled!**\n\n{conv_response}",
                                       parse_mode="Markdown")
            else:
                await bot.send_message(user_id,
                                       "ℹ️ You do not have any upcoming appointments scheduled on our calendar to cancel.",
                                       parse_mode="Markdown")

        elif action == "reschedule":
            # First, clean sweep any older appointments to prevent double-booking
            await cancel_booking_async(user_id)
            # Create the fresh appointment block
            success = await create_booking_async(f"{summary} ({username})", booking_time, user_id)
            if success:
                reschedule_msg = f"🔄 **Appointment Rescheduled Successfully!**\n\n🗓️ **New Event:** {summary}\n⏰ **New Time:** `{booking_time}`\n\n{conv_response}"
                await bot.send_message(user_id, reschedule_msg, parse_mode="Markdown")
            else:
                await bot.send_message(user_id, "❌ Infrastructure mapping error while rescheduling.")

        else:
            # Deliver full, rich customer service answer directly
            await bot.send_message(user_id, conv_response, parse_mode="Markdown")

    except Exception as e:
        print(f"[-] Global Exception Handler Target Error: {e}")
        await bot.send_message(user_id,
                               "⚠️ I am having trouble accessing your profile context. Could you clarify your question or scheduling request?")


if __name__ == "__main__":
    init_db()
    print(
        "[+] High-Availability Polling System Online with full Customer Service & Multi-Action Calendar Management...")
    asyncio.run(bot.polling(non_stop=True))