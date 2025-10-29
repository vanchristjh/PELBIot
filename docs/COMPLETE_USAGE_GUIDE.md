# 📖 PANDUAN LENGKAP: Cara Menggunakan PELBIoT Project

**Status:** ✅ Project siap untuk digunakan  
**Tanggal:** 29 Oktober 2025  
**Kategori:** Setup, Penggunaan & Troubleshooting

---

## 🚀 QUICK START (5 MENIT)

### 1. Clone & Install Dependencies
```bash
cd d:\PROJECT\PT\pelbiot

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Setup Database
```bash
# Copy file SQL ke MySQL
mysql -u root -p < backend/init.sql

# Atau gunakan setup script
.\setup_database.ps1
```

### 3. Create Environment File
```bash
# Copy dari template
copy .env.example .env

# Edit .env dengan konfigurasi Anda
```

### 4. Start Backend (Terminal 1)
```bash
cd backend
npm start
```

**Output diharapkan:**
```
Server running on port 5000
MySQL connected successfully
Socket.IO listening...
```

### 5. Start Frontend (Terminal 2)
```bash
npm start
```

**App akan open di:** `http://localhost:3000`

### 6. Login dengan Akun Test
```
Email: superadmin@test.com
Password: Test@123
```

---

## ✅ CHECKLIST SETUP AWAL

- [ ] **Node.js installed** → Run: `node --version` (harus 14+)
- [ ] **npm installed** → Run: `npm --version`
- [ ] **MySQL installed & running** → Run: `mysql --version`
- [ ] **Dependencies installed** → `npm install` di root & `backend/`
- [ ] **Database setup** → Run: `mysql -u root -p < backend/init.sql`
- [ ] **Environment file** → Create `.env` dari `.env.example`
- [ ] **Backend running** → Run: `cd backend && npm start`
- [ ] **Frontend running** → Run: `npm start`
- [ ] **Login works** → Bisa login dengan test account
- [ ] **Dashboard loads** → Bisa lihat real-time data

---

## 📋 FILE KONFIGURASI YANG PERLU DIUBAH

### 1. `.env` File
```env
# Database Configuration
DB_HOST=localhost          # Ubah jika MySQL di server lain
DB_USER=root              # Ubah dengan user MySQL Anda
DB_PASSWORD=root          # Ubah dengan password MySQL Anda
DB_NAME=pelbiot           # Nama database
DB_PORT=3306              # Port MySQL

# Server Configuration
API_PORT=5000             # Port backend
NODE_ENV=development      # development, staging, production

# JWT Configuration
JWT_SECRET=your_secret_key_here  # UBAH dengan secret random Anda!
JWT_EXPIRY=7d             # Token expiry time

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

### 2. `backend/server.js` (Jika perlu custom config)
```javascript
// Line yang perlu diperhatikan:
const PORT = process.env.API_PORT || 5000;
const DB_POOL_SIZE = 10;  // Sesuaikan dengan kebutuhan
```

---

## 🔧 TROUBLESHOOTING COMMON ISSUES

### ❌ "Cannot connect to MySQL database"
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solusi:**
1. Verifikasi MySQL running: `mysql --version`
2. Check credentials di `.env`
3. Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`
4. Ensure database initialized: `mysql -u root -p pelbiot < backend/init.sql`

---

### ❌ "WebSocket connection refused"
```
Error: WebSocket connection failed
```

**Solusi:**
1. Verifikasi backend running: `cd backend && npm start`
2. Check port 5000 available: `netstat -an | findstr 5000`
3. Restart backend server
4. Hard refresh browser: `Ctrl+Shift+R`

---

### ❌ "npm ERR! code ENOENT"
```
Error: npm ERR! enoent ENOENT: no such file or directory
```

**Solusi:**
```bash
# Clear and reinstall
rm -r node_modules
npm cache clean --force
npm install
```

---

### ❌ "Port 5000 already in use"
```
Error: listen EADDRINUSE :::5000
```

**Solusi:**
```bash
# Find process using port 5000
netstat -ano | findstr 5000

# Kill process (ganti PID dengan process ID)
taskkill /PID <PID> /F

# Atau gunakan port berbeda di .env
# API_PORT=5001
```

---

## 🎯 CARA MENGGUNAKAN FITUR-FITUR

### 📊 Dashboard
1. Login dengan account test
2. Akan melihat real-time data:
   - Total energy output
   - System health status
   - Active panel count
   - System efficiency

**Real-time updates:** Data refresh setiap 2 detik

### 📈 Panel Distribution
1. Klik menu "Panel Distribution"
2. Lihat semua solar panels dengan status:
   - Panel ID
   - Current output (Watt)
   - Status (Active/Inactive)
   - Last update time

### 🔌 Transformer (Trafo)
1. Klik "Trafo Management"
2. Monitor transformers:
   - Load distribution
   - Current voltage
   - Temperature
   - Alert status

