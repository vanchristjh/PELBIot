# 🔧 ACTION PLAN: Real-Time Data Integration
**Target:** Remove dummy data dependency dan implement real database streaming

---

## QUICK FIX #1: Server.JS - Replace Dummy Socket Emissions

**File:** `backend/server.js`

**Current Code (Lines 80-110):**
```javascript
// Stream data every 2 seconds
const interval = setInterval(() => {
  if (socket.connected) {
    // Emit different data types
    socket.emit('ampere-data-update', generatePanelData());
    socket.emit('panel-update', generatePanelData());
    socket.emit('transformer-update', generateTransformerData());
    socket.emit('weather-update', generateWeatherData());
    socket.emit('device-status-change', generateDeviceStatus());

    // Random alerts
    if (Math.random() > 0.9) {
      socket.emit('alert-created', generateAlertData());
    }
  }
}, 2000);
```

**Replacement Code:**
```javascript
// Stream REAL data every 2 seconds from database
const interval = setInterval(async () => {
  if (socket.connected) {
    try {
      // Fetch real panel data
      const panels = await query(
        'SELECT * FROM panels WHERE status = "online" ORDER BY RAND() LIMIT 1'
      );
      
      // Fetch real transformer data
      const transformers = await query(
        'SELECT * FROM transformers WHERE status = "online" ORDER BY RAND() LIMIT 1'
      );
      
      // Fetch latest weather data
      const weather = await query(
        'SELECT * FROM weather ORDER BY created_at DESC LIMIT 1'
      );
      
      // Fetch device status
      const devices = await query(
        'SELECT id, name, status FROM devices LIMIT 10'
      );
      
      // Fetch recent alerts
      const alerts = await query(
        'SELECT * FROM alerts WHERE status = "open" ORDER BY created_at DESC LIMIT 1'
      );
      
      // Emit REAL data
      if (panels.length) {
        socket.emit('ampere-data-update', {
          ...panels[0],
          timestamp: new Date()
        });
        socket.emit('panel-update', panels[0]);
      }
      
      if (transformers.length) {
        socket.emit('transformer-update', {
          ...transformers[0],
          timestamp: new Date()
        });
      }
      
      if (weather.length) {
        socket.emit('weather-update', weather[0]);
      }
      
      socket.emit('device-status-change', devices);
      
      if (alerts.length) {
        socket.emit('alert-created', alerts[0]);
      }
    } catch (error) {
      console.error('Real-time data fetch error:', error);
      // Fallback ke dummy hanya jika database error
      socket.emit('ampere-data-update', generatePanelData());
    }
  }
}, 2000);
```

**Implementation Steps:**
1. Replace interval code di server.js
2. Remove import `generateDemoData` jika sudah tidak digunakan
3. Test dengan database populated
4. Verify Socket.IO events menerima real data

---

## QUICK FIX #2: Dashboard.JS - Remove Hardcoded Values

**File:** `src/pages/Dashboard.js`

**Current Code (Lines 13-35):**
```javascript
const [metrics, setMetrics] = useState({
  totalEnergiHari: 45.8,
  totalBiaya: 57250000,
  panelAktif: 3,
  panelTotal: 5,
  voltageSekarang: 380,
  arusSekarang: 125.5,
  dayaSekarang: 45.8,
  lastUpdate: new Date()
});

// ... later in code
const [panelStatus] = useState([
  { name: 'Panel Utama', value: 68, fill: '#00d4ff' },
  { name: 'Panel A', value: 45, fill: '#00ff88' },
  { name: 'Panel B', value: 58, fill: '#ffaa00' },
  { name: 'Panel C', value: 32, fill: '#00d4ff' },
  { name: 'Panel D', value: 52, fill: '#00ff88' }
]);
```

