/**
 * Comprehensive Jest Test Suite
 * Testing validation, rate limiting, error tracking, and core functionality
 */

import {
  sanitizeString,
  sanitizeObject,
  validateEmail,
  validatePhoneNumber,
  validateURL,
  validateNumber,
  validateArray,
  validateWhitelist,
  validateJSON,
  validateAgainstSchema,
  validateFileUpload,
  validationSchemas,
  validationMiddleware,
  fieldValidator
} from '../middleware/validationMiddleware.js';

import {
  RateLimiter,
  CircuitBreaker,
  AdaptiveRateLimiter,
  createRateLimitMiddleware,
  createCircuitBreakerMiddleware
} from '../middleware/rateLimitMiddleware.js';

import { ErrorTracker } from '../utils/errorTracking.js';

describe('Input Validation & Sanitization Tests', () => {
  describe('Email Validation', () => {
    test('should validate correct email format', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com'
      ];
      
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email format', () => {
      const invalidEmails = [
        'invalid',
        'user@',
        '@example.com',
        'user name@example.com'
      ];
      
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Phone Number Validation', () => {
    test('should validate correct phone numbers', () => {
      const validPhones = [
        '+1(555)123-4567',
        '555-123-4567',
        '5551234567',
        '+44 20 7946 0958'
      ];
      
      validPhones.forEach(phone => {
        expect(validatePhoneNumber(phone)).toBe(true);
      });
    });

    test('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        'abc',
        '555-12',
        ''
      ];
      
      invalidPhones.forEach(phone => {
        expect(validatePhoneNumber(phone)).toBe(false);
      });
    });
  });

  describe('URL Validation', () => {
    test('should validate correct URLs', () => {
      const validURLs = [
        'https://example.com',
        'http://www.example.com',
        'https://example.com/path?query=value'
      ];
      
      validURLs.forEach(url => {
        expect(validateURL(url)).toBe(true);
      });
    });

    test('should reject invalid URLs', () => {
      const invalidURLs = [
        'not a url',
        'htp://example.com',
        'example'
      ];
      
      invalidURLs.forEach(url => {
        expect(validateURL(url)).toBe(false);
      });
    });
  });

  describe('Number Validation', () => {
    test('should validate numbers within range', () => {
      expect(validateNumber(5, { min: 0, max: 10 })).toBe(true);
      expect(validateNumber(0, { min: 0, max: 10 })).toBe(true);
      expect(validateNumber(10, { min: 0, max: 10 })).toBe(true);
    });

    test('should reject numbers outside range', () => {
      expect(validateNumber(-1, { min: 0, max: 10 })).toBe(false);
      expect(validateNumber(11, { min: 0, max: 10 })).toBe(false);
    });

    test('should validate integer constraint', () => {
      expect(validateNumber(5, { integer: true })).toBe(true);
      expect(validateNumber(5.5, { integer: true })).toBe(false);
    });
  });

  describe('String Sanitization', () => {
    test('should remove XSS attempts', () => {
      const xssString = '<script>alert("xss")</script>';
      const sanitized = sanitizeString(xssString);
      expect(sanitized).not.toContain('<script>');
    });

    test('should remove SQL injection patterns', () => {
      const sqlString = "'; DROP TABLE users; --";
      const sanitized = sanitizeString(sqlString);
      expect(sanitized.toLowerCase()).not.toContain('drop');
    });

    test('should preserve safe strings', () => {
      const safeString = 'Hello World 123';
      expect(sanitizeString(safeString)).toBe(safeString);
    });
  });

  describe('Object Sanitization', () => {
    test('should sanitize all string values in object', () => {
      const obj = {
        name: 'John',
        email: '<script>alert("xss")</script>'
      };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.email).not.toContain('<script>');
    });

    test('should handle nested objects', () => {
      const obj = {
        user: {
          name: 'John',
          contact: {
            email: 'john@example.com'
          }
        }
      };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.user.contact.email).toBe('john@example.com');
    });

    test('should handle arrays', () => {
      const obj = {
        items: ['<script>alert</script>', 'safe text']
      };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.items[0]).not.toContain('<script>');
    });
  });

  describe('Schema Validation', () => {
    test('should validate against user schema', () => {
      const user = {
        email: 'user@example.com',
        password: 'securepass123',
        name: 'John Doe'
      };
      const result = validateAgainstSchema(user, validationSchemas.user);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid schema', () => {
      const user = {
        email: 'invalid-email',
        password: '123'
      };
      const result = validateAgainstSchema(user, validationSchemas.user);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should require fields', () => {
      const user = {
        name: 'John Doe'
      };
      const result = validateAgainstSchema(user, validationSchemas.user);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('email'))).toBe(true);
    });
  });
});

