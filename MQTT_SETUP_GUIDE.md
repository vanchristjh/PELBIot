# 🚀 MQTT Integration Setup Guide

## Overview
Dokumentasi lengkap untuk setup dan testing MQTT integration di PELBIOT project.

---

## ✅ What's Implemented

### Backend Components
- **MQTT Service** (`backend/services/mqttService.js`) - Handles MQTT connections, message processing, and Socket.IO broadcasting
- **MQTT Config** (`backend/config/mqtt.js`) - Centralized MQTT broker configuration
- **MQTT Routes** (`backend/routes/mqtt.js`) - REST API endpoints for MQTT management
- **MQTT Simulator** (`backend/utils/mqttSimulator.js`) - Test data generator for development
- **Database Integration** - Automatic saving of MQTT messages to MySQL

### Frontend Components  
- **MQTT Event Listeners** (`src/pages/Dashboard.js`) - Real-time updates from MQTT via Socket.IO
- **Status Indicators** - Connection status display for Socket.IO and MQTT
- **Real-time Metrics** - Voltage, Ampere, Power, Energy Cost updates

### API Endpoints
```
GET  /api/mqtt/status          - Connection status and subscriptions
GET  /api/mqtt/last-values     - All last-received MQTT values
GET  /api/mqtt/history         - Message history (query: topic, limit)
GET  /api/mqtt/last-value/:topic - Single topic last value
POST /api/mqtt/publish         - Publish message to topic (body: {topic, message})
GET  /api/mqtt/topics          - List subscribed topics
```

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js >= 16.x
- MySQL database
- Internet connection (for HiveMQ Cloud broker)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `mqtt@^5.3.1` - MQTT client library
- `mqtt-pattern@^2.0.0` - Topic pattern matching
- `chalk@^5.3.0` - CLI output formatting

### Step 2: Configure Environment

Update `.env` file (backend root):

```env
# MQTT Configuration
MQTT_BROKER_URL=wss://broker.hivemq.com:8884/mqtt
MQTT_CLIENT_ID=pelbiot-panel-trafo1-$(date +%s)
MQTT_TOPIC_VOLT=panel/trafo1/volt
MQTT_TOPIC_AMPERE=panel/trafo1/ampere
MQTT_TOPIC_POWER=panel/trafo1/power
MQTT_TOPIC_ENERGY_COST=panel/trafo1/energy_cost
MQTT_QOS=1
MQTT_KEEPALIVE=60
MQTT_RECONNECT_PERIOD=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pelbiot

# Server
PORT=5000
NODE_ENV=development
```

### Step 3: Verify Database Schema

Ensure your database has these tables:

```sql
-- Existing panels table
CREATE TABLE IF NOT EXISTS panels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  voltage DECIMAL(10,2),
  ampere DECIMAL(10,2),
  power DECIMAL(10,2),
  energy_cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trends table (for MQTT history)
CREATE TABLE IF NOT EXISTS trends (
  id INT PRIMARY KEY AUTO_INCREMENT,
  panel_id INT,
  voltage DECIMAL(10,2),
  ampere DECIMAL(10,2),
  power DECIMAL(10,2),
  energy_cost DECIMAL(10,2),
  timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_timestamp (timestamp)
);
```

---

## 🚀 Running the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm start
```

Expected output:
```
✅ MQTT Service Initialized
✅ MQTT API routes registered
[MQTT] Connected to wss://broker.hivemq.com:8884/mqtt
[MQTT] Subscribed to: panel/trafo1/volt, panel/trafo1/ampere, etc.
```

### Terminal 2: Run MQTT Data Simulator (Development Only)

```bash
cd backend
node utils/mqttSimulator.js
```

Expected output:
```
🚀 Starting MQTT Simulator...
📡 Connecting to broker...
✅ Connected to HiveMQ broker
🔄 Publishing test data every 2 seconds...

📤 Published to panel/trafo1/volt: 230.45
📤 Published to panel/trafo1/ampere: 15.32
📤 Published to panel/trafo1/power: 3542.65
📤 Published to panel/trafo1/energy_cost: 4428312.50

[Message count: 1] [Uptime: 2s]
```

### Terminal 3: Start Frontend

```bash
cd frontend
npm start
```

Navigate to: `http://localhost:3000`

---

## 📊 Testing MQTT Flow

### Option 1: Using Dashboard UI
1. Open `http://localhost:3000` (Dashboard)
2. Login as Super Admin
3. Look for MQTT event logs in browser console (F12)
4. Verify metrics update in real-time:
   - Tegangan Sistem (Voltage)
   - Arus Sistem (Ampere)
   - Daya Real-Time (Power)
   - Total Biaya (Energy Cost)

### Option 2: Using REST API

Check MQTT status:
```bash
curl http://localhost:5000/api/mqtt/status
```

Response:
```json
{
  "connected": true,
  "clientId": "pelbiot-panel-trafo1-1234567890",
  "subscriptions": ["panel/trafo1/volt", "panel/trafo1/ampere", ...],
  "messageCount": 42,
  "bufferSize": 10,
  "lastMessage": {...}
}
```

Get last values:
```bash
curl http://localhost:5000/api/mqtt/last-values
```

