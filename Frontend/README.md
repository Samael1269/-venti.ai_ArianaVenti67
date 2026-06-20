# Advisor360 AI (Venti.ai)

Advisor360 AI is a modern, high-fidelity platform built for financial advisors and advisory firms. Designed with a striking "Newsprint" Neo-Brutalist aesthetic, the platform integrates live client relationship management (CRM) with smart calendar scheduling, regulatory compliance tracking, and AI-driven intelligence.

---

## 🏛️ System Architecture

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

1. **Frontend (Vite + React)**: Serves the visual experience. Styled with a Neo-Brutalist, custom newsprint-inspired design system. 
2. **Node.js Helper Server**: Proxies `/api/calendar` calls to fetch, insert, and delete calendar events via the **Google Calendar API** using Service Account OAuth credentials.
3. **Spring Boot Backend**: Exposes client record management REST endpoints under `/api/clients` on port `8080`.
4. **MySQL Database**: Acts as the system of record for client memory and advisor settings.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (v19), Vite, Tailwind CSS, Lucide React icons, local storage |
| **Backend API** | Java 17, Spring Boot (v3.5.x), Spring Data JPA, Jakarta Validation, Lombok |
| **Helper Server** | Node.js, Express, CORS, Googleapis v173 |
| **Database** | MySQL / MariaDB (port 3306) |
| **AI Integration**| Google Gemini Pro API, callGrafilab intelligence endpoints |

---

## 🌟 Core Features

1. **Smart Calendar & Schedule AI**
   - Live synchronization with Google Calendar via Service Account keys.
   - Interactive calendar grid allowing advisors to manage scheduling meetings.
   - Conversational schedule AI to add, edit, or remove meetings through chat commands.
   
2. **Client Memory (CRM)**
   - End-to-end client record tracking (name, email, phone, background notes, last contact date) synced directly with MySQL.
   - Opportunities & Vulnerability Index: AI analyzes stored notes to suggest custom opportunities and warning indicators.
   - AI Meeting Summarizer: Paste raw meeting logs to extract structured summaries and follow-ups.
   - Interactive local timeline storage mapped by database ID to log historical interactions.

3. **Learning Hub & CPD Tracker**
   - Tracks continuing professional development (CPD) points against compliance targets.
   - Interactive knowledge center for regulatory, tax, and compliance topics.
   - AI Regulatory Inquiry Desk: Conversational assistant answering compliance questions based on library materials.
   - Custom publishing form to add new literature directly to the curriculum.

4. **Partner Finder**
   - Directory of trusted tax, legal, and mortgage professionals.
   - AI Referral recommendation matching engine based on client requirements.

---

## 🚀 Getting Started & Local Setup

Ensure you have **Node.js**, **Java 17 (JDK)**, and **MySQL** (such as via XAMPP) installed on your system.

### Step 1: Database Setup
1. Start your MySQL Server (via XAMPP, Docker, or local Windows Service) on port `3306`.
2. Create a new database named:
   ```sql
   CREATE DATABASE advisor360_db;
   ```
3. The Spring Boot backend uses `spring.jpa.hibernate.ddl-auto=validate`. Ensure you run schema creation scripts first or configure Spring Boot to generate the tables (`update` or `create`).

### Step 2: Run the Spring Boot Backend
1. Open a terminal at your Spring Boot project directory (`C:\Users\ASUS\Desktop\ArianaVenti67`).
2. Run the application using the Maven wrapper:
   - **On Linux/macOS:**
     ```bash
     ./mvnw spring-boot:run
     ```
   - **On Windows:**
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   *(Or import the project into IntelliJ IDEA and run `Advisor360Application.java` directly).*
3. The server runs at: **`http://localhost:8080`**

### Step 3: Configure Calendar Credentials (Optional)
If you want to sync meetings with Google Calendar:
1. Place your Service Account credentials inside `credentials.json` in the frontend root directory (`c:\Users\ASUS\Desktop\advisor360-ai\credentials.json`).
2. Update the target calendar ID inside `server.js` (`const TARGET_CALENDAR_ID = "your-email@gmail.com"`).

### Step 4: Run the Frontend & Node Helper
1. Open a terminal at the React project directory (`c:\Users\ASUS\Desktop\advisor360-ai`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *(This starts concurrently both the Node calendar server on port `3001` and the Vite dev server on port `5173`).*
4. Navigate to **`http://localhost:5173/`** in your browser.

> [!NOTE]
> **Windows Script Execution Restrictions**
> If you get a script execution policy error while running `npm run dev` on Windows PowerShell, run the following bypass command:
> ```powershell
> powershell -ExecutionPolicy Bypass -Command "npm run dev"
> ```
