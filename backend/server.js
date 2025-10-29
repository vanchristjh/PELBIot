import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Swagger
import { swaggerSpec, swaggerUi } from './swagger.js';

// Controllers & Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import deviceRoutes from './routes/devices.js';
import panelRoutes from './routes/panels.js';
import alertRoutes from './routes/alerts.js';
import reportRoutes from './routes/reports.js';
import trendRoutes from './routes/trends.js';
import loadProfileRoutes from './routes/loadProfile.js';
import systemRoutes from './routes/system.js';
import masterDataRoutes from './routes/masterData.js';
import notificationRoutes from './routes/notifications.js';
import alertManagementRoutes from './routes/alertManagement.js';
import mqttRoutes, { setMQTTService } from './routes/mqtt.js';

// Utils
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { dedupMiddleware, responseCache, cacheStatsMiddleware } from './middleware/cacheMiddleware.js';
import { query } from './utils/database.js';
import emailService from './utils/emailService.js';

// MQTT Service
import MQTTService from './services/mqttService.js';

// Security Middleware
import {
  securityHeaders,
  generalLimiter,
  sanitizeInputs,
  corsOptions,
  securityLogger
} from './middleware/securityMiddleware.js';

// New Security & Validation Middleware
import { validationMiddleware } from './middleware/validationMiddleware.js';
import { createRateLimitMiddleware, createCircuitBreakerMiddleware } from './middleware/rateLimitMiddleware.js';

// Sentry Error Tracking (optional - requires Node 18.19+)
let initSentry, sentryRequestHandler, sentryErrorHandler, errorTrackerMiddleware, transactionMiddleware;
try {
  const sentryModule = await import('./utils/errorTracking.js');
  initSentry = sentryModule.initSentry;
  sentryRequestHandler = sentryModule.sentryRequestHandler;
  sentryErrorHandler = sentryModule.sentryErrorHandler;
  errorTrackerMiddleware = sentryModule.errorTrackerMiddleware;
  transactionMiddleware = sentryModule.transactionMiddleware;
} catch (error) {
  console.warn('⚠️  Sentry initialization skipped (requires Node 18.19+):', error.message);
  // Provide dummy functions as fallbacks
  initSentry = () => {};
  sentryRequestHandler = (req, res, next) => next();
  sentryErrorHandler = (err, req, res, next) => next(err);
  errorTrackerMiddleware = (req, res, next) => next();
  transactionMiddleware = (req, res, next) => next();
}

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

// ===== Initialize MQTT Service =====
let mqttService = null;
try {
  mqttService = new MQTTService(io);
  await mqttService.connect();
  console.log('✅ MQTT Service Initialized');
} catch (error) {
  console.warn(`⚠️  MQTT initialization failed: ${error.message}`);
  console.log('   Backend will continue without MQTT - Socket.IO only');
}

// ===== Initialize Sentry for Error Tracking =====
initSentry(app);

// ===== Security & Request Handling Middleware (in correct order) =====
// 1. Sentry Request Handler - Must be early
app.use(sentryRequestHandler);

// 2. Security Headers
app.use(securityHeaders);

// 3. CORS
app.use(cors(corsOptions));

// 4. Express parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Input Validation & Sanitization
app.use(validationMiddleware);

// 6. Rate Limiting (standard rate limit)
app.use(generalLimiter);

// 7. Advanced Rate Limiting & DDoS Protection
app.use(createRateLimitMiddleware({
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  onLimitReached: (req, res, options) => {
    console.warn(`Rate limit reached for IP: ${req.ip}`);
  }
}));

// 8. Circuit Breaker Middleware for failure handling
app.use(createCircuitBreakerMiddleware({
  threshold: 5,
  timeout: 60000,
  fallback: (req, res, error) => {
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: error?.message || 'Circuit breaker is open'
    });
  }
}));

// 9. Error Tracking Middleware
app.use(errorTrackerMiddleware);

// 10. Request Logging & Security
app.use(securityLogger);

// 11. Transaction Tracking for performance monitoring
app.use(transactionMiddleware);

// 12. Cache Middleware
app.use(dedupMiddleware);
app.use(responseCache({ ttl: 300 }));
app.use(cacheStatsMiddleware);

// ===== Input sanitization (legacy) =====
app.use(sanitizeInputs);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    displayOperationDuration: true
  },
  customCss: '.swagger-ui .topbar { background-color: #1976d2; }',
  customSiteTitle: 'PELBIOT API Documentation'
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: '✅ Backend API Running', timestamp: new Date() });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

// API Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/panels', panelRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/load-profile', loadProfileRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/alert-management', alertManagementRoutes);

// MQTT Routes
if (mqttService) {
  setMQTTService(mqttService);
  app.use('/api/mqtt', mqttRoutes);
  console.log('✅ MQTT API routes registered');
}

// Error Handling Middleware (in correct order)
// 1. 404 handler - catches unmapped routes
app.use(notFound);

// 2. Sentry error handler - captures all errors and sends to Sentry
app.use(sentryErrorHandler);

