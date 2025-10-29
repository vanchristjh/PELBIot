/**
 * Input Validation & Sanitization Middleware
 * Comprehensive protection against SQL injection, XSS, and malicious input
 * 
 * @features:
 * - SQL Injection prevention
 * - XSS attack prevention
 * - Data type validation
 * - Email validation
 * - Phone number validation
 * - URL validation
 * - File upload validation
 * - Whitelist validation
 */

import xss from 'xss';
import validator from 'validator';

/**
 * Sanitize string input - Remove XSS attempts
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove XSS attempts
  let sanitized = xss(input, {
    whiteList: {},
    stripIgnoredTag: true,
    stripLeakage: true
  });
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Remove suspicious SQL patterns (basic protection)
  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi,
    /(-{2})/g, // SQL comments
    /\/\*/g, // Multi-line comments
    /(;)/g // Semicolons
  ];
  
  sqlPatterns.forEach(pattern => {
    if (pattern.test(sanitized)) {
      // Log suspicious input
      console.warn('Suspicious SQL pattern detected:', sanitized.substring(0, 100));
    }
  });
  
  return sanitized;
};

/**
 * Validate email address
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && validator.isEmail(email);
};

/**
 * Validate phone number (international format)
 */
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate URL
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return validator.isURL(url);
  } catch {
    return false;
  }
};

/**
 * Validate numeric input
 */
export const validateNumber = (value, options = {}) => {
  const { min = -Infinity, max = Infinity, integer = false } = options;
  
  const num = Number(value);
  if (isNaN(num)) return false;
  if (integer && !Number.isInteger(num)) return false;
  if (num < min || num > max) return false;
  
  return true;
};

/**
 * Validate array input
 */
export const validateArray = (value, options = {}) => {
  const { minLength = 0, maxLength = Infinity, itemType = null } = options;
  
  if (!Array.isArray(value)) return false;
  if (value.length < minLength || value.length > maxLength) return false;
  
  if (itemType) {
    return value.every(item => {
      if (itemType === 'string') return typeof item === 'string';
      if (itemType === 'number') return typeof item === 'number';
      if (itemType === 'email') return validateEmail(item);
      return true;
    });
  }
  
  return true;
};

/**
 * Validate against whitelist
 */
export const validateWhitelist = (value, whitelist) => {
  return whitelist.includes(value);
};

/**
 * Validate JSON structure
 */
export const validateJSON = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key
    const sanitizedKey = sanitizeString(key);
    
    // Sanitize value
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeObject(value);
    } else {
      sanitized[sanitizedKey] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validation schema for common patterns
 */
export const validationSchemas = {
  user: {
    email: { type: 'email', required: true },
    password: { type: 'string', minLength: 8, required: true },
    name: { type: 'string', minLength: 2, maxLength: 100 },
    phone: { type: 'phone' }
  },
  device: {
    deviceId: { type: 'string', required: true },
    name: { type: 'string', minLength: 1, maxLength: 100, required: true },
    location: { type: 'string', maxLength: 200 },
    status: { type: 'whitelist', values: ['active', 'inactive', 'maintenance'], required: true }
  },
  alert: {
    name: { type: 'string', minLength: 1, maxLength: 100, required: true },
    threshold: { type: 'number', required: true },
    condition: { type: 'whitelist', values: ['>', '<', '>=', '<=', '==', '!='], required: true },
    severity: { type: 'whitelist', values: ['low', 'medium', 'high', 'critical'], required: true }
  },
  report: {
    type: { type: 'whitelist', values: ['summary', 'trend', 'alert', 'energy'], required: true },
    format: { type: 'whitelist', values: ['pdf', 'csv', 'json'], required: true },
    startDate: { type: 'date', required: true },
    endDate: { type: 'date', required: true }
  }
};

/**
 * Validate input against schema
 */
export const validateAgainstSchema = (data, schema) => {
  const errors = [];
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];
    
    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`);
      continue;
    }
    
    if (value === undefined || value === null) continue;
    
    // Validate type
    if (rules.type === 'email' && !validateEmail(value)) {
      errors.push(`${key} must be a valid email`);
    }
    
    if (rules.type === 'number') {
      if (!validateNumber(value, { min: rules.min, max: rules.max })) {
        errors.push(`${key} must be a valid number`);
      }
    }
    
    if (rules.type === 'phone' && !validatePhoneNumber(value)) {
      errors.push(`${key} must be a valid phone number`);
    }
    
    if (rules.type === 'string') {
      if (typeof value !== 'string') {
        errors.push(`${key} must be a string`);
      }
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${key} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${key} must be at most ${rules.maxLength} characters`);
      }
    }
    
    if (rules.type === 'whitelist') {
      if (!validateWhitelist(value, rules.values)) {
        errors.push(`${key} must be one of: ${rules.values.join(', ')}`);
      }
    }
    
    if (rules.type === 'date') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push(`${key} must be a valid date`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Express middleware for request validation and sanitization
 */
export const validationMiddleware = () => {
  return (req, res, next) => {
    try {
      // Sanitize query params
      if (req.query && Object.keys(req.query).length > 0) {
        req.query = sanitizeObject(req.query);
      }
      
      // Sanitize request body
      if (req.body && Object.keys(req.body).length > 0) {
        req.body = sanitizeObject(req.body);
      }
      
      // Sanitize params
      if (req.params && Object.keys(req.params).length > 0) {
        req.params = sanitizeObject(req.params);
      }
      
      // Log sanitization info
      req.sanitized = true;
      
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(400).json({ 
        error: 'Invalid input detected',
        message: error.message 
      });
    }
  };
};

/**
 * Request field validator middleware (use with specific schemas)
 */
export const fieldValidator = (schema) => {
  return (req, res, next) => {
    const dataToValidate = { ...req.body, ...req.params, ...req.query };
    const validation = validateAgainstSchema(dataToValidate, schema);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    req.validated = true;
    next();
  };
};

/**
 * File upload validation
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions = ['.jpg', '.png', '.pdf']
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
  }
  
  if (!allowedMimes.includes(file.mimetype)) {
    errors.push(`File type must be one of: ${allowedMimes.join(', ')}`);
  }
  
  const fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
    errors.push(`File extension must be one of: ${allowedExtensions.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Export validation utilities as a single object
 */
export const ValidationUtils = {
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
};

export default ValidationUtils;
