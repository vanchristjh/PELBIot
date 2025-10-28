# 🚀 PELBIOT Backend - Setup & Launch Guide

## 📋 Prerequisites

- Node.js 16+ 
- MySQL/MariaDB
- npm or yarn

## 🔧 Installation Steps

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- express (4.18.2)
- socket.io (4.8.1)
- cors (2.8.5)
- dotenv (16.3.1)
- mysql2 (3.6.5)

### Step 2: Setup Database

**Option A: Using MySQL CLI**
```bash
mysql -u root -p
```

Then run the schema:
```sql
source database.sql;
```

**Option B: Using MySQL GUI (Workbench, phpMyAdmin)**
1. Create new database: `pelbiot`
2. Copy content from `database.sql` into SQL editor
3. Execute

**Option C: Automatic Setup (Node.js)**
```bash
# Edit .env file first (see Step 3)
# Then run:
npm run seed
```

### Step 3: Configure Environment Variables

Edit `.env` file:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pelbiot
DB_PORT=3306

# Socket.IO Configuration
SOCKET_PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# API Configuration
API_BASE_URL=http://localhost:5000/api
```

**Important:** Update `DB_PASSWORD` with your MySQL password!

### Step 4: Start Backend Server

```bash
npm start
```

You should see:
```
╔══════════════════════════════════════════════════════════╗
║  🚀 PELBIOT Backend Server Running!                     ║
║  📡 Server: http://localhost:5000                       ║
║  🔌 WebSocket: ws://localhost:5000                      ║
║  ✅ Ready to receive connections                         ║
╚══════════════════════════════════════════════════════════╝
```

---

## 🧪 Testing the Backend

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "✅ Backend API Running",
  "timestamp": "2025-10-29T..."
}
```

### Test API Endpoints

**Get All Devices:**
```bash
curl http://localhost:5000/api/devices
```

**Get Active Alerts:**
```bash
curl http://localhost:5000/api/alerts/active
```

**Get System Health:**
```bash
curl http://localhost:5000/api/system/health
```

### Test WebSocket

Open browser console and run:
```javascript
// Connect
const socket = io('http://localhost:5000');

// Listen for events
socket.on('ampere-data-update', (data) => {
  console.log('Panel data:', data);
});

socket.on('alert-created', (data) => {
  console.log('New alert:', data);
});

// Start real-time stream
socket.emit('start-realtime');

// Stop real-time stream
socket.emit('stop-realtime');
```

---

## 📦 Backend Structure

```
backend/
├── server.js                 # Main server file
├── package.json              # Dependencies
├── .env                      # Environment variables
├── database.sql              # Database schema
│
├── routes/                   # API routes
│   ├── devices.js
│   ├── panels.js
│   ├── alerts.js
│   ├── reports.js
│   ├── trends.js
│   ├── loadProfile.js
│   ├── system.js
│   └── masterData.js
│
├── controllers/              # Route controllers
│   ├── deviceController.js
│   ├── panelController.js
│   ├── alertController.js
│   ├── reportController.js
│   ├── trendController.js
│   ├── loadProfileController.js
│   └── systemController.js
│
├── middleware/               # Express middleware
│   └── errorHandler.js
│
└── utils/                    # Utility functions
    ├── database.js           # MySQL connection
    ├── seedData.js           # Database seeding
    └── generateDemoData.js   # Demo data generation
```

---

## 🔌 API Endpoints

### Devices
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get device by ID
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `GET /api/devices/status/all` - Get device status

### Panels
- `GET /api/panels` - Get all panels
- `GET /api/panels/:id` - Get panel by ID
- `GET /api/panels/:id/history` - Get panel history
- `POST /api/panels` - Create panel
- `PUT /api/panels/:id` - Update panel
- `POST /api/panels/:id/control` - Control panel

### Alerts
- `GET /api/alerts/active` - Get active alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `GET /api/alerts/:id/details` - Get alert details
- `GET /api/alerts/stats/summary` - Get alert statistics

### Reports
- `POST /api/reports/generate` - Generate report
- `POST /api/reports/export` - Export report (CSV/JSON)
- `GET /api/reports` - Get available reports

### Trends
- `GET /api/trends/power?days=30` - Get power trend
- `GET /api/trends/energy?days=30` - Get energy trend
- `GET /api/trends/temperature?days=30` - Get temperature trend
- `GET /api/trends/load?days=30` - Get load trend

### Load Profile
- `GET /api/load-profile/history?hours=24` - Get load profile
- `GET /api/load-profile/peak` - Get peak load
- `GET /api/load-profile/average` - Get average load
- `GET /api/load-profile/factor` - Get load factor

### System
- `GET /api/system/health` - Get system health
- `GET /api/system/status` - Get system status
- `GET /api/system/stats` - Get system statistics
- `GET /api/system/energy/stats` - Get energy statistics

### Master Data
- `GET /api/master-data` - Get all master data
- `GET /api/master-data/:type` - Get by type
- `POST /api/master-data` - Create entry

---

## 🔌 WebSocket Events

### Server Emits (Backend → Frontend)
- `connect` - Connection established
- `ampere-data-update` - Real-time ampere/current data
- `panel-update` - Panel status update
- `transformer-update` - Transformer data
- `weather-update` - Weather information
- `alert-created` - New alert generated
- `device-status-change` - Device status changed
- `system-health` - System health update
- `energy-data` - Energy data update
- `load-profile-data` - Load profile data
- `trend-data` - Trend analysis data
- `server-tick` - Periodic server heartbeat

### Client Emits (Frontend → Backend)
- `start-realtime` - Start real-time streaming
- `stop-realtime` - Stop real-time streaming
- `request-panel-data` - Request panel data on demand
- `request-system-health` - Request health data
- `request-energy-data` - Request energy data
- `request-load-profile` - Request load profile
- `request-trend-data` - Request trend data
- `heartbeat` - Keep-alive signal

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:**
1. Ensure MySQL is running: `mysql -u root -p`
2. Check DB credentials in `.env`
3. Verify database exists: `SHOW DATABASES;`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Kill process on port 5000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Or use different port
PORT=5001 npm start
```

### Socket.IO Connection Failed
**Solution:**
1. Verify frontend `FRONTEND_URL` in `.env` matches frontend origin
2. Check browser console for CORS errors
3. Ensure WebSocket is not blocked by firewall

### No Data from Database
**Solution:**
1. Seed the database: `npm run seed`
2. Check data: `SELECT COUNT(*) FROM devices;`
3. Verify tables exist: `SHOW TABLES;`

---

## 📊 Production Checklist

- [ ] Test all API endpoints
- [ ] Test WebSocket connections
- [ ] Database backups configured
- [ ] Error logging enabled
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting added (optional)
- [ ] SSL/TLS certificates (for HTTPS)
- [ ] Load balancer configured
- [ ] Monitoring alerts setup
- [ ] Database connection pooling tuned
- [ ] Real-time event performance tested

---

## 📞 Support

- Check `/backend/server.js` for implementation
- Review `/LAUNCH_CHECKLIST.md` for integration steps
- Check `/DOCUMENTATION_INDEX_REALTIME.md` for frontend docs

---

## ✅ Status

**Backend:** ✅ READY TO DEPLOY
**Database:** ⏳ SETUP REQUIRED (Follow Step 2)
**Frontend:** ✅ ALREADY INTEGRATED

**Next Step:** Run `npm install && npm start`

---

**Created:** October 29, 2025
**Version:** 2.0
**Status:** Production Ready
