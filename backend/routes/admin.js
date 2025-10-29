import express from 'express';
import { authMiddleware, roleMiddleware } from '../utils/authUtils.js';
import { validateId, validatePagination } from '../middleware/validationRules.js';
import { handleValidationErrors } from '../middleware/securityMiddleware.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAuditLogs,
} from '../controllers/adminController.js';
import {
  getSettings,
  getSetting,
  updateSetting,
  getSystemStats,
  getActivityLogs,
  getSystemHealth,
} from '../controllers/settingsController.js';

const router = express.Router();

// All admin routes require authentication and super_admin role
router.use(authMiddleware);
router.use(roleMiddleware(['super_admin', 'admin']));

// ===== User Management Routes =====

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/users', validatePagination, handleValidationErrors, getAllUsers);

/**
 * GET /api/admin/users/:id
 * Get specific user
 */
router.get('/users/:id', validateId, handleValidationErrors, getUserById);

/**
 * PUT /api/admin/users/:id
 * Update user
 */
router.put('/users/:id', validateId, handleValidationErrors, updateUser);

/**
 * DELETE /api/admin/users/:id
 * Delete user
 */
router.delete('/users/:id', validateId, handleValidationErrors, deleteUser);

/**
 * POST /api/admin/users/:id/reset-password
 * Reset user password (super_admin only)
 */
router.post(
  '/users/:id/reset-password',
  authMiddleware,
  roleMiddleware(['super_admin']),
  validateId,
  handleValidationErrors,
  resetUserPassword
);

// ===== Settings Routes =====

/**
 * GET /api/admin/settings
 * Get all system settings
 */
router.get('/settings', getSettings);

/**
 * GET /api/admin/settings/:key
 * Get specific setting
 */
router.get('/settings/:key', getSetting);

/**
 * PUT /api/admin/settings/:key
 * Update setting (super_admin only)
 */
router.put(
  '/settings/:key',
  authMiddleware,
  roleMiddleware(['super_admin']),
  updateSetting
);

// ===== System Monitoring Routes =====

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', getSystemStats);

/**
 * GET /api/admin/health
 * Get system health
 */
router.get('/health', getSystemHealth);

/**
 * GET /api/admin/audit-logs
 * Get audit logs
 */
router.get('/audit-logs', validatePagination, handleValidationErrors, getAuditLogs);

/**
 * GET /api/admin/activity-logs
 * Get activity logs
 */
router.get('/activity-logs', validatePagination, handleValidationErrors, getActivityLogs);

export default router;
