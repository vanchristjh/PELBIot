╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                   🎯 PELBIOT - FINAL LAUNCH SEQUENCE 🎯                     ║
║                                                                              ║
║                      Follow These 6 Steps to Go Live!                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝


═══════════════════════════════════════════════════════════════════════════════
STEP 1: SETUP DATABASE (5 minutes)
═══════════════════════════════════════════════════════════════════════════════

Open MySQL terminal:
┌─────────────────────────────────────────────────────────────────────────────┐
│ mysql -u root -p                                                             │
│ (Enter your MySQL password)                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Import database schema:
┌─────────────────────────────────────────────────────────────────────────────┐
│ source database.sql;                                                         │
│                                                                              │
│ Expected output:                                                             │
│ Query OK, X rows affected                                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Verify database created:
┌─────────────────────────────────────────────────────────────────────────────┐
│ USE pelbiot;                                                                 │
│ SHOW TABLES;                                                                 │
│                                                                              │
│ Expected: 10 tables (devices, panels, transformers, weather, alerts, etc.)  │
└─────────────────────────────────────────────────────────────────────────────┘

✅ STEP 1 COMPLETE!


═══════════════════════════════════════════════════════════════════════════════
STEP 2: SETUP BACKEND (3 minutes)
═══════════════════════════════════════════════════════════════════════════════

Open PowerShell/Terminal and navigate:
┌─────────────────────────────────────────────────────────────────────────────┐
│ cd d:\PROJECT\PT\pelbiot\backend                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Install dependencies:
┌─────────────────────────────────────────────────────────────────────────────┐
│ npm install                                                                  │
│                                                                              │
│ Expected output:                                                             │
│ added XX packages                                                            │
│ up to date                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Seed database with demo data:
┌─────────────────────────────────────────────────────────────────────────────┐
│ npm run seed                                                                 │
│                                                                              │
│ Expected output:                                                             │
│ 🌱 Seeding database...                                                      │
│ 🎉 Database seeded successfully!                                            │
└─────────────────────────────────────────────────────────────────────────────┘

✅ STEP 2 COMPLETE!


═══════════════════════════════════════════════════════════════════════════════
STEP 3: START BACKEND SERVER (1 minute)
═══════════════════════════════════════════════════════════════════════════════

Start the backend server:
┌─────────────────────────────────────────────────────────────────────────────┐
│ npm start                                                                    │
│                                                                              │
│ Expected output:                                                             │
│ ╔══════════════════════════════════════════════════════════════════════════╗
│ ║  🚀 PELBIOT Backend Server Running!                                      ║
│ ║  📡 Server: http://localhost:5000                                        ║
│ ║  🔌 WebSocket: ws://localhost:5000                                       ║
│ ║  ✅ Ready to receive connections                                          ║
│ ╚══════════════════════════════════════════════════════════════════════════╝
└─────────────────────────────────────────────────────────────────────────────┘

⚠️  KEEP THIS TERMINAL OPEN! DO NOT CLOSE!

✅ STEP 3 COMPLETE!


═══════════════════════════════════════════════════════════════════════════════
STEP 4: START FRONTEND SERVER (1 minute)
═══════════════════════════════════════════════════════════════════════════════

⚠️  OPEN A NEW TERMINAL/POWERSHELL WINDOW!

Navigate to main project folder:
┌─────────────────────────────────────────────────────────────────────────────┐
│ cd d:\PROJECT\PT\pelbiot                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Start frontend server:
┌─────────────────────────────────────────────────────────────────────────────┐
│ npm start                                                                    │
│                                                                              │
│ Expected output:                                                             │
│ Compiled successfully!                                                       │
│ You can now view pelbiot in the browser.                                    │
│ http://localhost:3000/                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

✅ STEP 4 COMPLETE!


═══════════════════════════════════════════════════════════════════════════════
STEP 5: VERIFY BOTH SERVERS RUNNING
═══════════════════════════════════════════════════════════════════════════════

Test Backend (in another terminal):
┌─────────────────────────────────────────────────────────────────────────────┐
│ curl http://localhost:5000/health                                            │
│                                                                              │
│ Expected response:                                                           │
│ {"status":"✅ Backend API Running","timestamp":"2025-10-29T..."}           │
└─────────────────────────────────────────────────────────────────────────────┘

✅ STEP 5 COMPLETE!


═══════════════════════════════════════════════════════════════════════════════
STEP 6: OPEN BROWSER & LAUNCH SYSTEM (1 minute)
═══════════════════════════════════════════════════════════════════════════════

Open your web browser:
┌─────────────────────────────────────────────────────────────────────────────┐
│ http://localhost:3000                                                        │
└─────────────────────────────────────────────────────────────────────────────┘

Expected to see:
✅ All 13+ pages loading
✅ 🟢 Green connection indicator on all pages
✅ Real-time data flowing in charts (updates every 2 seconds)
✅ Alerts appearing in real-time
✅ System health monitoring live
✅ Energy metrics updating

