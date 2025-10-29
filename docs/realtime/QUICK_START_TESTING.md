# 🚀 Quick Start Testing Guide

## 1️⃣ Setup Database

```powershell
# Open PowerShell and navigate to backend
cd d:\PROJECT\PT\pelbiot\backend

# Install dependencies
npm install

# Seed database with test data
node utils/seedData.js
```

**Expected Output:**
```
🌱 Seeding database...
📱 Adding devices...
✅ Added 6 devices
🔌 Adding panels...
✅ Added 6 panels
... (more data)
✅ Database seeding complete!
```

---

## 2️⃣ Start Backend Server

```powershell
# In backend directory
npm start
```

**Expected Output:**
```
Server running on port 5000
Database connection pool created
Socket.IO server initialized
```

---

## 3️⃣ Start Frontend App (New PowerShell Window)

```powershell
# Navigate to project root
cd d:\PROJECT\PT\pelbiot

# Start React app
npm start
```

**Expected Output:**
```
compiled successfully!
Local: http://localhost:3000
```

---

## 4️⃣ Test Real-Time Updates

### In Browser Console (F12 → Console)

**Test 1: Check Socket.IO Connection**
```javascript
// Type this in browser console:
io().on('connect', () => console.log('✅ Connected'));
```

**Expected:** `✅ Connected` message appears

**Test 2: Monitor Real-Time Data**
```javascript
// Open DevTools Network tab
// Go to Dashboard
// Observe WebSocket messages in Network tab
// Should see messages every 2 seconds with real data
```

---

## 5️⃣ Verify No Dummy Data

### Dashboard Page (http://localhost:3000/dashboard)
- [ ] Panel count matches database (should be 6, not hardcoded 3/5)
- [ ] Power values are real numbers, not 45.8
- [ ] Cost is calculated, not hardcoded 57,250,000
- [ ] Updates every 2 seconds in real-time

### Panel Distribution (http://localhost:3000/panel-distribusi)
- [ ] Shows 6 actual panels (not dummy "Panel Utama")
- [ ] Voltages and currents are real values
- [ ] History chart shows actual data

### Transformers (http://localhost:3000/trafo)
- [ ] Shows 2 actual transformers (not 3 dummies)
- [ ] Temperature and efficiency are real values

### Master Data (http://localhost:3000/master-data)
- [ ] Shows 6 actual devices (not 4 hardcoded)
- [ ] Device types match database

### Trend Analysis (http://localhost:3000/trend)
- [ ] Shows 7-day trend data
- [ ] Statistics (Avg, Max, Min) calculated from real data
- [ ] No random numbers visible

### Reports (http://localhost:3000/report)
- [ ] Date picker works
- [ ] Shows data for selected date range
- [ ] No random report generation

### Load Profile (http://localhost:3000/load-profile)
- [ ] Shows 24-hour load data
- [ ] Peak, Avg, Min, Factor calculated correctly

### Alerts (http://localhost:3000/alarm)
- [ ] Shows active alerts from database
- [ ] No dummy "Temperature High" alert
- [ ] Real-time updates when new alerts created

---

## 6️⃣ Test Role-Based Access

### Super Admin Login
```
Username: superadmin
Password: (check backend seed data)
```
- [ ] Can view all features
- [ ] Can manage devices and users
- [ ] Can view all reports

### Admin Login
```
Username: admin
Password: (check backend seed data)
```
- [ ] Can view dashboard and monitoring
- [ ] Can manage devices
- [ ] Can generate reports

### Moderator Login
```
Username: moderator
Password: (check backend seed data)
```
- [ ] Can view dashboard (read-only)
- [ ] Cannot edit devices
- [ ] Can view alerts

---

## 7️⃣ Test Error Handling

### Test 1: Stop Database
1. Stop MySQL server
2. Refresh page
3. **Expected:** Error message shown, no dummy data fallback

### Test 2: Check Console Errors
1. Open DevTools (F12)
2. Go to Console tab
3. **Expected:** Error messages logged, no warnings about unused imports

---

## 8️⃣ Performance Check

### Check Response Times
1. Open DevTools (F12 → Network tab)
2. Go to Dashboard
3. Observe API response times
4. **Expected:** < 500ms for most requests

### Check Real-Time Frequency
1. Open WebSocket frame inspection in Network tab
2. Go to Dashboard
3. **Expected:** Messages every 2 seconds

---

## 📊 Verification Checklist

### ✅ Backend Verification
- [ ] Server starts without errors
- [ ] No "generateDemoData" in console
- [ ] Database queries execute successfully
- [ ] Socket.IO connections stable

### ✅ Frontend Verification
- [ ] No hardcoded values visible
- [ ] All data loads from API
- [ ] Real-time updates working
- [ ] No dummy fallback data shown

### ✅ Data Verification
- [ ] Panel count = 6 (from database)
- [ ] Transformer count = 2 (from database)
- [ ] Device count = 6 (from database)
- [ ] No Math.random() values visible

### ✅ Error Handling
- [ ] Empty charts/tables shown gracefully
- [ ] Error messages logged to console
- [ ] No dummy data appears on error

---

## 🔧 Troubleshooting

### Issue: Page shows "Loading..." forever
**Solution:**
```powershell
# Check backend is running
# Check database is seeded
# Open browser console (F12) to see errors
```

### Issue: Real-time updates not working
**Solution:**
```powershell
# Check Socket.IO connection in Network tab
# Verify WebSocket URL in browser console
# Restart backend server
```

### Issue: Data not loading
**Solution:**
```powershell
# Verify .env configuration
# Check MySQL is running
# Run seed script again
```

### Issue: Build errors
**Solution:**
```powershell
# Delete node_modules and package-lock.json
# Run: npm install
# Run: npm start
```

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________
Environment: [Development/Staging/Production]

Feature: Dashboard
- [ ] Real data loaded from API
- [ ] Real-time updates every 2 seconds
- [ ] No hardcoded values visible
- [ ] Error handling works correctly

Feature: Panels
- [ ] All panels from database shown
- [ ] History data is real (not random)
- [ ] Status updates in real-time

Feature: Transformers
- [ ] All transformers shown
- [ ] Temperature data is real
- [ ] No dummy fallback

Feature: Alerts
- [ ] Active alerts shown
- [ ] New alerts appear in real-time
- [ ] Severity filtering works

Overall Result: [ ] PASS [ ] FAIL
Notes: ___________
```

---

## ✅ Success Criteria

All tests pass when:
1. ✅ No hardcoded values visible anywhere
2. ✅ All data loads from real database/API
3. ✅ Real-time updates occur every 2 seconds
4. ✅ Error handling graceful (no dummy data)
5. ✅ All roles can access appropriate features
6. ✅ No browser console errors
7. ✅ No unused imports or lint errors
8. ✅ Database queries are efficient (< 500ms)
9. ✅ Socket.IO WebSocket stable
10. ✅ Role-based permissions enforced

---

**If all criteria pass, system is ready for production! 🎉**
