# PELBIOT Enhancement API Reference

**Complete API Endpoint Documentation**  
**Generated:** October 29, 2025

---

## Table of Contents
1. [Mobile App Endpoints](#mobile-app-endpoints)
2. [Third-Party Integration Endpoints](#third-party-integration-endpoints)
3. [Analytics Endpoints](#analytics-endpoints)
4. [AI/ML Endpoints](#aiml-endpoints)
5. [Health & Status](#health--status)

---

## Mobile App Endpoints

### Register Device
**Endpoint:** `POST /api/enhancements/mobile/register`

Register a mobile device for the application.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "deviceId": "device-uuid-123",
  "platform": "iOS|Android|Web",
  "osVersion": "14.5",
  "appVersion": "1.0.0"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "registration": {
    "deviceId": "device-uuid-123",
    "platform": "iOS",
    "osVersion": "14.5",
    "appVersion": "1.0.0",
    "userId": "user-123",
    "registered": 1698624000000
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "deviceId and platform required"
}
```

---

### Sync Offline Data
**Endpoint:** `POST /api/enhancements/mobile/sync`

Synchronize offline data changes with the server.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "deviceId": "device-uuid-123",
  "changes": [
    {
      "id": "record-1",
      "operation": "create|update|delete",
      "data": { /* ... */ }
    }
  ]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Data synced successfully",
  "result": {
    "synced": 5,
    "conflicts": 0,
    "timestamp": 1698624000000
  }
}
```

---

### Get Offline Data
**Endpoint:** `GET /api/enhancements/mobile/offline-data/:deviceId`

Retrieve offline data stored on device.

**Authentication:** Required (Bearer token)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "records": [
      { "id": "record-1", "status": "pending" }
    ]
  }
}
```

---

### Register Push Token
**Endpoint:** `POST /api/enhancements/mobile/push-token`

Register device token for push notifications.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "deviceId": "device-uuid-123",
  "pushToken": "firebase-token-xyz"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Push token registered",
  "result": {
    "deviceId": "device-uuid-123",
    "registered": true
  }
}
```

---

### Subscribe to Topic
**Endpoint:** `POST /api/enhancements/mobile/subscribe-topic`

Subscribe device to notification topic.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "deviceId": "device-uuid-123",
  "topic": "alerts|updates|news"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Subscribed to topic: alerts"
}
```

---

### Register Biometric
**Endpoint:** `POST /api/enhancements/mobile/biometric-register`

Register biometric authentication for user.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "userId": "user-123",
  "biometricType": "fingerprint|face|iris",
  "biometricData": "encrypted-biometric-template"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Biometric registered successfully",
  "result": {
    "userId": "user-123",
    "type": "fingerprint",
    "registered": true
  }
}
```

---

### Verify Biometric
**Endpoint:** `POST /api/enhancements/mobile/biometric-verify`

Verify user with biometric authentication.

**Authentication:** Not required

**Request Body:**
```json
{
  "userId": "user-123",
  "biometricType": "fingerprint|face|iris",
  "biometricData": "encrypted-biometric-template"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Biometric verified successfully",
  "token": "auth-token-here"
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "Biometric verification failed"
}
```

---

### Get Responsive UI Layout
**Endpoint:** `GET /api/enhancements/mobile/ui-layout/:deviceType`

Get responsive UI layout for device type.

**Authentication:** Not required

**URL Parameters:**
- `deviceType`: `phone|tablet|desktop`

**Response (Success - 200):**
```json
{
  "success": true,
  "layout": {
    "type": "phone",
    "screenSize": "375x667",
    "columns": 1,
    "fontSize": "14px",
    "components": [
      { "type": "header", "height": "56px" },
      { "type": "content", "height": "auto" }
    ]
  }
}
```

---

## Third-Party Integration Endpoints

### Store API Credentials
**Endpoint:** `POST /api/enhancements/integrations/credentials/store`

Store API credentials securely (encrypted).

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "provider": "stripe|paypal|twilio|sendgrid",
  "apiKey": "sk_live_xxxxx",
  "apiSecret": "secret_xxxxx"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Credentials stored securely",
  "result": {
    "provider": "stripe",
    "stored": true,
    "encrypted": true
  }
}
```

---

### Rotate API Credentials
**Endpoint:** `POST /api/enhancements/integrations/credentials/rotate`

Rotate API credentials for security.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "provider": "stripe"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Credentials rotated successfully",
  "result": {
    "provider": "stripe",
    "rotated": true,
    "newKeyId": "key-789"
  }
}
```

---

### Get Credentials Audit Log
**Endpoint:** `GET /api/enhancements/integrations/credentials/audit`

Get audit log of credential operations.

**Authentication:** Required (Bearer token)

**Response (Success - 200):**
```json
{
  "success": true,
  "auditLog": [
    {
      "action": "created|accessed|rotated",
      "provider": "stripe",
      "timestamp": 1698624000000,
      "userId": "user-123"
    }
  ]
}
```

---

### Create Payment
**Endpoint:** `POST /api/enhancements/integrations/payments/create`

Create a payment transaction.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "amount": 99.99,
  "currency": "USD",
  "method": "credit_card|debit_card|paypal",
  "description": "Product purchase"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Payment created",
  "result": {
    "paymentId": "pay-123",
    "amount": 99.99,
    "currency": "USD",
    "status": "pending",
    "created": 1698624000000
  }
}
```

---

### Confirm Payment
**Endpoint:** `POST /api/enhancements/integrations/payments/confirm`

Confirm payment transaction.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "paymentId": "pay-123",
  "authCode": "auth-code-xyz"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Payment confirmed",
  "result": {
    "paymentId": "pay-123",
    "status": "confirmed",
    "timestamp": 1698624000000
  }
}
```

