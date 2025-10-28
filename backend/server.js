import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Controllers & Routes
import deviceRoutes from './routes/devices.js';
import panelRoutes from './routes/panels.js';
import alertRoutes from './routes/alerts.js';
import reportRoutes from './routes/reports.js';
import trendRoutes from './routes/trends.js';
import loadProfileRoutes from './routes/loadProfile.js';
import systemRoutes from './routes/system.js';
import masterDataRoutes from './routes/masterData.js';

// Utils
import { errorHandler, notFound } from './middleware/errorHandler.js';
import {
  generatePanelData,
  generateTransformerData,
  generateWeatherData,
  generateAlertData,
  generateSystemHealth,
  generateEnergyData,
  generateLoadProfileData,
  generateTrendData,
  generateDeviceStatus
} from './utils/generateDemoData.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: '✅ Backend API Running', timestamp: new Date() });
});

// API Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/panels', panelRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/load-profile', loadProfileRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/master-data', masterDataRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Socket.IO Connection Handler
const clients = new Map();
const realTimeIntervals = new Map();

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  clients.set(socket.id, { id: socket.id, connectedAt: new Date() });

  // Send initial connection status
  socket.emit('connect', { status: 'Connected to backend', socketId: socket.id });

  // Real-time data streaming
  socket.on('start-realtime', () => {
    console.log(`📡 Real-time data streaming started for ${socket.id}`);

    // Clear any existing intervals for this socket
    if (realTimeIntervals.has(socket.id)) {
      clearInterval(realTimeIntervals.get(socket.id));
    }

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

    realTimeIntervals.set(socket.id, interval);
  });

  socket.on('stop-realtime', () => {
    console.log(`⏹️ Real-time data streaming stopped for ${socket.id}`);
    if (realTimeIntervals.has(socket.id)) {
      clearInterval(realTimeIntervals.get(socket.id));
      realTimeIntervals.delete(socket.id);
    }
  });

  // On-demand data requests
  socket.on('request-panel-data', () => {
    socket.emit('panel-data', generatePanelData());
  });

  socket.on('request-system-health', () => {
    socket.emit('system-health', generateSystemHealth());
  });

  socket.on('request-energy-data', () => {
    socket.emit('energy-data', generateEnergyData());
  });

  socket.on('request-load-profile', () => {
    socket.emit('load-profile-data', generateLoadProfileData());
  });

  socket.on('request-trend-data', (type) => {
    socket.emit('trend-data', generateTrendData(type));
  });

  // Keep-alive / Heartbeat
  socket.on('heartbeat', (data) => {
    socket.emit('heartbeat-ack', { timestamp: new Date() });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    clients.delete(socket.id);

    // Clear interval
    if (realTimeIntervals.has(socket.id)) {
      clearInterval(realTimeIntervals.get(socket.id));
      realTimeIntervals.delete(socket.id);
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`⚠️ Socket error for ${socket.id}:`, error);
  });

  socket.on('connect_error', (error) => {
    console.error(`⚠️ Connection error for ${socket.id}:`, error);
  });
});

// Periodic broadcast to all clients (every 5 seconds)
setInterval(() => {
  if (io.engine.clientsCount > 0) {
    io.emit('server-tick', {
      timestamp: new Date(),
      connectedClients: clients.size,
      systemHealth: generateSystemHealth()
    });
  }
}, 5000);

// Server startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log(`║  🚀 PELBIOT Backend Server Running!                     ║`);
  console.log(`║  📡 Server: http://localhost:${PORT}                             ║`);
  console.log(`║  🔌 WebSocket: ws://localhost:${PORT}                             ║`);
  console.log('║  ✅ Ready to receive connections                         ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📊 API Endpoints Available:');
  console.log('   • GET  /api/devices');
  console.log('   • GET  /api/panels');
  console.log('   • GET  /api/alerts/active');
  console.log('   • GET  /api/trends/power');
  console.log('   • GET  /api/load-profile/history');
  console.log('   • GET  /api/system/health');
  console.log('');
  console.log('🔌 Socket.IO Events Available:');
  console.log('   • ampere-data-update');
  console.log('   • panel-update');
  console.log('   • transformer-update');
  console.log('   • weather-update');
  console.log('   • alert-created');
  console.log('   • device-status-change');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default server;