**Replacement Code:**
```javascript
const [metrics, setMetrics] = useState({
  totalEnergiHari: 0,           // ← Fetch dari database
  totalBiaya: 0,                // ← Fetch dari database
  panelAktif: 0,                // ← Count dari database
  panelTotal: 0,                // ← Count dari database
  voltageSekarang: 0,
  arusSekarang: 0,
  dayaSekarang: 0,
  lastUpdate: new Date()
});

const [panelStatus, setPanelStatus] = useState([]);  // ← Make it state

// Add effect to fetch real data on mount
useEffect(() => {
  const fetchRealMetrics = async () => {
    try {
      // Fetch all panels
      const panelsResponse = await apiService.panels.getAll();
      const panelsData = panelsResponse.data || [];
      
      // Count online panels
      const onlinePanels = panelsData.filter(p => p.status === 'online');
      
      // Calculate panel status distribution
      const status = panelsData.map(p => ({
        name: p.name || `Panel ${p.id}`,
        value: p.power ? Math.min((p.power / 20000) * 100, 100) : 0,  // Convert to percentage
        fill: p.status === 'online' ? '#00ff88' : '#ff6b6b'
      }));
      
      // Set metrics
      setMetrics(prev => ({
        ...prev,
        panelAktif: onlinePanels.length,
        panelTotal: panelsData.length,
        voltageSekarang: panelsData[0]?.voltage || 0,
        arusSekarang: panelsData[0]?.ampere || 0,
        dayaSekarang: panelsData[0]?.power || 0,
      }));
      
      setPanelStatus(status);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };
  
  fetchRealMetrics();
  const interval = setInterval(fetchRealMetrics, 30000); // Refresh every 30s
  return () => clearInterval(interval);
}, []);
```

**Implementation Steps:**
1. Replace initial useState values
2. Add useEffect untuk fetch real metrics
3. Update setPanelStatus logic
4. Test dengan database populated
5. Verify initial render menampilkan real data

---

## QUICK FIX #3: PanelDistribusi.JS - Remove Hardcoded Fallback

**File:** `src/pages/PanelDistribusi.js`

**Current Code (Lines 20-28):**
```javascript
catch (err) {
  console.error('Error:', err);
  setPanels([
    { id: 1, nama: 'Panel Utama', lokasi: 'Lantai 1', energi: 12.5, 
      tegangan: 380, arus: 35.2, daya: 12.8, status: 'online', beban: 68 }
  ]);
  setSelectedPanel(1);
}
```

**Replacement Code:**
```javascript
catch (err) {
  console.error('Error fetching panels:', err);
  // Show error message instead of dummy data
  setError('Gagal memuat panel data: ' + err.message);
  setPanels([]); // Empty instead of dummy
}
```

**Full Updated Code:**
```javascript
useEffect(() => {
  const fetchPanels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.panels.getAll();
      if (response.data && Array.isArray(response.data)) {
        // Format data sesuai dengan yang ditampilkan
        const formattedPanels = response.data.map(p => ({
          id: p.id,
          nama: p.device_name || `Panel ${p.id}`,
          lokasi: p.location || 'Unknown',
          energi: p.power ? p.power / 1000 : 0, // Convert to kWh
          tegangan: p.voltage || 0,
          arus: p.ampere || 0,
          daya: p.power || 0,
          status: p.status || 'offline',
          beban: p.ampere ? Math.min((p.ampere / 63) * 100, 100) : 0 // Percentage
        }));
        
        setPanels(formattedPanels);
        if (formattedPanels.length > 0) {
          setSelectedPanel(formattedPanels[0].id);
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Gagal memuat data panels. Silakan refresh halaman.');
      setPanels([]); // Don't show dummy data
    } finally {
      setLoading(false);
    }
  };
  
  fetchPanels();
}, []);
```

---

## QUICK FIX #4: Trafo.JS - Remove Hardcoded Sample Data

**File:** `src/pages/Trafo.js`

**Current Code (Lines 26-35):**
```javascript
catch (err) {
  console.error('Error fetching transformers:', err);
  setError('Gagal memuat data trafo: ' + (err.response?.statusText || err.message));
  
  // Fallback dengan sample data
  setUnits([
    { id: 1, name: 'Trafo Unit 1', load: 75, temp: 65, voltage: 380, current: 125, status: 'Active' },
    { id: 2, name: 'Trafo Unit 2', load: 82, temp: 72, voltage: 380, current: 135, status: 'Active' },
    { id: 3, name: 'Trafo Unit 3 (Backup)', load: 0, temp: 45, voltage: 0, current: 0, status: 'Standby' }
  ]);
}
```

**Replacement Code:**
```javascript
catch (err) {
  console.error('Error fetching transformers:', err);
  setError('Gagal memuat data trafo. Pastikan backend running.');
  setUnits([]); // Empty instead of dummy
  setSelectedUnit(null);
}
```

