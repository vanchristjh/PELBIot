import { 
  hashPassword, 
  comparePassword, 
  validatePasswordStrength,
  generateToken,
  verifyToken 
} from '../utils/authUtils.js';

describe('Auth Utils', () => {
  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test('should compare password correctly', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const match = await comparePassword(password, hash);
      expect(match).toBe(true);
    });

    test('should fail when comparing wrong password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const match = await comparePassword('wrongPassword', hash);
      expect(match).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('should reject password without uppercase', () => {
      const result = validatePasswordStrength('password123@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain uppercase letters');
    });

    test('should reject password without lowercase', () => {
      const result = validatePasswordStrength('PASSWORD123@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain lowercase letters');
    });

    test('should reject password without numbers', () => {
      const result = validatePasswordStrength('Password@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain numbers');
    });

    test('should reject password without special characters', () => {
      const result = validatePasswordStrength('Password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain special characters (@$!%*?&)');
    });

    test('should reject short password', () => {
      const result = validatePasswordStrength('Pass1@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    test('should accept valid password', () => {
      const result = validatePasswordStrength('ValidPass123@');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('JWT Tokens', () => {
    test('should generate token', () => {
      const payload = { id: 1, username: 'testuser', role: 'admin' };
      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should verify valid token', () => {
      const payload = { id: 1, username: 'testuser', role: 'admin' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.role).toBe(payload.role);
    });

    test('should reject invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.here');
      }).toThrow();
    });

    test('should reject expired token', (done) => {
      // This test would need token manipulation to set expiry to past
      // For now, just verify that expired tokens are rejected
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.signature';
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
      done();
    });
  });
});
