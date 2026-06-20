# Venti.ai / Advisor360 AI Platform

This repository contains the full integrated codebase and database assets for the **Advisor360 AI** (Venti.ai) platform.

## 📂 Repository Structure

- **`Frontend/`**: The React + Vite client web application, coupled with a Node.js Google Calendar API helper server.
- **`Backend/`**: The Spring Boot REST API layer.
- **`booking_bot_project/`**: A Python-based Telegram booking daemon core and retention worker engine.
- **`database/`**: Contains the **Entity Relationship Diagram (`ERD.png`)** for database design visualization and the exported DDL construction script (`schema.sql`) to initialize your MySQL database.

---

## 🗄️ Database Setup (using schema.sql)

To construct the database on your own machine:
1. Ensure your local MySQL instance is running (e.g. through XAMPP or MySQL Service).
2. Open phpMyAdmin or your MySQL workbench and run the DDL schema script:
   - Create a database named `advisor360_db`:
     ```sql
     CREATE DATABASE advisor360_db;
     ```
   - Import **`database/schema.sql`** into the `advisor360_db` database to construct all entity tables (including `advisor` and `client` tables and their foreign key relationships).

---

## 🚀 Setup & Launch Instructions

Please check the individual directories for detailed configuration and setup steps:

- Read **[Frontend/README.md](Frontend/README.md)** to configure and start the React app & calendar sync server.
- Read **[Backend/README.md](Backend/README.md)** to configure and launch the Spring Boot REST API.
- Read **[booking_bot_project/README.md](booking_bot_project/README.md)** (or inspect its scripts) to configure and run the Telegram bot and Python worker.
