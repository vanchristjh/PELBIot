import express from 'express';
import { validateLogin, validateRegister } from '../middleware/validationRules.js';
import { handleValidationErrors } from '../middleware/securityMiddleware.js';
import { authMiddleware } from '../utils/authUtils.js';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyUserToken
} from '../controllers/authController.js';

const router = express.Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: 'Too many registration attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  registerLimiter,
  validateRegister,
  handleValidationErrors,
  registerUser
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  loginLimiter,
  validateLogin,
  handleValidationErrors,
  loginUser
);

/**
 * GET /api/auth/me
 * Get current user (requires authentication)
 */
router.get(
  '/me',
  authMiddleware,
  getCurrentUser
);

/**
 * GET /api/auth/verify
 * Verify token validity (requires authentication)
 */
router.get(
  '/verify',
  authMiddleware,
  verifyUserToken
);

export default router;
