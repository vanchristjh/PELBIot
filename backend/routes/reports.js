import express from 'express';
import reportController from '../controllers/reportController.js';
import { authMiddleware } from '../utils/authUtils.js';
import {
  ReportGenerator,
  AnalyticsEngine,
  ReportScheduler
} from '../utils/reportingModule.js';

const router = express.Router();
const reportGenerator = new ReportGenerator();
const analyticsEngine = new AnalyticsEngine();
const reportScheduler = new ReportScheduler();

// Report generation endpoints
router.post('/device-summary', authMiddleware, reportController.generateDeviceSummaryReport);
router.post('/trend-analysis', authMiddleware, reportController.generateTrendReport);
router.post('/alert-history', authMiddleware, reportController.generateAlertHistoryReport);
router.post('/energy', authMiddleware, reportController.generateEnergyReport);
router.post('/csv-export', authMiddleware, reportController.generateCSVExport);

// Report management endpoints
router.get('/all', authMiddleware, reportController.getAllReports);
router.get('/my-reports', authMiddleware, reportController.getUserReports);
router.get('/files', authMiddleware, reportController.getGeneratedReportsList);

// Report scheduling
router.post('/schedule', authMiddleware, reportController.scheduleReport);

// Cleanup endpoint
router.post('/cleanup', authMiddleware, reportController.cleanupOldReports);

// Legacy endpoints for backward compatibility
router.post('/generate', reportController.generateReport);
router.post('/export', reportController.exportReport);
router.get('/', reportController.getReports);

// ============================================================
// ADVANCED REPORTING MODULE - Analytics & Export Features
// ============================================================

/**
 * POST /api/reports/advanced/generate
 * Generate report in multiple formats: pdf, excel, json, csv
 */
router.post('/advanced/generate', authMiddleware, async (req, res) => {
  try {
    const { format = 'pdf', data, fileName } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Report data is required' });
    }

    let result;
    switch (format.toLowerCase()) {
      case 'pdf':
        result = await reportGenerator.generatePDFReport(data, fileName || 'report.pdf');
        break;
      case 'excel':
      case 'xlsx':
        result = await reportGenerator.generateExcelReport(data, fileName || 'report.xlsx');
        break;
      case 'json':
        result = reportGenerator.generateJSONReport(data, fileName || 'report.json');
        break;
      case 'csv':
        result = reportGenerator.generateCSVReport(data, fileName || 'report.csv');
        break;
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reports/advanced/analytics/statistics
 * Calculate statistics for data
 */
router.post('/advanced/analytics/statistics', authMiddleware, (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Data must be an array' });
    }
    const stats = analyticsEngine.calculateStatistics(data);
    res.json({ status: 'success', statistics: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reports/advanced/analytics/group
 * Group data by category
 */
router.post('/advanced/analytics/group', authMiddleware, (req, res) => {
  try {
    const { data, categoryKey } = req.body;
    if (!Array.isArray(data) || !categoryKey) {
      return res.status(400).json({ error: 'Data and categoryKey required' });
    }
    const grouped = analyticsEngine.groupByCategory(data, categoryKey);
    res.json({ status: 'success', grouped });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reports/advanced/analytics/trends
 * Generate trend analysis
 */
router.post('/advanced/analytics/trends', authMiddleware, (req, res) => {
  try {
    const { data, dateKey, valueKey, period = 'daily' } = req.body;
    if (!Array.isArray(data) || !dateKey || !valueKey) {
      return res.status(400).json({ error: 'Data, dateKey, valueKey required' });
    }
    const trends = analyticsEngine.generateTrendData(data, dateKey, valueKey, period);
    res.json({ status: 'success', trends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reports/advanced/schedule
 * Schedule recurring report
 */
router.post('/advanced/schedule', authMiddleware, (req, res) => {
  try {
    const { reportConfig, frequency = 'daily' } = req.body;
    if (!reportConfig) {
      return res.status(400).json({ error: 'Report configuration required' });
    }
    const scheduled = reportScheduler.scheduleReport(reportConfig, frequency);
    res.json({ status: 'success', schedule: scheduled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reports/advanced/scheduled
 * Get all scheduled reports
 */
router.get('/advanced/scheduled', authMiddleware, (req, res) => {
  try {
    const scheduled = reportScheduler.getScheduledReports();
    res.json({ status: 'success', reports: scheduled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/reports/advanced/scheduled/:reportId
 * Remove scheduled report
 */
router.delete('/advanced/scheduled/:reportId', authMiddleware, (req, res) => {
  try {
    const { reportId } = req.params;
    const result = reportScheduler.removeScheduledReport(reportId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
