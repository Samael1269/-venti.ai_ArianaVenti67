import os
import time
import sqlite3
import schedule
from datetime import datetime
from openai import OpenAI
from telebot import TeleBot

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN_HERE")
GRAFILAB_API_KEY = os.getenv("GRAFILAB_API_KEY", "YOUR_GRAFILAB_API_KEY_HERE")
DB_PATH = "interactions.db"

bot = TeleBot(TELEGRAM_TOKEN)
ai_client = OpenAI(
    base_url="https://console-api.grafilab.ai/api/oai/v1",
    api_key=GRAFILAB_API_KEY
)


def run_reengagement():
    print(f"[*] Sweeping client engine states at {datetime.now().isoformat()}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Target leads slipping beyond the 48-hour activity window
    cursor.execute('''
        SELECT telegram_id, username FROM clients 
        WHERE last_interaction <= datetime('now', '-2 days') 
          AND follow_up_sent = 0
    ''')

    expired_users = cursor.fetchall()

    for user in expired_users:
        telegram_id, username = user
        try:
            response = ai_client.chat.completions.create(
                # Updated to match the Grafilab naming convention shown in your screenshot
                model="grafilab/qwen3.6-flash",
                messages=[
                    {"role": "system",
                     "content": "You are a warm account strategist. Generate exactly 2 hyper-personalized sentences looking to re-secure an explicit user scheduling slot."},
                    {"role": "user", "content": f"The client's name is {username}."}
                ],
                temperature=0.2,
                top_p=0.9
            )
            outreach_copy = response.choices[0].message.content

            # Removed parse_mode to prevent Telegram API crashes from raw AI text formatting
            bot.send_message(telegram_id, outreach_copy)

            cursor.execute('UPDATE clients SET follow_up_sent = 1 WHERE telegram_id = ?', (telegram_id,))
            conn.commit()
            print(f"[+] Re-engagement dispatched successfully to: {username}")
        except Exception as err:
            print(f"[-] Execution issue targeting user {telegram_id}: {err}")

    conn.close()


if __name__ == "__main__":
    # For hackathons: Schedule every 10 seconds for live judge demos, or change to 1 day for presentation delivery
    schedule.every(10).seconds.do(run_reengagement)
    print("[+] Background Worker Loop engaged cleanly...")
    while True:
        schedule.run_pending()
        time.sleep(1)