# PELBIOT Developer Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Backend Setup
cd backend
npm install pdfkit exceljs

# Start Backend
npm start

# Start WebSocket Server
node Socket.IO/server-real-time.js

# Start Frontend
npm start

# Test API
npm test
```

---

## 📡 API Quick Reference

### Authentication Headers
```javascript
// JWT Token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// API Key
X-API-Key: your-api-key-here
```

### Common Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | User login |
| GET | `/api/devices` | List devices |
| POST | `/api/alerts/{id}/acknowledge` | Acknowledge alert |
| POST | `/api/reports/advanced/generate` | Generate report |
| POST | `/api/reports/advanced/analytics/statistics` | Calculate stats |
| POST | `/api/reports/advanced/schedule` | Schedule report |

---

## 🔧 Key Classes & Methods

### ReportGenerator
```javascript
generatePDFReport(data, fileName)
generateExcelReport(data, fileName)
generateJSONReport(data, fileName)
generateCSVReport(data, fileName)
```

### AnalyticsEngine
```javascript
calculateStatistics(data)          // min, max, avg, median, stdDev
groupByCategory(data, key)         // Group array by category
generateTrendData(data, dateKey, valueKey, period)
calculateStdDev(data)              // Standard deviation
```

### ReportScheduler
```javascript
scheduleReport(config, frequency)      // 'hourly'|'daily'|'weekly'|'monthly'
getScheduledReports()
removeScheduledReport(reportId)
calculateNextRun(frequency)
```

### EmailService
```javascript
sendAlertNotification(options)
sendReportEmail(options)
sendWelcomeEmail(options)
sendPasswordResetEmail(options)
```

---

## 📊 Common Report Data Format

```javascript
{
  title: "Report Title",
  summary: {
    "Metric 1": "Value 1",
    "Metric 2": "Value 2"
  },
  tables: [
    {
      title: "Table Name",
      headers: ["Col 1", "Col 2", "Col 3"],
      rows: [
        ["Val1", "Val2", "Val3"],
        ["Val1", "Val2", "Val3"]
      ]
    }
  ],
  charts: [
    {
      name: "Chart Name",
      type: "line" // or "bar", "pie", etc.
    }
  ]
}
```

---

## 🔐 Authentication Flow

```
1. POST /api/auth/register
   └─> Create new user

2. POST /api/auth/login
   └─> Receive JWT token

3. Include token in all requests
   Authorization: Bearer <token>

4. Token expires after 7 days
   └─> Re-login required
```

---

## 📝 Database Models

### Users
```sql
id, email, username, role, password, department, status, createdAt
Roles: superadmin | admin | operator | viewer
```

### Devices
```sql
id, deviceId, deviceName, deviceType, status, location, 
manufacturer, serialNumber, firmware, lastUpdate, createdAt
```

### Alerts
```sql
id, deviceId, severity, type, message, status, 
timestamp, acknowledgedAt, resolvedAt, createdAt
Severity: critical | high | medium | low | info
```

### Reports
```sql
id, title, type, format, status, createdBy, filePath,
createdAt, completedAt
Status: pending | processing | completed | failed
```

---

## 🌐 WebSocket Events

### Server → Client
```javascript
socket.on('device-status-update', (data) => {})
socket.on('alert-notification', (alert) => {})
socket.on('data-stream', (metrics) => {})
socket.on('connection-event', (event) => {})
```

### Client → Server
```javascript
socket.emit('subscribe-device', { deviceId: 'METER-001' })
socket.emit('unsubscribe-device', { deviceId: 'METER-001' })
socket.emit('request-live-data', { deviceId: 'METER-001' })
```

---

## 🎨 Error Response Format

```javascript
{
  status: 400,                    // HTTP Status
  error: "ErrorType",             // Error category
  message: "Description",         // Human-readable message
  timestamp: "2025-01-15T..."     // ISO timestamp
}
```

### Common Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## 🛠️ Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=pelbiot

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@pelbiot.com

# WebSocket
WEBSOCKET_PORT=5001
WEBSOCKET_URL=http://localhost:5001

# Reports
REPORTS_DIR=./reports
MAX_REPORT_SIZE=10000000
ARCHIVE_AFTER_DAYS=30
```

