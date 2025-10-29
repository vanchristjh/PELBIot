# Feature Usage Quick Start Guide

## Email Notifications

### Setup

1. Configure SMTP in `.env`:
```env
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@pelbiot.com
```

2. Verify on server startup - Check logs for: `✉️  Email Service: Connected and ready`

### Send Alert Notification
```bash
curl -X POST http://localhost:5000/api/notifications/alert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "alertId": 1,
    "userId": 1,
    "alertName": "High Temperature",
    "severity": "critical",
    "message": "Device temperature exceeded threshold"
  }'
```

### Send Report Email
```bash
curl -X POST http://localhost:5000/api/notifications/report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "reportId": 1,
    "userId": 1,
    "reportName": "Daily Summary",
    "attachmentPath": "/path/to/report.pdf"
  }'
```

### Send Welcome Email
```bash
curl -X POST http://localhost:5000/api/notifications/welcome \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }'
```

### Get User Notifications
```bash
curl http://localhost:5000/api/notifications/1?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Notification Preferences
```bash
curl -X PUT http://localhost:5000/api/notifications/preferences/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "alert_emails": true,
    "report_emails": true,
    "daily_summary": true,
    "critical_only": false,
    "notification_frequency": "immediate"
  }'
```

---

## Advanced Reporting

### Generate Device Summary Report

```bash
curl -X POST http://localhost:5000/api/reports/device-summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "sendEmail": true,
    "recipientEmail": "manager@example.com"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Device summary report generated successfully",
  "reportFile": "device-summary-1-1704067200000.pdf",
  "emailSent": true,
  "reportPath": "/api/reports/download/device-summary-1-1704067200000.pdf"
}
```

### Generate Trend Analysis Report

```bash
curl -X POST http://localhost:5000/api/reports/trend-analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "metric": "power",
    "sendEmail": true,
    "recipientEmail": "analyst@example.com"
  }'
```

Available metrics: `power`, `energy`, `temperature`, `load`

### Generate Alert History Report

```bash
curl -X POST http://localhost:5000/api/reports/alert-history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "sendEmail": false
  }'
```

### Generate Energy Report

```bash
curl -X POST http://localhost:5000/api/reports/energy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "sendEmail": true,
    "recipientEmail": "cfo@example.com"
  }'
```

### Export Data as CSV

```bash
curl -X POST http://localhost:5000/api/reports/csv-export \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "reportType": "trends"
  }'
```

Report types: `summary`, `trends`, `alerts`

### Get All Reports

```bash
curl "http://localhost:5000/api/reports/all?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get My Reports

```bash
curl "http://localhost:5000/api/reports/my-reports?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List Generated Report Files

```bash
curl http://localhost:5000/api/reports/files \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cleanup Old Reports

```bash
curl -X POST http://localhost:5000/api/reports/cleanup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "daysOld": 30
  }'
```

---

## Common Workflows

### Workflow 1: Daily Morning Executive Report

```bash
# 1. Generate energy report
curl -X POST http://localhost:5000/api/reports/energy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-01",
    "sendEmail": true,
    "recipientEmail": "ceo@example.com"
  }'

# 2. Generate alert summary
curl -X POST http://localhost:5000/api/reports/alert-history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-01",
    "sendEmail": true,
    "recipientEmail": "ceo@example.com"
  }'
```

### Workflow 2: Weekly Performance Analysis

```bash
# 1. Generate device summary
curl -X POST http://localhost:5000/api/reports/device-summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-07",
    "sendEmail": true,
    "recipientEmail": "analyst@example.com"
  }'

# 2. Generate trend analysis
curl -X POST http://localhost:5000/api/reports/trend-analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-07",
    "metric": "power",
    "sendEmail": true,
    "recipientEmail": "analyst@example.com"
  }'
```

### Workflow 3: Monthly Compliance Report

```bash
# Generate comprehensive monthly report
curl -X POST http://localhost:5000/api/reports/device-summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "sendEmail": true,
    "recipientEmail": "compliance@example.com"
  }'
```

### Workflow 4: Data Export for External Analysis

```bash
# Export trends data
curl -X POST http://localhost:5000/api/reports/csv-export \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "reportType": "trends"
  }'

# Save to file or import to Excel/BI tools
```

---

## Notification Settings Configuration

### Setup User Notification Preferences

```bash
# Immediate alerts, daily summaries
curl -X PUT http://localhost:5000/api/notifications/preferences/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "alert_emails": true,
    "report_emails": true,
    "daily_summary": true,
    "weekly_summary": false,
    "critical_only": false,
    "notification_frequency": "immediate"
  }'
```

### Setup for Minimal Notifications

```bash
# Only critical alerts, weekly summary
curl -X PUT http://localhost:5000/api/notifications/preferences/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "alert_emails": true,
    "report_emails": false,
    "daily_summary": false,
    "weekly_summary": true,
    "critical_only": true,
    "notification_frequency": "weekly"
  }'
```

### Opt-out of All Notifications

```bash
curl -X PUT http://localhost:5000/api/notifications/preferences/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "alert_emails": false,
    "report_emails": false,
    "daily_summary": false,
    "weekly_summary": false,
    "critical_only": false
  }'
```

---

## Troubleshooting

### Email Not Sending

1. Verify SMTP credentials in `.env`
2. Check server logs for: `✉️  Email Service: Connected and ready`
3. Test with:
```bash
curl -X POST http://localhost:5000/api/notifications/welcome \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"email": "test@example.com", "username": "testuser", "role": "user"}'
```

### Report Generation Fails

1. Verify device exists: `GET /api/devices/:deviceId`
2. Verify data exists in date range
3. Check file permissions on `/backend/reports/` directory
4. Review error message in API response

### Missing Report Files

1. Check `/backend/reports/` directory exists
2. Run cleanup manually: `POST /api/reports/cleanup`
3. Verify disk space available

---

## API Response Examples

### Successful Report Generation

```json
{
  "success": true,
  "message": "Device summary report generated successfully",
  "reportFile": "device-summary-1-1704067200000.pdf",
  "emailSent": true,
  "reportPath": "/api/reports/download/device-summary-1-1704067200000.pdf"
}
```

### Notification Sent

```json
{
  "success": true,
  "message": "Alert notification sent successfully",
  "notificationId": 42,
  "userId": 1,
  "emailStatus": "sent",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response

```json
{
  "error": "Failed to generate report",
  "details": "Device not found"
}
```

---

## Best Practices

1. **Email Configuration**
   - Use Gmail app passwords, not primary password
   - Test configuration before going live
   - Monitor email delivery rates

2. **Report Generation**
   - Schedule heavy reports during off-peak hours
   - Limit date ranges for better performance
   - Export to CSV for large datasets

3. **Notification Management**
   - Set user preferences in onboarding
   - Implement unsubscribe mechanism
   - Monitor notification delivery

4. **Database Maintenance**
   - Run cleanup regularly (weekly recommended)
   - Archive old reports to cold storage
   - Monitor database growth

---

## Support & Documentation

- **Email Notifications**: See `docs/features/EMAIL_NOTIFICATIONS.md`
- **Advanced Reporting**: See `docs/features/ADVANCED_REPORTING.md`
- **API Documentation**: Will be available at `/api-docs` (Swagger UI)
- **Issues**: Check logs at `backend/logs/` or server console

---

**Last Updated**: 2024
**Features Status**: Email Notifications ✅ | Advanced Reporting ✅ | Alert Management ⏳ | API Docs ⏳ | Performance ⏳
