# Venti.ai (Advisor360 AI Platform)

Venti.ai is a modern, high-fidelity platform built for financial advisors and advisory firms. Designed with a striking "Newsprint" Neo-Brutalist aesthetic, the platform integrates live client relationship management (CRM) with smart calendar scheduling, regulatory compliance tracking, and AI-driven intelligence.

To bridge the gap between advisors and their clients, the platform features a web-based **Advisor Dashboard** and an asynchronous customer-facing **Telegram Booking Bot**.

---

## 👥 Team Members

* **Satheesan A/L Mathialagan** (sath.mk1010@gmail.com)
* **Chin Yong Hao** (chinyonghao29@gmail.com)
* **Shawn Soon** (shawnsoon.ss@gmail.com)

---

## 🎯 Challenge and Approach

### The Challenge
Financial advisors face severe administrative bottlenecks due to fragmented tools:
- **Scheduling Friction**: Setting up meetings requires tedious back-and-forth coordination.
- **CRM Administrative Load**: Manual logging of client interactions, background notes, and timeline histories takes up hours of productive time.
- **Compliance Overhead**: Advisors must stay updated on tax laws and compliance standards while keeping track of their Continuing Professional Development (CPD) requirements.

### Our Approach
We built **Venti.ai** as a unified monorepo system combining a backend API, frontend dashboard, and automated Telegram booking agent:
1. **Advisor Dashboard (Frontend)**: Developed a Vite + React web application styled in a retro-minimalist "Newsprint" design system to keep data dense, highly scannable, and aesthetically premium.
2. **REST API (Backend)**: Built a secure **Spring Boot REST API** integrated with a **MySQL database** to handle structured CRUD mutations for client memory.
3. **Natural Language Assistant (Telegram Bot)**: Coded a Python bot that parses natural language messages (e.g. *"Let's meet tomorrow at 10 AM"*), maps client data inside a local SQLite database, and automatically books events via **Google Calendar API** using Service Account scopes.
4. **Calendar Sync**: Created an Express-based polling synchronization helper that seamlessly mirrors the advisor's calendar schedule on the dashboard in real-time.

---

## 🤖 AI Usage Attribution

We credited the following AI engines for assistance during the development of this project:
- **Code & Integration Assistance**: Code integration, MySQL schema mapping, master `.gitignore` setup, and monorepo compilation assisted by **Antigravity** (Advanced Agentic Coding AI designed by the Google DeepMind team).
- **Natural Language Parsing**: Client booking intent analysis and date-time extraction handled by **Grafilab API** (using `grafilab/qwen3.6-flash`).
- **Advisor CRM Intelligence & Inquiry Desk**: Custom client opportunities analysis and compliance information matching powered by **Google Gemini Pro API**.

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

---

## 🛠️ Technologies Used

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

> [!IMPORTANT]
> Ensure you have **Node.js (v18+)**, **Java 17 (JDK)**, **Python 3.10+**, and **MySQL** (via XAMPP or Docker) installed on your system before proceeding.

### Step 1: Database Setup
1. Start your MySQL Server on port `3306`.
2. Create a new database named `advisor360_db`:
   ```sql
   CREATE DATABASE advisor360_db;
   ```
3. > [!IMPORTANT]
   > Import **`database/schema.sql`** into the `advisor360_db` database to construct all entity tables (including `advisor` and `client` tables and their foreign key relationships) before starting the backend.

### Step 2: Spring Boot Backend Setup
1. Open a terminal at the `/Backend` directory.
2. Run the application:
   - **On Windows:** `mvnw.cmd spring-boot:run`
   - **On Linux/macOS:** `./mvnw spring-boot:run`
   *(Or run `Advisor360Application.java` directly inside IntelliJ IDEA).*
3. The server runs at: `http://localhost:8080`

### Step 3: Configure Google Calendar & API Credentials
1. Create a project in the Google Cloud Console, enable the **Google Calendar API**, and generate a **Service Account JSON Key**.
2. > [!IMPORTANT]
   > Save this downloaded file as `credentials.json` in both:
   > - The `/Frontend` directory.
   > - The `/booking_bot_project` directory.
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
4. > [!IMPORTANT]
   > If you get script execution errors on Windows PowerShell, run the following command to bypass the execution policy:
   > ```powershell
   > powershell -ExecutionPolicy Bypass -Command "npm run dev"
   > ```

---

> 🔍 **Validation & Testing Note**
> Start your Telegram Bot, type `/start`, and send a test message: *"Hey, can I book a session for tomorrow afternoon at 3 PM to look over my portfolio?"* The AI will parse the intent, book it on Google Calendar, and it will instantly sync onto your Advisor360 Web Dashboard.
