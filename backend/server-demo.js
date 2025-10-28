import express from 'express';
import http from 'http';
import { Server as SocketIo } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// ========================
// DEMO DATA GENERATORS
// ========================

const generateAlertData = () => ({
  id: Math.floor(Math.random() * 1000),
  title: ['Power Surge', 'Voltage Low', 'Temperature High', 'Device Offline', 'System Update'][Math.floor(Math.random() * 5)],
  severity: ['info', 'warning', 'critical'][Math.floor(Math.random() * 3)],
  message: 'System status update',
  timestamp: new Date().toISOString(),
  status: Math.random() > 0.3 ? 'open' : 'acknowledged'
});

const generatePanelData = () => ({
  ampere: Math.random() * 100 + 50,
  voltage: Math.random() * 10 + 380,
  power: Math.random() * 50000 + 30000,
  frequency: 50 + Math.random() * 0.5,
  timestamp: new Date().toISOString()
});

const generateTrendData = () => ({
  date: new Date().toISOString(),
  power: Math.random() * 100000 + 30000,
  energy: Math.random() * 1000 + 500,
  temperature: Math.random() * 10 + 30,
  efficiency: Math.random() * 20 + 75
});

// ========================
// MOCK API ROUTES
// ========================

// Devices
app.get('/api/devices', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Main Meter', type: 'meter', location: 'Building A', status: 'active' },
      { id: 2, name: 'Solar Panels', type: 'generator', location: 'Roof', status: 'active' },
      { id: 3, name: 'Transformer 1', type: 'transformer', location: 'Basement', status: 'active' }
    ]
  });
});

// Alerts
app.get('/api/alerts', (req, res) => {
  res.json({
    success: true,
    data: [generateAlertData(), generateAlertData(), generateAlertData()]
  });
});

// Panels
app.get('/api/panels', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Panel A1', voltage: 380, current: 75, power: 30000 },
      { id: 2, name: 'Panel A2', voltage: 380, current: 82, power: 33000 },
      { id: 3, name: 'Panel B1', voltage: 380, current: 65, power: 26000 }
    ]
  });
});

// Trends
app.get('/api/trends', (req, res) => {
  res.json({
    success: true,
    data: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
      power: Math.random() * 100000 + 30000,
      energy: Math.random() * 1000 + 500
    }))
  });
});

// Reports
app.get('/api/reports', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, title: 'Daily Report', type: 'daily', createdAt: new Date().toISOString() },
      { id: 2, title: 'Weekly Report', type: 'weekly', createdAt: new Date().toISOString() }
    ]
  });
});

// Load Profile
app.get('/api/load-profile', (req, res) => {
  res.json({
    success: true,
    data: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      load: Math.random() * 100,
      timestamp: new Date().toISOString()
    }))
  });
});

// System Health
app.get('/api/system/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: Math.floor(Math.random() * 100000),
      activeDevices: Math.floor(Math.random() * 10) + 5,
      totalDevices: 10,
      lastUpdate: new Date().toISOString()
    }
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'PELBIOT Backend Server is running',
    timestamp: new Date().toISOString(),
    mode: '🎯 DEMO MODE - Live streaming data'
  });
});

// ========================
// REAL-TIME SOCKET.IO
// ========================

io.on('connection', (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);

  socket.on('start-realtime', () => {
    console.log(`📡 Real-time started for: ${socket.id}`);
    
    // Emit data every 2 seconds
    const interval = setInterval(() => {
      socket.emit('ampere-data-update', generatePanelData());
      socket.emit('alert-created', generateAlertData());
      socket.emit('device-status-update', {
        deviceId: Math.floor(Math.random() * 10) + 1,
        status: Math.random() > 0.05 ? 'active' : 'offline',
        timestamp: new Date().toISOString()
      });
      socket.emit('power-consumption-update', {
        value: Math.random() * 100 + 50,
        unit: 'kW',
        timestamp: new Date().toISOString()
      });
      socket.emit('energy-production-update', {
        value: Math.random() * 500 + 300,
        unit: 'kWh',
        timestamp: new Date().toISOString()
      });
      socket.emit('temperature-update', {
        value: Math.random() * 10 + 30,
        unit: '°C',
        timestamp: new Date().toISOString()
      });
      socket.emit('load-profile-update', {
        hour: new Date().getHours(),
        load: Math.random() * 100,
        timestamp: new Date().toISOString()
      });
      socket.emit('efficiency-update', {
        value: Math.random() * 20 + 75,
        timestamp: new Date().toISOString()
      });
      socket.emit('trend-update', generateTrendData());
    }, 2000);

    socket.on('stop-realtime', () => {
      clearInterval(interval);
      console.log(`📡 Real-time stopped for: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// ========================
// ERROR HANDLING
// ========================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ========================
// START SERVER
// ========================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     🚀 PELBIOT BACKEND SERVER RUNNING                         ║
║                                                                ║
║     🎯 DEMO MODE - Real-time data streaming active            ║
║                                                                ║
║     Server: http://localhost:${PORT}                           
║     Health: http://localhost:${PORT}/health                    
║     Socket.IO: ws://localhost:${PORT}                          
║                                                                ║
║     ✅ All 13 pages will work with demo data                  ║
║     ✅ Real-time updates every 2 seconds                      ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
