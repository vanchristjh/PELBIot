/**
 * Notifications Controller
 * Handles all notification-related operations
 * Email alerts, report delivery, user notifications
 */

import { query } from '../utils/database.js';
import {
  sendAlertNotification,
  sendReportEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendDailySummaryEmail,
} from '../utils/emailService.js';

/**
 * Create and Send Alert Notification
 */
export const createAlertNotification = async (req, res) => {
  try {
    const { alertId, userId, alertName, severity, description, device, value, threshold } = req.body;

    // Get user email
    const users = await query('SELECT email FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userEmail = users[0].email;

    // Send email
    const emailResult = await sendAlertNotification(userEmail, {
      alertName,
      severity,
      description,
      device,
      value,
      threshold,
      timestamp: new Date(),
    });

    // Log notification
    await query(
      'INSERT INTO notifications (user_id, alert_id, notification_type, status, sent_at) VALUES (?, ?, ?, ?, ?)',
      [userId, alertId, 'email', 'sent', new Date()]
    );

    res.json({
      success: true,
      message: 'Alert notification sent successfully',
      messageId: emailResult.messageId,
    });
  } catch (error) {
    console.error('Error sending alert notification:', error);
    res.status(500).json({ error: 'Failed to send alert notification' });
  }
};

/**
 * Send Report Email
 */
export const sendReport = async (req, res) => {
  try {
    const { reportId, userId, reportName, reportPath, period, summary } = req.body;

    // Get user email
    const users = await query('SELECT email FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userEmail = users[0].email;

    // Send email with attachment
    const emailResult = await sendReportEmail(
      userEmail,
      {
        reportName,
        period,
        generatedDate: new Date(),
        summary,
      },
      reportPath
    );

    // Log notification
    await query(
      'INSERT INTO notifications (user_id, report_id, notification_type, status, sent_at) VALUES (?, ?, ?, ?, ?)',
      [userId, reportId, 'report', 'sent', new Date()]
    );

    res.json({
      success: true,
      message: 'Report sent successfully',
      messageId: emailResult.messageId,
    });
  } catch (error) {
    console.error('Error sending report:', error);
    res.status(500).json({ error: 'Failed to send report' });
  }
};

/**
 * Send Welcome Email to New User
 */
export const sendWelcome = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    await sendWelcomeEmail(email, {
      username,
      email,
      role,
    });

    res.json({
      success: true,
      message: 'Welcome email sent successfully',
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
};

/**
 * Send Password Reset Email
 */
export const sendPasswordReset = async (req, res) => {
  try {
    const { email, username, resetToken } = req.body;

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost'}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(email, resetLink, username);

    res.json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
};

/**
 * Get All Notifications for User
 */
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type = null } = req.query;

    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (type) {
      sql += ' AND notification_type = ?';
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const notifications = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?';
    const countParams = [userId];

    if (type) {
      countSql += ' AND notification_type = ?';
      countParams.push(type);
    }

    const countResult = await query(countSql, countParams);
    const total = countResult[0]?.total || 0;

    res.json({
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Mark Notification as Read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await query('UPDATE notifications SET is_read = 1, read_at = ? WHERE id = ?', [new Date(), notificationId]);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

/**
 * Send Daily Summary Email to Multiple Users
 */
export const sendDailySummaries = async (req, res) => {
  try {
    // Get all users with notification enabled
    const users = await query('SELECT id, email, username FROM users WHERE notification_enabled = 1');

    if (users.length === 0) {
      return res.json({ success: true, message: 'No users to send summaries to' });
    }

    // Get system statistics
    const [alertStats, deviceStats, powerStats] = await Promise.all([
      query('SELECT COUNT(*) as total FROM alerts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)'),
      query('SELECT COUNT(*) as total, SUM(status = "online") as online FROM devices'),
      query('SELECT AVG(power) as avg_power FROM panels WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)'),
    ]);

    const summaryData = {
      date: new Date(),
      totalAlerts: alertStats[0]?.total || 0,
      activeAlerts: await query('SELECT COUNT(*) as total FROM alerts WHERE status = "open"').then(r => r[0]?.total || 0),
      totalDevices: deviceStats[0]?.total || 0,
      onlineDevices: deviceStats[0]?.online || 0,
      averagePower: (powerStats[0]?.avg_power || 0).toFixed(2),
    };

    // Send to each user
    const results = [];
    for (const user of users) {
      try {
        await sendDailySummaryEmail(user.email, summaryData);
        results.push({ userId: user.id, success: true });
      } catch (error) {
        console.error(`Failed to send summary to ${user.email}:`, error);
        results.push({ userId: user.id, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Daily summaries sent to ${users.length} users`,
      results,
      summaryData,
    });
  } catch (error) {
    console.error('Error sending daily summaries:', error);
    res.status(500).json({ error: 'Failed to send daily summaries' });
  }
};

/**
 * Get Notification Preferences
 */
export const getNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    const prefs = await query('SELECT * FROM notification_preferences WHERE user_id = ?', [userId]);

    if (!prefs || prefs.length === 0) {
      // Return default preferences
      return res.json({
        userId,
        alertEmails: true,
        reportEmails: true,
        dailySummary: true,
        criticalOnly: false,
      });
    }

    res.json(prefs[0]);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
};

/**
 * Update Notification Preferences
 */
export const updateNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { alertEmails, reportEmails, dailySummary, criticalOnly } = req.body;

    await query(
      `INSERT INTO notification_preferences (user_id, alert_emails, report_emails, daily_summary, critical_only, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE alert_emails = ?, report_emails = ?, daily_summary = ?, critical_only = ?, updated_at = ?`,
      [
        userId,
        alertEmails ? 1 : 0,
        reportEmails ? 1 : 0,
        dailySummary ? 1 : 0,
        criticalOnly ? 1 : 0,
        new Date(),
        alertEmails ? 1 : 0,
        reportEmails ? 1 : 0,
        dailySummary ? 1 : 0,
        criticalOnly ? 1 : 0,
        new Date(),
      ]
    );

    res.json({
      success: true,
      message: 'Notification preferences updated',
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

const notificationController = {
  createAlertNotification,
  sendReport,
  sendWelcome,
  sendPasswordReset,
  getNotifications,
  markNotificationRead,
  sendDailySummaries,
  getNotificationPreferences,
  updateNotificationPreferences,
};

export default notificationController;
