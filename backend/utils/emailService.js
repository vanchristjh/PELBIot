/**
 * Email Service Utility
 * Handles all email sending operations for PELBIOT
 * Supports alert notifications, reports, and user communications
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Email Transporter
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'your-app-password',
  },
});

/**
 * Verify SMTP connection on startup
 */
export const verifyEmailService = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service verified and ready to send');
    return true;
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message);
    return false;
  }
};

/**
 * Send Alert Notification Email
 */
export const sendAlertNotification = async (recipientEmail, alertData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject: `🚨 PELBIOT Alert: ${alertData.alertName}`,
      html: generateAlertEmailTemplate(alertData),
      replyTo: process.env.SMTP_REPLY_TO || undefined,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Alert email sent to ${recipientEmail}: ${result.messageId}`);
    return {
      success: true,
      messageId: result.messageId,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`❌ Failed to send alert email: ${error.message}`);
    throw error;
  }
};

/**
 * Send Report Email
 */
export const sendReportEmail = async (recipientEmail, reportData, attachmentPath) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject: `📊 PELBIOT Report: ${reportData.reportName}`,
      html: generateReportEmailTemplate(reportData),
      attachments: attachmentPath ? [
        {
          filename: `${reportData.reportName}.pdf`,
          path: attachmentPath,
          contentType: 'application/pdf',
        },
      ] : [],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Report email sent to ${recipientEmail}: ${result.messageId}`);
    return {
      success: true,
      messageId: result.messageId,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`❌ Failed to send report email: ${error.message}`);
    throw error;
  }
};

/**
 * Send Welcome Email to New User
 */
export const sendWelcomeEmail = async (recipientEmail, userData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject: '👋 Welcome to PELBIOT',
      html: generateWelcomeEmailTemplate(userData),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${recipientEmail}: ${result.messageId}`);
    return {
      success: true,
      messageId: result.messageId,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`❌ Failed to send welcome email: ${error.message}`);
    throw error;
  }
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (recipientEmail, resetLink, username) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject: '🔒 Reset Your PELBIOT Password',
      html: generatePasswordResetEmailTemplate(resetLink, username),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${recipientEmail}: ${result.messageId}`);
    return {
      success: true,
      messageId: result.messageId,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`❌ Failed to send password reset email: ${error.message}`);
    throw error;
  }
};

/**
 * Send Daily Summary Email
 */