---

## 📦 Required Dependencies

```json
{
  "express": "^4.18.0",
  "jsonwebtoken": "^9.0.0",
  "mysql2": "^3.2.0",
  "socket.io": "^4.5.0",
  "nodemailer": "^6.9.0",
  "pdfkit": "^0.13.0",
  "exceljs": "^4.3.0",
  "swagger-ui-express": "^4.6.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0"
}
```

---

## 🧪 Testing Endpoints

### Login & Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pelbiot.com","password":"admin123"}'
```

### Generate PDF
```bash
curl -X POST http://localhost:5000/api/reports/advanced/generate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format":"pdf",
    "data":{"title":"Test","summary":{"Data":"Value"}}
  }'
```

### Get Statistics
```bash
curl -X POST http://localhost:5000/api/reports/advanced/analytics/statistics \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":[1,2,3,4,5]}'
```

---

## 💡 Code Examples

### Generate Report Programmatically
```javascript
import { ReportGenerator } from './utils/reportingModule.js';

const generator = new ReportGenerator();
const result = await generator.generatePDFReport({
  title: 'Monthly Report',
  summary: { Total: '1000 kWh' }
}, 'report.pdf');
```

### Send Email Alert
```javascript
import { EmailService } from './utils/emailService.js';

const emailService = new EmailService();
await emailService.sendAlertNotification({
  recipientEmail: 'user@example.com',
  deviceName: 'METER-001',
  alertMessage: 'High voltage detected'
});
```

### Use WebSocket Client
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

socket.on('alert-notification', (alert) => {
  console.log('New alert:', alert);
});

socket.emit('subscribe-device', { deviceId: 'METER-001' });
```

---

## 🎯 Common Tasks

### Add New API Endpoint
```javascript
// In routes/reports.js
router.post('/custom', authMiddleware, (req, res) => {
  try {
    // Your logic here
    res.json({ status: 'success', data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Create Scheduled Report
```javascript
const scheduler = new ReportScheduler();
scheduler.scheduleReport({
  type: 'energy-report',
  format: 'pdf',
  deviceIds: ['METER-001']
}, 'daily');
```

### Add Permission Check
```javascript
// Use authorize middleware
router.post('/admin-only', 
  authenticateToken, 
  authorize(['admin', 'superadmin']), 
  handler);
```

---

## 📊 Performance Tips

1. **Large Reports:** Use CSV/JSON instead of PDF
2. **Real-time Updates:** Throttle WebSocket events
3. **Database Queries:** Use pagination and indexes
4. **Caching:** Cache frequently accessed data
5. **Rate Limiting:** Implement per-user limits

---

## 🔍 Debugging

### Enable Debug Logging
```javascript
// Add to .env
DEBUG=pelbiot:*

// In code
import debug from 'debug';
const log = debug('pelbiot:component');
log('message', data);
```

### Check WebSocket Connection
```bash
# In browser console
console.log(socket.connected)
socket.on('connect', () => console.log('Connected'))
socket.on('disconnect', () => console.log('Disconnected'))
```

### View API Documentation
```
http://localhost:5000/api-docs
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `docs/API_DOCUMENTATION.md` | Full API reference |
| `docs/INTEGRATION_GUIDE.md` | Integration examples |
| `FEATURES_COMPLETE.md` | Feature overview |
| `Socket.IO/README.md` | WebSocket guide |
| `backend/README.md` | Backend setup |

---

## 🆘 Troubleshooting Checklist

- [ ] Is backend running? (`npm start`)
- [ ] Are dependencies installed? (`npm install`)
- [ ] Is .env file configured?
- [ ] Is database running?
- [ ] Are all required packages installed?
- [ ] Check console for error messages
- [ ] Verify API tokens are valid
- [ ] Check network connectivity

---

**Quick Reference Version:** 2.0.0
**Last Updated:** January 15, 2025
**Keep this handy while developing!** 🚀
