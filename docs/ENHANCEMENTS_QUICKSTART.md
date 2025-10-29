# PELBIOT Enhancement Features - Quick Start Guide

**Get started with PELBIOT enhancements in 5 minutes!**

---

## Prerequisites

- Node.js 14+ 
- Backend server running
- Valid API authentication token

---

## Step 1: Integrate Routes (1 minute)

Add the enhancement routes to your main server file:

**File: `backend/server.js`**

```javascript
import express from 'express';
import enhancementRoutes from './routes/enhancements.js';

const app = express();

// ... other middleware ...

// Add enhancement routes
app.use('/api/enhancements', enhancementRoutes);

// Start server
app.listen(3001, () => {
  console.log('Server running on port 3001');
  console.log('Enhancement endpoints available at /api/enhancements');
});
```

---

## Step 2: Verify Integration (1 minute)

Test the health endpoint:

```bash
curl http://localhost:3001/api/enhancements/health
```

Expected response:
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

## Step 3: Try Key Features (3 minutes)

### Example 1: Track Analytics Event

```bash
curl -X POST http://localhost:3001/api/enhancements/analytics/track-event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "eventName": "user_login",
    "eventData": {
      "platform": "web",
      "duration": 1500
    },
    "userId": "user-123"
  }'
```

### Example 2: Detect Anomalies

First, train a model:
```bash
curl -X POST http://localhost:3001/api/enhancements/aiml/anomalies/train \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "modelName": "cpu_anomalies",
    "trainingData": [
      { "timestamp": 1698624000000, "value": 45.2 },
      { "timestamp": 1698624060000, "value": 46.5 },
      { "timestamp": 1698624120000, "value": 44.8 }
    ]
  }'
```

Then detect anomalies:
```bash
curl -X POST http://localhost:3001/api/enhancements/aiml/anomalies/detect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "modelName": "cpu_anomalies",
    "dataPoints": [
      { "timestamp": 1698624180000, "value": 95.5 }
    ]
  }'
```

### Example 3: Register Device

```bash
curl -X POST http://localhost:3001/api/enhancements/mobile/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceId": "iphone-12-pro",
    "platform": "iOS",
    "osVersion": "15.0",
    "appVersion": "1.0.0"
  }'
```

---

## Common Tasks

### Create Analytics Dashboard

```javascript
const response = await fetch('/api/enhancements/analytics/dashboards/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Sales Dashboard',
    description: 'Real-time sales metrics'
  })
});

const result = await response.json();
console.log(result.dashboard.id); // dash-123
```

### Store Payment Credentials

```javascript
const response = await fetch('/api/enhancements/integrations/credentials/store', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    provider: 'stripe',
    apiKey: 'sk_live_xxxxx',
    apiSecret: 'secret_xxxxx'
  })
});
```

### Make Payment

```javascript
const response = await fetch('/api/enhancements/integrations/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 99.99,
    currency: 'USD',
    method: 'credit_card',
    description: 'Product purchase'
  })
});

const payment = await response.json();
console.log(payment.result.paymentId); // pay-123
```

### Sync Mobile Data

```javascript
const response = await fetch('/api/enhancements/mobile/sync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    deviceId: 'iphone-12-pro',
    changes: [
      {
        id: 'record-1',
        operation: 'create',
        data: { name: 'New Record' }
      }
    ]
  })
});
```

---

## Module Quick Reference

### 🔴 Mobile App
- Register devices
- Sync offline data
- Push notifications
- Biometric authentication
- Responsive UI layouts

**Key Endpoint:** `POST /api/enhancements/mobile/register`

### 🟡 Third-Party Integrations
- Store credentials securely
- Process payments
- Send messages (SMS/Email)
- Manage webhooks
- Audit logging

**Key Endpoint:** `POST /api/enhancements/integrations/payments/create`

### 🟢 Advanced Analytics
- Track events
- Record metrics
- Create dashboards
- Generate reports
- Make predictions

**Key Endpoint:** `POST /api/enhancements/analytics/track-event`

### 🔵 AI/ML Features
- Anomaly detection
- Time series forecasting
- Classification models
- K-means clustering
- Recommendation engine

**Key Endpoint:** `POST /api/enhancements/aiml/anomalies/train`

---

## Troubleshooting

### "Authentication required" Error

Ensure you're passing a valid token:
```bash
-H "Authorization: Bearer YOUR_VALID_TOKEN"
```

### "Module not found" Error

Verify the routes are integrated in server.js:
```javascript
import enhancementRoutes from './routes/enhancements.js';
app.use('/api/enhancements', enhancementRoutes);
```

### "Invalid data" Error

Check the request body matches the endpoint schema (see API Reference).

### Port Already in Use

Change the port in server.js:
```javascript
app.listen(3002, () => { ... }); // Use different port
```

---

## Next Steps

1. **Read Full API Reference:** See `ENHANCEMENTS_API_REFERENCE.md`
2. **Review Implementation Guide:** See `ENHANCEMENTS_GUIDE.md`
3. **Check Implementation Checklist:** See `ENHANCEMENTS_IMPLEMENTATION_CHECKLIST.md`
4. **View Delivery Summary:** See `ENHANCEMENTS_DELIVERY_SUMMARY.md`

---

## Support

For detailed endpoint documentation, see:
- **API Reference:** `docs/ENHANCEMENTS_API_REFERENCE.md`
- **Implementation Guide:** `docs/ENHANCEMENTS_GUIDE.md`
- **Final Report:** `docs/ENHANCEMENTS_COMPLETE.md`

---

**Quick Start Complete!** ✅  
You now have 41 powerful APIs ready to use.