export const sendDailySummaryEmail = async (recipientEmail, summaryData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject: '📈 PELBIOT Daily Summary',
      html: generateDailySummaryEmailTemplate(summaryData),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Daily summary email sent to ${recipientEmail}: ${result.messageId}`);
    return {
      success: true,
      messageId: result.messageId,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`❌ Failed to send daily summary email: ${error.message}`);
    throw error;
  }
};

/**
 * Send Batch Emails to Multiple Recipients
 */
export const sendBatchEmails = async (recipients, subject, htmlTemplate) => {
  try {
    const results = [];
    for (const recipient of recipients) {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: recipient,
        subject: subject,
        html: htmlTemplate,
      };

      try {
        const result = await transporter.sendMail(mailOptions);
        results.push({
          recipient,
          success: true,
          messageId: result.messageId,
        });
      } catch (error) {
        results.push({
          recipient,
          success: false,
          error: error.message,
        });
      }
    }

    console.log(`✅ Batch email sent to ${recipients.length} recipients`);
    return results;
  } catch (error) {
    console.error(`❌ Failed to send batch emails: ${error.message}`);
    throw error;
  }
};

/**
 * Email Template: Alert Notification
 */
const generateAlertEmailTemplate = (alertData) => {
  const { alertName, severity, description, timestamp, device, value, threshold } = alertData;

  const severityColor = {
    critical: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
  }[severity] || '#6c757d';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${severityColor}; color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { margin: 20px 0; padding: 20px; background-color: #f5f5f5; border-left: 4px solid ${severityColor}; }
        .details { display: grid; gap: 10px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .detail-label { font-weight: bold; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        .button { background-color: ${severityColor}; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 ${severity.toUpperCase()} Alert</h1>
          <p>${alertName}</p>
        </div>

        <div class="content">
          <h2>Alert Details</h2>
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Alert Name:</span>
              <span>${alertName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Severity:</span>
              <span>${severity.toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Device:</span>
              <span>${device || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Current Value:</span>
              <span>${value || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Threshold:</span>
              <span>${threshold || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Timestamp:</span>
              <span>${new Date(timestamp).toLocaleString()}</span>
            </div>
          </div>

          <p style="margin-top: 20px;"><strong>Description:</strong></p>
          <p>${description}</p>

          <a href="${process.env.FRONTEND_URL || 'http://localhost'}/alerts" class="button">View in Dashboard</a>
        </div>

        <div class="footer">
          <p>This is an automated alert from PELBIOT System</p>
          <p>© ${new Date().getFullYear()} PELBIOT. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email Template: Report
 */
const generateReportEmailTemplate = (reportData) => {
  const { reportName, generatedDate, period, summary } = reportData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { margin: 20px 0; padding: 20px; background-color: #f5f5f5; }
        .summary { display: grid; gap: 10px; margin: 20px 0; }
        .summary-item { padding: 10px; background-color: white; border-left: 4px solid #007bff; }
        .button { background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 10px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Report Generated</h1>
          <p>${reportName}</p>
        </div>

        <div class="content">
          <h2>Report Summary</h2>
          <div class="summary">
            <div class="summary-item">
              <strong>Report Name:</strong> ${reportName}
            </div>
            <div class="summary-item">
              <strong>Period:</strong> ${period}
            </div>
            <div class="summary-item">
              <strong>Generated:</strong> ${new Date(generatedDate).toLocaleString()}
            </div>
          </div>

          ${summary ? `
            <h3>Summary</h3>
            <p>${summary}</p>
          ` : ''}

          <p style="margin-top: 20px;">The full report is attached to this email as a PDF file.</p>

          <a href="${process.env.FRONTEND_URL || 'http://localhost'}/reports" class="button">View Reports</a>
        </div>

        <div class="footer">
          <p>This is an automated report from PELBIOT System</p>
          <p>© ${new Date().getFullYear()} PELBIOT. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email Template: Welcome Email
 */
const generateWelcomeEmailTemplate = (userData) => {
  const { username, email, role } = userData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 5px; text-align: center; }
        .content { margin: 20px 0; padding: 20px; background-color: #f5f5f5; }
        .button { background-color: #667eea; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 15px; }
        .features { display: grid; gap: 15px; margin: 20px 0; }
        .feature { padding: 15px; background-color: white; border-left: 4px solid #667eea; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👋 Welcome to PELBIOT!</h1>
          <p>Hi ${username}, thanks for joining us</p>
        </div>

        <div class="content">
          <h2>You're all set!</h2>
          <p>Your account has been created successfully with the following details:</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Role:</strong> ${role}</p>
          </div>

          <h3>What can you do?</h3>
          <div class="features">
            <div class="feature">
              <strong>🔍 Monitor Real-time Data</strong><br/>
              View live electrical measurements and system status
            </div>
            <div class="feature">
              <strong>📊 Generate Reports</strong><br/>
              Create custom reports and export them as PDF
            </div>
            <div class="feature">
              <strong>🚨 Manage Alerts</strong><br/>
              Set up alert rules and receive notifications
            </div>
            <div class="feature">
              <strong>⚙️ Administer Users</strong><br/>
              Manage system users and permissions (admin only)
            </div>
          </div>

          <a href="${process.env.FRONTEND_URL || 'http://localhost'}/dashboard" class="button">Go to Dashboard</a>
        </div>

        <div class="footer">
          <p>If you have any questions, please contact support.</p>
          <p>© ${new Date().getFullYear()} PELBIOT. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email Template: Password Reset
 */
const generatePasswordResetEmailTemplate = (resetLink, username) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { margin: 20px 0; padding: 20px; background-color: #f5f5f5; }
        .button { background-color: #dc3545; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 15px; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>

        <div class="content">
          <p>Hi ${username},</p>
          <p>We received a request to reset your PELBIOT password. Click the button below to reset it:</p>

          <a href="${resetLink}" class="button">Reset Password</a>

          <p style="margin-top: 20px; color: #666;">Or copy and paste this link in your browser:</p>
          <p style="background-color: white; padding: 10px; word-break: break-all; border-radius: 5px;">
            ${resetLink}
          </p>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <p>This link will expire in 1 hour. If you didn't request this, please ignore this email or contact support.</p>
            <p>Never share this link with anyone.</p>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} PELBIOT. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email Template: Daily Summary
 */
const generateDailySummaryEmailTemplate = (summaryData) => {
  const { date, totalAlerts, activeAlerts, totalDevices, onlineDevices, averagePower } = summaryData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { margin: 20px 0; padding: 20px; background-color: #f5f5f5; }
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat { background-color: white; padding: 15px; border-radius: 5px; text-align: center; border-top: 4px solid #28a745; }
        .stat-value { font-size: 24px; font-weight: bold; color: #28a745; }
        .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
        .button { background-color: #28a745; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 15px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📈 Daily Summary Report</h1>
          <p>${new Date(date).toLocaleDateString()}</p>
        </div>

        <div class="content">
          <h2>System Status</h2>
          <div class="stats">
            <div class="stat">
              <div class="stat-value">${totalAlerts}</div>
              <div class="stat-label">Total Alerts</div>
            </div>
            <div class="stat">
              <div class="stat-value">${activeAlerts}</div>
              <div class="stat-label">Active Alerts</div>
            </div>
            <div class="stat">
              <div class="stat-value">${totalDevices}</div>
              <div class="stat-label">Total Devices</div>
            </div>
            <div class="stat">
              <div class="stat-value">${onlineDevices}</div>
              <div class="stat-label">Online Devices</div>
            </div>
          </div>

          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Average Power Consumption:</strong> ${averagePower} kW</p>
          </div>

          <a href="${process.env.FRONTEND_URL || 'http://localhost'}/dashboard" class="button">View Dashboard</a>
        </div>

        <div class="footer">
          <p>This is an automated daily summary from PELBIOT System</p>
          <p>© ${new Date().getFullYear()} PELBIOT. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const emailService = {
  verifyEmailService,
  sendAlertNotification,
  sendReportEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendDailySummaryEmail,
  sendBatchEmails,
};

export default emailService;
