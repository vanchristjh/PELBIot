# ⚡ PELBIOT Advanced Features - Quick Start Guide

## 🚀 Get Started dalam 5 Menit!

### Prerequisites
- Node.js 16+ terinstall
- Backend PELBIOT running
- MySQL database terkoneksi
- Redis (optional, untuk caching penuh)

---

## 1️⃣ Setup Performance Tuning

### Kode Implementasi
```javascript
// backend/server.js
import { initializePerformanceSystem } from './utils/performanceTuning.js';

// Inisialisasi
const performanceSystem = initializePerformanceSystem();

// Tambahkan middleware
app.use(performanceSystem.middleware);

// Dapatkan metrics
app.get('/api/perf-metrics', (req, res) => {
  const summary = performanceSystem.metricsCollector.getSummary();
  res.json(summary);
});
```

### Testing
```bash
# Terminal 1: Start backend
npm start

# Terminal 2: Get performance metrics
curl http://localhost:5000/api/advanced/performance/metrics

# Jalankan beberapa requests untuk generate data
for i in {1..100}; do curl http://localhost:5000/api/users; done

# Lihat analysis
curl http://localhost:5000/api/advanced/performance/analysis
```

**Expected Output:**
```json
{
  "bottlenecks": [...],
  "summary": {
    "criticalIssues": 0,
    "warnings": 0,
    "overallHealth": 100
  },
  "actionItems": []
}
```

---

## 2️⃣ Setup Database Optimization

### Kode Implementasi
```javascript
// backend/server.js
import { DatabaseOptimizationService } from './utils/dbOptimization.js';

// Inisialisasi
const dbOptimization = new DatabaseOptimizationService({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

await dbOptimization.initialize();

// Setup route
app.post('/api/optimize-db', async (req, res) => {
  const report = await dbOptimization.runFullOptimization();
  res.json(report);
});
```

### Testing
```bash
# Run full optimization
curl -X POST http://localhost:5000/api/advanced/database/optimize

# Check slow queries
curl http://localhost:5000/api/advanced/database/slow-queries

# Get table statistics
curl http://localhost:5000/api/advanced/database/table-stats
```

**What It Does:**
- ✅ Membuat 20+ optimization indexes
- ✅ Menganalisis table statistics
- ✅ Mengidentifikasi slow queries
- ✅ Memberikan rekomendasi

---

## 3️⃣ Setup Caching Strategy

### Kode Implementasi
```javascript
// backend/server.js
import { MultiLayerCache, cachingMiddleware } from './utils/cachingStrategy.js';

// Inisialisasi
const cachingSystem = new MultiLayerCache({
  lruSize: 1000,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

await cachingSystem.initialize();

// Tambahkan middleware untuk auto-caching
app.use('/api', cachingMiddleware(cachingSystem, 300)); // Cache 5 minutes

// Get cache stats
app.get('/api/cache-stats', (req, res) => {
  const stats = cachingSystem.getStats();
  res.json(stats);
});
```

### Testing
```bash
# First request (MISS)
curl http://localhost:5000/api/users
# Response header: X-Cache: MISS

# Second request (HIT)
curl http://localhost:5000/api/users
# Response header: X-Cache: HIT

# Check cache statistics
curl http://localhost:5000/api/advanced/cache/stats

# Clear cache
curl -X POST http://localhost:5000/api/advanced/cache/clear
```

**Cache Statistics Output:**
```json
{
  "lru": {
    "size": 45,
    "hits": 120,
    "misses": 80,
    "hitRate": "60%"
  },
  "redis": "Connected",
  "hitRate": "75%"
}
```

---

## 4️⃣ Setup Load Balancing

### Kode Implementasi
```javascript
// backend/server.js
import { initializeLoadBalancer } from './utils/loadBalancer.js';

// Inisialisasi
const { clusterManager, middleware } = initializeLoadBalancer(app, {
  workerCount: require('os').cpus().length,
  strategy: 'round-robin',
  sessionAffinity: true
});

await clusterManager.initialize();

// Tambahkan middleware
app.use(middleware);

// Get cluster status
app.get('/api/cluster-status', (req, res) => {
  const status = clusterManager.getStatus();
  res.json(status);
});
```

