/**
 * PELBIOT Input Validation Middleware
 * Comprehensive validation for all request inputs
 * 
 * @module middleware/inputValidation
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * UUID v4 validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Phone number validation regex
 */
const PHONE_REGEX = /^\+?1?\d{9,15}$/;

/**
 * Validation error object
 */
class ValidationError extends Error {
  constructor(message, field = null, value = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.statusCode = 400;
  }
}

/**
 * Base validator class
 */
class Validator {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  /**
   * Check if value is required
   */
  isRequired(field, message) {
    if (!this.data[field]) {
      this.errors.push({
        field,
        message: message || `${field} is required`,
      });
    }
    return this;
  }

  /**
   * Validate email
   */
  isEmail(field, message) {
    if (this.data[field] && !EMAIL_REGEX.test(this.data[field])) {
      this.errors.push({
        field,
        message: message || `${field} must be a valid email`,
      });
    }
    return this;
  }

  /**
   * Validate string length
   */
  isLength(field, min = null, max = null, message = null) {
    const value = this.data[field];
    if (value) {
      const len = String(value).length;
      if (min && len < min) {
        this.errors.push({
          field,
          message: message || `${field} must be at least ${min} characters`,
        });
      }
      if (max && len > max) {
        this.errors.push({
          field,
          message: message || `${field} must be at most ${max} characters`,
        });
      }
    }
    return this;
  }

  /**
   * Validate numeric range
   */
  isNumeric(field, min = null, max = null, message = null) {
    const value = this.data[field];
    if (value !== null && value !== undefined) {
      const num = Number(value);
      if (isNaN(num)) {
        this.errors.push({
          field,
          message: message || `${field} must be numeric`,
        });
        return this;
      }
      if (min !== null && num < min) {
        this.errors.push({
          field,
          message: message || `${field} must be at least ${min}`,
        });
      }
      if (max !== null && num > max) {
        this.errors.push({
          field,
          message: message || `${field} must be at most ${max}`,
        });
      }
    }
    return this;
  }

  /**
   * Validate if value is boolean
   */
  isBoolean(field, message = null) {
    const value = this.data[field];
    if (value !== null && value !== undefined && typeof value !== 'boolean') {
      this.errors.push({
        field,
        message: message || `${field} must be boolean`,
      });
    }
    return this;
  }

  /**
   * Validate if value is array
   */
  isArray(field, message = null) {
    const value = this.data[field];
    if (value && !Array.isArray(value)) {
      this.errors.push({
        field,
        message: message || `${field} must be an array`,
      });
    }
    return this;
  }

  /**
   * Validate array length
   */
  arrayLength(field, min = null, max = null, message = null) {
    const value = this.data[field];
    if (Array.isArray(value)) {
      if (min && value.length < min) {
        this.errors.push({
          field,
          message: message || `${field} must have at least ${min} items`,
        });
      }
      if (max && value.length > max) {
        this.errors.push({
          field,
          message: message || `${field} must have at most ${max} items`,
        });
      }
    }
    return this;
  }

  /**
   * Validate if value is in allowed list
   */
  isIn(field, allowedValues, message = null) {
    const value = this.data[field];
    if (value && !allowedValues.includes(value)) {
      this.errors.push({
        field,
        message: message || `${field} must be one of: ${allowedValues.join(', ')}`,
      });
    }
    return this;
  }

  /**
   * Validate UUID
   */
  isUUID(field, message = null) {
    const value = this.data[field];
    if (value && !UUID_REGEX.test(value)) {
      this.errors.push({
        field,
        message: message || `${field} must be a valid UUID`,
      });
    }
    return this;
  }

  /**
   * Validate phone number
   */
  isPhone(field, message = null) {
    const value = this.data[field];
    if (value && !PHONE_REGEX.test(value)) {
      this.errors.push({
        field,
        message: message || `${field} must be a valid phone number`,
      });
    }
    return this;
  }

  /**
   * Custom validation function
   */
  custom(field, validationFn, message) {
    const value = this.data[field];
    if (value && !validationFn(value)) {
      this.errors.push({
        field,
        message: message || `${field} failed custom validation`,
      });
    }
    return this;
  }

  /**
   * Get validation errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Check if validation passed
   */
  passes() {
    return this.errors.length === 0;
  }

  /**
   * Check if validation failed
   */
  fails() {
    return this.errors.length > 0;
  }
}

/**
 * Mobile App Validator
 */
class MobileValidator extends Validator {
  validateRegister() {
    this.isRequired('deviceId', 'Device ID is required')
      .isRequired('deviceType', 'Device type is required')
      .isRequired('osVersion', 'OS version is required')
      .isIn('deviceType', ['iOS', 'Android', 'Windows'], 'Invalid device type')
      .isIn('osVersion', ['10', '11', '12', '13', '14', '15', '16', '17'], 'OS version not supported');
    return this;
  }

