/**
 * Notifications Routes
 * Endpoints for managing email notifications and preferences
 */

import express from 'express';
import {
  createAlertNotification,
  sendReport,
  sendWelcome,
  sendPasswordReset,
  getNotifications,
  markNotificationRead,
  sendDailySummaries,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notificationController.js';
import { authMiddleware } from '../utils/authUtils.js';

const router = express.Router();

/**
 * @route   POST /api/notifications/alert
 * @desc    Send alert notification email
 * @access  Private/Admin
 */
router.post('/alert', authMiddleware, createAlertNotification);

/**
 * @route   POST /api/notifications/report
 * @desc    Send report via email
 * @access  Private/Admin
 */
router.post('/report', authMiddleware, sendReport);

/**
 * @route   POST /api/notifications/welcome
 * @desc    Send welcome email to new user
 * @access  Private/Admin
 */
router.post('/welcome', authMiddleware, sendWelcome);

/**
 * @route   POST /api/notifications/password-reset
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/password-reset', sendPasswordReset);

/**
 * @route   POST /api/notifications/daily-summary
 * @desc    Send daily summary to all users
 * @access  Private/Admin
 */
router.post('/daily-summary', authMiddleware, sendDailySummaries);

/**
 * @route   GET /api/notifications/:userId
 * @desc    Get all notifications for a user
 * @access  Private
 */
router.get('/:userId', authMiddleware, getNotifications);

/**
 * @route   PUT /api/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:notificationId/read', authMiddleware, markNotificationRead);

/**
 * @route   GET /api/notifications/preferences/:userId
 * @desc    Get notification preferences
 * @access  Private
 */
router.get('/preferences/:userId', authMiddleware, getNotificationPreferences);

/**
 * @route   PUT /api/notifications/preferences/:userId
 * @desc    Update notification preferences
 * @access  Private
 */
router.put('/preferences/:userId', authMiddleware, updateNotificationPreferences);

export default router;