### Jalankan Backend dengan Clustering
```bash
# Backend akan otomatis membuat worker processes
# Output:
# ✅ Worker 1 started (PID: 12345)
# ✅ Worker 2 started (PID: 12346)
# ✅ Worker 3 started (PID: 12347)
# ✅ Worker 4 started (PID: 12348)

# Check cluster status
curl http://localhost:5000/api/advanced/cluster/status
```

**Cluster Status Output:**
```json
{
  "master": true,
  "workers": [
    {"id": 1, "pid": 12345, "alive": true, "connections": 5, "requests": 1234},
    {"id": 2, "pid": 12346, "alive": true, "connections": 3, "requests": 1200},
    ...
  ],
  "totals": {
    "workers": 4,
    "connections": 20,
    "requests": 5000,
    "averageConnectionsPerWorker": "5.0"
  }
}
```

---

## 5️⃣ Setup Monitoring & Alerting

### Kode Implementasi
```javascript
// backend/server.js
import { initializeMonitoringSystem } from './utils/monitoring.js';

// Inisialisasi
const monitoringSystem = initializeMonitoringSystem({
  collectionInterval: 30000 // 30 seconds
});

// Setup default alerts
const emailChannel = new EmailNotificationChannel({
  from: 'alerts@pelbiot.com',
  to: ['admin@pelbiot.com'],
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  }
});

// Get dashboard
app.get('/api/monitoring-dashboard', (req, res) => {
  const dashboard = monitoringSystem.dashboardService.getDashboardData();
  res.json(dashboard);
});
```

### Testing
```bash
# Get monitoring dashboard
curl http://localhost:5000/api/advanced/monitoring/dashboard

# Get active alerts
curl http://localhost:5000/api/advanced/monitoring/alerts/active

# Get alert history
curl http://localhost:5000/api/advanced/monitoring/alerts/history?limit=50

# Get system health
curl http://localhost:5000/api/advanced/monitoring/metrics/summary

# Create incident
curl -X POST http://localhost:5000/api/advanced/monitoring/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database connection timeout",
    "description": "Primary database unreachable",
    "severity": "CRITICAL"
  }'

# Acknowledge alert
curl -X POST http://localhost:5000/api/advanced/monitoring/alerts/{alertId}/acknowledge
```

**Monitoring Dashboard Output:**
```json
{
  "timestamp": "2025-10-29T10:30:45Z",
  "metrics": {...},
  "alerts": {
    "active": 2,
    "details": [...]
  },
  "incidents": {
    "open": 0,
    "details": []
  },
  "systemHealth": {
    "totalScore": 95,
    "status": "EXCELLENT",
    "componentScores": {
      "cpu": 100,
      "memory": 90,
      "errors": 100,
      "responseTime": 85
    }
  }
}
```

---

## 🔗 Integration ke Server.js

### Complete Backend Server Setup

