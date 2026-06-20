# Venti.ai / Advisor360 AI Platform

Advisor360 AI (Venti.ai) is a modern, high-fidelity platform built for financial advisors and advisory firms. Designed with a striking "Newsprint" Neo-Brutalist aesthetic, the platform integrates live client relationship management (CRM) with smart calendar scheduling, regulatory compliance tracking, and AI-driven intelligence.

To bridge the gap between advisors and their clients, the platform features a web-based **Advisor Dashboard** and an asynchronous customer-facing **Telegram Booking Bot**.

---

## 📂 Repository Structure

- **`Frontend/`**: The React + Vite client web application, coupled with a Node.js Google Calendar API helper server.
- **`Backend/`**: The Spring Boot REST API layer connected to the MySQL database.
- **`booking_bot_project/`**: A Python-based Telegram booking daemon core and retention worker engine.
- **`database/`**: Contains the **Entity Relationship Diagram (`ERD.png`)** for database design visualization and the exported DDL construction script (`schema.sql`) to initialize your MySQL database.

---

## 🏛️ System Architecture

### 1. Advisor Platform (Dashboard)
The platform operates as a secure, distributed multi-tier architecture:

```text
       ┌────────────────────────────────────────────────────────┐
       │                     React Frontend                     │
       │                   (Vite Dev Server)                    │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                                  ├───────────────┐ (Proxied via Vite Config)
                                  ▼               ▼
                        ┌───────────┐       ┌───────────┐
                        │Node Server│       │Spring Boot│
                        │(Port 3001)│       │(Port 8080)│
                        └─────┬─────┘       └─────┬─────┘
                              │                   │ (Spring Data JPA)
                              ▼                   ▼
                        ┌───────────┐       ┌───────────┐
                        │Google Cal │       │MySQL DB   │
                        │    API    │       │(Port 3306)│
                        └───────────┘       └───────────┘
```

- **Frontend**: Styled with a Neo-Brutalist, custom newsprint-inspired design system.
- **Node.js Helper Server**: Proxies `/api/calendar` calls to manage calendar events via the **Google Calendar API** using Service Account OAuth credentials.
- **Spring Boot Backend**: Exposes client record management REST endpoints under `/api/clients` on port `8080`.
- **MySQL Database**: Acts as the system of record for client memory and advisor settings.

### 2. Telegram Bot Integration
The Telegram Bot integrates natively into the wider Advisor360 AI eco-system as the customer-facing bridge:

```text
┌────────────────────────────────────────────────────────┐
│                      Telegram Client                   │
│                     (User Interaction)                 │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Telegram    │
                    │  Bot API     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐       ┌────────────────────┐
                    │ Python Bot   │◄─────►│ Grafilab LLM API   │
                    │ Engine       │       │ (Qwen-3.6-Flash)   │
                    └──────┬───────┴───────└────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
     ┌──────────────┐              ┌──────────────┐
     │  SQLite DB   │              │ Google Cal   │
     │(Interactions)│              │     API      │
     └──────────────┘              └──────────────┘
```

- **Telegram Bot Engine (`bot.py`)**: Asynchronously listens for messages, managing states and interactions.
- **Grafilab LLM Engine**: Employs `grafilab/qwen3.6-flash` over an OpenAI-compatible endpoint to extract dates, intents, and client requirements.
- **Google Calendar API**: Books and patches appointment intervals directly using shared Service Account access tokens.
- **SQLite Database**: Serves as the localized interaction layer, logging historical data points to keep information aligned with the core dashboard tracking.
- **Follow-up Engine (`followup.py`)**: Background cron engine evaluating dormant leads to trigger smart re-engagement outreach.

---

## 🛠️ Technology Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend Dashboard** | React (v19), Vite, Tailwind CSS, Lucide React icons, local storage |
| **Backend API** | Java 17, Spring Boot (v3.5.x), Spring Data JPA, Jakarta Validation, Lombok |
| **Node Helper Server** | Node.js, Express, CORS, Googleapis v173 |
| **Database System** | MySQL / MariaDB (port 3306) |
| **Telegram Bot Engine** | Python, `pyTelegramBotAPI` (Async runtimes), SQLite 3, Docker |
| **AI Integration** | Google Gemini Pro API, OpenAI Python SDK, Pydantic (Structured Outputs), Grafilab API (`grafilab/qwen3.6-flash`) |

---

## 🌟 Core Features

### Advisor Dashboard
1. **Smart Calendar & Schedule AI**: Live synchronization with Google Calendar. Conversational schedule AI to add, edit, or remove meetings through chat.
2. **Client Memory (CRM)**: End-to-end client record tracking synced directly with MySQL. AI Opportunity & Vulnerability analysis. AI meeting log summarization.
3. **Learning Hub & CPD Tracker**: Tracks continuing professional development (CPD) points. AI Regulatory Inquiry Desk. Custom publishing form.
4. **Partner Finder**: Directory of trusted professionals with AI referral matching.

