# ✅ IMPLEMENTATION CHECKLIST: Real-Time Data Fix

**Project:** PELBIoT  
**Target:** Remove dummy data dependency, implement real database streaming  
**Timeline:** 2-3 weeks  
**Priority:** 🔴 CRITICAL

---

## PHASE 1: CRITICAL FIXES (Week 1)

### Week 1 - Backend Socket.IO Fix

#### ☐ 1.1: Update server.js Main Socket Handler
- **File:** `backend/server.js`
- **Lines:** 80-115 (interval setInterval)
- **Action:** Replace `generateDemoData()` calls with database queries
- **Time:** 1 hour
- **Status:** NOT STARTED
```javascript
// Replace from:
socket.emit('ampere-data-update', generatePanelData());

// To:
const panels = await query('SELECT * FROM panels LIMIT 1');
socket.emit('ampere-data-update', panels[0]);
```
- **Testing:** 
  - [ ] Verify Socket.IO still connects
  - [ ] Verify data emitted is from database
  - [ ] Check console for no errors
- **PR Ready:** [ ]

#### ☐ 1.2: Update periodic broadcast (server-tick)
- **File:** `backend/server.js`
- **Lines:** 158-167
- **Action:** Replace hardcoded mock with real query
- **Time:** 30 minutes
- **Status:** NOT STARTED
```javascript
// Update systemHealth from real data
const systemHealth = await query(
  'SELECT COUNT(*) as total, SUM(status="online") as online FROM devices'
);
socket.emit('server-tick', { systemHealth });
```
- **Testing:** [ ]
- **PR Ready:** [ ]

#### ☐ 1.3: Test backend with database populated
- **Command:** `npm run seed`
- **Verify:**
  - [ ] Database has test data (devices, panels, transformers)
  - [ ] Server starts without errors
  - [ ] Socket.IO events emit real data
  - [ ] No random values in emissions
- **Time:** 30 minutes

#### ☐ 1.4: Add error handling for DB queries
- **File:** `backend/server.js`
- **Action:** Add try-catch for all database queries in socket interval
- **Time:** 30 minutes
- **Fallback:** Log error but keep socket alive
```javascript
try {
  const data = await query(...);
  socket.emit(..., data);
} catch (error) {
  console.error('Real-time query failed:', error);
  // Don't emit anything or emit error event
}
```
- **PR Ready:** [ ]

---

### Week 1 - Frontend Dashboard Fix

#### ☐ 1.5: Remove hardcoded metrics from Dashboard
- **File:** `src/pages/Dashboard.js`
- **Lines:** 13-35 (useState)
- **Action:** Remove hardcoded initial values
- **Time:** 1 hour
- **Status:** NOT STARTED
```javascript
// Remove hardcoded:
totalEnergiHari: 45.8,
totalBiaya: 57250000,
panelAktif: 3,
panelTotal: 5,

// Replace with fetched values
```
- **Testing:**
  - [ ] Dashboard loads without initial values
  - [ ] Values populate from API
  - [ ] No NaN or undefined shown
- **PR Ready:** [ ]

#### ☐ 1.6: Add useEffect to fetch real metrics
- **File:** `src/pages/Dashboard.js`
- **Action:** Add effect to fetch panels and calculate metrics
- **Time:** 1 hour
- **Status:** NOT STARTED
```javascript
useEffect(() => {
  const fetchMetrics = async () => {
    const panelsResponse = await apiService.panels.getAll();
    const panels = panelsResponse.data || [];
    setMetrics(prev => ({
      ...prev,
      panelAktif: panels.filter(p => p.status === 'online').length,
      panelTotal: panels.length,
      // ... other calculated values
    }));
  };
  fetchMetrics();
}, []);
```
- **Testing:**
  - [ ] Metrics match database values
  - [ ] No hardcoded fallbacks
  - [ ] Updates on refresh
- **PR Ready:** [ ]

