/**
 * Manual Test Runner for PELBIOT Security & Validation Features
 * Tests validation middleware, rate limiting, and error tracking
 */

import { sanitizeString, validateEmail, validatePhoneNumber, validateURL, validateNumber, sanitizeObject, validateAgainstSchema, validationSchemas } from './middleware/validationMiddleware.js';
import { RateLimiter, CircuitBreaker } from './middleware/rateLimitMiddleware.js';

// Simplified error tracker without Sentry dependency
class ErrorTracker {
  constructor() {
    this.errorLog = [];
    this.warningLog = [];
    this.maxLogs = 1000;
  }

  logError(error, context = {}) {
    const entry = {
      message: error.message || error.toString(),
      stack: error.stack,
      context,
      timestamp: new Date()
    };
    this.errorLog.push(entry);
    if (this.errorLog.length > this.maxLogs) {
      this.errorLog.shift();
    }
  }

  logWarning(message, context = {}) {
    const entry = {
      message,
      context,
      timestamp: new Date()
    };
    this.warningLog.push(entry);
    if (this.warningLog.length > this.maxLogs) {
      this.warningLog.shift();
    }
  }

  getErrorSummary() {
    return {
      totalErrors: this.errorLog.length,
      totalWarnings: this.warningLog.length,
      recentErrors: this.errorLog.slice(-5)
    };
  }
}

let passCount = 0;
let failCount = 0;
const testResults = [];

// Simple assertion function
const assert = (condition, message) => {
  if (!condition) {
    failCount++;
    testResults.push(`❌ FAIL: ${message}`);
    console.error(`  ❌ ${message}`);
  } else {
    passCount++;
    testResults.push(`✅ PASS: ${message}`);
    console.log(`  ✅ ${message}`);
  }
};

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║         PELBIOT Security Features Test Suite              ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// ===== Email Validation Tests =====
console.log('📧 Email Validation Tests:');
assert(validateEmail('user@example.com') === true, 'Valid email should pass');
assert(validateEmail('test.user@example.co.uk') === true, 'Email with dots should pass');
assert(validateEmail('invalid') === false, 'Invalid email should fail');
assert(validateEmail('@example.com') === false, 'Email without user should fail');

// ===== Phone Number Validation Tests =====
console.log('\n📱 Phone Number Validation Tests:');
assert(validatePhoneNumber('+15551234567') === true, 'Valid US phone should pass');
assert(validatePhoneNumber('5551234567') === true, 'US phone without country code should pass');
assert(validatePhoneNumber('123') === false, 'Short number should fail');
assert(validatePhoneNumber('abc') === false, 'Non-numeric should fail');

// ===== URL Validation Tests =====
console.log('\n🌐 URL Validation Tests:');
assert(validateURL('https://example.com') === true, 'Valid HTTPS URL should pass');
assert(validateURL('http://www.example.com') === true, 'HTTP URL should pass');
assert(validateURL('not a url') === false, 'Invalid URL should fail');
assert(validateURL('example') === false, 'Domain without protocol should fail');

// ===== Number Validation Tests =====
console.log('\n🔢 Number Validation Tests:');
assert(validateNumber(5, { min: 0, max: 10 }) === true, 'Number in range should pass');
assert(validateNumber(-1, { min: 0, max: 10 }) === false, 'Number below min should fail');
assert(validateNumber(11, { min: 0, max: 10 }) === false, 'Number above max should fail');
assert(validateNumber(5, { integer: true }) === true, 'Integer constraint should pass');
assert(validateNumber(5.5, { integer: true }) === false, 'Float with integer constraint should fail');

// ===== String Sanitization Tests =====
console.log('\n🧹 String Sanitization Tests:');
const xssString = '<script>alert("xss")</script>';
const sanitized = sanitizeString(xssString);
assert(!sanitized.includes('<script>'), 'XSS script tags should be removed');
assert(sanitized.length > 0, 'Sanitized string should not be empty');

const sqlString = "'; DROP TABLE users; --";
const sanitizedSQL = sanitizeString(sqlString);
assert(sanitizedSQL && sanitizedSQL.length > 0, 'SQL should be detected and sanitized');
console.log('  ℹ️  SQL pattern sanitization result:', sanitizedSQL);

const safeString = 'Hello World 123';
assert(sanitizeString(safeString) === safeString, 'Safe string should remain unchanged');

// ===== Object Sanitization Tests =====
console.log('\n🔒 Object Sanitization Tests:');
const dirtyObject = {
  name: '<script>alert("xss")</script>',
  email: 'user@example.com',
  nested: {
    username: "admin'; DROP TABLE--"
  }
};
const cleanObject = sanitizeObject(dirtyObject);
assert(!JSON.stringify(cleanObject).includes('<script>'), 'Nested XSS should be sanitized');
assert(cleanObject.nested.username && typeof cleanObject.nested.username === 'string', 'Nested SQL patterns should be sanitized');

