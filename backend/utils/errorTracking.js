/**
 * Error Tracking & Monitoring with Sentry
 * Comprehensive error tracking, performance monitoring, and crash reporting
 * 
 * @features:
 * - Error capturing and reporting
 * - Performance monitoring
 * - Transaction tracking
 * - Source map support
 * - Custom context and tags
 * - Breadcrumb tracking
 * - Release management
 * - Session tracking
 */

import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

/**
 * Initialize Sentry
 */
export const initSentry = (app, options = {}) => {
  const {
    dsn = process.env.SENTRY_DSN,
    environment = process.env.NODE_ENV || 'development',
    release = process.env.RELEASE_VERSION || '1.0.0',
    tracesSampleRate = 1.0,
    maxBreadcrumbs = 100,
    maxValueLength = 1024,
    attachStacktrace = true,
    denyUrls = [],
    allowUrls = []
  } = options;

  if (!dsn) {
    console.warn('⚠️  Sentry DSN not provided - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Express.Integrations.Express({ app }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUncaughtRejection()
    ],
    tracesSampleRate,
    maxBreadcrumbs,
    maxValueLength,
    attachStacktrace,
    denyUrls,
    allowUrls,
    beforeSend(event, hint) {
      // Filter sensitive data
      if (event.request) {
        if (event.request.cookies) {
          event.request.cookies = '[REDACTED]';
        }
        if (event.request.headers && event.request.headers.authorization) {
          event.request.headers.authorization = '[REDACTED]';
        }
      }
      
      if (event.contexts && event.contexts.trace) {
        if (event.contexts.trace.data && event.contexts.trace.data.password) {
          event.contexts.trace.data.password = '[REDACTED]';
        }
      }

      return event;
    }
  });

  console.log('✅ Sentry initialized successfully');
};

/**
 * Express middleware for Sentry request handling
 */
export const sentryRequestHandler = Sentry.Handlers.requestHandler({
  user: ['id', 'email', 'username']
});

/**
 * Express middleware for Sentry error handling
 */
export const sentryErrorHandler = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture all errors except 4xx client errors in production
    if (process.env.NODE_ENV === 'production') {
      return !(error.status >= 400 && error.status < 500);
    }
    return true;
  }
});

/**
 * Add breadcrumb for tracking user actions
 */
export const addBreadcrumb = (message, data = {}, level = 'info') => {
  Sentry.captureMessage(message, level);
  Sentry.addBreadcrumb({
    message,
    level,
    data,
    category: 'user-action',
    timestamp: Date.now() / 1000
  });
};

/**
 * Capture exception with context
 */
export const captureException = (error, context = {}) => {
  Sentry.withScope((scope) => {
    // Add custom context
    Object.entries(context).forEach(([key, value]) => {
      scope.setContext(key, value);
    });

    Sentry.captureException(error);
  });
};

/**
 * Capture message with level and context
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setContext(key, value);
    });

    Sentry.captureMessage(message, level);
  });
};

/**
 * Set user context
 */
export const setUserContext = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Set custom tags for filtering
 */
export const setTags = (tags) => {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
};

/**
 * Start a performance transaction
 */
export const startTransaction = (name, op = 'http.request', options = {}) => {
  const transaction = Sentry.startTransaction({
    name,
    op,
    ...options
  });

  return transaction;
};

/**
 * Middleware for automatic transaction tracking
 */
export const transactionMiddleware = () => {
  return (req, res, next) => {
    const transaction = Sentry.startTransaction({
      op: 'http.request',
      name: `${req.method} ${req.path}`,
      description: req.originalUrl
    });

    // Track request completion
    res.on('finish', () => {
      transaction.setStatus(
        res.statusCode >= 400 ? 'failure' : 'success'
      );
      transaction.setData('statusCode', res.statusCode);
      transaction.setData('contentLength', res.get('content-length'));
      transaction.finish();
    });

    Sentry.getCurrentHub().configureScope((scope) => {
      scope.setSpan(transaction);
    });

    next();
  };
};

/**
 * Error wrapper middleware
 */
export const errorTrackerMiddleware = () => {
  return (err, req, res, next) => {
    // Capture error
    Sentry.withScope((scope) => {
      scope.setContext('request', {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        query: req.query,
        body: req.body,
        ip: req.ip
      });

      scope.setTag('error_type', err.constructor.name);
      scope.setTag('http_method', req.method);
      scope.setTag('http_status', res.statusCode);

      Sentry.captureException(err);
    });

    next(err);
  };
};