describe('Rate Limiting Tests', () => {
  let rateLimiter;
  let mockRedisClient;

  beforeEach(() => {
    mockRedisClient = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK'),
      incr: jest.fn().mockResolvedValue(1),
      del: jest.fn().mockResolvedValue(1)
    };
    rateLimiter = new RateLimiter(mockRedisClient, { limit: 100, windowMs: 60000 });
  });

  test('should allow requests within limit', async () => {
    const result = await rateLimiter.checkLimit('user123');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(99);
  });

  test('should track rate limit per user', async () => {
    await rateLimiter.checkLimit('user1');
    await rateLimiter.checkLimit('user2');
    
    expect(mockRedisClient.setex).toHaveBeenCalledTimes(2);
  });

  test('should add to whitelist', () => {
    rateLimiter.addToWhitelist('trusted-ip');
    expect(rateLimiter.whitelist.has('trusted-ip')).toBe(true);
  });

  test('should add to blacklist', () => {
    rateLimiter.addToBlacklist('malicious-ip');
    expect(rateLimiter.blacklist.has('malicious-ip')).toBe(true);
  });

  test('should track analytics', async () => {
    mockRedisClient.get.mockResolvedValueOnce('99');
    mockRedisClient.get.mockResolvedValueOnce('100');
    
    const result1 = await rateLimiter.checkLimit('user1');
    expect(result1.allowed).toBe(true);
    
    const result2 = await rateLimiter.checkLimit('user1');
    expect(result2.allowed).toBe(false);
    
    const analytics = rateLimiter.getAnalytics();
    expect(analytics.blockedRequests).toBeGreaterThan(0);
  });
});

describe('Circuit Breaker Tests', () => {
  let circuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 5000
    });
  });

  test('should start in CLOSED state', () => {
    expect(circuitBreaker.state).toBe('CLOSED');
  });

  test('should open after threshold failures', () => {
    circuitBreaker.recordFailure();
    circuitBreaker.recordFailure();
    circuitBreaker.recordFailure();
    
    expect(circuitBreaker.state).toBe('OPEN');
  });

  test('should transition to HALF_OPEN after timeout', () => {
    circuitBreaker.recordFailure();
    circuitBreaker.recordFailure();
    circuitBreaker.recordFailure();
    expect(circuitBreaker.state).toBe('OPEN');
    
    jest.advanceTimersByTime(6000);
    expect(circuitBreaker.canExecute()).toBe(true);
    expect(circuitBreaker.state).toBe('HALF_OPEN');
  });

  test('should record success count', () => {
    circuitBreaker.state = 'HALF_OPEN';
    circuitBreaker.recordSuccess();
    circuitBreaker.recordSuccess();
    
    expect(circuitBreaker.state).toBe('CLOSED');
  });

  test('should track metrics', () => {
    circuitBreaker.recordSuccess();
    circuitBreaker.recordFailure();
    
    const metrics = circuitBreaker.getState().metrics;
    expect(metrics.totalRequests).toBe(2);
    expect(metrics.successfulRequests).toBe(1);
    expect(metrics.failedRequests).toBe(1);
  });
});