#### ☐ 1.7: Update panel status from real data
- **File:** `src/pages/Dashboard.js`
- **Action:** Calculate panelStatus from fetched data instead of hardcoded array
- **Time:** 30 minutes
- **Status:** NOT STARTED
- **Testing:**
  - [ ] Panel status reflects real panel data
  - [ ] Colors update based on actual status
- **PR Ready:** [ ]

---

### Week 1 - Other Pages Quick Fixes

#### ☐ 1.8: PanelDistribusi.js - Remove dummy fallback
- **File:** `src/pages/PanelDistribusi.js`
- **Lines:** 25-28 (catch block)
- **Action:** Remove hardcoded dummy panels in error catch
- **Time:** 20 minutes
```javascript
// Replace from:
setPanels([
  { id: 1, nama: 'Panel Utama', ... }  // Dummy
]);

// To:
setError('Failed to load panels');
setPanels([]);
```
- **PR Ready:** [ ]

#### ☐ 1.9: Trafo.js - Remove dummy fallback
- **File:** `src/pages/Trafo.js`
- **Lines:** 30-35 (catch block)
- **Action:** Remove hardcoded dummy transformers
- **Time:** 20 minutes
- **PR Ready:** [ ]

#### ☐ 1.10: MasterData.js - Remove dummy fallback
- **File:** `src/pages/MasterData.js`
- **Lines:** 30-35 (catch block)
- **Action:** Remove hardcoded dummy devices
- **Time:** 20 minutes
- **PR Ready:** [ ]

#### ☐ 1.11: Trend.js - Remove random mock
- **File:** `src/pages/Trend.js`
- **Lines:** 20-25 (catch block)
- **Action:** Replace random mock with error state
- **Time:** 20 minutes
```javascript
// Replace:
const mock = Array.from({ length: 7 }, () => ({
  value: Math.random() * 100  // Pure random
}));

// With:
setError('Failed to load trend data');
setTrendData([]);
```
- **PR Ready:** [ ]

#### ☐ 1.12: Report.js - Remove random mock
- **File:** `src/pages/Report.js`
- **Lines:** 20-27 (catch block)
- **Action:** Replace random mock with error state
- **Time:** 20 minutes
- **PR Ready:** [ ]

#### ☐ 1.13: LoadProfile.js - Remove random mock
- **File:** `src/pages/LoadProfile.js`
- **Lines:** 12-18 (catch block)
- **Action:** Replace random mock with error state
- **Time:** 20 minutes
- **PR Ready:** [ ]

#### ☐ 1.14: Alarm.js - Remove dummy alert
- **File:** `src/pages/Alarm.js`
- **Lines:** 19-25 (catch block)
- **Action:** Remove hardcoded dummy alert
- **Time:** 20 minutes
- **PR Ready:** [ ]

---

## PHASE 1 SUMMARY

| Task | Time | Status |
|------|------|--------|
| Backend Socket.IO Fix | 2.5 hrs | [ ] |
| Dashboard Frontend Fix | 3 hrs | [ ] |
| Other Pages Cleanup | 3 hrs | [ ] |
| **Phase 1 Total** | **8.5 hrs** | **[ ]** |

---

## PHASE 2: DATA QUALITY IMPROVEMENTS (Week 2)

### ☐ 2.1: Implement data validation in backend
- **File:** Create `backend/utils/validation.js`
- **Time:** 2 hours
- **Content:**
  - Voltage range validation
  - Ampere range validation
  - Temperature range validation
  - Alert severity determination

```javascript
export const validatePanelData = (data) => {
  const errors = [];
  if (data.voltage < 300 || data.voltage > 450) {
    errors.push('Voltage out of range');
  }
  // ... more validations
  return { valid: errors.length === 0, errors };
};
```

- **PR Ready:** [ ]

### ☐ 2.2: Add data quality monitoring
- **File:** `backend/utils/dataQuality.js`
- **Time:** 1.5 hours
- **Track:**
  - Last successful update timestamp
  - Update frequency
  - Data accuracy score

