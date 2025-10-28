# 🚀 QUICK START - Report & Load Profile

## ⚡ 30 DETIK SETUP

### 1. Pastikan Backend Running
```bash
# Terminal 1 - Backend
cd d:\PROJECT\PT\ampere-monitoring-system
npm start
# Harusnya output: "✅ Server running on http://localhost:5000"
```

### 2. Pastikan Frontend Running
```bash
# Terminal 2 - Frontend
cd d:\PROJECT\PT\pelbiot
npm start
# Harusnya output: "✅ Compiled successfully!"
# Browser otomatis buka: http://localhost:3002
```

### 3. Akses Features
```
Report:       http://localhost:3002/dashboard/report
LoadProfile:  http://localhost:3002/dashboard/load-profile
```

---

## 🎯 FITUR UTAMA (30 DETIK DEMO)

### Report Page
1. **Buka Report** → http://localhost:3002/dashboard/report
2. **Lihat Status** → 🟢 Connected (top-right)
3. **Pilih Period** → Klik "24 Jam" button
4. **Tunggu 2 detik** → Charts mulai animated
5. **Export Data** → Klik "Ekspor CSV" atau "Ekspor JSON"

### Load Profile Page
1. **Buka LoadProfile** → http://localhost:3002/dashboard/load-profile
2. **Lihat Analysis** → 4 cards (Peak, Avg, Factor, Count)
3. **Pilih Mode** → 24H / 7D / 30D
4. **Scroll Charts** → 4 interactive charts
5. **Lihat Insights** → Smart recommendations

---

## 🔍 VERIFY EVERYTHING WORKS

### Browser Console Check
```javascript
// Buka Console: F12 → Console tab
// Harus muncul:
✅ Socket.IO Connected
📡 Real-time update: {...}
🚨 Real-time alarm received: {...}
```

### Network Check
```
F12 → Network tab
Filter: "ampere-data-update"
Harus ada messages masuk setiap 1-2 detik
```

---

## 📊 REAL-TIME DEMO

### Expected Behavior

#### Report Page
```
0s  - Page loads, API call
1s  - Charts render dengan data awal
2s  - ✅ Socket.IO connected
3s+ - Charts auto-update setiap 1-2 detik
    - Stats cards update real-time
    - Data table append new rows
```

#### LoadProfile Page
```
0s  - Page loads, peak analysis
1s  - Cards show: Peak, Avg, Factor, Count
2s  - ✅ Socket.IO connected
3s+ - Charts animated real-time
    - Classification updated
    - Insights refreshed
```

---

## ⚙️ TROUBLESHOOTING

### Masalah: Charts tidak muncul
```
❌ Solusi:
1. Cek browser console (F12)
2. Verify backend running: http://localhost:5000
3. Refresh page (Ctrl+R)
4. Check /api/data/history endpoint
```

### Masalah: 🔴 Disconnected
```
❌ Solusi:
1. Restart backend (npm start)
2. Check firewall allow localhost:5000
3. Verify Socket.IO server running
4. Check browser console for errors
```

### Masalah: Data tidak ter-update
```
❌ Solusi:
1. Check network (F12 → Network)
2. Verify 'ampere-data-update' events
3. Check backend emit Socket.IO
4. Try different period selector
```

---

## 📁 FILES CREATED

| File | Lines | Status |
|------|-------|--------|
| Report.js | 445 | ✅ Complete |
| Report.css | 650+ | ✅ Complete |
| LoadProfile.js | 398 | ✅ Complete |
| LoadProfile.css | 600+ | ✅ Complete |

---

## 🎓 KEY FEATURES CHECKLIST

### Report Page ✅
- [x] Real-time socket.io
- [x] 4 summary stats cards
- [x] Period selector (1H/6H/24H/7D/30D)
- [x] 4 interactive Recharts
- [x] Export CSV/JSON/PDF
- [x] Data detail table
- [x] Error handling
- [x] Mobile responsive

### Load Profile Page ✅
- [x] Real-time analysis
- [x] 4 analysis cards
- [x] Mode selector (24H/7D/30D)
- [x] Peak detection algorithm
- [x] 4 interactive Recharts
- [x] Load classification (4 colors)
- [x] Peak periods table
- [x] Smart insights
- [x] Mobile responsive

---

## 📞 SUPPORT

### Documentation
- Main: `/REPORT_LOADPROFILE_COMPLETE.md` (detailed)
- Quick: `/QUICK_START.md` (this file)

### Backend API Required
- `GET /api/data/current`
- `GET /api/data/history?hours={1,6,24,168,720}`
- `Socket.IO: ampere-data-update` event
- `Socket.IO: ampere-alarm` event

### Frontend Services
- Uses: `src/services/apiService.js`
- Already configured ✅

---

## 🎉 YOU'RE ALL SET!

**Now**: Open both pages and enjoy real-time monitoring! 🚀

```bash
# Quick Command to Remember:
npm start          # Frontend (:3002)
# In another terminal:
# cd ../ampere-monitoring-system && npm start  # Backend (:5000)
```

**Enjoy the dashboard!** 📊✨
