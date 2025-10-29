/**
 * PELBIOT Environment Configuration Module
 * Loads and validates environment variables with fallback defaults
 * 
 * @module config/environment
 * @requires dotenv
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment Configuration Object
 * All critical environment variables with validation and defaults
 */
const environmentConfig = {
  // === SERVER CONFIGURATION ===
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || 'localhost',
    isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
    isProduction: (process.env.NODE_ENV || 'development') === 'production',
    isTesting: (process.env.NODE_ENV || 'development') === 'test',
  },

  // === DATABASE CONFIGURATION ===
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'pelbiot_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
  },

  // === JWT AUTHENTICATION ===
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
    expiry: process.env.JWT_EXPIRY || '24h',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret',
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    algorithm: 'HS256',
  },

  // === MOBILE APP CONFIGURATION ===
  mobileApp: {
    version: process.env.MOBILE_APP_VERSION || '1.0.0',
    minVersion: process.env.MOBILE_MIN_VERSION || '1.0.0',
    offlineStorageLimit: parseInt(process.env.MOBILE_OFFLINE_STORAGE_LIMIT || '52428800', 10),
    syncInterval: parseInt(process.env.MOBILE_SYNC_INTERVAL || '30000', 10),
    requestTimeout: parseInt(process.env.MOBILE_REQUEST_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.MOBILE_MAX_RETRIES || '3', 10),
  },

  // === THIRD-PARTY INTEGRATIONS ===
  integrations: {
    stripe: {
      apiKey: process.env.STRIPE_API_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      mode: process.env.PAYPAL_MODE || 'sandbox',
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    },
    sendGrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@pelbiot.com',
      fromName: process.env.SENDGRID_FROM_NAME || 'PELBIOT',
    },
    credentials: {
      encryptionKey: process.env.CREDENTIALS_ENCRYPTION_KEY || 'default-encryption-key-change-in-production',
      rotationInterval: parseInt(process.env.CREDENTIALS_ROTATION_INTERVAL || '86400000', 10),
      maxPerProvider: parseInt(process.env.CREDENTIALS_MAX_PER_PROVIDER || '5', 10),
    },
  },

  // === ANALYTICS CONFIGURATION ===
  analytics: {
    maxDataPoints: parseInt(process.env.ANALYTICS_MAX_DATA_POINTS || '100000', 10),
    retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90', 10),
    batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE || '1000', 10),
    aggregationInterval: parseInt(process.env.ANALYTICS_AGGREGATION_INTERVAL || '3600000', 10),
    enableExport: process.env.ANALYTICS_ENABLE_EXPORT === 'true',
    exportFormats: (process.env.ANALYTICS_EXPORT_FORMATS || 'json,csv,pdf,excel').split(','),
  },

  // === AI/ML CONFIGURATION ===
  aiml: {
    anomaly: {
      sensitivity: parseFloat(process.env.AIML_ANOMALY_SENSITIVITY || '2.5'),
      minTrainingPoints: parseInt(process.env.AIML_MIN_TRAINING_POINTS || '50', 10),
      lookbackWindow: parseInt(process.env.AIML_LOOKBACK_WINDOW || '86400000', 10),
    },
    forecasting: {
      updateInterval: parseInt(process.env.AIML_MODEL_UPDATE_INTERVAL || '60000', 10),
      periods: parseInt(process.env.AIML_FORECASTING_PERIODS || '12', 10),
    },
    clustering: {
      iterations: parseInt(process.env.AIML_CLUSTERING_ITERATIONS || '100', 10),
    },
  },

  // === LOGGING CONFIGURATION ===
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
    fileSize: process.env.LOG_FILE_SIZE || '10M',
    filesToKeep: parseInt(process.env.LOG_FILES_TO_KEEP || '10', 10),
    enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
    enableFile: process.env.LOG_ENABLE_FILE !== 'false',
    enableDatabase: process.env.LOG_ENABLE_DATABASE === 'true',
    format: process.env.LOG_FORMAT || 'json',
  },

  // === CORS CONFIGURATION ===
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: process.env.CORS_CREDENTIALS !== 'false',
    maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
  },

  // === RATE LIMITING ===
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    storage: process.env.RATE_LIMIT_STORAGE || 'memory',
  },

  // === SECURITY ===
  security: {
    enableHelmet: process.env.ENABLE_HELMET !== 'false',
    enableHpp: process.env.ENABLE_HPP !== 'false',
    enableCsrf: process.env.ENABLE_CSRF === 'true',
    sessionSecret: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
  },

  // === CACHE CONFIGURATION ===
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    type: process.env.CACHE_TYPE || 'memory',
    ttl: parseInt(process.env.CACHE_TTL || '3600000', 10),
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // === MONITORING & ALERTS ===
  monitoring: {
    alertEmail: process.env.ALERT_EMAIL || 'alerts@pelbiot.com',
    alertWebhookUrl: process.env.ALERT_WEBHOOK_URL || '',
    monitoringEnabled: process.env.MONITORING_ENABLED !== 'false',
    metricsEnabled: process.env.METRICS_ENABLED !== 'false',
    sentryDsn: process.env.SENTRY_DSN || '',
  },

  // === DEVELOPMENT ===
  development: {
    debug: process.env.DEBUG || 'pelbiot:*',
    seedDatabase: process.env.SEED_DATABASE === 'true',
  },
};

/**
 * Validate required environment variables
 * Throws error if critical variables are missing in production
 */
function validateEnvironment() {
  const errors = [];

  // Production-only validations
  if (environmentConfig.server.isProduction) {
    const requiredInProduction = [
      { key: 'JWT_SECRET', validator: () => process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32 },
      { key: 'NODE_ENV', validator: () => process.env.NODE_ENV === 'production' },
      { key: 'DB_PASSWORD', validator: () => process.env.DB_PASSWORD },
      { key: 'CREDENTIALS_ENCRYPTION_KEY', validator: () => process.env.CREDENTIALS_ENCRYPTION_KEY && process.env.CREDENTIALS_ENCRYPTION_KEY.length >= 32 },
    ];

    requiredInProduction.forEach(({ key, validator }) => {
      if (!validator()) {
        errors.push(`Missing or invalid required environment variable: ${key}`);
      }
    });
  }

  if (errors.length > 0) {
    console.error('Environment Validation Errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }

  return true;
}

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not set
 * @returns {*} Environment variable value or default
 */
function getEnv(key, defaultValue = undefined) {
  return process.env[key] || defaultValue;
}

/**
 * Check if in specific environment
 * @param {string} env - Environment to check (development, production, test)
 * @returns {boolean} True if in specified environment
 */
function isEnv(env) {
  return environmentConfig.server.nodeEnv === env;
}

// Export configuration object and utility functions
export default environmentConfig;
export { validateEnvironment, getEnv, isEnv };
