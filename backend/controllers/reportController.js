import { query } from '../utils/database.js';
import reportService from '../utils/reportService.js';

/**
 * Generate and send device summary report
 */
export const generateDeviceSummaryReport = async (req, res) => {
  try {
    const { deviceId, startDate, endDate, sendEmail, recipientEmail } = req.body;

    // Validate input
    if (!deviceId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: deviceId, startDate, endDate' });
    }

    // Generate report
    const reportFile = await reportService.generateDeviceSummaryReport(deviceId, startDate, endDate);

    // Save to database
    await query(
      'INSERT INTO reports (name, report_type, start_date, end_date, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [
        `Device Summary Report - Device ${deviceId}`,
        'device_summary',
        startDate,
        endDate,
        req.user?.id || 'system'
      ]
    );

    // Send email if requested
    let emailResult = null;
    if (sendEmail && recipientEmail) {
      emailResult = await reportService.sendReportByEmail(
        recipientEmail,
        deviceId,
        'device_summary',
        startDate,
        endDate
      );
    }

    res.json({
      success: true,
      message: 'Device summary report generated successfully',
      reportFile: reportFile.filename,
      emailSent: emailResult ? emailResult.success : false,
      reportPath: '/api/reports/download/' + reportFile.filename
    });
  } catch (error) {
    console.error('Error generating device summary report:', error.message);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
};

/**
 * Generate and send trend analysis report
 */
export const generateTrendReport = async (req, res) => {
  try {
    const { deviceId, startDate, endDate, metric = 'power', sendEmail, recipientEmail } = req.body;

    // Validate input
    if (!deviceId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: deviceId, startDate, endDate' });
    }

    // Generate report
    const reportFile = await reportService.generateTrendAnalysisReport(deviceId, startDate, endDate, metric);

    // Save to database
    await query(
      'INSERT INTO reports (name, report_type, start_date, end_date, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [
        `Trend Analysis Report - Device ${deviceId} (${metric})`,
        'trend_analysis',
        startDate,
        endDate,
        req.user?.id || 'system'
      ]
    );

    // Send email if requested
    let emailResult = null;
    if (sendEmail && recipientEmail) {
      emailResult = await reportService.sendReportByEmail(
        recipientEmail,
        deviceId,
        'trend_analysis',
        startDate,
        endDate
      );
    }

    res.json({
      success: true,
      message: 'Trend analysis report generated successfully',
      reportFile: reportFile.filename,
      emailSent: emailResult ? emailResult.success : false,
      metric,
      reportPath: '/api/reports/download/' + reportFile.filename
    });
  } catch (error) {
    console.error('Error generating trend report:', error.message);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
};

/**
 * Generate and send alert history report
 */
export const generateAlertHistoryReport = async (req, res) => {
  try {
    const { deviceId, startDate, endDate, sendEmail, recipientEmail } = req.body;

    // Validate input
    if (!deviceId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: deviceId, startDate, endDate' });
    }

    // Generate report
    const reportFile = await reportService.generateAlertHistoryReport(deviceId, startDate, endDate);

    // Save to database
    await query(
      'INSERT INTO reports (name, report_type, start_date, end_date, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [
        `Alert History Report - Device ${deviceId}`,
        'alert_history',
        startDate,
        endDate,
        req.user?.id || 'system'
      ]
    );

    // Send email if requested
    let emailResult = null;
    if (sendEmail && recipientEmail) {
      emailResult = await reportService.sendReportByEmail(
        recipientEmail,
        deviceId,
        'alert_history',
        startDate,
        endDate
      );
    }

    res.json({
      success: true,
      message: 'Alert history report generated successfully',
      reportFile: reportFile.filename,
      emailSent: emailResult ? emailResult.success : false,
      reportPath: '/api/reports/download/' + reportFile.filename
    });
  } catch (error) {
    console.error('Error generating alert history report:', error.message);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
};

/**
 * Generate and send energy report
 */
