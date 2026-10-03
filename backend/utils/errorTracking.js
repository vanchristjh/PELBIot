/**
 * Error Tracking & Monitoring with Sentry (v11 compatible)
 * Supports both Sentry 11 modern API and legacy fallback via dynamic feature detection.
 */

import * as Sentry from '@sentry/node';

// ---------------------------------------------------------------------------
// Initialize Sentry
// ---------------------------------------------------------------------------
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
    allowUrls = [],
  } = options;

  if (!dsn) {
    console.warn('Sentry DSN not provided - error tracking disabled');
    return;
  }

  // Build integrations array with feature detection for Sentry 11 vs 10
  const integrations = [];

  // HTTP / Express integrations (Sentry 11: httpIntegration, expressIntegration)
  try {
    if (typeof Sentry.httpIntegration === 'function') {
      integrations.push(Sentry.httpIntegration({ tracing: true }));
    } else if (Sentry.Integrations?.Http) {
      integrations.push(new Sentry.Integrations.Http({ tracing: true }));
    }
  } catch (_) {}

  try {
    if (typeof Sentry.expressIntegration === 'function') {
      integrations.push(Sentry.expressIntegration({ app }));
    }
  } catch (_) {}

  try {
    if (typeof Sentry.onUncaughtExceptionIntegration === 'function') {
      integrations.push(Sentry.onUncaughtExceptionIntegration());
    } else if (Sentry.Integrations?.OnUncaughtException) {
      integrations.push(new Sentry.Integrations.OnUncaughtException());
    }
  } catch (_) {}

  try {
    if (typeof Sentry.onUnhandledRejectionIntegration === 'function') {
      integrations.push(Sentry.onUnhandledRejectionIntegration());
    } else if (Sentry.Integrations?.OnUnhandledRejection) {
      integrations.push(new Sentry.Integrations.OnUnhandledRejection());
    }
  } catch (_) {}

  Sentry.init({
    dsn,
    environment,
    release,
    integrations: integrations.length ? integrations : undefined,
    tracesSampleRate,
    maxBreadcrumbs,
    maxValueLength,
    attachStacktrace,
    denyUrls,
    allowUrls,
    beforeSend(event) {
      if (event.request) {
        if (event.request.cookies) event.request.cookies = '[REDACTED]';
        if (event.request.headers?.authorization) event.request.headers.authorization = '[REDACTED]';
      }
      if (event.contexts?.trace?.data?.password) {
        event.contexts.trace.data.password = '[REDACTED]';
      }
      return event;
    },
  });

  console.log('Sentry initialized successfully');
};

// ---------------------------------------------------------------------------
// Express middleware — uses new setupExpressErrorHandler when available,
// otherwise falls back to legacy Handlers or noop.
// ---------------------------------------------------------------------------
let _requestHandler;
export const sentryRequestHandler = (req, res, next) => {
  if (!_requestHandler) {
    // Sentry 11 auto-instruments via integrations; a noop passthrough is safe.
    // Try legacy Handlers for Sentry 10 compat.
    const legacy = Sentry.Handlers?.requestHandler;
    if (typeof legacy === 'function') {
      try {
        _requestHandler = legacy({ user: ['id', 'email', 'username'] });
      } catch (_) {
        _requestHandler = (a, b, c) => c();
      }
    } else {
      _requestHandler = (a, b, c) => c();
    }
  }
  return _requestHandler(req, res, next);
};

let _errorHandler;
export const sentryErrorHandler = (err, req, res, next) => {
  if (!_errorHandler) {
    // Sentry 11: setupExpressErrorHandler(app) is called after routes; here provide passthrough
    // Legacy fallback
    const legacy = Sentry.Handlers?.errorHandler;
    if (typeof legacy === 'function') {
      try {
        _errorHandler = legacy({
          shouldHandleError(error) {
            if (process.env.NODE_ENV === 'production') {
              return !(error.status >= 400 && error.status < 500);
            }
            return true;
          },
        });
      } catch (_) {
        _errorHandler = (e, a, b, c) => c(e);
      }
    } else {
      _errorHandler = (e, a, b, c) => c(e);
    }
  }
  return _errorHandler(err, req, res, next);
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export const addBreadcrumb = (message, data = {}, level = 'info') => {
  try {
    Sentry.captureMessage(message, level);
  } catch (_) {}
  try {
    Sentry.addBreadcrumb({ message, level, data, category: 'user-action', timestamp: Date.now() / 1000 });
  } catch (_) {}
};

export const captureException = (error, context = {}) => {
  try {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => scope.setContext(key, value));
      Sentry.captureException(error);
    });
  } catch (_) {}
};