### 📚 Master Data
1. Klik "Master Data"
2. Manage semua devices:
   - Device inventory
   - Device configuration
   - Device status
   - Maintenance info

### 📊 Trends
1. Klik "Trends"
2. Lihat historical data:
   - Performance trends
   - Usage patterns
   - Comparison period
   - Export data

### 📄 Reports
1. Klik "Reports"
2. Generate reports:
   - Daily reports
   - Custom date range
   - Export ke Excel/PDF
   - Scheduled reports

### ⚠️ Alerts
1. Klik "Alerts"
2. Manage system alerts:
   - Active alerts list
   - Alert history
   - Acknowledge alerts
   - Alert configuration

### 📋 Load Profile
1. Klik "Load Profile"
2. Analyze consumption:
   - Historical patterns
   - Peak usage times
   - Forecasting
   - Usage breakdown

---

## 👤 MULTI-ROLE SYSTEM

### Super Admin
**Akses:** Full system access
```
Email: superadmin@test.com
Password: Test@123
```
**Capabilities:**
- ✅ Create/edit/delete users
- ✅ Modify all settings
- ✅ View audit logs
- ✅ System-wide configuration

### Admin
**Akses:** Administrative access
```
Email: admin@test.com
Password: Test@123
```
**Capabilities:**
- ✅ Create new users
- ✅ View reports
- ✅ Manage alerts
- ✅ Configure features (limited)

### Moderator
**Akses:** Monitoring only
```
Email: moderator@test.com
Password: Test@123
```
**Capabilities:**
- ✅ View all data
- ✅ Acknowledge alerts
- ✅ Generate reports
- ❌ Cannot create users
- ❌ Cannot modify settings

---

## 🔄 REAL-TIME DATA SYSTEM

### Cara Kerja Real-Time
```
Frontend Component
    ↓ (Socket.IO emit event)
Backend Socket.IO Handler
    ↓ (Query MySQL database)
MySQL Database
    ↓ (Return real data)
Backend sends data
    ↓ (Socket.IO broadcast)
Frontend updates UI
    ↓ (Every 2 seconds!)
Live data on screen ✨
```

### Data yang Real-Time (Live Update)
- ✅ Panel output (Watts)
- ✅ Transformer load
- ✅ System efficiency
- ✅ Active alerts
- ✅ Device status
- ✅ Energy consumption
- ✅ Weather data
- ✅ Load profiles

### Update Frequency
- **Real-time metrics:** Every 2 seconds
- **Dashboard:** Every 2 seconds
- **Details:** On-demand queries
- **Reports:** Historical data (static)

---

## 📱 API ENDPOINTS (REST)

### Panels API
```bash
# Get all panels
GET /api/panels

# Get panel by ID
GET /api/panels/:id

# Get panel status
GET /api/panels/:id/status
```

### Devices API
```bash
# Get all devices
GET /api/devices

# Get device details
GET /api/devices/:id

# Get device status history
GET /api/devices/:id/history
```

### System API
```bash
# Get system health
GET /api/system/health

# Get system metrics
GET /api/system/metrics

# Get realtime status
GET /api/system/realtime
```

### Authentication API
```bash
# Login
POST /api/auth/login
Body: { email, password }

# Logout
POST /api/auth/logout

# Refresh token
POST /api/auth/refresh
```

---

## 🛠️ DEVELOPMENT WORKFLOW

### 1. Modifying Frontend Component
```
src/pages/Dashboard.js
    ↓ Make changes
    ↓ Save file
    ↓ Hot-reload (automatic)
    ↓ See changes in browser
```

### 2. Modifying Backend Handler
```
backend/controllers/systemController.js
    ↓ Make changes
    ↓ Save file
    ↓ Restart backend: npm start
    ↓ Test with API/UI
```

### 3. Modifying Database Query
```
backend/routes/panels.js
    ↓ Update query
    ↓ Restart backend
    ↓ Frontend automatically gets new data
```

### Best Practices
✅ Restart backend setelah mengubah controller/routes  
✅ No need restart frontend (hot reload)  
✅ Test setiap perubahan di browser  
✅ Check console untuk errors  

---

## 🧪 TESTING

### Run Tests
```bash
npm test
```

### Test Accounts (untuk testing)
```
Super Admin:
  Email: superadmin@test.com
  Password: Test@123

Admin:
  Email: admin@test.com
  Password: Test@123

Moderator:
  Email: moderator@test.com
  Password: Test@123
```

### Manual Testing Checklist
- [ ] Login works
- [ ] Dashboard loads data
- [ ] Real-time updates working
- [ ] All pages accessible
- [ ] Role-based access working
- [ ] Alerts showing correctly
- [ ] No console errors
- [ ] No network errors

---

## 📚 DOKUMENTASI

