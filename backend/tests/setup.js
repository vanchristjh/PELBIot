import express from 'express';
import authRoutes from '../routes/auth.js';
import adminRoutes from '../routes/admin.js';
import {
  securityHeaders,
  sanitizeInputs,
  corsOptions,
} from '../middleware/securityMiddleware.js';
import cors from 'cors';

// Create test app
const createTestApp = () => {
  const app = express();

  // Middleware
  app.use(securityHeaders);
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(sanitizeInputs);

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  return app;
};

export default createTestApp;
