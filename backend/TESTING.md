# PELBIOT Testing Documentation

## Overview
This document describes the testing strategy for PELBIOT, including unit tests, integration tests, and best practices.

## Backend Testing

### Setup
```bash
cd backend
npm install
npm test
```

### Test Structure
- **Unit Tests**: Test individual functions in isolation
  - `utils/authUtils.test.js` - Authentication utilities
  - `tests/validation.test.js` - Input validation rules

- **Integration Tests**: Test API endpoints with middleware
  - `tests/auth.integration.test.js` - Authentication endpoints
  - `tests/admin.integration.test.js` - Admin endpoints (coming soon)

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

Current coverage targets:
- Controllers: 80%+
- Utilities: 90%+
- Middleware: 85%+
- Routes: 75%+

## Frontend Testing

### Setup
```bash
cd frontend
npm install
npm test
```

### Test Structure
- **Component Tests**: React component testing with React Testing Library
- **Service Tests**: API service function tests
- **Integration Tests**: Multi-component workflows

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## Security Testing

### Rate Limiting Tests
- Verify rate limit headers are present
- Test consecutive requests exceed limit
- Verify reset after time window

### Authentication Tests
- Test password hashing and comparison
- Verify token generation and validation
- Test JWT expiry
- Verify role-based access control

### Input Validation Tests
- Test XSS prevention (sanitization)
- Test SQL injection prevention (parameterized queries)
- Test input length limits
- Test type validation

### CORS Tests
- Verify CORS headers on allowed origins
- Test rejection of unauthorized origins
- Test credentials header handling

## Best Practices

### Writing Good Tests

1. **Use Descriptive Names**
   ```javascript
   // Good
   test('should reject password without uppercase letters', () => {});
   
   // Bad
   test('password test', () => {});
   ```

2. **One Assertion Focus**
   ```javascript
   // Good - tests one thing
   test('should hash password', () => {
     const hash = hashPassword('test');
     expect(hash).toBeDefined();
   });
   
   // Avoid - tests multiple things
   test('password workflow', () => {
     const hash = hashPassword('test');
     const match = comparePassword('test', hash);
     expect(hash && match).toBe(true);
   });
   ```

3. **Use Setup/Teardown**
   ```javascript
   beforeEach(() => {
     // Reset test data
   });
   
   afterEach(() => {
     // Cleanup
   });
   ```

4. **Mock External Dependencies**
   ```javascript
   jest.mock('../utils/database.js');
   ```

## Continuous Integration

Tests will run automatically on:
- Pull requests
- Commits to main branch
- Scheduled daily runs

### GitHub Actions Workflow
See `.github/workflows/test.yml` for CI configuration.

## Troubleshooting

### Common Issues

**Tests Fail with "Cannot find module"**
- Ensure all imports use correct relative paths
- Check that modules are installed: `npm install`

**Tests Timeout**
- Increase Jest timeout: `jest.setTimeout(10000)`
- Check for unresolved promises

**Coverage Below Target**
- Identify uncovered lines: `npm run test:coverage`
- Add tests for edge cases
- Mock external dependencies properly

## Future Improvements

- [ ] Add E2E tests with Cypress
- [ ] Add performance benchmarks
- [ ] Add visual regression testing
- [ ] Add accessibility testing (axe)
- [ ] Set up test data seeding
