# API Reference

This folder contains API documentation and integration guides.

## 📋 API Categories

### REST API Endpoints
- Panels API
- Devices API
- Transformers API
- Weather Data API
- Alerts API
- Trends API
- Load Profiles API
- Reports API
- System Health API

### WebSocket Events (Socket.IO)
- Real-time data events
- Panel updates
- System status
- Alert notifications
- Device status
- Trend data streaming

### Authentication
- JWT authentication
- Role-based access control
- Token refresh mechanism
- Security headers

---

## 🔌 Quick API Reference

### Base URLs
- **REST API:** `http://localhost:5000/api`
- **WebSocket:** `ws://localhost:5000`

### Authentication Header
```
Authorization: Bearer <JWT_TOKEN>
```

### Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null
}
```

---

## 🚀 Getting Started with API

1. **Authentication:** Obtain JWT token from login endpoint
2. **REST Calls:** Use token in Authorization header
3. **WebSocket:** Connect with Socket.IO client
4. **Real-Time:** Listen to emitted events

---

## 📚 Related Documentation

- **Features:** [`../features/`](../features/)
- **Architecture:** [`../architecture/`](../architecture/)
- **Deployment:** [`../deployment/`](../deployment/)

---

**Last Updated:** October 29, 2025
