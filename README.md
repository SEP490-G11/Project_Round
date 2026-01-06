# Project Round – Task Management System

## Project Overview
Project Round is a **Task Management System** designed to support:
- Task and sub-task management
- Role-based access control (Admin / User)
- Task status tracking and progress monitoring
- Action logging and real-time notifications
- RESTful APIs for frontend integration and external systems

The project aims to simulate a **real-world task management platform**, following a decoupled **Backend–Frontend architecture** and deployed using Docker for consistency and scalability.

---

## Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring Security with JWT authentication
- Spring Data JPA (Hibernate)
- MySQL
- WebSocket (real-time notifications)
- Maven

### Frontend
- React
- TypeScript
- Vite
- Ant Design
- Axios

### DevOps / Deployment
- Docker
- Docker Compose
- Nginx (serving the frontend)

---

## Demo / Screenshots

### Run the project using Docker
```bash
docker compose up -d