/**
 * Custom error tracking class
 */
export class ErrorTracker {
  constructor(options = {}) {
    this.enableRemoteLogging = options.enableRemoteLogging !== false;
    this.errorLog = [];
    this.warningLog = [];
    this.maxLogSize = options.maxLogSize || 1000;
    this.metrics = {
      totalErrors: 0,
      totalWarnings: 0,
      errorsByType: {},
      errorsByEndpoint: {}
    };
  }

  /**
   * Log error
   */
  logError(error, context = {}, severity = 'error') {
    const errorEntry = {
      timestamp: new Date(),
      message: error.message || String(error),
      stack: error.stack,
      severity,
      context,
      type: error.constructor.name
    };

    this.errorLog.push(errorEntry);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Update metrics
    this.metrics.totalErrors++;
    this.metrics.errorsByType[error.constructor.name] = 
      (this.metrics.errorsByType[error.constructor.name] || 0) + 1;

    // Send to Sentry
    if (this.enableRemoteLogging) {
      captureException(error, context);
    }

    console.error(`[${severity.toUpperCase()}]`, error.message, context);
    
    return errorEntry;
  }

  /**
   * Log warning
   */
  logWarning(message, context = {}) {
    const warningEntry = {
      timestamp: new Date(),
      message,
      context
    };

    this.warningLog.push(warningEntry);
    if (this.warningLog.length > this.maxLogSize) {
      this.warningLog.shift();
    }

    this.metrics.totalWarnings++;

    console.warn(`[WARNING]`, message, context);
    
    return warningEntry;
  }

  /**
   * Track API endpoint errors
   */
  trackEndpointError(endpoint, error, context = {}) {
    if (!this.metrics.errorsByEndpoint[endpoint]) {
      this.metrics.errorsByEndpoint[endpoint] = [];
    }

    this.metrics.errorsByEndpoint[endpoint].push({
      error: error.message,
      timestamp: new Date(),
      context
    });

    this.logError(error, { endpoint, ...context });
  }

  /**
   * Get error summary
   */
  getErrorSummary() {
    return {
      totalErrors: this.metrics.totalErrors,
      totalWarnings: this.metrics.totalWarnings,
      errorTypes: this.metrics.errorsByType,
      endpoints: Object.keys(this.metrics.errorsByEndpoint).map(endpoint => ({
        endpoint,
        errorCount: this.metrics.errorsByEndpoint[endpoint].length,
        errors: this.metrics.errorsByEndpoint[endpoint].slice(-5) // Last 5
      })),
      recentErrors: this.errorLog.slice(-10)
    };
  }

  /**
   * Get all logged data
   */
  getAllLogs() {
    return {
      errors: this.errorLog,
      warnings: this.warningLog,
      metrics: this.metrics
    };
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.errorLog = [];
    this.warningLog = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs() {
    return JSON.stringify(this.getAllLogs(), null, 2);
  }
}

/**
 * Global error handler
 */
export const setupGlobalErrorHandlers = () => {
  process.on('uncaughtException', (error) => {
    console.error('🔴 UNCAUGHT EXCEPTION:', error);
    Sentry.captureException(error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('🔴 UNHANDLED REJECTION:', reason);
    Sentry.captureException(reason);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    Sentry.close(2000).then(() => {
      process.exit(0);
    });
  });
};

/**
 * API endpoint for error statistics
 */
export const createErrorStatsEndpoint = (errorTracker) => {
  return (req, res) => {
    try {
      const stats = errorTracker.getErrorSummary();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      captureException(error, { endpoint: 'error-stats' });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve error statistics'
      });
    }
  };
};

/**
 * Export all error tracking utilities
 */
const errorTrackingExports = {
  initSentry,
  sentryRequestHandler,
  sentryErrorHandler,
  addBreadcrumb,
  captureException,
  captureMessage,
  setUserContext,
  setTags,
  startTransaction,
  transactionMiddleware,
  errorTrackerMiddleware,
  ErrorTracker,
  setupGlobalErrorHandlers,
  createErrorStatsEndpoint
};

export default errorTrackingExports;
