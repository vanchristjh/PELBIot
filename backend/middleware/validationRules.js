import { body, param, query } from 'express-validator';

// Auth Validations
export const validateLogin = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .trim()
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .isLength({ max: 50 }).withMessage('Username must not exceed 50 characters'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 100 }).withMessage('Password must not exceed 100 characters'),
];

export const validateRegister = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3-50 characters')
    .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('role')
    .optional()
    .isIn(['admin', 'user', 'operator']).withMessage('Invalid role'),
];

// Device Validations
export const validateDeviceCreate = [
  body('name')
    .notEmpty().withMessage('Device name is required')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('type')
    .notEmpty().withMessage('Device type is required')
    .isIn(['trafo', 'panel', 'weather', 'sensor']).withMessage('Invalid device type'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Location must not exceed 255 characters'),
  body('ip_address')
    .optional()
    .isIP().withMessage('Invalid IP address'),
];

export const validateDeviceUpdate = [
  param('id')
    .isInt({ min: 1 }).withMessage('Device ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('status')
    .optional()
    .isIn(['online', 'offline', 'error']).withMessage('Invalid status'),
];

// Panel Validations
export const validatePanelCreate = [
  body('device_id')
    .notEmpty().withMessage('Device ID is required')
    .isInt({ min: 1 }).withMessage('Device ID must be a positive integer'),
  body('panel_number')
    .notEmpty().withMessage('Panel number is required')
    .isInt({ min: 1 }).withMessage('Panel number must be a positive integer'),
  body('voltage')
    .optional()
    .isFloat({ min: 0 }).withMessage('Voltage must be a positive number'),
  body('ampere')
    .optional()
    .isFloat({ min: 0 }).withMessage('Ampere must be a positive number'),
];

// Alert Validations
export const validateAlertCreate = [
  body('device_id')
    .notEmpty().withMessage('Device ID is required')
    .isInt({ min: 1 }).withMessage('Device ID must be a positive integer'),
  body('severity')
    .notEmpty().withMessage('Severity is required')
    .isIn(['info', 'warning', 'critical']).withMessage('Invalid severity level'),
  body('message')
    .notEmpty().withMessage('Message is required')
    .trim()
    .isLength({ min: 5, max: 500 }).withMessage('Message must be between 5-500 characters'),
];

// Trend Validations
export const validateTrendQuery = [
  query('device_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Device ID must be a positive integer'),
  query('start_date')
    .optional()
    .isISO8601().withMessage('Start date must be ISO 8601 format'),
  query('end_date')
    .optional()
    .isISO8601().withMessage('End date must be ISO 8601 format'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1-1000'),
];

// Report Validations
export const validateReportCreate = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3-200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('type')
    .notEmpty().withMessage('Report type is required')
    .isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid report type'),
];

// Generic ID validation
export const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID format'),
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
];