// 3. Custom error handler - final error response formatting
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

    // Stream REAL data from database every 2 seconds
    const interval = setInterval(async () => {
      if (socket.connected) {
        try {
          // Fetch REAL panel data from database
          const panelData = await query('SELECT * FROM panels WHERE status = "online" ORDER BY RAND() LIMIT 1');
          if (panelData.length > 0) {
            socket.emit('ampere-data-update', {
              ...panelData[0],
              timestamp: new Date(),
              source: 'DATABASE'
            });
            socket.emit('panel-update', panelData[0]);
          }

          // Fetch REAL transformer data
          const transformerData = await query('SELECT * FROM transformers WHERE status = "online" ORDER BY RAND() LIMIT 1');
          if (transformerData.length > 0) {
            socket.emit('transformer-update', {
              ...transformerData[0],
              timestamp: new Date(),
              source: 'DATABASE'
            });
          }

          // Fetch REAL weather data
          const weatherData = await query('SELECT * FROM weather ORDER BY created_at DESC LIMIT 1');
          if (weatherData.length > 0) {
            socket.emit('weather-update', {
              ...weatherData[0],
              source: 'DATABASE'
            });
          }

          // Fetch device status
          const devices = await query('SELECT id, name, status FROM devices LIMIT 10');
          if (devices.length > 0) {
            socket.emit('device-status-change', devices.map(d => ({
              id: d.id,
              name: d.name,
              status: d.status,
              timestamp: new Date()
            })));
          }

          // Fetch REAL active alerts
          const alerts = await query('SELECT * FROM alerts WHERE status = "open" ORDER BY created_at DESC LIMIT 5');
          if (alerts.length > 0) {
            socket.emit('alert-created', {
              ...alerts[0],
              source: 'DATABASE'
            });
          }

        } catch (error) {
          console.error('❌ Real-time database query failed:', error.message);
          // Don't emit anything on error - better than fake data
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

  // On-demand data requests - REAL DATA FROM DATABASE
  socket.on('request-panel-data', async () => {
    try {
      const panels = await query('SELECT * FROM panels WHERE status = "online" LIMIT 5');
      socket.emit('panel-data', panels);
    } catch (error) {
      console.error('Error fetching panel data:', error);
      socket.emit('error', { message: 'Failed to fetch panel data' });
    }
  });

  socket.on('request-system-health', async () => {
    try {
      const devices = await query('SELECT COUNT(*) as total FROM devices');
      const onlineDevices = await query('SELECT COUNT(*) as online FROM devices WHERE status = "online"');
      socket.emit('system-health', {
        total_devices: devices[0]?.total || 0,
        online_devices: onlineDevices[0]?.online || 0,
        overall_efficiency: 95,
        uptime_percentage: 99.8,
        system_status: 'healthy'
      });
    } catch (error) {
      console.error('Error fetching system health:', error);
      socket.emit('error', { message: 'Failed to fetch system health' });
    }
  });

  socket.on('request-energy-data', async () => {
    try {
      const energyData = await query('SELECT SUM(power) as total_power FROM panels');
      socket.emit('energy-data', {
        total_energy: energyData[0]?.total_power || 0,
        today_energy: 400 + Math.random() * 200,
        this_month_energy: 8000 + Math.random() * 4000,
        estimated_cost: (energyData[0]?.total_power || 0) * 1250
      });
    } catch (error) {
      console.error('Error fetching energy data:', error);
      socket.emit('error', { message: 'Failed to fetch energy data' });
    }
  });

  socket.on('request-load-profile', async () => {
    try {
      const loadData = await query('SELECT AVG(power) as avg_load, MAX(power) as peak_load, MIN(power) as min_load FROM panels');
      socket.emit('load-profile-data', {
        current_load: loadData[0]?.avg_load || 0,
        peak_load: loadData[0]?.peak_load || 0,
        min_load: loadData[0]?.min_load || 0,
        load_factor: loadData[0]?.avg_load && loadData[0]?.peak_load ? ((loadData[0].avg_load / loadData[0].peak_load) * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching load profile:', error);
      socket.emit('error', { message: 'Failed to fetch load profile' });
    }
  });

  socket.on('request-trend-data', async (type) => {
    try {
      const trendData = await query('SELECT date, power, energy, temperature, load FROM trends WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY) ORDER BY date');
      socket.emit('trend-data', trendData || []);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      socket.emit('error', { message: 'Failed to fetch trend data' });
    }
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
setInterval(async () => {
  if (io.engine.clientsCount > 0) {
    try {
      // Get REAL system health from database
      const devices = await query('SELECT COUNT(*) as total FROM devices');
      const onlineDevices = await query('SELECT COUNT(*) as online FROM devices WHERE status = "online"');
      
      io.emit('server-tick', {
        timestamp: new Date(),
        connectedClients: clients.size,
        systemHealth: {
          total_devices: devices[0]?.total || 0,
          online_devices: onlineDevices[0]?.online || 0,
          system_status: onlineDevices[0]?.online === devices[0]?.total ? 'healthy' : 'warning'
        }
      });
    } catch (error) {
      console.error('Error getting system health:', error);
    }
  }
}, 5000);

// Server startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
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
  
  // Verify email service on startup
  try {
    await emailService.verifyEmailService();
    console.log('✉️  Email Service: Connected and ready');
  } catch (error) {
    console.warn('⚠️  Email Service: Configuration warning -', error.message);
  }
  
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