---

### Refund Payment
**Endpoint:** `POST /api/enhancements/integrations/payments/refund`

Refund a payment transaction.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "paymentId": "pay-123",
  "amount": 99.99,
  "reason": "Customer request"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Payment refunded",
  "result": {
    "paymentId": "pay-123",
    "refundId": "ref-123",
    "amount": 99.99,
    "status": "refunded"
  }
}
```

---

### Send Message
**Endpoint:** `POST /api/enhancements/integrations/messaging/send`

Send message via third-party provider (SMS/Email).

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "recipient": "+1234567890|user@example.com",
  "message": "Your OTP is 123456",
  "provider": "twilio|sendgrid",
  "templateId": "otp-template"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "result": {
    "messageId": "msg-123",
    "recipient": "+1234567890",
    "provider": "twilio",
    "status": "sent"
  }
}
```

---

### Register Webhook
**Endpoint:** `POST /api/enhancements/integrations/webhooks/register`

Register webhook endpoint for events.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "event": "payment.confirmed|user.created|device.sync",
  "url": "https://example.com/webhooks/events",
  "secret": "webhook-secret-xyz"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Webhook registered successfully",
  "result": {
    "webhookId": "hook-123",
    "event": "payment.confirmed",
    "url": "https://example.com/webhooks/events",
    "active": true
  }
}
```

---

### Get Webhook Delivery Logs
**Endpoint:** `GET /api/enhancements/integrations/webhooks/delivery-logs`

Get webhook delivery logs.

**Authentication:** Required (Bearer token)

**Response (Success - 200):**
```json
{
  "success": true,
  "logs": [
    {
      "webhookId": "hook-123",
      "event": "payment.confirmed",
      "statusCode": 200,
      "timestamp": 1698624000000,
      "retries": 0
    }
  ]
}
```

---

## Analytics Endpoints

### Track Event
**Endpoint:** `POST /api/enhancements/analytics/track-event`

Track analytics event.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "eventName": "user_login|page_view|purchase",
  "eventData": {
    "page": "/dashboard",
    "duration": 1500
  },
  "userId": "user-123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Event tracked"
}
```

---

### Record Metric
**Endpoint:** `POST /api/enhancements/analytics/record-metric`

Record performance metric.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "metricName": "response_time|cpu_usage|memory_usage",
  "value": 45.5,
  "tags": {
    "service": "api",
    "endpoint": "/users"
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Metric recorded"
}
```

---

### Get Event Statistics
**Endpoint:** `GET /api/enhancements/analytics/events/stats`

Get aggregated event statistics.

**Authentication:** Required (Bearer token)

**Response (Success - 200):**
```json
{
  "success": true,
  "stats": {
    "totalEvents": 10500,
    "uniqueEvents": 25,
    "topEvents": [
      { "name": "user_login", "count": 5000 }
    ]
  }
}
```

---

### Get Metric Statistics
**Endpoint:** `GET /api/enhancements/analytics/metrics/stats`

Get aggregated metric statistics.

**Authentication:** Required (Bearer token)

**Response (Success - 200):**
```json
{
  "success": true,
  "stats": {
    "metrics": [
      {
        "name": "response_time",
        "mean": 45.2,
        "min": 10.5,
        "max": 250.3,
        "p95": 120.5
      }
    ]
  }
}
```

---

### Create Dashboard
**Endpoint:** `POST /api/enhancements/analytics/dashboards/create`

Create analytics dashboard.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "name": "Sales Dashboard",
  "description": "Real-time sales metrics"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Dashboard created",
  "dashboard": {
    "id": "dash-123",
    "name": "Sales Dashboard",
    "widgets": [],
    "created": 1698624000000
  }
}
```