### Telegram Client Bot
1. **Natural Language Appointment Booking**: Clients chat with the bot casually (e.g. *"Can we meet tomorrow at 3 PM?"*). The AI parses date/time parameters and registers the event instantly.
2. **Automated Calendar Synchronization**: Direct server-to-server booking using Google Service Account keys.
3. **Local CRM Interaction Logging**: Captures chat entries locally in `interactions.db`, tracking conversation states, background notes, and last contact.
4. **Proactive Client Re-engagement**: A background process (`followup.py`) scans for idle users and issues context-aware follow-ups automatically.

---

## 🚀 Getting Started & Local Setup

Ensure you have **Node.js**, **Java 17 (JDK)**, **Python 3.10+**, and **MySQL** (via XAMPP or Docker) installed on your system.

### Step 1: Database Setup
1. Start your MySQL Server on port `3306`.
2. Create a new database named `advisor360_db`:
   ```sql
   CREATE DATABASE advisor360_db;
   ```
3. Import **`database/schema.sql`** into the `advisor360_db` database to construct all entity tables (including `advisor` and `client` tables and their foreign key relationships).
4. Start XAMPP and verify the schema matches phpMyAdmin.

### Step 2: Spring Boot Backend Setup
1. Open a terminal at the `/Backend` directory.
2. Run the application:
   - **On Windows:** `mvnw.cmd spring-boot:run`
   - **On Linux/macOS:** `./mvnw spring-boot:run`
   *(Or run `Advisor360Application.java` directly inside IntelliJ IDEA).*
3. The server runs at: `http://localhost:8080`

### Step 3: Configure Google Calendar & API Credentials
1. Create a project in the Google Cloud Console, enable the **Google Calendar API**, and generate a **Service Account JSON Key**.
2. Save this downloaded file as `credentials.json` in both:
   - The `/Frontend` directory (for the dashboard).
   - The `/booking_bot_project` directory (for the Telegram bot).
3. Copy the `client_email` from the JSON, open your target Google Calendar settings, and share it with that email address with **"Make changes to events"** permissions.
4. Update the calendar ID inside `/Frontend/server.js` (`TARGET_CALENDAR_ID`) and environment variables.

### Step 4: Run the Telegram Bot & Follow-up Engine
1. Obtain a Telegram Bot Token from `@BotFather` and a Grafilab API Key.
2. Open a terminal at the `/booking_bot_project` directory.

#### Option A: Local Native Deployment (Python)
1. **Set Environment Variables**:
   - **Windows (PowerShell):**
     ```powershell
     $env:TELEGRAM_TOKEN="your_telegram_bot_token_here"
     $env:GRAFILAB_API_KEY="your_grafilab_api_key_here"
     ```
   - **Linux/macOS:**
     ```bash
     export TELEGRAM_TOKEN="your_telegram_bot_token_here"
     export GRAFILAB_API_KEY="your_grafilab_api_key_here"
     ```
2. **Install and Run**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python bot.py
   ```
3. **Start the Follow-up Engine** (in a separate terminal with same environment variables):
   ```bash
   python followup.py
   ```

#### Option B: Containerized Deployment (Docker)
1. **Build the Image**:
   ```bash
   docker build -t telegram-booking-bot .
   ```
2. **Run the Interactive Bot Container**:
   ```bash
   docker run -d \
     --name booking-bot-instance \
     -e TELEGRAM_TOKEN="your_telegram_bot_token_here" \
     -e GRAFILAB_API_KEY="your_grafilab_api_key_here" \
     -v $(pwd)/credentials.json:/app/credentials.json \
     -v $(pwd)/interactions.db:/app/interactions.db \
     telegram-booking-bot
   ```
3. **Run the Background Follow-up Worker Container**:
   ```bash
   docker run -d \
     --name fallback-worker-instance \
     -e TELEGRAM_TOKEN="your_telegram_bot_token_here" \
     -e GRAFILAB_API_KEY="your_grafilab_api_key_here" \
     -v $(pwd)/interactions.db:/app/interactions.db \
     telegram-booking-bot python followup.py
   ```

### Step 5: Run the Frontend Dashboard
1. Open a terminal at `/Frontend`.
2. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```
   *(This starts concurrently both the Node calendar server on port `3001` and the Vite dev server on port `5173`).*
3. Open **`http://localhost:5173/`** in your browser.
*(If you get script execution errors on Windows PowerShell, run: `powershell -ExecutionPolicy Bypass -Command "npm run dev"`).*

---

> 🔍 **Validation & Testing Note**
> Start your Telegram Bot, type `/start`, and send a test message: *"Hey, can I book a session for tomorrow afternoon at 3 PM to look over my portfolio?"* The AI will parse the intent, book it on Google Calendar, and it will instantly sync onto your Advisor360 Web Dashboard.