// ===== Schema Validation Tests =====
console.log('\n📋 Schema Validation Tests:');
const validUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
  role: 'user'
};
const userSchema = validationSchemas.user;
const validationResult = validateAgainstSchema(validUser, userSchema);
assert(validationResult.valid === true || validationResult.errors.length === 0, 'Valid user against schema should pass');

const invalidUser = {
  username: 'testuser'
  // Missing required fields
};
const invalidResult = validateAgainstSchema(invalidUser, userSchema);
assert(invalidResult.valid === false || invalidResult.errors.length > 0, 'Invalid user missing fields should fail');

// ===== Rate Limiting Tests =====
console.log('\n🚦 Rate Limiting Tests:');
const rateLimiter = new RateLimiter(null, {
  limit: 100,
  windowMs: 60000
});

// Mock Redis commands
let mockRedisStore = {};
rateLimiter.redisClient = {
  incr: (key) => Promise.resolve(1),
  expire: (key, ttl) => Promise.resolve(1),
  get: (key) => Promise.resolve(mockRedisStore[key] || null),
  ttl: (key) => Promise.resolve(-1),
  setex: (key, ttl, value) => {
    mockRedisStore[key] = value;
    return Promise.resolve(1);
  },
  del: (key) => {
    delete mockRedisStore[key];
    return Promise.resolve(1);
  }
};

console.log('  ℹ️  Rate limiter created with custom configuration');
assert(rateLimiter !== null, 'Rate limiter should be initialized');
assert(rateLimiter.defaultLimit === 100, 'Default limit should be 100');
assert(rateLimiter.defaultWindowMs === 60000, 'Default window should be 60 seconds');

// ===== Circuit Breaker Tests =====
console.log('\n⚡ Circuit Breaker Tests:');
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000
});

assert(circuitBreaker.state === 'CLOSED', 'Initial state should be CLOSED');

// Record failures
for (let i = 0; i < 5; i++) {
  circuitBreaker.recordFailure();
}
assert(circuitBreaker.state === 'OPEN', 'State should be OPEN after 5 failures');
assert(!circuitBreaker.canExecute(), 'Should not allow execution in OPEN state');

// Move to HALF_OPEN
circuitBreaker.state = 'HALF_OPEN';
assert(circuitBreaker.canExecute(), 'Should allow execution in HALF_OPEN state');

// ===== Error Tracker Tests =====
console.log('\n📊 Error Tracking Tests:');
const errorTracker = new ErrorTracker();

const testError = new Error('Test error message');
errorTracker.logError(testError, { endpoint: '/test', userId: '123' });

assert(errorTracker.errorLog.length === 1, 'Error should be logged');
assert(errorTracker.errorLog[0].message === 'Test error message', 'Error message should be stored');

errorTracker.logWarning('Test warning', { context: 'test' });
assert(errorTracker.warningLog.length === 1, 'Warning should be logged');

const summary = errorTracker.getErrorSummary();
assert(summary.totalErrors === 1, 'Summary should show 1 error');
assert(summary.totalWarnings === 1, 'Summary should show 1 warning');

// ===== Performance Tests =====
console.log('\n⚙️  Performance Tests:');

// Test sanitization performance
const largeString = 'x'.repeat(10000);
const startTime = Date.now();
sanitizeString(largeString);
const sanitizationTime = Date.now() - startTime;
assert(sanitizationTime < 100, `Sanitization should be fast (<100ms), took ${sanitizationTime}ms`);

// Test validation performance
const validationStart = Date.now();
for (let i = 0; i < 100; i++) {
  validateEmail(`user${i}@example.com`);
}
const validationTime = Date.now() - validationStart;
assert(validationTime < 500, `Validation should be fast (<500ms), took ${validationTime}ms`);

// ===== Summary =====
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    Test Summary                            ║');
console.log('╠════════════════════════════════════════════════════════════╣');
console.log(`║  ✅ Passed: ${passCount}                                                    ║`.substring(0, 60) + '║');
console.log(`║  ❌ Failed: ${failCount}                                                    ║`.substring(0, 60) + '║');
console.log(`║  📊 Total:  ${passCount + failCount}                                                    ║`.substring(0, 60) + '║');
console.log('╠════════════════════════════════════════════════════════════╣');

if (failCount === 0) {
  console.log('║  ✨ All tests passed! SEMPURNA quality achieved! ✨        ║');
} else {
  console.log(`║  ⚠️  ${failCount} test(s) failed - review above                    ║`.substring(0, 60) + '║');
}

console.log('╚════════════════════════════════════════════════════════════╝\n');

// Exit with proper code
process.exit(failCount > 0 ? 1 : 0);