describe('Error Tracking Tests', () => {
  let errorTracker;

  beforeEach(() => {
    errorTracker = new ErrorTracker({ enableRemoteLogging: false });
  });

  test('should log errors', () => {
    const error = new Error('Test error');
    errorTracker.logError(error, { context: 'test' });
    
    expect(errorTracker.errorLog.length).toBe(1);
    expect(errorTracker.errorLog[0].message).toBe('Test error');
  });

  test('should log warnings', () => {
    errorTracker.logWarning('Test warning', { data: 'value' });
    
    expect(errorTracker.warningLog.length).toBe(1);
    expect(errorTracker.warningLog[0].message).toBe('Test warning');
  });

  test('should track errors by endpoint', () => {
    const error = new Error('API error');
    errorTracker.trackEndpointError('/api/users', error, { statusCode: 500 });
    
    expect(errorTracker.metrics.errorsByEndpoint['/api/users']).toBeDefined();
  });

  test('should count error types', () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');
    
    errorTracker.logError(error1);
    errorTracker.logError(error2);
    
    expect(errorTracker.metrics.totalErrors).toBe(2);
  });

  test('should maintain max log size', () => {
    errorTracker.maxLogSize = 5;
    
    for (let i = 0; i < 10; i++) {
      errorTracker.logError(new Error(`Error ${i}`));
    }
    
    expect(errorTracker.errorLog.length).toBeLessThanOrEqual(5);
  });

  test('should provide error summary', () => {
    errorTracker.logError(new Error('Error 1'));
    errorTracker.logError(new Error('Error 2'));
    errorTracker.logWarning('Warning 1');
    
    const summary = errorTracker.getErrorSummary();
    expect(summary.totalErrors).toBe(2);
    expect(summary.totalWarnings).toBe(1);
  });

  test('should export logs as JSON', () => {
    errorTracker.logError(new Error('Test error'));
    const exported = errorTracker.exportLogs();
    
    expect(typeof exported).toBe('string');
    expect(JSON.parse(exported)).toBeDefined();
  });

  test('should clear logs', () => {
    errorTracker.logError(new Error('Error 1'));
    errorTracker.logWarning('Warning 1');
    
    errorTracker.clearLogs();
    
    expect(errorTracker.errorLog.length).toBe(0);
    expect(errorTracker.warningLog.length).toBe(0);
  });
});

describe('API Integration Tests', () => {
  test('should handle validation middleware', () => {
    const middleware = validationMiddleware();
    const req = {
      body: { email: '<script>alert("xss")</script>' },
      query: {},
      params: {},
      sanitized: false
    };
    const res = {};
    const next = jest.fn();
    
    middleware(req, res, next);
    
    expect(req.sanitized).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  test('should handle rate limit middleware', async () => {
    const mockRedisClient = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK')
    };
    const rateLimiter = new RateLimiter(mockRedisClient, { limit: 100 });
    const middleware = createRateLimitMiddleware(rateLimiter);
    
    const req = {
      ip: '127.0.0.1',
      method: 'GET',
      path: '/api/users'
    };
    const res = {
      set: jest.fn()
    };
    const next = jest.fn();
    
    await middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(String));
  });

  test('should handle circuit breaker middleware', () => {
    const circuitBreaker = new CircuitBreaker();
    const middleware = createCircuitBreakerMiddleware(circuitBreaker);
    
    const req = {};
    const res = {
      statusCode: 200,
      send: jest.fn((data) => data)
    };
    const next = jest.fn();
    
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });
});

describe('Performance Tests', () => {
  test('sanitization should be fast', () => {
    const largeString = 'a'.repeat(10000);
    const start = performance.now();
    
    sanitizeString(largeString);
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in < 100ms
  });

  test('validation should be efficient', () => {
    const obj = {
      users: Array(1000).fill().map((_, i) => ({
        id: i,
        email: `user${i}@example.com`,
        name: `User ${i}`
      }))
    };
    
    const start = performance.now();
    sanitizeObject(obj);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(1000); // Should complete in < 1 second
  });

  test('rate limiting should handle high concurrency', async () => {
    const mockRedisClient = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK'),
      incr: jest.fn().mockResolvedValue(1)
    };
    const rateLimiter = new RateLimiter(mockRedisClient);
    
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(rateLimiter.checkLimit(`user${i}`));
    }
    
    const start = performance.now();
    await Promise.all(promises);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(2000); // Should handle 100 requests in < 2s
  });
});