  validateSync() {
    this.isRequired('deviceId', 'Device ID is required')
      .isArray('offlineData', 'Offline data must be an array');
    return this;
  }

  validateBiometric() {
    this.isRequired('deviceId', 'Device ID is required')
      .isRequired('biometricType', 'Biometric type is required')
      .isIn('biometricType', ['fingerprint', 'face', 'iris'], 'Invalid biometric type');
    return this;
  }
}

/**
 * Third-Party Integrations Validator
 */
class IntegrationValidator extends Validator {
  validateCredentials() {
    this.isRequired('provider', 'Provider is required')
      .isRequired('apiKey', 'API key is required')
      .isLength('apiKey', 10, null, 'API key must be at least 10 characters')
      .isIn('provider', ['stripe', 'paypal', 'twilio', 'sendgrid'], 'Invalid provider');
    return this;
  }

  validatePayment() {
    this.isRequired('amount', 'Amount is required')
      .isRequired('currency', 'Currency is required')
      .isRequired('paymentMethod', 'Payment method is required')
      .isNumeric('amount', 0.01, null, 'Amount must be positive')
      .isLength('currency', 3, 3, 'Currency must be 3 characters')
      .isIn('paymentMethod', ['stripe', 'paypal', 'card', 'bank'], 'Invalid payment method');
    return this;
  }

  validateMessaging() {
    this.isRequired('recipient', 'Recipient is required')
      .isRequired('message', 'Message is required')
      .isRequired('type', 'Message type is required')
      .isLength('message', 1, 1000, 'Message must be between 1 and 1000 characters')
      .isIn('type', ['sms', 'email'], 'Invalid message type');

    if (this.data.type === 'email') {
      this.isEmail('recipient', 'Recipient must be valid email for email type');
    }
    return this;
  }

  validateWebhook() {
    this.isRequired('url', 'Webhook URL is required')
      .isRequired('events', 'Events array is required')
      .isArray('events', 'Events must be an array')
      .arrayLength('events', 1, null, 'At least one event is required');
    return this;
  }
}

/**
 * Analytics Validator
 */
class AnalyticsValidator extends Validator {
  validateEvent() {
    this.isRequired('eventName', 'Event name is required')
      .isRequired('userId', 'User ID is required')
      .isLength('eventName', 1, 100, 'Event name must be between 1 and 100 characters');
    return this;
  }

  validateMetric() {
    this.isRequired('metricName', 'Metric name is required')
      .isRequired('value', 'Metric value is required')
      .isNumeric('value', null, null, 'Metric value must be numeric')
      .isLength('metricName', 1, 100, 'Metric name must be between 1 and 100 characters');
    return this;
  }

  validateDashboard() {
    this.isRequired('name', 'Dashboard name is required')
      .isLength('name', 1, 100, 'Dashboard name must be between 1 and 100 characters');
    return this;
  }

  validateReport() {
    this.isRequired('reportType', 'Report type is required')
      .isRequired('startDate', 'Start date is required')
      .isRequired('endDate', 'End date is required')
      .isIn('reportType', ['summary', 'detailed', 'custom'], 'Invalid report type');
    return this;
  }
}

/**
 * AI/ML Validator
 */
class AIMLValidator extends Validator {
  validateAnomalyDetection() {
    this.isRequired('modelId', 'Model ID is required')
      .isArray('dataPoints', 'Data points must be an array')
      .arrayLength('dataPoints', 50, null, 'At least 50 data points required for training');
    return this;
  }

  validateForecasting() {
    this.isRequired('timeSeriesId', 'Time series ID is required')
      .isRequired('periods', 'Number of periods is required')
      .isNumeric('periods', 1, 100, 'Periods must be between 1 and 100');
    return this;
  }

  validateClassification() {
    this.isRequired('modelId', 'Model ID is required')
      .isArray('features', 'Features must be an array')
      .arrayLength('features', 1, null, 'At least one feature is required');
    return this;
  }

  validateClustering() {
    this.isRequired('dataPoints', 'Data points are required')
      .isArray('dataPoints', 'Data points must be an array')
      .isRequired('k', 'Number of clusters (k) is required')
      .isNumeric('k', 1, null, 'k must be at least 1');
    return this;
  }
}

/**
 * Validation middleware factory
 */
function createValidationMiddleware(validatorClass, validationMethod) {
  return (req, res, next) => {
    try {
      const validator = new validatorClass(req.body);
      validator[validationMethod]();

      if (validator.fails()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validator.getErrors(),
        });
      }

      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }
  };
}

// Export validators and utilities
export {
  Validator,
  MobileValidator,
  IntegrationValidator,
  AnalyticsValidator,
  AIMLValidator,
  ValidationError,
  createValidationMiddleware,
  EMAIL_REGEX,
  UUID_REGEX,
  PHONE_REGEX,
};
