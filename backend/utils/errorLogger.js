/**
 * PELBIOT Error Logging Module
 * Comprehensive error tracking and logging system
 * 
 * @module utils/errorLogger
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Log levels with priority
 */
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

/**
 * Error Logger Class
 */
class ErrorLogger {
  constructor(options = {}) {
    this.logDir = options.logDir || path.join(__dirname, '../../logs');
    this.logLevel = options.logLevel || 'info';
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile !== false;
    this.enableDatabase = options.enableDatabase || false;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 10;
    this.format = options.format || 'json';

    // Create logs directory if it doesn't exist
    this.ensureLogDirectory();

    // Initialize error tracking
    this.errorCounts = {};
    this.errorHistory = [];
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Get current timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = this.getTimestamp();

    if (this.format === 'json') {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...meta,
      });
    }

    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${
      Object.keys(meta).length > 0 ? JSON.stringify(meta) : ''
    }`;
  }

  /**
   * Get log filename
   */
  getLogFileName(level) {
    return path.join(this.logDir, `${level}.log`);
  }

  /**
   * Rotate log file if needed
   */
  rotateLogFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const stats = fs.statSync(filePath);
    if (stats.size >= this.maxFileSize) {
      const ext = path.extname(filePath);
      const name = path.basename(filePath, ext);
      const dir = path.dirname(filePath);
      const timestamp = Date.now();
      const rotatedPath = path.join(dir, `${name}.${timestamp}${ext}`);

      fs.renameSync(filePath, rotatedPath);

      // Clean old files
      this.cleanOldLogFiles(dir, name, ext);
    }
  }

  /**
   * Clean old log files
   */
  cleanOldLogFiles(dir, name, ext) {
    try {
      const files = fs
        .readdirSync(dir)
        .filter((f) => f.startsWith(name) && f.endsWith(ext))
        .sort()
        .reverse();

      if (files.length > this.maxFiles) {
        files.slice(this.maxFiles).forEach((f) => {
          fs.unlinkSync(path.join(dir, f));
        });
      }
    } catch (error) {
      console.error('Error cleaning old log files:', error);
    }
  }

  /**
   * Write log to file
   */
  writeToFile(level, message) {
    try {
      if (!this.enableFile) return;

      const filePath = this.getLogFileName(level);
      this.rotateLogFile(filePath);

      fs.appendFileSync(filePath, message + '\n', { encoding: 'utf-8' });
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  /**
   * Write to console
   */
  writeToConsole(level, message) {
    if (!this.enableConsole) return;

    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m', // Green
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      critical: '\x1b[35m', // Magenta
    };

    const resetColor = '\x1b[0m';
    const color = colors[level] || '';

    console.log(`${color}${message}${resetColor}`);
  }

  /**
   * Log debug message
   */
  debug(message, meta = {}) {
    if (LOG_LEVELS[this.logLevel] <= LOG_LEVELS.debug) {
      const formatted = this.formatMessage('debug', message, meta);
      this.writeToConsole('debug', formatted);
      this.writeToFile('debug', formatted);
    }
  }

  /**
   * Log info message
   */
  info(message, meta = {}) {
    if (LOG_LEVELS[this.logLevel] <= LOG_LEVELS.info) {
      const formatted = this.formatMessage('info', message, meta);
      this.writeToConsole('info', formatted);
      this.writeToFile('info', formatted);
    }
  }

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    if (LOG_LEVELS[this.logLevel] <= LOG_LEVELS.warn) {
      const formatted = this.formatMessage('warn', message, meta);
      this.writeToConsole('warn', formatted);
      this.writeToFile('warn', formatted);
      this.trackError('warn', message);
    }
  }

  /**
   * Log error message
   */
  error(message, error = null, meta = {}) {
    if (LOG_LEVELS[this.logLevel] <= LOG_LEVELS.error) {
      const errorMeta = {
        ...meta,
        ...(error && {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
        }),
      };

      const formatted = this.formatMessage('error', message, errorMeta);
      this.writeToConsole('error', formatted);
      this.writeToFile('error', formatted);
      this.trackError('error', message);
    }
  }

  /**
   * Log critical error
   */
  critical(message, error = null, meta = {}) {
    if (LOG_LEVELS[this.logLevel] <= LOG_LEVELS.critical) {
      const errorMeta = {
        ...meta,
        severity: 'CRITICAL',
        ...(error && {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
        }),
      };

      const formatted = this.formatMessage('critical', message, errorMeta);
      this.writeToConsole('critical', formatted);
      this.writeToFile('critical', formatted);
      this.writeToFile('error', formatted); // Also write to error.log
      this.trackError('critical', message);
    }
  }

  /**
   * Track error occurrences
   */
  trackError(level, message) {
    const key = `${level}:${message}`;
    this.errorCounts[key] = (this.errorCounts[key] || 0) + 1;

    // Keep error history (last 1000 errors)
    this.errorHistory.push({
      timestamp: this.getTimestamp(),
      level,
      message,
    });

    if (this.errorHistory.length > 1000) {
      this.errorHistory.shift();
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    return {
      totalErrors: Object.values(this.errorCounts).reduce((a, b) => a + b, 0),
      errorCounts: this.errorCounts,
      recentErrors: this.errorHistory.slice(-10),
    };
  }

  /**
   * Reset error tracking
   */
  resetErrorStats() {
    this.errorCounts = {};
    this.errorHistory = [];
  }

  /**
   * Create request logger middleware
   */
  requestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

        this[logLevel](`${req.method} ${req.path}`, {
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userAgent: req.get('user-agent'),
        });
      });

      next();
    };
  }

  /**
   * Create error handler middleware
   */
  errorHandler() {
    return (err, req, res, next) => {
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';

      this.error(`${req.method} ${req.path}`, err, {
        statusCode,
        requestBody: req.body,
        query: req.query,
        params: req.params,
      });

      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
      });
    };
  }

  /**
   * Create uncaught exception handler
   */
  handleUncaughtException() {
    process.on('uncaughtException', (error) => {
      this.critical('Uncaught Exception', error);
      process.exit(1);
    });
  }

  /**
   * Create unhandled rejection handler
   */
  handleUnhandledRejection() {
    process.on('unhandledRejection', (reason, promise) => {
      this.critical('Unhandled Rejection', new Error(String(reason)), {
        promise,
      });
    });
  }
}

// Create singleton instance
let loggerInstance = null;

/**
 * Get or create logger instance
 */
function getLogger(options = {}) {
  if (!loggerInstance) {
    loggerInstance = new ErrorLogger(options);
  }
  return loggerInstance;
}

/**
 * Initialize logger with options
 */
function initializeLogger(options = {}) {
  loggerInstance = new ErrorLogger(options);
  return loggerInstance;
}

// Export logger and utilities
export { ErrorLogger, getLogger, initializeLogger };