---

### Add Widget to Dashboard
**Endpoint:** `POST /api/enhancements/analytics/dashboards/:dashboardId/widget`

Add widget to dashboard.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "widgetType": "chart|table|gauge|map",
  "config": {
    "title": "Revenue",
    "metric": "total_revenue",
    "timeRange": "24h"
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Widget added to dashboard",
  "widget": {
    "id": "widget-123",
    "type": "chart",
    "config": { /* ... */ }
  }
}
```

---

### Get Dashboard
**Endpoint:** `GET /api/enhancements/analytics/dashboards/:dashboardId`

Get dashboard details.

**Authentication:** Required (Bearer token)

**Response (Success - 200):**
```json
{
  "success": true,
  "dashboard": {
    "id": "dash-123",
    "name": "Sales Dashboard",
    "widgets": [
      { "id": "widget-123", "type": "chart" }
    ]
  }
}
```

---

### Generate Report
**Endpoint:** `POST /api/enhancements/analytics/reports/generate`

Generate analytics report.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "title": "Monthly Revenue Report",
  "metrics": ["total_revenue", "transaction_count"],
  "timeRange": {
    "start": "2025-09-01",
    "end": "2025-09-30"
  },
  "format": "json|csv|pdf|excel"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Report generated",
  "report": {
    "id": "report-123",
    "title": "Monthly Revenue Report",
    "data": { /* ... */ }
  }
}
```

---

### Export Report
**Endpoint:** `POST /api/enhancements/analytics/reports/export`

Export report in multiple formats.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "reportId": "report-123",
  "format": "csv|json|pdf|excel"
}
```

**Response (Success - 200):**
- If CSV: Returns CSV file
- If JSON: Returns JSON data
- If PDF/Excel: Returns file stream

---

### Train Predictive Model
**Endpoint:** `POST /api/enhancements/analytics/predictions/train`

Train predictive model on historical data.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "modelName": "sales_forecast",
  "historicalData": [
    { "timestamp": 1698624000000, "value": 1000 }
  ]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Model trained",
  "result": {
    "modelId": "model-123",
    "accuracy": 0.85,
    "trained": true
  }
}
```

---

### Make Forecast
**Endpoint:** `POST /api/enhancements/analytics/predictions/forecast`

Make prediction using trained model.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "modelName": "sales_forecast",
  "data": [1000, 1100, 950, 1200]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "prediction": {
    "forecast": [1150, 1250, 1200],
    "confidence": 0.85
  }
}
```

---

## AI/ML Endpoints

### Train Anomaly Detection Model
**Endpoint:** `POST /api/enhancements/aiml/anomalies/train`

Train anomaly detection model.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "modelName": "device_anomalies",
  "trainingData": [
    { "timestamp": 1698624000000, "value": 45.2 }
  ]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Model trained successfully",
  "result": {
    "modelId": "model-456",
    "statistics": {
      "mean": 45.5,
      "stdDev": 2.3
    }
  }
}
```

---

### Detect Anomalies
**Endpoint:** `POST /api/enhancements/aiml/anomalies/detect`

Detect anomalies in data.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "modelName": "device_anomalies",
  "dataPoints": [
    { "timestamp": 1698624000000, "value": 120.5 }
  ]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "anomalies": [
    {
      "id": "anom-123",
      "value": 120.5,
      "zScore": 35.2,
      "severity": "critical"
    }
  ],
  "count": 1
}
```

---

### List Anomalies
**Endpoint:** `GET /api/enhancements/aiml/anomalies/list`

Get detected anomalies.

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `modelName`: Optional model filter
- `limit`: Optional limit (default 100)

**Response (Success - 200):**
```json
{
  "success": true,
  "anomalies": [
    {
      "id": "anom-123",
      "severity": "critical",
      "timestamp": 1698624000000
    }
  ],
  "count": 15
}
```

---

### Generate Time Series Forecast
**Endpoint:** `POST /api/enhancements/aiml/forecasting/generate`

Generate time series forecast.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "seriesName": "cpu_usage",
  "historicalData": [
    { "timestamp": 1698624000000, "value": 45.2 }
  ]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Forecast generated",
  "result": {
    "forecastId": "fc-123",
    "forecast": [45.5, 46.2, 47.1],
    "confidenceInterval": {
      "lower": [40.5, 41.2],
      "upper": [50.5, 51.2]
    }
  }
}
```