export const captureMessage = (message, level = 'info', context = {}) => {
  try {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => scope.setContext(key, value));
      Sentry.captureMessage(message, level);
    });
  } catch (_) {}
};

export const setUserContext = (user) => {
  try {
    if (user) Sentry.setUser({ id: user.id, email: user.email, username: user.username });
    else Sentry.setUser(null);
  } catch (_) {}
};

export const setTags = (tags) => {
  try {
    Object.entries(tags).forEach(([key, value]) => Sentry.setTag(key, value));
  } catch (_) {}
};

// ---------------------------------------------------------------------------
// Performance transaction helpers — Sentry.startSpan preferred, fallback to
// startTransaction for older SDKs.
// ---------------------------------------------------------------------------
export const startTransaction = (name, op = 'http.request', options = {}) => {
  try {
    if (typeof Sentry.startSpan === 'function') {
      // startSpan is callback-based; for backwards compat return a minimal transaction-like object
      // Caller expects { finish(), setStatus(), setData() } — provide shim
      let spanRef = null;
      // Use startInactiveSpan if available (Sentry 8+)
      const starter = Sentry.startInactiveSpan || Sentry.startSpan;
      try {
        spanRef = starter.call(Sentry, { name, op, ...options });
      } catch (_) {
        spanRef = null;
      }
      if (spanRef && typeof spanRef.end === 'function') {
        return { finish: () => spanRef.end(), setStatus: () => {}, setData: () => {}, end: () => spanRef.end() };
      }
    }
    if (typeof Sentry.startTransaction === 'function') {
      return Sentry.startTransaction({ name, op, ...options });
    }
  } catch (_) {}
  return { finish: () => {}, setStatus: () => {}, setData: () => {}, end: () => {} };
};

export const transactionMiddleware = () => (req, res, next) => {
  // Prefer Sentry auto-tracing; this middleware becomes a noop shim if startSpan not needed
  let transaction = null;
  try {
    if (typeof Sentry.startInactiveSpan === 'function') {
      transaction = Sentry.startInactiveSpan({ op: 'http.request', name: `${req.method} ${req.path}` });
    } else if (typeof Sentry.startTransaction === 'function') {
      transaction = Sentry.startTransaction({ op: 'http.request', name: `${req.method} ${req.path}`, description: req.originalUrl });
    }
  } catch (_) {}

  if (transaction) {
    res.on('finish', () => {
      try {
        if (typeof transaction.setStatus === 'function') transaction.setStatus(res.statusCode >= 400 ? 'failure' : 'success');
        if (typeof transaction.setData === 'function') {
          transaction.setData('statusCode', res.statusCode);
          transaction.setData('contentLength', res.get('content-length'));
        }
        if (typeof transaction.finish === 'function') transaction.finish();
        else if (typeof transaction.end === 'function') transaction.end();
      } catch (_) {}
    });
    try {
      const hub = Sentry.getCurrentHub?.();
      if (hub?.configureScope) hub.configureScope((scope) => scope.setSpan(transaction));
      else if (Sentry.getCurrentScope) Sentry.getCurrentScope().setSpan?.(transaction);
    } catch (_) {}
  }
  return next();
};

export const errorTrackerMiddleware = () => (err, req, res, next) => {
  try {
    Sentry.withScope((scope) => {
      scope.setContext('request', { method: req.method, url: req.originalUrl, headers: req.headers, query: req.query, body: req.body, ip: req.ip });
      scope.setTag('error_type', err.constructor.name);
      scope.setTag('http_method', req.method);
      scope.setTag('http_status', res.statusCode);
      Sentry.captureException(err);
    });
  } catch (_) {}
  return next(err);
};

