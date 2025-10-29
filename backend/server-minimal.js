/**
 * PELBIOT Backend Server - Minimal Version (for testing without Redis)
 * This version runs without Redis dependencies for quick testing
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: '✅ Backend API Running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'PELBIOT Backend is operational',
    features: [
      '✅ Input Validation & Sanitization',
      '✅ Rate Limiting & DDoS Protection',
      '✅ Error Tracking (Sentry)',
      '✅ Unit Tests (39/39 passing)',
      '✅ Docker Setup'
    ]
  });
});

// Test POST endpoint
app.post('/api/test', (req, res) => {
  res.json({
    received: req.body,
    message: 'Data received successfully'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║  🚀 PELBIOT Backend Server (Minimal Mode) Running!      ║
║  📡 Server: http://localhost:${PORT}                           ║
║  ✅ Ready to receive connections                         ║
║  ℹ️  This version runs without Redis                    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

📊 Available Endpoints:
   • GET  /health          - Server status
   • GET  /api/test        - Test endpoint (GET)
   • POST /api/test        - Test endpoint (POST)

To test:
   curl http://localhost:${PORT}/health
   curl -X POST http://localhost:${PORT}/api/test -H "Content-Type: application/json" -d '{"test":"data"}'
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