---

## QUICK FIX #5: MasterData.JS - Remove Hardcoded Devices

**File:** `src/pages/MasterData.js`

**Current Code (Lines 28-37):**
```javascript
catch (err) {
  console.error('Error fetching devices:', err);
  setError('Gagal memuat data devices: ' + (err.response?.statusText || err.message));
  
  // Fallback dengan sample data
  setDevices([
    { id: 1, name: 'Device Panel Utama', status: 'Active', location: 'Lantai 1', type: 'Panel' },
    { id: 2, name: 'Device Trafo Unit 1', status: 'Active', location: 'Ruang Teknis', type: 'Transformer' },
    // ... more dummy devices
  ]);
}
```

**Replacement Code:**
```javascript
catch (err) {
  console.error('Error fetching devices:', err);
  setError('Gagal memuat data devices: ' + (err.response?.statusText || err.message));
  setDevices([]); // Empty instead of dummy
}
```

---

## QUICK FIX #6: Report.JS & Trend.JS - Remove Pure Random Mock

**File:** `src/pages/Report.js` & `src/pages/Trend.js`

**Current (Bad Practice):**
```javascript
catch {
  const mock = Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    energy: Math.random() * 100 + 50,    // ← Pure random, no basis
    cost: Math.random() * 500 + 200      // ← Pure random, no basis
  }));
  setChartData(mock);
}
```

**Better Approach:**
```javascript
catch (error) {
  console.error('Error generating report:', error);
  setError('Gagal generate report. Silakan coba dengan tanggal lain.');
  setChartData([]); // Empty chart instead of fake data
  setReports([]);
}
```

---

## Database Seeding - Ensure Real Data

**File:** `backend/utils/seedData.js`

**Action:** Verify seed data sudah dijalankan:
```bash
# Run seed data
npm run seed

# Or manually:
node -r dotenv/config utils/seedData.js
```

**Verify seeded data:**
```sql
SELECT COUNT(*) FROM devices;
SELECT COUNT(*) FROM panels;
SELECT COUNT(*) FROM transformers;
SELECT COUNT(*) FROM alerts;
SELECT COUNT(*) FROM weather;
```

---

## Testing Checklist

After implementing fixes:

- [ ] Backend server starting without errors
- [ ] Database has real data (not empty)
- [ ] Socket.IO emitting real database data
- [ ] Dashboard fetching real panel data
- [ ] Panel Distribusi showing real panels (not hardcoded)
- [ ] Trafo page showing real transformers (not dummy)
- [ ] Master Data showing real devices (not sample)
- [ ] No more random mock data in reports/trends
- [ ] Fallback error messages instead of dummy data
- [ ] Real-time updates from Socket.IO accurate

---

## Verification Commands

```bash
# Check if database has data
mysql -u root pelbiot -e "SELECT COUNT(*) FROM panels; SELECT COUNT(*) FROM devices; SELECT COUNT(*) FROM transformers;"

# Test Socket.IO connection
curl http://localhost:5000/health

# Monitor Socket.IO events
# Open browser console at http://localhost:3000 and check:
# - Socket.IO connected message
# - Real data in events (not random values)
# - No hardcoded initial values persisting
```

---

## Priority Order for Implementation

1. ✅ **FIRST:** Update `backend/server.js` - Replace dummy socket emissions with real DB queries
2. ✅ **SECOND:** Update `Dashboard.js` - Remove hardcoded metrics
3. ✅ **THIRD:** Update `PanelDistribusi.js`, `Trafo.js`, `MasterData.js` - Remove dummy fallbacks
4. ✅ **FOURTH:** Remove random mock generation from Report.js, Trend.js, LoadProfile.js
5. ✅ **FIFTH:** Test all components end-to-end
6. ✅ **SIXTH:** Deploy dengan confidence

---

## Performance Consideration

**Current approach (bad):**
- Emit data setiap 2 detik ke setiap client
- Data random, tidak accurate

**Recommended approach (good):**
- Query database hanya untuk latest/changed data
- Use cursor/offset untuk history paging
- Cache device list untuk refresh setiap 5 menit
- Real-time alerts hanya emit jika ada change

---

**Next Step:** Start dengan QUICK FIX #1 (Server.JS)