### Main Entry Points
1. **`README.md`** - Project introduction
2. **`docs/INDEX.md`** - Complete documentation index
3. **`docs/guides/NAVIGATION_GUIDE.md`** - How to navigate

### Documentation by Topic
- **Setup:** `docs/setup/README.md`
- **Architecture:** `docs/architecture/README.md`
- **API:** `docs/api/README.md`
- **Features:** `docs/features/README.md`
- **Real-Time:** `docs/realtime/README.md`
- **Troubleshooting:** `docs/troubleshooting/README.md`

---

## ⚠️ IMPORTANT NOTES

### ✅ PRODUCTION READINESS
- ✅ Real-time data system: 100% working
- ✅ Database queries: Optimized
- ✅ Authentication: Secure (JWT)
- ✅ Error handling: Implemented
- ✅ No dummy data: All live
- ✅ Lint errors: 0

### ⚠️ SECURITY CONSIDERATIONS
**BEFORE GOING TO PRODUCTION:**

1. **Change JWT_SECRET**
```env
# JANGAN GUNAKAN INI:
JWT_SECRET=your_secret_key_here

# GUNAKAN YANG RANDOM DAN KUAT:
JWT_SECRET=aB3kD9mF2xP8nQ4rT7uV5wX1yZ6cH8iJ
```

2. **Update Database Credentials**
```env
DB_USER=root          # UBAH!
DB_PASSWORD=root      # UBAH!
```

3. **Enable HTTPS**
```env
NODE_ENV=production
# Setup SSL certificate
```

4. **Configure CORS**
```javascript
// backend/server.js
const corsOptions = {
  origin: 'https://yourdomain.com',  // SPECIFY YOUR DOMAIN
  credentials: true
};
```

5. **Hide Sensitive Files**
```
.env - JANGAN commit
.env.local - JANGAN commit
```

---

## 🎯 PERFORMANCE OPTIMIZATION

### Frontend Optimization
```bash
# Build optimized production version
npm run build

# Check bundle size
npm run analyze
```

### Backend Optimization
```javascript
// Database connection pooling (sudah ada)
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
```

### Database Optimization
```sql
-- Add indexes untuk frequent queries
ALTER TABLE panels ADD INDEX idx_status (status);
ALTER TABLE transformers ADD INDEX idx_load (load);
```

---

## 🚀 DEPLOYMENT

### Deploy to Production Server
```bash
# Build frontend
npm run build

# Copy to production server
scp -r build/ user@server:/var/www/pelbiot/

# Copy backend
scp -r backend/ user@server:/app/pelbiot/

# Start on server
ssh user@server
cd /app/pelbiot/backend
npm start
```

### Docker (Optional)
```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 📊 MONITORING & LOGGING

### View Backend Logs
```bash
# Real-time logs
tail -f backend.log

# Search for errors
grep "ERROR" backend.log

# Check specific date
grep "2025-10-29" backend.log
```

### Monitor Database
```sql
-- Check active connections
SHOW PROCESSLIST;

-- Check table sizes
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) as size
FROM information_schema.TABLES
WHERE table_schema = 'pelbiot';
```

---

## ✨ NEXT STEPS FOR PRODUCTION

### Before Launch
- [ ] Test all features thoroughly
- [ ] Change all default passwords
- [ ] Update JWT_SECRET
- [ ] Configure CORS properly
- [ ] Setup HTTPS/SSL
- [ ] Backup database
- [ ] Test backup & restore
- [ ] Monitor performance
- [ ] Check error logs
- [ ] Security audit

### After Launch
- [ ] Monitor system 24/7
- [ ] Review error logs daily
- [ ] Update database backups
- [ ] Monitor performance metrics
- [ ] Check user feedback
- [ ] Security updates when available
- [ ] Performance optimization

---

## 📞 QUICK HELP

**Error saat login?**
→ Check database connection  
→ Verify user exists in database  
→ Clear browser cache

**Real-time data tidak update?**
→ Check backend running  
→ Check WebSocket connection  
→ Verify MySQL connected

**Port sudah digunakan?**
→ Kill process: `taskkill /F /IM node.exe`  
→ Atau gunakan port lain di `.env`

**Perlu bantuan?**
→ Check: `docs/troubleshooting/README.md`  
→ Search: `Ctrl+F` dalam dokumentasi  

---

## 🎉 SELESAI!

Anda sekarang siap menggunakan PELBIoT dengan lancar! 

**Ringkasan:**
1. ✅ Setup database & environment
2. ✅ Start backend & frontend
3. ✅ Login dengan test account
4. ✅ Explore fitur-fiturnya
5. ✅ Customize sesuai kebutuhan
6. ✅ Deploy ke production

**Happy coding!** 🚀

---

Untuk pertanyaan lebih lanjut, lihat dokumentasi di: [`docs/`](../../docs/)

**Last Updated:** 29 Oktober 2025
