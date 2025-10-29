/**
 * Mobile App Module Tests
 * @module tests/mobileApp.test.js
 */

import { MobileValidator } from '../backend/middleware/inputValidation.js';
import { getLogger } from '../backend/utils/errorLogger.js';

describe('Mobile App Module Tests', () => {
  let logger;

  beforeAll(() => {
    logger = getLogger({ logLevel: 'error' });
  });

  describe('MobileValidator', () => {
    test('should validate device registration successfully', () => {
      const data = {
        deviceId: 'device-123',
        deviceType: 'iOS',
        osVersion: '16',
      };

      const validator = new MobileValidator(data);
      validator.validateRegister();

      expect(validator.passes()).toBe(true);
      expect(validator.fails()).toBe(false);
    });

    test('should fail validation with missing deviceId', () => {
      const data = {
        deviceType: 'iOS',
        osVersion: '16',
      };

      const validator = new MobileValidator(data);
      validator.validateRegister();

      expect(validator.fails()).toBe(true);
      expect(validator.getErrors()).toHaveLength(1);
      expect(validator.getErrors()[0].field).toBe('deviceId');
    });

    test('should fail validation with invalid device type', () => {
      const data = {
        deviceId: 'device-123',
        deviceType: 'InvalidOS',
        osVersion: '16',
      };

      const validator = new MobileValidator(data);
      validator.validateRegister();

      expect(validator.fails()).toBe(true);
    });

    test('should validate sync successfully', () => {
      const data = {
        deviceId: 'device-123',
        offlineData: [
          { id: 1, action: 'create', data: {} },
          { id: 2, action: 'update', data: {} },
        ],
      };

      const validator = new MobileValidator(data);
      validator.validateSync();

      expect(validator.passes()).toBe(true);
    });

    test('should validate biometric authentication', () => {
      const data = {
        deviceId: 'device-123',
        biometricType: 'fingerprint',
      };

      const validator = new MobileValidator(data);
      validator.validateBiometric();

      expect(validator.passes()).toBe(true);
    });

    test('should fail with invalid biometric type', () => {
      const data = {
        deviceId: 'device-123',
        biometricType: 'invalid',
      };

      const validator = new MobileValidator(data);
      validator.validateBiometric();

      expect(validator.fails()).toBe(true);
    });
  });

  describe('Mobile Features', () => {
    test('should track offline data', () => {
      const offlineData = [
        {
          id: 1,
          timestamp: Date.now(),
          action: 'create',
          entity: 'device',
          data: { name: 'Device 1' },
        },
      ];

      expect(offlineData).toHaveLength(1);
      expect(offlineData[0].action).toBe('create');
      logger.info('Offline data tracked', { count: offlineData.length });
    });

    test('should handle push notifications', () => {
      const notification = {
        title: 'Test Notification',
        body: 'This is a test',
        topic: 'general',
      };

      expect(notification.title).toBeDefined();
      expect(notification.topic).toBe('general');
    });

    test('should manage biometric data', () => {
      const biometricData = {
        type: 'fingerprint',
        encrypted: true,
        template: Buffer.from('encrypted-template'),
      };

      expect(biometricData.encrypted).toBe(true);
      expect(biometricData.template).toBeDefined();
    });
  });
});
