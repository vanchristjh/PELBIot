# PELBIOT Integration Guide - Advanced Features

## Feature Integration Checklist

### ✅ Feature 1: Email Notification Service
- **Status:** Complete
- **File:** `backend/utils/emailService.js`
- **Integration Points:**
  - Alert controller (send email on alert)
  - Report controller (send reports via email)
  - User management (welcome/password reset emails)

### ✅ Feature 2: WebSocket Real-time Updates
- **Status:** Complete
- **Directory:** `Socket.IO/`
- **Integration Points:**
  - Device status updates
  - Alert notifications
  - Live data streaming

### ✅ Feature 3: Advanced Reporting Module
- **Status:** Complete
- **File:** `backend/utils/reportingModule.js`
- **Features:**
  - PDF, Excel, JSON, CSV export
  - Statistical analysis
  - Trend generation
  - Report scheduling

### ✅ Feature 4: Swagger API Documentation
- **Status:** Complete
- **File:** `backend/utils/swaggerDefinition.js`
- **File:** `docs/API_DOCUMENTATION.md`

---

## Quick Start Guide

### 1. Setting Up Reporting Module

**Backend Integration:**

```javascript
import { ReportGenerator, AnalyticsEngine, ReportScheduler } from './utils/reportingModule.js';

// Initialize
const reportGen = new ReportGenerator();
const analytics = new AnalyticsEngine();
const scheduler = new ReportScheduler();

// Generate PDF Report
const data = {
  title: 'Monthly Report',
  summary: { Total: 1000, Average: 50 },
  tables: [{
    title: 'Data',
    headers: ['Device', 'Status'],
    rows: [['METER-001', 'Online']]
  }]
};

const result = await reportGen.generatePDFReport(data, 'report.pdf');
console.log(result); // { status: 'success', filePath: '...', fileName: 'report.pdf' }
```

### 2. Using Analytics Engine

```javascript
// Calculate statistics
const data = [10, 20, 30, 40, 50];
const stats = analytics.calculateStatistics(data);
console.log(stats);
// Output:
// {
//   count: 5,
//   sum: 150,
//   average: 30,
//   median: 30,
//   min: 10,
//   max: 50,
//   stdDev: 14.14...
// }

// Group data
const items = [
  { type: 'meter', value: 100 },
  { type: 'sensor', value: 200 },
  { type: 'meter', value: 150 }
];
const grouped = analytics.groupByCategory(items, 'type');
console.log(grouped);
// Output:
// {
//   meter: [{ type: 'meter', value: 100 }, ...],
//   sensor: [{ type: 'sensor', value: 200 }]
// }

// Generate trends
const data = [
  { timestamp: '2025-01-01', energy: 100 },
  { timestamp: '2025-01-02', energy: 105 },
  { timestamp: '2025-01-03', energy: 102 }
];
const trends = analytics.generateTrendData(data, 'timestamp', 'energy', 'daily');
console.log(trends);
// Output:
// [
//   { period: '2025-01-01', average: 100, total: 100, count: 1 },
//   { period: '2025-01-02', average: 105, total: 105, count: 1 },
//   { period: '2025-01-03', average: 102, total: 102, count: 1 }
// ]
```

### 3. Scheduling Reports

```javascript
// Schedule a report
const schedule = scheduler.scheduleReport({
  type: 'energy-report',
  format: 'pdf',
  recipients: ['admin@example.com'],
  deviceIds: ['METER-001', 'METER-002']
}, 'daily');

console.log(schedule);
// Output:
// {
//   id: 'schedule-xyz',
//   type: 'energy-report',
//   frequency: 'daily',
//   nextRun: 2025-01-16T00:00:00Z,
//   createdAt: 2025-01-15T15:30:00Z
// }

// Get all scheduled reports
const allSchedules = scheduler.getScheduledReports();

// Remove a schedule
scheduler.removeScheduledReport('schedule-xyz');
```

### 4. Using Reporting API Endpoints

**Generate PDF Report:**
```bash
curl -X POST http://localhost:5000/api/reports/advanced/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "pdf",
    "fileName": "report.pdf",
    "data": {
      "title": "Monthly Report",
      "summary": {"Total": "1000 kWh"},
      "tables": []
    }
  }'
```

**Calculate Statistics:**
```bash
curl -X POST http://localhost:5000/api/reports/advanced/analytics/statistics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [100, 105, 102, 108, 95]
  }'
```

**Generate Trends:**
```bash
curl -X POST http://localhost:5000/api/reports/advanced/analytics/trends \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {"timestamp": "2025-01-01", "value": 100},
      {"timestamp": "2025-01-02", "value": 105}
    ],
    "dateKey": "timestamp",
    "valueKey": "value",
    "period": "daily"
  }'
```