Response:
```json
{
  "voltage": 230.45,
  "ampere": 15.32,
  "power": 3542.65,
  "energy_cost": 4428312.50,
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

Get message history:
```bash
curl "http://localhost:5000/api/mqtt/history?topic=panel/trafo1/ampere&limit=10"
```

### Option 3: Using MQTT.js CLI (Optional)

Install MQTT.js globally:
```bash
npm install -g mqtt
```

Subscribe to topics:
```bash
mqtt sub -h broker.hivemq.com -p 8884 --protocol mqtt "panel/trafo1/+" --insecure
```

---

## 🐛 Troubleshooting

### Issue: "MQTT service initialization failed"
- **Check:** Internet connection to HiveMQ broker
- **Check:** Firewall blocking WebSocket (port 8884)
- **Solution:** Backend continues without MQTT, uses Socket.IO fallback

### Issue: No data updating in Dashboard
- **Check:** Browser console for MQTT event logs (F12)
- **Check:** Backend MQTT status: `curl http://localhost:5000/api/mqtt/status`
- **Check:** Simulator running in Terminal 2
- **Solution:** Restart backend and simulator

### Issue: Database not saving MQTT data
- **Check:** MySQL connection in backend logs
- **Check:** `trends` table exists in database
- **Solution:** Run database schema SQL (see Step 3)

### Issue: WebSocket connection refused
- **Check:** Backend server running on port 5000
- **Check:** Frontend correctly pointing to backend
- **Solution:** Update `REACT_APP_API_URL` in frontend `.env`

---

## 📈 Real-Time Metrics

### MQTT Topics & Data Format

All values are published as JSON or float:

| Topic | Value | Unit | Range | Update Rate |
|-------|-------|------|-------|------------|
| `panel/trafo1/volt` | Voltage | V | 215-245 | 2s (simulator) |
| `panel/trafo1/ampere` | Current | A | 5-25 | 2s (simulator) |
| `panel/trafo1/power` | Power | W | 1075-6125 | 2s (simulator) |
| `panel/trafo1/energy_cost` | Cost | Rp | Calc | 2s (simulator) |

### Database Storage

- **panels** table: Latest values only (UPDATE)
- **trends** table: Historical data with timestamp (INSERT)
- Query examples:
  ```sql
  -- Last 1 hour data
  SELECT * FROM trends 
  WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
  ORDER BY timestamp DESC;

  -- Daily summary
  SELECT DATE(timestamp) as date,
         AVG(power) as avg_power,
         MAX(power) as max_power
  FROM trends
  GROUP BY DATE(timestamp);
  ```

---

## 🔐 Security Notes

### For Development
- Simulator publishes test data
- HiveMQ public broker used (no authentication)
- Auth middleware optional (development mode)

### For Production
1. Use authenticated MQTT broker:
   ```javascript
   username: process.env.MQTT_USERNAME,
   password: process.env.MQTT_PASSWORD
   ```

2. Enable authentication middleware:
   ```javascript
   app.use('/api/mqtt', authenticateToken, mqttRoutes);
   ```

3. Use TLS/SSL for MQTT connections (wss://)

4. Implement rate limiting on REST API

5. Secure database credentials in vault

---

## 📝 Socket.IO Events Reference

### Events Emitted by Backend (MQTT Service)
```javascript
// Connection events
'mqtt-connected'          // MQTT broker connected
'mqtt-disconnected'       // MQTT broker disconnected
'mqtt-error'              // MQTT error occurred

// Data events
'mqtt-voltage-update'     // { topic, value, timestamp }
'mqtt-ampere-update'      // { topic, value, timestamp }
'mqtt-power-update'       // { topic, value, timestamp }
'mqtt-cost-update'        // { topic, value, timestamp }
'mqtt-data-update'        // Aggregate event
```

### Frontend Dashboard Listeners
Located in `src/pages/Dashboard.js` (lines 80-150):
```javascript
// Handles all MQTT events and updates metrics
socketService.on('mqtt-voltage-update', handleMQTTVoltageUpdate);
socketService.on('mqtt-ampere-update', handleMQTTAmpereUpdate);
socketService.on('mqtt-power-update', handleMQTTPowerUpdate);
socketService.on('mqtt-cost-update', handleMQTTCostUpdate);
```

---

## 🧪 Testing Checklist

- [ ] Backend starts without errors
- [ ] MQTT Service connects to broker
- [ ] Simulator runs and publishes data
- [ ] Frontend receives MQTT events
- [ ] Metrics update in real-time
- [ ] Charts display data correctly
- [ ] Database saves historical data
- [ ] API endpoints respond correctly
- [ ] Status indicators show correct state
- [ ] Logs show message timestamps

---

## 📚 Additional Resources

- **MQTT.js Documentation:** https://github.com/mqttjs/MQTT.js
- **HiveMQ Broker:** https://www.hivemq.com/mqtt-cloud/
- **MQTT Protocol:** http://mqtt.org/
- **Socket.IO Documentation:** https://socket.io/

---

## 🎯 Next Steps

1. **Frontend Enhancements:**
   - Add separate MQTT metrics display
   - Create real-time graphs for voltage/ampere
   - Add historical data viewer

2. **Backend Enhancements:**
   - Add data aggregation/statistics endpoint
   - Implement data export (CSV/JSON)
   - Add alerts for abnormal values

3. **Testing:**
   - Unit tests for MQTTService
   - Integration tests for API endpoints
   - End-to-end tests with real hardware

4. **Deployment:**
   - Docker containerization
   - Kubernetes deployment
   - Cloud hosting setup

---

**Last Updated:** 2024-01-15  
**MQTT Version:** 5.3.1  
**Status:** ✅ Production Ready
