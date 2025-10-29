# 🚀 QUICK REFERENCE: Real-Time Data Issues & Fixes

## 🎯 TL;DR (Too Long; Didn't Read)

**Current State:** 70% dummy/random data  
**Problem:** System unreliable for real-time monitoring  
**Solution:** Query database instead of generating random data  
**Time to Fix:** 2-3 weeks  
**Must Fix Before:** Production deployment  

---

## 📍 WHERE ARE THE PROBLEMS?

### Backend Problems (Server-side)

| File | Line | Problem | Fix |
|------|------|---------|-----|
| `backend/server.js` | 92-103 | Socket.IO emits random data | Query database |
| `backend/server.js` | 158-167 | System health is random | Query database |
| `backend/utils/generateDemoData.js` | All | 100% random generator | Don't use in production |

### Frontend Problems (Client-side)

| File | Line | Problem | Fix |
|------|------|---------|-----|
| `src/pages/Dashboard.js` | 13-35 | Hardcoded metric values | Fetch from API |
| `src/pages/Dashboard.js` | 35-50 | Hardcoded panel status | Map from real data |
| `src/pages/PanelDistribusi.js` | 25-28 | Dummy fallback panels | Show error instead |
| `src/pages/Trafo.js` | 30-35 | Dummy fallback transformers | Show error instead |
| `src/pages/MasterData.js` | 30-35 | Dummy fallback devices | Show error instead |
| `src/pages/Trend.js` | 20-25 | Random mock trend data | Show error instead |
| `src/pages/Report.js` | 20-27 | Random mock report data | Show error instead |
| `src/pages/LoadProfile.js` | 12-18 | Random mock profile | Show error instead |

---

## 🔧 QUICK FIXES (Do These First!)

### Fix #1: Server Socket.IO (2 hours)

**File:** `backend/server.js` (Line 92)

**Current (BAD):**
```javascript
socket.emit('ampere-data-update', generatePanelData());
socket.emit('transformer-update', generateTransformerData());
socket.emit('weather-update', generateWeatherData());
```

**Replace With (GOOD):**
```javascript
try {
  // Query actual database
  const panels = await query('SELECT * FROM panels LIMIT 1');
  const transformers = await query('SELECT * FROM transformers LIMIT 1');
  const weather = await query('SELECT * FROM weather ORDER BY created_at DESC LIMIT 1');
  
  // Emit REAL data
  if (panels.length) socket.emit('ampere-data-update', panels[0]);
  if (transformers.length) socket.emit('transformer-update', transformers[0]);
  if (weather.length) socket.emit('weather-update', weather[0]);
} catch (error) {
  console.error('Real-time query failed:', error);
  // Don't emit if query fails
}
```

**Verify:**
- [ ] Database has data: `SELECT COUNT(*) FROM panels;`
- [ ] Server starts: `npm start`
- [ ] Data in Socket.IO is from DB, not random
- [ ] No errors in console

---

### Fix #2: Dashboard Hardcoded Values (1 hour)

**File:** `src/pages/Dashboard.js` (Line 13)

**Current (BAD):**
```javascript
const [metrics, setMetrics] = useState({
  totalEnergiHari: 45.8,        // ← Hardcoded
  totalBiaya: 57250000,         // ← Hardcoded
  panelAktif: 3,                // ← Hardcoded
  panelTotal: 5,                // ← Hardcoded
});

const [panelStatus] = useState([   // ← Hardcoded
  { name: 'Panel Utama', value: 68 },
  { name: 'Panel A', value: 45 },
]);
```

**Replace With (GOOD):**
```javascript
const [metrics, setMetrics] = useState({
  totalEnergiHari: 0,           // ← Will be fetched
  totalBiaya: 0,                // ← Will be fetched
  panelAktif: 0,                // ← Will be fetched
  panelTotal: 0,                // ← Will be fetched
});

const [panelStatus, setPanelStatus] = useState([]);  // ← Will be fetched

// Add this effect
useEffect(() => {
  const fetchMetrics = async () => {
    try {
      const res = await apiService.panels.getAll();
      const panelsData = res.data || [];
      const onlinePanels = panelsData.filter(p => p.status === 'online');
      
      // Set real values
      setMetrics(prev => ({
        ...prev,
        panelAktif: onlinePanels.length,
        panelTotal: panelsData.length,
      }));
      
      // Set real panel status
      setPanelStatus(panelsData.map(p => ({
        name: p.name || `Panel ${p.id}`,
        value: p.power ? Math.min((p.power / 20000) * 100, 100) : 0,
      })));
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };
  
  fetchMetrics();
}, []);
```

**Verify:**
- [ ] Dashboard loads without initial values
- [ ] Values populate from API call
- [ ] No hardcoded numbers visible
- [ ] Refresh shows updated values

---

### Fix #3: Remove Dummy Fallbacks (30 min each)

**Pattern for all pages:** `PanelDistribusi.js`, `Trafo.js`, `MasterData.js`

**Current (BAD):**
```javascript
catch (err) {
  setPanels([
    { id: 1, nama: 'Panel Utama', energi: 12.5, ... }  // ← Hardcoded dummy!
  ]);
}
```

**Replace With (GOOD):**
```javascript
catch (err) {
  console.error('Error:', err);
  setError('Gagal memuat data. Silakan refresh.');
  setPanels([]);  // Show empty, not dummy
}
```

Then show error message in UI:
```javascript
{error && <div className="error-message">{error}</div>}
```

**Verify:**
- [ ] No hardcoded dummy data in error states
- [ ] Error messages display instead
- [ ] Arrays empty when failed
- [ ] User sees clear error message

