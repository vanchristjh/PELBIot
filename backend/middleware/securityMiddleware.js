import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { validationResult } from 'express-validator';

// Helmet - Secure HTTP headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

// General Rate Limit - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  },
});

// Strict Rate Limit - 5 requests per 15 minutes (for authentication)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// API Rate Limit - 50 requests per minute
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: 'Too many API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation Error Handler Middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Request Sanitization Middleware
export const sanitizeInputs = (req, res, next) => {
  // Remove any potential XSS characters from string inputs
  const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim();
  };

  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitize(req.body[key]);
      }
    });
  }

  // Sanitize query
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitize(req.query[key]);
      }
    });
  }

  next();
};

// CORS Options
export const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      'http://localhost:3000',
      'http://localhost:5000',
      process.env.FRONTEND_URL,
      process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()),
    ].filter(Boolean).flat();

    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Log security events middleware
export const securityLogger = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Log auth attempts
    if (req.path.includes('/auth') || req.path.includes('/login')) {
      console.log(`🔐 Auth Event: ${req.method} ${req.path} - Status: ${res.statusCode}`);
    }

    // Log failed requests
    if (res.statusCode >= 400) {
      console.log(`⚠️ Security Event: ${req.method} ${req.path} - Status: ${res.statusCode} - IP: ${req.ip}`);
    }

    res.send = originalSend;
    return res.send(data);
  };

  next();
};