export const generateEnergyReport = async (req, res) => {
  try {
    const { deviceId, startDate, endDate, sendEmail, recipientEmail } = req.body;

    // Validate input
    if (!deviceId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: deviceId, startDate, endDate' });
    }

    // Generate report
    const reportFile = await reportService.generateEnergyReport(deviceId, startDate, endDate);

    // Save to database
    await query(
      'INSERT INTO reports (name, report_type, start_date, end_date, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [
        `Energy Consumption Report - Device ${deviceId}`,
        'energy',
        startDate,
        endDate,
        req.user?.id || 'system'
      ]
    );

    // Send email if requested
    let emailResult = null;
    if (sendEmail && recipientEmail) {
      emailResult = await reportService.sendReportByEmail(
        recipientEmail,
        deviceId,
        'energy',
        startDate,
        endDate
      );
    }

    res.json({
      success: true,
      message: 'Energy report generated successfully',
      reportFile: reportFile.filename,
      emailSent: emailResult ? emailResult.success : false,
      reportPath: '/api/reports/download/' + reportFile.filename
    });
  } catch (error) {
    console.error('Error generating energy report:', error.message);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
};

/**
 * Generate CSV export
 */
export const generateCSVExport = async (req, res) => {
  try {
    const { deviceId, startDate, endDate, reportType = 'summary' } = req.body;

    // Validate input
    if (!deviceId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: deviceId, startDate, endDate' });
    }

    // Generate CSV
    const reportFile = await reportService.generateCSVReport(deviceId, startDate, endDate, reportType);

    // Save to database
    await query(
      'INSERT INTO reports (name, report_type, start_date, end_date, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [
        `CSV Export - Device ${deviceId} (${reportType})`,
        `csv_${reportType}`,
        startDate,
        endDate,
        req.user?.id || 'system'
      ]
    );

    res.json({
      success: true,
      message: 'CSV export generated successfully',
      reportFile: reportFile.filename,
      reportPath: '/api/reports/download/' + reportFile.filename
    });
  } catch (error) {
    console.error('Error generating CSV export:', error.message);
    res.status(500).json({ error: 'Failed to generate CSV export', details: error.message });
  }
};

/**
 * Get all reports
 */
export const getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const reports = await query(
      'SELECT id, name, report_type, start_date, end_date, created_by, created_at FROM reports ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM reports');
    const total = countResult[0].total;

    res.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting reports:', error.message);
    res.status(500).json({ error: 'Failed to get reports', details: error.message });
  }
};

/**
 * Get user's reports
 */
export const getUserReports = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const reports = await query(
      'SELECT id, name, report_type, start_date, end_date, created_by, created_at FROM reports WHERE created_by = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM reports WHERE created_by = ?', [userId]);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting user reports:', error.message);
    res.status(500).json({ error: 'Failed to get user reports', details: error.message });
  }
};

/**
 * Get generated reports list
 */
export const getGeneratedReportsList = async (req, res) => {
  try {
    const reports = reportService.getGeneratedReports();

    res.json({
      success: true,
      reports: reports.map((r) => ({
        filename: r.filename,
        size: (r.size / 1024).toFixed(2) + ' KB',
        created: new Date(r.created),
        modified: new Date(r.modified)
      }))
    });
  } catch (error) {
    console.error('Error getting generated reports list:', error.message);
    res.status(500).json({ error: 'Failed to get reports list', details: error.message });
  }
};

/**
 * Schedule report generation
 */
export const scheduleReport = async (req, res) => {
  try {
    const { deviceId, reportType, frequency, recipientEmail } = req.body;

    if (!deviceId || !reportType || !frequency || !recipientEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // TODO: Implement actual scheduling with job queue

    res.json({
      success: true,
      message: 'Report schedule created',
      schedule: {
        deviceId,
        reportType,
        frequency,
        recipientEmail,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    console.error('Error scheduling report:', error.message);
    res.status(500).json({ error: 'Failed to schedule report', details: error.message });
  }
};

/**
 * Cleanup old reports
 */
export const cleanupOldReports = async (req, res) => {
  try {
    const daysOld = parseInt(req.body.daysOld) || 30;
    const result = reportService.deleteOldReports(daysOld);

    res.json({
      success: true,
      message: `Cleanup completed - deleted ${result.deleted} old reports`,
      deleted: result.deleted,
      daysOld
    });
  } catch (error) {
    console.error('Error cleaning up reports:', error.message);
    res.status(500).json({ error: 'Failed to cleanup reports', details: error.message });
  }
};

// Legacy exports for backward compatibility
export const generateReport = getAllReports;
export const exportReport = generateCSVExport;
export const getReports = getAllReports;

const reportController = {
  generateDeviceSummaryReport,
  generateTrendReport,
  generateAlertHistoryReport,
  generateEnergyReport,
  generateCSVExport,
  getAllReports,
  getUserReports,
  getGeneratedReportsList,
  scheduleReport,
  cleanupOldReports,
  // Legacy
  generateReport,
  exportReport,
  getReports
};

export default reportController;