---

### Get Forecast
**Endpoint:** `GET /api/enhancements/aiml/forecasting/:forecastId`

Get forecast details.

**Authentication:** Required (Bearer token)

**Response (Success - 200):**
```json
{
  "success": true,
  "forecast": {
    "id": "fc-123",
    "seriesName": "cpu_usage",
    "forecast": [45.5, 46.2, 47.1],
    "modelAccuracy": 0.85
  }
}
```

---

### Train Classification Model
**Endpoint:** `POST /api/enhancements/aiml/classification/train`

Train classification model.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "modelName": "user_churn",
  "trainingData": [
    { "features": [0.5, 0.8, 0.2], "label": "churn" }
  ],
  "features": ["engagement", "spend", "frequency"],
  "labels": ["churn", "retain"]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Model trained",
  "result": {
    "modelId": "clf-123",
    "accuracy": 0.92,
    "f1Score": 0.89
  }
}
```

---

### Make Classification Prediction
**Endpoint:** `POST /api/enhancements/aiml/classification/predict`

Make classification prediction.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "modelName": "user_churn",
  "features": [0.5, 0.8, 0.2]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "prediction": "retain",
  "probabilities": [
    { "label": "churn", "probability": 0.25 },
    { "label": "retain", "probability": 0.75 }
  ],
  "confidence": 0.75
}
```

---

### Perform K-Means Clustering
**Endpoint:** `POST /api/enhancements/aiml/clustering/kmeans`

Perform k-means clustering.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "dataPoints": [[1, 2], [1.5, 1.8], [5, 8]],
  "k": 2
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Clustering completed",
  "result": {
    "clusterId": "clust-123",
    "k": 2,
    "converged": true,
    "iterations": 5,
    "inertia": 12.45
  }
}
```

---

### Track User-Item Interaction
**Endpoint:** `POST /api/enhancements/aiml/recommendations/track`

Track user-item interaction for recommendations.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "userId": "user-123",
  "itemId": "item-456",
  "interactionType": "view|click|purchase|rating",
  "score": 1
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Interaction tracked"
}
```

---

### Get User Recommendations
**Endpoint:** `GET /api/enhancements/aiml/recommendations/:userId`

Generate recommendations for user.

**Authentication:** Required (Bearer token)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Recommendations generated",
  "recommendations": [
    {
      "itemId": "item-789",
      "similarity": 0.85,
      "score": 42.5
    }
  ]
}
```

---

### Add Item Features
**Endpoint:** `POST /api/enhancements/aiml/recommendations/add-item-features`

Add features for recommendation item.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "itemId": "item-789",
  "features": [0.5, 0.8, 0.2, 0.9, 0.3]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Item features added"
}
```

---

## Health & Status

### Health Check
**Endpoint:** `GET /api/enhancements/health`

Health check for enhancement endpoints.

**Authentication:** Not required

**Response (Success - 200):**
```json
{
  "success": true,
  "status": "healthy",
  "message": "All enhancement endpoints operational",
  "modules": {
    "mobile": "active",
    "integrations": "active",
    "analytics": "active",
    "aiml": "active"
  },
  "endpoints": {
    "mobile": 8,
    "integrations": 10,
    "analytics": 12,
    "aiml": 11,
    "total": 41
  }
}
```

---

## Error Codes

### Standard Error Responses

**400 - Bad Request**
```json
{
  "success": false,
  "error": "Required parameter missing"
}
```

**401 - Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**404 - Not Found**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 - Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Common Patterns

### Authentication Header
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Response Format
All responses follow standard format:
```json
{
  "success": true|false,
  "message": "Optional message",
  "data": { /* response data */ },
  "error": "Optional error message"
}
```

### Rate Limiting
- Default: 1000 requests/minute per user
- Premium: Unlimited
- Response Header: `X-RateLimit-Remaining`

---

**API Reference Complete**  
**Last Updated:** October 29, 2025
