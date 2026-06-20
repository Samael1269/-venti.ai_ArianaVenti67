
Spring Boot and MySQL/MariaDB backend for the Venti.ai, an AI-assisted advisory platform designed to support financial advisors with client management, scheduling, learning resources, and partner referrals.
Project Overview
Advisor360 is a web-based advisory support platform. The advisor is the only system actor, while clients are managed as records inside the system.
This repository contains the backend and database work for the project, including:
Spring Boot REST API
MySQL/MariaDB database integration
Spring Data JPA repositories
Entity relationships based on the project ERD
Client Memory CRUD operations
Validation and exception handling
API testing with Postman
My Responsibility
My responsibility in this project is to develop and maintain the backend and database layer.
Main responsibilities:
Design and implement the Spring Boot backend
Connect Spring Boot to MySQL/MariaDB
Convert the ERD into database tables and JPA entities
Build REST APIs for frontend integration
Implement CRUD operations for client records
Add validation and centralized exception handling
Test API endpoints using Postman
Prepare the backend for future AI service integration
Technology Stack
Backend
Java 17
Spring Boot 3.5.15
Spring Web
Spring Data JPA
Hibernate
Jakarta Validation
Lombok
Maven
Database
MySQL/MariaDB
XAMPP
phpMyAdmin
MySQL Workbench
Development Tools
IntelliJ IDEA
Postman
Git and GitHub
Current Features
Client Memory API
The current backend supports:
Registering a new client
Retrieving all clients assigned to an advisor
Retrieving one client by ID
Updating an existing client
Deleting a client
Validating client input
Returning structured error responses
API Endpoints
Method	Endpoint	Description
GET	`/api/clients?advisorId={id}`	Get all clients for an advisor
GET	`/api/clients/{clientId}`	Get one client
POST	`/api/clients`	Register a new client
PUT	`/api/clients/{clientId}`	Update a client
DELETE	`/api/clients/{clientId}`	Delete a client
Example Request
Register a client
```http
POST http://localhost:8080/api/clients
Content-Type: application/json
```
```json
{
  "advisorId": 1,
  "fullName": "John Tan",
  "email": "john.tan@email.com",
  "phone": "+60123456789",
  "backgroundNotes": "Interested in retirement planning.",
  "lastContactDate": "2026-06-20"
}
```
Database Structure
The database is named:
```text
advisor360_db
```
Main tables include:
`advisor`
`advisor_settings`
`client`
`client_interaction`
`meeting`
`task`
`ai_summary`
`ai_conversation`
`learning_category`
`learning_content`
`learning_progress`
`partner_category`
`partner`
`referral`
Project Structure
```text
src/main/java/com/advisor360
├── controller
├── dto
├── entity
├── exception
├── repository
├── service
└── Advisor360Application.java
```
Setup Instructions
1. Clone the repository
```bash
git clone <your-repository-url>
cd advisor360-backend
```
2. Start MySQL/MariaDB
   Start MySQL through XAMPP and make sure the database server is running.
3. Create the database
   Import the SQL schema into phpMyAdmin or MySQL Workbench.
   Database name:
```text
advisor360_db
```
4. Configure Spring Boot
   Update:
```text
src/main/resources/application.properties
```
Example configuration:
```properties
spring.application.name=advisor360

spring.datasource.url=jdbc:mysql://127.0.0.1:3306/advisor360_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kuala_Lumpur
spring.datasource.username=root
spring.datasource.password=

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false

server.port=8080
```
Change port `3306` if your XAMPP MySQL server uses another port such as `3307`.
Do not commit real passwords or API keys to GitHub.
5. Run the application
   In IntelliJ IDEA, run:
```text
Advisor360Application.java
```
Or use Maven:
```bash
./mvnw spring-boot:run
```
On Windows:
```bash
mvnw.cmd spring-boot:run
```
The backend will run at:
```text
http://localhost:8080
```
Testing
Use Postman to test the endpoints.
Example:
```http
GET http://localhost:8080/api/clients?advisorId=1
```
A successful startup should include messages similar to:
```text
HikariPool-1 - Start completed
Tomcat started on port 8080
Started Advisor360Application
```
Frontend Integration
The frontend should connect to the Spring Boot REST API, not directly to MySQL.
```text
Frontend UI
    ↓ HTTP/JSON
Spring Boot REST API
    ↓ Spring Data JPA
MySQL/MariaDB
```
## System Architecture

[![Advisor360 System Architecture](images/system-architecture.png)

## Entity Relationship Diagram

![Advisor360 ERD](images/advisor360-erd.png)

Planned Improvements
Meeting and calendar APIs
Task checklist APIs
Client interaction timeline
Learning Hub APIs
Partner Finder and referral APIs
Authentication and authorization
Gemini/LLM integration
AI-generated meeting summaries
Secure production configuration
Repository Status
This repository is currently under development.
The Client Memory backend and MySQL/MariaDB connection are the first completed modules. Additional modules will be added progressively based on the project requirements.
Author
Satheesan Mathialagan  
Backend and Database Developer  
Spring Boot and MySQL/MariaDB