- **PR Ready:** [ ]

### ☐ 2.3: Implement circuit breaker for DB queries
- **File:** `backend/server.js`
- **Time:** 1.5 hours
- **Purpose:** 
  - Fallback if database becomes unavailable
  - Graceful error handling
  - User notification

- **PR Ready:** [ ]

### ☐ 2.4: Add data freshness indicator
- **Frontend:** All monitoring pages
- **Time:** 2 hours
- **Show:**
  - Last update timestamp
  - Connection status
  - Data age warning if stale

- **PR Ready:** [ ]

---

## PHASE 2 SUMMARY

| Task | Time | Status |
|------|------|--------|
| Data Validation | 2 hrs | [ ] |
| Quality Monitoring | 1.5 hrs | [ ] |
| Circuit Breaker | 1.5 hrs | [ ] |
| Freshness Indicator | 2 hrs | [ ] |
| **Phase 2 Total** | **7 hours** | **[ ]** |

---

## PHASE 3: SENSOR INTEGRATION (Week 3)

### ☐ 3.1: Design sensor communication protocol
- **Document:** `docs/SENSOR_INTEGRATION.md`
- **Time:** 2 hours
- **Define:**
  - Modbus register mapping
  - Data conversion formulas
  - Polling interval
  - Error handling

- **PR Ready:** [ ]

### ☐ 3.2: Implement Modbus client
- **File:** `backend/utils/modbusClient.js`
- **Time:** 3 hours
- **Functionality:**
  - Connect to meter devices
  - Read holding registers
  - Parse raw values
  - Return formatted data

- **PR Ready:** [ ]

### ☐ 3.3: Create sensor data polling service
- **File:** `backend/utils/sensorPoller.js`
- **Time:** 2.5 hours
- **Features:**
  - Poll meters every N seconds
  - Validate data
  - Store to database
  - Error recovery

```javascript
export const startSensorPolling = async () => {
  setInterval(async () => {
    try {
      const meters = await query('SELECT * FROM devices WHERE type="meter"');
      for (const meter of meters) {
        const data = await readMeterData(meter.ip_address);
        await storeMeterData(meter.id, data);
      }
    } catch (error) {
      console.error('Polling failed:', error);
    }
  }, 5000);
};
```

- **PR Ready:** [ ]

### ☐ 3.4: Integrate sensor polling into server startup
- **File:** `backend/server.js`
- **Time:** 30 minutes
- **Action:** Start sensor polling when server starts
- **PR Ready:** [ ]

### ☐ 3.5: Test with actual meter/sensor
- **Prerequisites:**
  - Meter connected and accessible
  - IP address configured
  - Modbus registers documented
- **Time:** 2 hours
- **Verify:**
  - [ ] Data polled successfully
  - [ ] Values in expected range
  - [ ] Stored in database
  - [ ] Emitted via Socket.IO

- **PR Ready:** [ ]

---

## PHASE 3 SUMMARY

| Task | Time | Status |
|------|------|--------|
| Sensor Protocol Design | 2 hrs | [ ] |
| Modbus Client | 3 hrs | [ ] |
| Sensor Polling Service | 2.5 hrs | [ ] |
| Server Integration | 0.5 hrs | [ ] |
| Testing | 2 hrs | [ ] |
| **Phase 3 Total** | **10 hours** | **[ ]** |

---

## PHASE 4: PRODUCTION HARDENING (Week 4)

### ☐ 4.1: Performance testing
- **Benchmark:**
  - Database query performance
  - Socket.IO event throughput
  - Memory usage
- **Time:** 2 hours
- **Tool:** Artillery, k6, or similar

- **PR Ready:** [ ]

### ☐ 4.2: Error handling audit
- **Review:** All try-catch blocks
- **Ensure:** 
  - User-friendly error messages
  - Proper logging
  - No sensitive data exposed
- **Time:** 2 hours

- **PR Ready:** [ ]

