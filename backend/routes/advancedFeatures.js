/**
 * PELBIOT Advanced Features API Routes
 * 
 * Routes untuk:
 * - Performance Tuning
 * - Database Optimization
 * - Caching Strategy
 * - Load Balancing
 * - Monitoring & Alerting
 */

import express from 'express';

export function setupAdvancedFeaturesRoutes(
  app,
  performanceSystem,
  dbOptimization,
  cachingSystem,
  clusterManager,
  monitoringSystem
) {
  const router = express.Router();

  // ============================================
  // PERFORMANCE TUNING ROUTES
  // ============================================

  /**
   * Get performance metrics
   */
  router.get('/performance/metrics', (req, res) => {
    try {
      const summary = performanceSystem.metricsCollector.getSummary();
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Analyze performance bottlenecks
   */
  router.get('/performance/analysis', (req, res) => {
    try {
      const recommendations = performanceSystem.bottleneckAnalyzer.getRecommendations();
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get performance tuning strategies
   */
  router.get('/performance/tuning-strategies', (req, res) => {
    try {
      const strategies = performanceSystem.autoTuningEngine.getTuningStrategies();
      res.json({
        success: true,
        data: strategies
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get performance trend
   */
  router.get('/performance/trend', (req, res) => {
    try {
      const minutes = parseInt(req.query.minutes) || 60;
      const trend = performanceSystem.reportService.getPerformanceTrend(minutes);
      res.json({
        success: true,
        data: trend
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Export performance report
   */
  router.post('/performance/export-report', (req, res) => {
    try {
      const result = performanceSystem.reportService.exportToFile(
        req.body.filePath || './reports/performance-report.json'
      );
      res.json({
        success: result.success,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // DATABASE OPTIMIZATION ROUTES
  // ============================================

  /**
   * Get slow queries analysis
   */
  router.get('/database/slow-queries', (req, res) => {
    try {
      const analysis = dbOptimization.analyzer.analyzeSlowQueries();
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get query statistics
   */
  router.get('/database/query-stats', (req, res) => {
    try {
      const stats = dbOptimization.analyzer.getQueryStatistics();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get database health
   */
  router.get('/database/health', async (req, res) => {
    try {
      const health = await dbOptimization.healthMonitor.checkHealth();
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get current indexes
   */
  router.get('/database/indexes', async (req, res) => {
    try {
      const indexes = await dbOptimization.indexManager.getCurrentIndexes();
      res.json({
        success: true,
        data: indexes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Analyze table statistics
   */
  router.get('/database/table-stats', async (req, res) => {
    try {
      const stats = await dbOptimization.indexManager.analyzeTableStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get pool statistics
   */
  router.get('/database/pool-stats', async (req, res) => {
    try {
      const stats = await dbOptimization.poolManager.getPoolStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Run full optimization
   */
  router.post('/database/optimize', async (req, res) => {
    try {
      const report = await dbOptimization.runFullOptimization();
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // CACHING ROUTES
  // ============================================

  /**
   * Get cache statistics
   */
  router.get('/cache/stats', (req, res) => {
    try {
      const stats = cachingSystem.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Clear all caches
   */
  router.post('/cache/clear', async (req, res) => {
    try {
      await cachingSystem.clear();
      res.json({
        success: true,
        message: 'All caches cleared'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Warm up cache
   */
  router.post('/cache/warmup', async (req, res) => {
    try {
      // Example: warm up common data
      // This should be customized based on your application
      res.json({
        success: true,
        message: 'Cache warmup initiated'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Invalidate cache pattern
   */
  router.post('/cache/invalidate', async (req, res) => {
    try {
      const { pattern } = req.body;
      const result = await cachingSystem.invalidatePattern(pattern);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // LOAD BALANCING ROUTES
  // ============================================

  /**
   * Get cluster status
   */
  router.get('/cluster/status', (req, res) => {
    try {
      const status = clusterManager.getStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get session statistics
   */
  router.get('/cluster/sessions', (req, res) => {
    try {
      // Assuming sessionManager is available
      res.json({
        success: true,
        data: {
          message: 'Session statistics'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Health check endpoint
   */
  router.get('/cluster/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      workerId: require('cluster').worker?.id || 'master'
    });
  });

  // ============================================
  // MONITORING & ALERTING ROUTES
  // ============================================

  /**
   * Get dashboard data
   */
  router.get('/monitoring/dashboard', (req, res) => {
    try {
      const dashboard = monitoringSystem.dashboardService.getDashboardData();
      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get active alerts
   */
  router.get('/monitoring/alerts/active', (req, res) => {
    try {
      const alerts = monitoringSystem.alertsEngine.getActiveAlerts();
      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get alert history
   */
  router.get('/monitoring/alerts/history', (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const history = monitoringSystem.alertsEngine.getAlertHistory(limit);
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Acknowledge alert
   */
  router.post('/monitoring/alerts/:alertId/acknowledge', (req, res) => {
    try {
      const success = monitoringSystem.alertsEngine.acknowledgeAlert(req.params.alertId);
      res.json({
        success,
        message: success ? 'Alert acknowledged' : 'Alert not found'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get alert rules
   */
  router.get('/monitoring/rules', (req, res) => {
    try {
      const rules = monitoringSystem.alertsEngine.getRules();
      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Toggle alert rule
   */
  router.post('/monitoring/rules/:ruleId/toggle', (req, res) => {
    try {
      const success = monitoringSystem.alertsEngine.toggleRule(req.params.ruleId);
      res.json({
        success,
        message: success ? 'Rule toggled' : 'Rule not found'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get open incidents
   */
  router.get('/monitoring/incidents/open', (req, res) => {
    try {
      const incidents = monitoringSystem.incidentTracker.getOpenIncidents();
      res.json({
        success: true,
        data: incidents
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Create incident
   */
  router.post('/monitoring/incidents', (req, res) => {
    try {
      const { title, description, severity } = req.body;
      const incident = monitoringSystem.incidentTracker.createIncident(
        title,
        description,
        severity
      );
      res.status(201).json({
        success: true,
        data: incident
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Resolve incident
   */
  router.post('/monitoring/incidents/:incidentId/resolve', (req, res) => {
    try {
      const success = monitoringSystem.incidentTracker.resolveIncident(
        req.params.incidentId,
        req.body.resolution
      );
      res.json({
        success,
        message: success ? 'Incident resolved' : 'Incident not found'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Get metrics summary
   */
  router.get('/monitoring/metrics/summary', (req, res) => {
    try {
      const summary = monitoringSystem.metricsCollector.getSummary();
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * Export monitoring report
   */
  router.post('/monitoring/export-report', (req, res) => {
    try {
      const result = monitoringSystem.dashboardService.exportMonitoringReport(
        req.body.filePath
      );
      res.json({
        success: result.success,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // COMBINED SYSTEM STATUS
  // ============================================

  /**
   * Get complete system status
   */
  router.get('/system/status/complete', async (req, res) => {
    try {
      const status = {
        timestamp: new Date().toISOString(),
        performance: performanceSystem.metricsCollector.getSummary(),
        database: await dbOptimization.getOptimizationReport(),
        cache: cachingSystem.getStats(),
        cluster: clusterManager.master ? clusterManager.getStatus() : { message: 'Worker process' },
        monitoring: monitoringSystem.dashboardService.getDashboardData()
      };

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

export default setupAdvancedFeaturesRoutes;