Navigate to different pages:
├─ Dashboard         → Real-time power metrics
├─ Alarm             → Real-time alerts
├─ Trend             → Analytics charts
├─ LoadProfile       → 24-hour load profiling
├─ Report            → Report generation
├─ WSLive            → WebSocket live meter
├─ Verifiable        → Data verification
├─ Overview          → System overview
├─ Laporan           → Energy reports
├─ MasterData        → Device management
├─ Trafo             → Transformer monitoring
├─ WeatherStation    → Weather data
└─ PanelDistribusi   → Panel distribution

🎉 YOU'RE DONE! SYSTEM IS LIVE!


═══════════════════════════════════════════════════════════════════════════════
TROUBLESHOOTING IF SOMETHING GOES WRONG
═══════════════════════════════════════════════════════════════════════════════

Problem: "Cannot connect to database"
Solution:
  1. Verify MySQL is running
  2. Check username/password in .env file
  3. Verify database exists: SHOW DATABASES;

Problem: "Port 5000 already in use"
Solution:
  1. Kill existing process: Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
  2. Or change PORT in .env to 5001

Problem: "Frontend can't connect to backend"
Solution:
  1. Verify both servers running
  2. Check browser console (F12) for errors
  3. Verify http://localhost:5000/health works

Problem: "No data showing on pages"
Solution:
  1. Check browser console for errors
  2. Verify Socket.IO connected (should see "start-realtime" in logs)
  3. Wait 5 seconds for first data to arrive
  4. Refresh page

Problem: "npm install fails"
Solution:
  1. Delete node_modules: rm -r node_modules
  2. Delete package-lock.json: rm package-lock.json
  3. Try again: npm install

═══════════════════════════════════════════════════════════════════════════════
MONITORING YOUR SYSTEM
═══════════════════════════════════════════════════════════════════════════════

Terminal 1 - Backend Logs:
├─ Shows incoming connections
├─ Shows Socket.IO events
├─ Shows real-time data updates
└─ Helpful for debugging

Terminal 2 - Frontend Logs:
├─ Shows compilation status
├─ Shows any errors
└─ Useful for development

Browser Console (F12):
├─ Shows Socket.IO connection status
├─ Shows any API errors
├─ Shows real-time events received
└─ Essential for troubleshooting


═══════════════════════════════════════════════════════════════════════════════
WHAT'S HAPPENING BEHIND THE SCENES
═══════════════════════════════════════════════════════════════════════════════

Every 2 Seconds:
✓ Backend generates realistic sensor data
✓ Sends via Socket.IO to frontend
✓ Frontend updates charts smoothly
✓ Real-time indicators update

Every 5 Seconds:
✓ Server heartbeat broadcast
✓ Client status check
✓ Connection verification

Real-Time:
✓ Alerts appear instantly
✓ Device status changes immediately
✓ Energy metrics update live
✓ System health monitored continuously


═══════════════════════════════════════════════════════════════════════════════
SYSTEM ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════════

Browser (http://localhost:3000)
   ↓ (HTTP + WebSocket)
Frontend React App (13+ pages)
   ↓ (API calls)
Backend Express Server (http://localhost:5000)
   ├─ REST API (/api/*)
   ├─ Socket.IO events
   └─ Demo data generation
   ↓ (SQL queries)
MySQL Database
   ├─ devices (6 records)
   ├─ panels (6 records)
   ├─ transformers (2 records)
   ├─ alerts (active)
   ├─ trends (30 days)
   └─ ... (10 tables total)


═══════════════════════════════════════════════════════════════════════════════
AFTER LAUNCH - WHAT TO TRY
═══════════════════════════════════════════════════════════════════════════════

✅ Visit all 13 pages - see different data on each
✅ Watch charts animate - updates every 2 seconds
✅ Check connection indicator - should be 🟢 green
✅ Generate a report - try report generation
✅ View trends - see 30-day analytics
✅ Monitor alerts - see real-time alerts appearing
✅ Open browser console - watch Socket.IO events
✅ Check backend logs - see what's happening

═══════════════════════════════════════════════════════════════════════════════
DOCUMENTATION YOU CAN READ ANYTIME
═══════════════════════════════════════════════════════════════════════════════

For API Details:          IMPLEMENTATION_REALTIME_DATA.md
For Troubleshooting:      DETAILED_TROUBLESHOOTING.md
For Backend Setup:        backend/README.md
For Complete Overview:    PROJECT_COMPLETION.md
For Deployment:           DEPLOYMENT_GUIDE.md


═══════════════════════════════════════════════════════════════════════════════

                    🎉 YOU'RE READY TO LAUNCH! 🎉

            Follow the 6 steps above in order (takes ~10 minutes)
         Your live real-time energy monitoring system will be online!

                            Good luck! 🚀

═══════════════════════════════════════════════════════════════════════════════

Created: October 29, 2025
Project: PELBIOT Real-Time Energy Monitoring System
Version: 2.0 - Production Ready
Status: ✅ Ready for Final Launch

All systems go! Follow the steps and you'll be monitoring energy in real-time! 🔌⚡💡