### ☐ 4.3: Data backup & recovery
- **Implement:**
  - Automated database backups
  - Recovery procedures
  - Test restore
- **Time:** 2 hours

- **PR Ready:** [ ]

### ☐ 4.4: Monitoring & alerting setup
- **Implement:**
  - System health dashboard
  - Alert thresholds
  - Notification channels
- **Time:** 3 hours

- **PR Ready:** [ ]

### ☐ 4.5: Documentation completion
- **Update:**
  - User guide
  - Admin documentation
  - API documentation
  - Troubleshooting guide
- **Time:** 3 hours

- **PR Ready:** [ ]

### ☐ 4.6: Final UAT testing
- **With:**
  - Super Admin
  - Admin
  - Moderator
- **Verify:**
  - [ ] All features work with real data
  - [ ] No hardcoded values visible
  - [ ] No random data
  - [ ] System stable
- **Time:** 3 hours

- **PR Ready:** [ ]

---

## PHASE 4 SUMMARY

| Task | Time | Status |
|------|------|--------|
| Performance Testing | 2 hrs | [ ] |
| Error Handling Audit | 2 hrs | [ ] |
| Backup & Recovery | 2 hrs | [ ] |
| Monitoring Setup | 3 hrs | [ ] |
| Documentation | 3 hrs | [ ] |
| UAT Testing | 3 hrs | [ ] |
| **Phase 4 Total** | **15 hours** | **[ ]** |

---

## DEPLOYMENT CHECKLIST

Before going to production:

- [ ] All hardcoded dummy data removed
- [ ] All random mock data replaced with real data
- [ ] Database has real data (devices, panels, transformers)
- [ ] Socket.IO emits real database data
- [ ] REST API all endpoints tested
- [ ] Error messages display instead of dummy data
- [ ] No console errors or warnings
- [ ] Performance acceptable (< 2s response time)
- [ ] All three roles tested (Super Admin, Admin, Moderator)
- [ ] Real sensor integration working
- [ ] Data validation in place
- [ ] Monitoring dashboard working
- [ ] Backup procedures tested
- [ ] Documentation complete
- [ ] Team trained on new system

---

## DAILY PROGRESS TEMPLATE

### Day: _______

#### Morning (What will be done)
- [ ] Task 1: _______________
- [ ] Task 2: _______________

#### Afternoon (Completed)
- [x] Task: _______ (Done in X hours)
- [x] Task: _______ (Done in X hours)

#### Blockers/Issues
- Issue: _____________________
- Solution: __________________

#### Tomorrow Plan
- Task: ______________________
- Task: ______________________

---

## QUICK REFERENCE

### High Priority Quick Wins (Do First)
1. Update server.js Socket.IO (1 hour) ← **START HERE**
2. Remove Dashboard hardcoded values (1 hour)
3. Remove dummy fallbacks from all pages (2 hours)

**Total Quick Fix Time: 4 hours**
**Impact: 70% improvement in data accuracy**

---

## ESTIMATED TOTALS

| Phase | Hours | Days | Priority |
|-------|-------|------|----------|
| Phase 1 (Critical) | 8.5 | 1-2 | 🔴 CRITICAL |
| Phase 2 (Quality) | 7 | 1 | 🟠 HIGH |
| Phase 3 (Sensors) | 10 | 1-2 | 🟠 HIGH |
| Phase 4 (Production) | 15 | 2 | 🟡 MEDIUM |
| **TOTAL** | **40.5 hrs** | **4-5 weeks** | |

---

## SUCCESS CRITERIA

✅ **Project Complete When:**
1. Zero hardcoded dummy data in code
2. Zero random mock data generation in production
3. 100% of real-time data from database
4. 100% of REST API working with real data
5. All three roles successfully tested
6. Real sensor data integration working
7. No user complaints about data accuracy
8. System stable for 1 week production test

---

**Status:** 🟢 Ready to Start
**Assigned To:** _____________
**Started:** _____________
**Expected Completion:** _____________
