# Architecture & System Design

This folder contains system architecture, design patterns, and technical documentation.

## 📋 Contents

### System Architecture
- Overall system design
- Component diagram
- Data flow diagram
- Architecture layers

### Database Schema
- Database design
- Table relationships
- Entity relationship diagram (ERD)
- Schema documentation

### Technology Stack
- Frontend: React with Recharts
- Backend: Node.js with Express
- Database: MySQL
- Real-time: Socket.IO
- Authentication: JWT

### Design Patterns
- MVC pattern
- Controller-Service-Repository pattern
- WebSocket event handling
- Error handling strategy

---

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  Dashboard │ Panels │ Trafo │ Master Data │ Reports    │
└────────────────────┬────────────────────────────────────┘
                     │ Socket.IO & REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Backend (Node.js/Express)               │
│  Controllers │ Services │ Routes │ Middleware           │
└────────────────────┬────────────────────────────────────┘
                     │ SQL Queries
                     ▼
        ┌───────────────────────────┐
        │    MySQL Database        │
        │ 8+ Tables with Real Data │
        └───────────────────────────┘
```

---

## 🔄 Data Flow

1. **Frontend Request** → React component initiates Socket.IO event or REST API call
2. **Backend Processing** → Express controller receives request
3. **Database Query** → Service queries MySQL database
4. **Response** → Data returned to frontend in real-time

---

## 📚 Key Components

### Frontend Structure
```
src/
├── components/    (Reusable UI components)
├── pages/        (Page components)
├── services/     (API & WebSocket services)
├── contexts/     (React Context for state)
└── App.js        (Main application)
```

### Backend Structure
```
backend/
├── controllers/  (Request handlers)
├── routes/       (API endpoints)
├── middleware/   (Authentication, error handling)
├── utils/        (Database, helpers)
└── server.js     (Express server)
```

### Database Structure
```
Tables:
├── users (authentication)
├── panels (solar panel data)
├── transformers (trafo data)
├── weather (weather data)
├── alerts (alert management)
├── devices (device management)
├── trends (trend data)
└── load_profiles (load profile data)
```

---

## 📚 Related Documentation

- **Setup:** [`../setup/`](../setup/)
- **API Reference:** [`../api/`](../api/)
- **Features:** [`../features/`](../features/)
- **Real-Time Implementation:** [`../realtime/`](../realtime/)

---

**Last Updated:** October 29, 2025