**Schedule Report:**
```bash
curl -X POST http://localhost:5000/api/reports/advanced/schedule \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "daily",
    "reportConfig": {
      "type": "energy-report",
      "format": "pdf",
      "deviceIds": ["METER-001"]
    }
  }'
```

---

## File Structure

```
backend/
├── utils/
│   ├── reportingModule.js          ← NEW: Report generation & analytics
│   ├── emailService.js             ← Email notifications
│   ├── swaggerDefinition.js        ← API documentation
│   └── database.js
├── routes/
│   ├── reports.js                  ← Enhanced with advanced endpoints
│   ├── alerts.js
│   └── devices.js
├── controllers/
│   └── reportController.js         ← Existing report endpoints
└── package.json

docs/
├── API_DOCUMENTATION.md            ← NEW: Complete API reference
├── INDEX.md
└── ...

Socket.IO/
├── client-real-time.html           ← WebSocket client
├── server-real-time.js             ← WebSocket server
└── README.md
```

---

## Environment Setup

### Install Dependencies

```bash
cd backend

# For reporting features
npm install pdfkit exceljs

# For email service (already configured)
npm install nodemailer

# For API documentation
npm install swagger-ui-express swagger-jsdoc
```

### Configuration

**`.env` file:**
```
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=pelbiot

# WebSocket
WEBSOCKET_PORT=5001

# Reports
REPORTS_DIR=./reports
MAX_REPORT_SIZE=10000000
```

---

## Testing the Integration

### 1. Test Report Generation

```bash
# Start the server
npm start

# In another terminal, generate a PDF
curl -X POST http://localhost:5000/api/reports/advanced/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "pdf",
    "data": {
      "title": "Test Report",
      "summary": {"Test": "Success"}
    }
  }'
```

### 2. Test Analytics

```bash
curl -X POST http://localhost:5000/api/reports/advanced/analytics/statistics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": [1, 2, 3, 4, 5]}'
```

### 3. Test Email Service

```javascript
// In your controller or service
import { EmailService } from '../utils/emailService.js';

const emailService = new EmailService();
await emailService.sendAlertNotification({
  recipientEmail: 'user@example.com',
  deviceName: 'METER-001',
  alertMessage: 'High voltage detected'
});
```

---

## Troubleshooting

### Report Generation Fails

**Issue:** `Cannot find module 'pdfkit'`
- **Solution:** `npm install pdfkit` in the backend directory

### Email Not Sending

**Issue:** SMTP authentication error
- **Solution:** Check `.env` file has correct SMTP credentials
- Ensure "Less secure app access" is enabled for Gmail

### WebSocket Not Connecting

**Issue:** WebSocket connection refused
- **Solution:** Ensure WebSocket server is running on port 5001
- Check firewall settings

### API Documentation Not Loading

**Issue:** Swagger UI not accessible
- **Solution:** Ensure `swagger-ui-express` is installed
- Check `/api-docs` endpoint is configured in main server file

---

## Performance Optimization

### Report Generation

- Large reports can take time; consider chunking data
- Use CSV/JSON for very large datasets (faster than PDF)
- Cache frequently generated reports

### Database Queries

- Add indexes for date-based queries
- Use pagination for large result sets
- Cache analytics calculations

### WebSocket

- Limit broadcast frequency to necessary intervals
- Use message compression for large updates
- Implement exponential backoff for reconnection

---

## Security Considerations

### API Authentication
✅ JWT token validation on all endpoints
✅ Role-based authorization checks
✅ CORS configuration

### Data Protection
✅ Sensitive data not logged
✅ Reports stored securely
✅ Email credentials in environment variables

### Rate Limiting
Recommended rate limits per user:
- Report generation: 100/hour
- API calls: 1000/hour
- File downloads: 50/hour

---

## Next Steps

1. **Frontend Integration**: Update React components to use new reporting APIs
2. **Database Integration**: Connect reporting to real device data
3. **Monitoring**: Set up logging for report generation and email sending
4. **Testing**: Write comprehensive unit and integration tests
5. **Deployment**: Package and deploy to production

---

## Support & Documentation

- **API Docs:** See `docs/API_DOCUMENTATION.md`
- **Email Service:** See `backend/utils/emailService.js` comments
- **Real-time Updates:** See `Socket.IO/README.md`
- **Database Schema:** See `backend/database.sql`

---

**Last Updated:** January 15, 2025
**Version:** 2.0.0