```javascript
// backend/server.js

import express from 'express';
import cluster from 'cluster';
import os from 'os';

// Import advanced features
import { initializePerformanceSystem } from './utils/performanceTuning.js';
import { DatabaseOptimizationService } from './utils/dbOptimization.js';
import { MultiLayerCache, cachingMiddleware } from './utils/cachingStrategy.js';
import { initializeLoadBalancer } from './utils/loadBalancer.js';
import { initializeMonitoringSystem } from './utils/monitoring.js';
import setupAdvancedFeaturesRoutes from './routes/advancedFeatures.js';

const app = express();
app.use(express.json());

// ============================================
// INITIALIZE ALL ADVANCED SYSTEMS
// ============================================

console.log('🚀 Initializing PELBIOT Advanced Features...\n');

// 1. Performance System
const performanceSystem = initializePerformanceSystem();
app.use(performanceSystem.middleware);
console.log('✅ Performance Tuning initialized');

// 2. Database Optimization
const dbOptimization = new DatabaseOptimizationService({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
await dbOptimization.initialize();
console.log('✅ Database Optimization initialized');

// 3. Caching System
const cachingSystem = new MultiLayerCache({
  lruSize: 1000,
  redis: {
    host: process.env.REDIS_HOST || 'localhost'
  }
});
await cachingSystem.initialize();
app.use(cachingMiddleware(cachingSystem, 300));
console.log('✅ Caching Strategy initialized');

// 4. Load Balancing
const { clusterManager, middleware: lbMiddleware } = initializeLoadBalancer(app, {
  workerCount: os.cpus().length,
  strategy: 'round-robin',
  sessionAffinity: true
});
app.use(lbMiddleware);
console.log('✅ Load Balancing initialized');

// 5. Monitoring & Alerting
const monitoringSystem = initializeMonitoringSystem({
  collectionInterval: 30000
});
console.log('✅ Monitoring & Alerting initialized');

// ============================================
// SETUP API ROUTES
// ============================================

// Advanced features routes
const advancedRoutes = setupAdvancedFeaturesRoutes(
  app,
  performanceSystem,
  dbOptimization,
  cachingSystem,
  clusterManager,
  monitoringSystem
);

app.use('/api/advanced', advancedRoutes);
console.log('✅ API routes configured\n');

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

if (cluster.isPrimary) {
  await clusterManager.initialize();
} else {
  app.listen(PORT, () => {
    console.log(`✨ PELBIOT Advanced Features ready on port ${PORT}`);
  });
}
```

---

## 📊 Monitoring Dashboard (Frontend)

### Simple React Component

```jsx
// src/pages/AdvancedMonitoring.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdvancedMonitoring() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('/api/advanced/monitoring/dashboard');
        setDashboard(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!dashboard) return <div>No data</div>;

  return (
    <div className="monitoring-dashboard">
      <h2>System Monitoring</h2>
      
      <div className="health-score">
        <h3>System Health: {dashboard.systemHealth.totalScore}/100</h3>
        <p>Status: {dashboard.systemHealth.status}</p>
      </div>

      <div className="alerts">
        <h3>Active Alerts: {dashboard.alerts.active}</h3>
        {dashboard.alerts.details.map(alert => (
          <div key={alert.id} className="alert-item">
            <p>{alert.ruleName} - {alert.severity}</p>
          </div>
        ))}
      </div>

      <div className="incidents">
        <h3>Open Incidents: {dashboard.incidents.open}</h3>
        {dashboard.incidents.details.map(incident => (
          <div key={incident.id} className="incident-item">
            <p>{incident.title} - {incident.severity}</p>
          </div>
        ))}
      </div>

      <div className="metrics">
        <h3>System Metrics</h3>
        <pre>{JSON.stringify(dashboard.metrics, null, 2)}</pre>
      </div>
    </div>
  );
}
```

---

## ✅ Verification Checklist

Setelah setup, verify semuanya berjalan:

- [ ] Performance metrics collecting setiap 30 detik
- [ ] Database queries tracking dengan slow query detection
- [ ] Cache hit rate > 60%
- [ ] All worker processes running
- [ ] Monitoring dashboard showing data
- [ ] Alerts configured dan working
- [ ] No error logs

---

## 🎯 Next Steps

1. **Monitor Production**
   - Setup dashboard monitoring
   - Configure alert notifications
   - Review reports daily

2. **Optimize Based on Metrics**
   - Analyze performance trends
   - Implement recommendations
   - Test improvements

3. **Scale Infrastructure**
   - Add more workers if needed
   - Increase cache size
   - Upgrade database resources

4. **Continuous Improvement**
   - Regular health checks
   - Incident post-mortems
   - Performance tuning cycles

---

**Ready to go! 🚀 Your system is now production-grade and enterprise-ready!**