---

### Fix #4: Remove Random Mock Data (20 min each)

**Pattern for:** `Trend.js`, `Report.js`, `LoadProfile.js`

**Current (BAD):**
```javascript
catch {
  const mock = Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    value: Math.random() * 100 + 50  // ← Pure random!
  }));
  setTrendData(mock);
}
```

**Replace With (GOOD):**
```javascript
catch (error) {
  console.error('Error:', error);
  setError('Gagal load trend data.');
  setTrendData([]);  // Empty instead of fake
}
```

**Verify:**
- [ ] No random data generated on error
- [ ] Empty graphs instead of fake data
- [ ] Error message shown
- [ ] No confused users

---

## 📊 TESTING CHECKLIST

After each fix, verify:

```
BACKEND FIXES
- [ ] Database has data (nodes, panels, transformers)
  mysql -u root pelbiot -e "SELECT COUNT(*) FROM panels;"

- [ ] Server starts without errors
  npm start
  
- [ ] Socket.IO connects
  curl http://localhost:5000/health
  
- [ ] Socket events have real data (check Chrome DevTools Network)
  Look for ampere-data-update, transformer-update events
  Verify values match database queries

FRONTEND FIXES
- [ ] Dashboard loads without hardcoded values
- [ ] Values update from API call (check Network tab)
- [ ] Panel status calculated from real data
- [ ] No dummy data visible

- [ ] All pages show error messages on failure
  (NOT fake data)
  
- [ ] All pages show empty results on error
  (NOT random mock data)

- [ ] Refresh shows updated values
```

---

## ⚡ IMPLEMENTATION ORDER

1. **Start with backend** (Server Socket.IO fix)
   - Most impactful
   - Affects all real-time features
   - Easy to test

2. **Then frontend** (Dashboard, then other pages)
   - Remove hardcoded values
   - Remove dummy fallbacks
   - Remove random mock data

3. **Test end-to-end**
   - Dashboard shows real data
   - Panel monitoring shows real status
   - All pages consistent

4. **Commit to staging**
5. **QA testing**
6. **Deploy to production**

---

## 🐛 DEBUGGING TIPS

### Socket.IO Not Emitting Real Data?

```javascript
// Add logging in backend/server.js
const interval = setInterval(async () => {
  try {
    const panels = await query('SELECT * FROM panels LIMIT 1');
    console.log('Emitting panel data:', panels[0]); // ← See actual data
    socket.emit('ampere-data-update', panels[0]);
  } catch (error) {
    console.error('Query failed:', error);
  }
}, 2000);
```

### Frontend Not Updating?

```javascript
// Check in React DevTools
// Component props should update from Socket.IO events
// Check Network tab for Socket.IO messages
// Verify data format matches expected structure
```

### Database Empty?

```bash
# Seed test data
npm run seed

# Verify
mysql -u root pelbiot -e "SELECT * FROM panels LIMIT 1;"
```

---

## 🎯 BEFORE/AFTER COMPARISON

### BEFORE (Current - Bad 😞)

```
Backend:
  Socket.IO → generateDemoData() → random values → client
  
Frontend:
  const [metrics] = useState({
    totalEnergiHari: 45.8,  // Hardcoded
  });
  
  catch (err) {
    setPanels([...hardcoded dummy...]);  // Fake data
  }

Result: Unreliable system, users confused
```

### AFTER (Fixed - Good 😊)

```
Backend:
  Socket.IO → query database → real values → client
  
Frontend:
  useEffect(() => {
    const res = await apiService.panels.getAll();
    setMetrics(calculated from res.data);  // Real
  });
  
  catch (error) {
    setError(error.message);  // Clear error
    setPanels([]);  // Empty, not fake
  }

Result: Reliable system, users trust data
```

---

## 💡 KEY TAKEAWAYS

1. **Don't use `generateDemoData.js` in production**
   - It's fine for development/testing
   - NOT for live socket events

2. **Never hardcode metric values**
   - Always fetch from database or API
   - Calculate dynamically if needed

3. **Show errors, not fake data**
   - User needs to know when system fails
   - Better than misleading information

4. **Test data freshness**
   - Verify data comes from database
   - Not from hardcoded values or random generation

5. **Socket.IO should be fast pipeline**
   - Database → Format → Emit
   - Not database → Generate random → Emit

---

## 🚨 RED FLAGS (If You See These, Something's Wrong)

- [ ] Random values in Socket.IO console output
- [ ] Hardcoded numbers in useState initialization
- [ ] Fallback data on API errors instead of error messages
- [ ] Math.random() in render logic
- [ ] generateDemoData imports in production code
- [ ] Discrepancy between UI and database values

---

## ✅ GREEN FLAGS (Good Signs)

- [ ] Socket.IO data matches database values
- [ ] Dashboard values calculated from real data
- [ ] Error messages displayed on failures
- [ ] Empty results instead of fake data
- [ ] Consistent values across refreshes
- [ ] User confident in system accuracy

---

## 📞 QUESTIONS?

Refer to:
- **Full Details:** `AUDIT_REAL_TIME_DATA.md`
- **Implementation:** `IMPLEMENTATION_REAL_TIME_DATA.md`
- **Checklist:** `IMPLEMENTATION_CHECKLIST.md`
- **Visual Guide:** `VISUAL_COMPARISON.md`
- **Executive Summary:** `EXECUTIVE_SUMMARY.md`

---

**Last Updated:** October 29, 2025  
**Status:** Active - Implementation in progress  
**Next Review:** Daily during fix phase
