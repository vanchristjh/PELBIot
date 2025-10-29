/**
 * Jest Configuration for PELBIOT
 * @module jest.config.js
 */

const config = {
  // Use Node.js environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

  // Coverage configuration
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/**/*.test.js',
    '!backend/**/__tests__/**',
    '!backend/config/**',
    '!**/node_modules/**',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },

  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/$1',
    '^@config/(.*)$': '<rootDir>/backend/config/$1',
    '^@utils/(.*)$': '<rootDir>/backend/utils/$1',
    '^@middleware/(.*)$': '<rootDir>/backend/middleware/$1',
    '^@controllers/(.*)$': '<rootDir>/backend/controllers/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Transform files
  transform: {
    '^.+\\.js$': ['babel-jest', { rootMode: 'upward' }],
  },

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Collect coverage by default
  collectCoverage: false,

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'json', 'json-summary', 'html'],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Notify on completion
  notify: true,

  // Bail on first failure (set to false for full test run)
  bail: false,

  // Max workers
  maxWorkers: '50%',
};

export default config;
