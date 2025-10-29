/**
 * Jest Test Setup
 * Global test configuration and utilities
 * 
 * @module tests/setup.js
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-min-32-chars-required-1234';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'pelbiot_test';

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers if needed
// jest.useFakeTimers();

// Global test utilities
global.testUtils = {
  /**
   * Create mock request object
   */
  createMockRequest(data = {}) {
    return {
      body: data.body || {},
      query: data.query || {},
      params: data.params || {},
      headers: data.headers || {},
      ip: data.ip || '127.0.0.1',
      get: jest.fn((key) => data.headers?.[key] || null),
      ...data,
    };
  },

  /**
   * Create mock response object
   */
  createMockResponse() {
    const res = {
      statusCode: null,
      body: null,
      status: jest.fn(function (code) {
        this.statusCode = code;
        return this;
      }),
      json: jest.fn(function (data) {
        this.body = data;
        return this;
      }),
      send: jest.fn(function (data) {
        this.body = data;
        return this;
      }),
      setHeader: jest.fn(function (key, value) {
        this.headers = this.headers || {};
        this.headers[key] = value;
        return this;
      }),
      end: jest.fn(function () {
        return this;
      }),
    };
    return res;
  },

  /**
   * Create mock next function
   */
  createMockNext() {
    return jest.fn();
  },

  /**
   * Wait for async operations
   */
  wait(ms = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Generate test UUID
   */
  generateUUID() {
    return '00000000-0000-4000-8000-000000000000';
  },

  /**
   * Generate random string
   */
  randomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generate test device object
   */
  generateTestDevice() {
    return {
      deviceId: this.generateUUID(),
      deviceType: 'iOS',
      osVersion: '16',
      appVersion: '1.0.0',
    };
  },

  /**
   * Generate test user object
   */
  generateTestUser() {
    return {
      userId: this.generateUUID(),
      email: `test-${this.randomString()}@pelbiot.com`,
      username: `testuser-${this.randomString()}`,
      role: 'user',
    };
  },
};

// Add custom matchers if needed
expect.extend({
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);

    return {
      pass,
      message: () => `expected ${received} to be a valid UUID`,
    };
  },

  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      pass,
      message: () => `expected ${received} to be a valid email`,
    };
  },
});

// Export setup utilities
export default global.testUtils;
