# PELBIOT API Documentation - Complete Reference

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Devices API](#devices-api)
4. [Alerts API](#alerts-api)
5. [Reports API](#reports-api)
6. [Advanced Reporting](#advanced-reporting)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Examples](#examples)

## Overview

The PELBIOT API is a production-grade REST API for managing IoT devices, receiving alerts, and generating comprehensive reports.

**Base URL:** `http://localhost:5000/api` or `https://api.pelbiot.com/api`

**API Version:** 2.0.0

**Authentication:** JWT Bearer Token or API Key

## Authentication

### Register New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePassword123!",
  "role": "operator"
}
```

**Response (201):**
```json
{
  "status": "success",
  "user": {
    "id": "uuid-1234",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "operator",
    "status": "active",
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-1234",
    "email": "user@example.com",
    "role": "operator",
    "status": "active"
  }
}
```

### Using Token in Requests

Include the JWT token in the `Authorization` header:

```http
GET /api/devices
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Or use API Key header:

```http
GET /api/devices
X-API-Key: your-api-key-here
```

## Devices API

### List Devices

```http
GET /api/devices?page=1&limit=20&status=online&type=meter
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Results per page (default: 20)
- `status` (string): Filter by status (online, offline, error)
- `type` (string): Filter by device type

**Response (200):**
```json
[
  {
    "id": "device-001",
    "deviceId": "METER-001",
    "deviceName": "Main Meter",
    "deviceType": "meter",
    "status": "online",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St, NYC"
    },
    "manufacturer": "Siemens",
    "model": "7SL89",
    "serialNumber": "SN-12345",
    "firmware": "v2.1.3",
    "lastUpdate": "2025-01-15T14:30:00Z",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### Create Device

```http
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceId": "METER-002",
  "deviceName": "Secondary Meter",
  "deviceType": "meter",
  "location": {
    "latitude": 40.7580,
    "longitude": -73.9855,
    "address": "456 Park Ave, NYC"
  },
  "manufacturer": "Siemens",
  "model": "7SL89",
  "serialNumber": "SN-12346",
  "installDate": "2025-01-15"
}
```

**Response (201):**
```json
{
  "id": "device-002",
  "deviceId": "METER-002",
  "status": "offline",
  "createdAt": "2025-01-15T15:00:00Z"
}
```

### Get Device Details

```http
GET /api/devices/{deviceId}
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "device-001",
  "deviceId": "METER-001",
  "deviceName": "Main Meter",
  "status": "online",
  "lastUpdate": "2025-01-15T14:30:00Z"
}
```

### Update Device

```http
PUT /api/devices/{deviceId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceName": "Main Meter Updated",
  "status": "maintenance"
}
```

### Delete Device

```http
DELETE /api/devices/{deviceId}
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Device deleted successfully"
}
```

## Alerts API

### Get Alerts

```http
GET /api/alerts?severity=high&status=active&page=1
Authorization: Bearer <token>
```

**Query Parameters:**
- `severity`: critical, high, medium, low, info
- `status`: active, acknowledged, resolved
- `deviceId`: Filter by device
- `page`: Page number

**Response (200):**
```json
[
  {
    "id": "alert-001",
    "deviceId": "METER-001",
    "severity": "high",
    "type": "voltage_anomaly",
    "message": "Voltage exceeds maximum threshold",
    "status": "active",
    "timestamp": "2025-01-15T14:25:00Z",
    "createdAt": "2025-01-15T14:25:00Z"
  }
]
```

### Acknowledge Alert

```http
POST /api/alerts/{alertId}/acknowledge
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "alert-001",
  "status": "acknowledged",
  "acknowledgedAt": "2025-01-15T14:30:00Z"
}
```

### Resolve Alert

```http
POST /api/alerts/{alertId}/resolve
Authorization: Bearer <token>
```

## Reports API

### List Reports

```http
GET /api/reports
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "report-001",
    "title": "Device Summary Report",
    "type": "device-summary",
    "format": "pdf",
    "status": "completed",
    "createdBy": "user@example.com",
    "createdAt": "2025-01-14T10:00:00Z",
    "completedAt": "2025-01-14T10:05:00Z",
    "filePath": "/reports/report-001.pdf"
  }
]
```

### Generate Device Summary Report

```http
POST /api/reports/device-summary
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceIds": ["METER-001", "METER-002"],
  "startDate": "2025-01-01",
  "endDate": "2025-01-15"
}
```

### Generate Trend Report

```http
POST /api/reports/trend-analysis
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceId": "METER-001",
  "metric": "voltage",
  "period": "daily",
  "startDate": "2025-01-01",
  "endDate": "2025-01-15"
}
```

### Generate Alert History Report

```http
POST /api/reports/alert-history
Authorization: Bearer <token>
Content-Type: application/json

{
  "severity": ["high", "critical"],
  "startDate": "2025-01-01",
  "endDate": "2025-01-15"
}
```

### Generate Energy Report

```http
POST /api/reports/energy
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceIds": ["METER-001", "METER-002"],
  "period": "monthly",
  "startDate": "2025-01-01",
  "endDate": "2025-01-15"
}
```

### Export as CSV

```http
POST /api/reports/csv-export
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportId": "report-001",
  "includeDetails": true
}
```

## Advanced Reporting

### Generate Report in Multiple Formats

Generate reports in PDF, Excel, JSON, or CSV formats.

```http
POST /api/reports/advanced/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "format": "pdf",
  "fileName": "monthly-report.pdf",
  "data": {
    "title": "Monthly Energy Report",
    "summary": {
      "Total Energy": "15,500 kWh",
      "Average Load": "645 kW",
      "Peak Load": "1,200 kW"
    },
    "tables": [
      {
        "title": "Device Performance",
        "headers": ["Device", "Status", "Energy (kWh)"],
        "rows": [
          ["METER-001", "Online", "7,750"],
          ["METER-002", "Online", "7,750"]
        ]
      }
    ],
    "charts": [
      {
        "name": "Energy Consumption Trend",
        "type": "line"
      }
    ]
  }
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "PDF report generated",
  "filePath": "/reports/monthly-report.pdf",
  "fileName": "monthly-report.pdf"
}
```

### Calculate Statistics

Calculate min, max, average, median, and standard deviation for numeric data.

```http
POST /api/reports/advanced/analytics/statistics
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": [100, 105, 102, 108, 95, 110, 98]
}
```

**Response (200):**
```json
{
  "status": "success",
  "statistics": {
    "count": 7,
    "sum": 718,
    "average": 102.57,
    "median": 102,
    "min": 95,
    "max": 110,
    "stdDev": 5.16
  }
}
```

### Group Data by Category

```http
POST /api/reports/advanced/analytics/group
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": [
    {"device": "METER-001", "status": "online", "energy": 100},
    {"device": "METER-002", "status": "offline", "energy": 50},
    {"device": "METER-003", "status": "online", "energy": 150}
  ],
  "categoryKey": "status"
}
```

**Response (200):**
```json
{
  "status": "success",
  "grouped": {
    "online": [
      {"device": "METER-001", "energy": 100},
      {"device": "METER-003", "energy": 150}
    ],
    "offline": [
      {"device": "METER-002", "energy": 50}
    ]
  }
}
```

### Generate Trend Analysis

Analyze data trends over time periods (daily, monthly, yearly).

```http
POST /api/reports/advanced/analytics/trends
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": [
    {"timestamp": "2025-01-01", "value": 100},
    {"timestamp": "2025-01-02", "value": 105},
    {"timestamp": "2025-01-03", "value": 102}
  ],
  "dateKey": "timestamp",
  "valueKey": "value",
  "period": "daily"
}
```

**Response (200):**
```json
{
  "status": "success",
  "trends": [
    {
      "period": "2025-01-01",
      "average": 100,
      "total": 100,
      "count": 1
    },
    {
      "period": "2025-01-02",
      "average": 105,
      "total": 105,
      "count": 1
    }
  ]
}
```

### Schedule Recurring Reports

Schedule reports to be generated automatically on a recurring basis.

```http
POST /api/reports/advanced/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "frequency": "daily",
  "reportConfig": {
    "type": "energy-report",
    "format": "pdf",
    "recipients": ["admin@example.com"],
    "deviceIds": ["METER-001", "METER-002"]
  }
}
```

**Response (200):**
```json
{
  "status": "success",
  "schedule": {
    "id": "schedule-001",
    "frequency": "daily",
    "nextRun": "2025-01-16T00:00:00Z",
    "createdAt": "2025-01-15T15:30:00Z"
  }
}
```

### Get Scheduled Reports

```http
GET /api/reports/advanced/scheduled
Authorization: Bearer <token>
```

### Remove Scheduled Report

```http
DELETE /api/reports/advanced/scheduled/{reportId}
Authorization: Bearer <token>
```

## Error Handling

The API uses standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "status": 400,
  "error": "ValidationError",
  "message": "Invalid request parameters",
  "timestamp": "2025-01-15T15:30:00Z"
}
```

### Common Errors

**Missing Token:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "No token provided"
}
```

**Invalid Token:**
```json
{
  "status": 401,
  "error": "TokenExpired",
  "message": "Token has expired"
}
```

**Insufficient Permissions:**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "User role does not have permission"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Standard**: 1,000 requests per hour
- **Premium**: 10,000 requests per hour
- **Enterprise**: Unlimited

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

## Examples

### Complete Workflow: Generate Energy Report

```javascript
// 1. Login
const loginRes = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});
const { token } = await loginRes.json();

// 2. Get devices
const devicesRes = await fetch('http://localhost:5000/api/devices', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const devices = await devicesRes.json();

// 3. Generate report
const reportRes = await fetch('http://localhost:5000/api/reports/energy', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    deviceIds: devices.map(d => d.deviceId),
    period: 'monthly',
    startDate: '2025-01-01',
    endDate: '2025-01-31'
  })
});
const report = await reportRes.json();
console.log('Report generated:', report);
```

---

**Last Updated:** January 15, 2025
**Documentation Version:** 2.0.0
**Maintained by:** PELBIOT Development Team