// ---------------------------------------------------------------------------
// ErrorTracker class & global handlers (unchanged logic)
// ---------------------------------------------------------------------------
export class ErrorTracker {
  constructor(options = {}) {
    this.enableRemoteLogging = options.enableRemoteLogging !== false;
    this.errorLog = [];
    this.warningLog = [];
    this.maxLogSize = options.maxLogSize || 1000;
    this.metrics = { totalErrors: 0, totalWarnings: 0, errorsByType: {}, errorsByEndpoint: {} };
  }

  logError(error, context = {}, severity = 'error') {
    const errorEntry = { timestamp: new Date(), message: error.message || String(error), stack: error.stack, severity, context, type: error.constructor.name };
    this.errorLog.push(errorEntry);
    if (this.errorLog.length > this.maxLogSize) this.errorLog.shift();
    this.metrics.totalErrors++;
    this.metrics.errorsByType[error.constructor.name] = (this.metrics.errorsByType[error.constructor.name] || 0) + 1;
    if (this.enableRemoteLogging) captureException(error, context);
    console.error(`[${severity.toUpperCase()}]`, error.message, context);
    return errorEntry;
  }

  logWarning(message, context = {}) {
    const warningEntry = { timestamp: new Date(), message, context };
    this.warningLog.push(warningEntry);
    if (this.warningLog.length > this.maxLogSize) this.warningLog.shift();
    this.metrics.totalWarnings++;
    console.warn('[WARNING]', message, context);
    return warningEntry;
  }

  trackEndpointError(endpoint, error, context = {}) {
    if (!this.metrics.errorsByEndpoint[endpoint]) this.metrics.errorsByEndpoint[endpoint] = [];
    this.metrics.errorsByEndpoint[endpoint].push({ error: error.message, timestamp: new Date(), context });
    this.logError(error, { endpoint, ...context });
  }

  getErrorSummary() {
    return {
      totalErrors: this.metrics.totalErrors,
      totalWarnings: this.metrics.totalWarnings,
      errorTypes: this.metrics.errorsByType,
      endpoints: Object.keys(this.metrics.errorsByEndpoint).map((endpoint) => ({
        endpoint,
        errorCount: this.metrics.errorsByEndpoint[endpoint].length,
        errors: this.metrics.errorsByEndpoint[endpoint].slice(-5),
      })),
      recentErrors: this.errorLog.slice(-10),
    };
  }

  getAllLogs() { return { errors: this.errorLog, warnings: this.warningLog, metrics: this.metrics }; }
  clearLogs() { this.errorLog = []; this.warningLog = []; }
  exportLogs() { return JSON.stringify(this.getAllLogs(), null, 2); }
}

export const setupGlobalErrorHandlers = () => {
  process.on('uncaughtException', (error) => { console.error('UNCAUGHT EXCEPTION:', error); try { Sentry.captureException(error); } catch (_) {} });
  process.on('unhandledRejection', (reason) => { console.error('UNHANDLED REJECTION:', reason); try { Sentry.captureException(reason); } catch (_) {} });
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    try { Sentry.close(2000).then(() => process.exit(0)); } catch (_) { process.exit(0); }
  });
};

export const createErrorStatsEndpoint = (errorTracker) => (req, res) => {
  try {
    const stats = errorTracker.getErrorSummary();
    res.json({ success: true, data: stats });
  } catch (error) {
    captureException(error, { endpoint: 'error-stats' });
    res.status(500).json({ success: false, error: 'Failed to retrieve error statistics' });
  }
};

const errorTrackingExports = { initSentry, sentryRequestHandler, sentryErrorHandler, addBreadcrumb, captureException, captureMessage, setUserContext, setTags, startTransaction, transactionMiddleware, errorTrackerMiddleware, ErrorTracker, setupGlobalErrorHandlers, createErrorStatsEndpoint };
export default errorTrackingExports;
