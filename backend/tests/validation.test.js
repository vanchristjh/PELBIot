import { validatePasswordStrength } from '../utils/authUtils.js';

describe('Validation Rules', () => {
  describe('Password Strength Validation', () => {
    const testCases = [
      {
        password: 'ValidPass123@',
        shouldPass: true,
        description: 'Valid password',
      },
      {
        password: 'Pass123@',
        shouldPass: false,
        description: 'Password too short (< 8 chars)',
      },
      {
        password: 'password123@',
        shouldPass: false,
        description: 'Missing uppercase letters',
      },
      {
        password: 'PASSWORD123@',
        shouldPass: false,
        description: 'Missing lowercase letters',
      },
      {
        password: 'ValidPassword@',
        shouldPass: false,
        description: 'Missing numbers',
      },
      {
        password: 'ValidPass123',
        shouldPass: false,
        description: 'Missing special characters',
      },
      {
        password: 'ValidPass123@!#$%',
        shouldPass: true,
        description: 'Valid password with multiple special chars',
      },
    ];

    testCases.forEach(({ password, shouldPass, description }) => {
      test(`${description}: "${password}"`, () => {
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(shouldPass);
        expect(shouldPass ? result.errors.length === 0 : result.errors.length > 0).toBe(true);
      });
    });
  });

  describe('Email Validation', () => {
    const validEmails = [
      'user@example.com',
      'test.user@example.co.uk',
      'user+tag@example.com',
    ];

    const invalidEmails = [
      'invalid',
      'user@',
      '@example.com',
      'user @example.com',
    ];

    validEmails.forEach(email => {
      test(`should accept valid email: ${email}`, () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    invalidEmails.forEach(email => {
      test(`should reject invalid email: ${email}`, () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Username Validation', () => {
    test('should accept valid username (3-50 chars, alphanumeric)', () => {
      const usernameRegex = /^[a-zA-Z0-9]{3,50}$/;
      expect(usernameRegex.test('validuser123')).toBe(true);
    });

    test('should reject username too short (< 3 chars)', () => {
      const usernameRegex = /^[a-zA-Z0-9]{3,50}$/;
      expect(usernameRegex.test('ab')).toBe(false);
    });

    test('should reject username too long (> 50 chars)', () => {
      const usernameRegex = /^[a-zA-Z0-9]{3,50}$/;
      const longUsername = 'a'.repeat(51);
      expect(usernameRegex.test(longUsername)).toBe(false);
    });

    test('should reject username with special characters', () => {
      const usernameRegex = /^[a-zA-Z0-9]{3,50}$/;
      expect(usernameRegex.test('user@name')).toBe(false);
    });
  });

  describe('Number Validation', () => {
    test('should validate positive integers', () => {
      expect(Number.isInteger(5) && 5 > 0).toBe(true);
      expect(Number.isInteger(-5) && -5 > 0).toBe(false);
      expect(Number.isInteger(3.14) && 3.14 > 0).toBe(false);
    });

    test('should validate voltage ranges', () => {
      const isValidVoltage = (v) => typeof v === 'number' && v >= 0 && v <= 1000;
      expect(isValidVoltage(220)).toBe(true);
      expect(isValidVoltage(-10)).toBe(false);
      expect(isValidVoltage(5000)).toBe(false);
    });

    test('should validate ampere ranges', () => {
      const isValidAmpere = (a) => typeof a === 'number' && a >= 0 && a <= 500;
      expect(isValidAmpere(50)).toBe(true);
      expect(isValidAmpere(-5)).toBe(false);
      expect(isValidAmpere(1000)).toBe(false);
    });
  });

  describe('XSS Prevention', () => {
    test('should detect script tags', () => {
      const hasScriptTag = (str) => /<script/i.test(str);
      expect(hasScriptTag('hello world')).toBe(false);
      expect(hasScriptTag('<script>alert("xss")</script>')).toBe(true);
      expect(hasScriptTag('<SCRIPT>alert("xss")</SCRIPT>')).toBe(true);
    });

    test('should detect onclick handlers', () => {
      const hasEventHandler = (str) => /on\w+\s*=/i.test(str);
      expect(hasEventHandler('hello world')).toBe(false);
      expect(hasEventHandler('<div onclick="alert()">test</div>')).toBe(true);
      expect(hasEventHandler('<img onerror="alert()">')).toBe(true);
    });

    test('should sanitize HTML special characters', () => {
      const sanitize = (str) => str.replace(/[<>]/g, '');
      expect(sanitize('hello world')).toBe('hello world');
      expect(sanitize('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitize('normal <text>')).toBe('normal text');
    });
  });
});
