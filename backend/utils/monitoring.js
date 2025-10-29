/**
 * PELBIOT Monitoring & Alerting System
 * 
 * Comprehensive monitoring and real-time alerting
 * - Real-time metrics collection
 * - Alert rules engine
 * - Incident tracking
 * - Alert notifications
 * - Dashboard metrics
 * - Health scoring
 */

import EventEmitter from 'events';
import nodemailer from 'nodemailer';

// Metrics Collector
export class MetricsCollector extends EventEmitter {
  constructor(options = {}) {
    super();

    this.metrics = {
      system: [],
      application: [],
      database: [],
      api: [],
      errors: []
    };

    this.collectionInterval = options.collectionInterval || 30000; // 30 seconds
    this.retentionPeriod = options.retentionPeriod || 86400000; // 24 hours
    this.maxMetricsPerType = options.maxMetricsPerType || 2880; // 24 hours at 30s intervals
  }

  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    const os = require('os');

    const metric = {
      timestamp: Date.now(),
      cpu: os.loadavg()[0],
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024,
        percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
      },
      uptime: process.uptime()
    };

    this.metrics.system.push(metric);
    this._maintainHistorySize('system');

    this.emit('system-metric', metric);
    return metric;
  }

  /**
   * Collect application metrics
   */
  collectApplicationMetric(name, value, unit = '') {
    const metric = {
      timestamp: Date.now(),
      name,
      value,
      unit
    };

    this.metrics.application.push(metric);
    this._maintainHistorySize('application');

    this.emit('app-metric', metric);
    return metric;
  }

  /**
   * Collect database metrics
   */
  collectDatabaseMetric(query, executionTime, success = true) {
    const metric = {
      timestamp: Date.now(),
      query: query.substring(0, 100),
      executionTime,
      success
    };

    this.metrics.database.push(metric);
    this._maintainHistorySize('database');

    this.emit('db-metric', metric);
    return metric;
  }

  /**
   * Collect API metrics
   */
  collectAPIMetric(method, path, statusCode, responseTime) {
    const metric = {
      timestamp: Date.now(),
      method,
      path,
      statusCode,
      responseTime
    };

    this.metrics.api.push(metric);
    this._maintainHistorySize('api');

    this.emit('api-metric', metric);
    return metric;
  }

  /**
   * Record error
   */
  recordError(errorType, message, stack = '') {
    const error = {
      timestamp: Date.now(),
      type: errorType,
      message,
      stack: stack.substring(0, 500)
    };

    this.metrics.errors.push(error);
    this._maintainHistorySize('errors');

    this.emit('error-metric', error);
    return error;
  }

  /**
   * Maintain history size
   */
  _maintainHistorySize(type) {
    if (this.metrics[type].length > this.maxMetricsPerType) {
      this.metrics[type] = this.metrics[type].slice(-this.maxMetricsPerType);
    }
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    return {
      system: this.metrics.system.slice(-10),
      application: this.metrics.application.slice(-10),
      database: this.metrics.database.slice(-10),
      api: this.metrics.api.slice(-10),
      errors: this.metrics.errors.slice(-10),
      counts: {
        totalSystemMetrics: this.metrics.system.length,
        totalApplicationMetrics: this.metrics.application.length,
        totalDatabaseMetrics: this.metrics.database.length,
        totalAPIMetrics: this.metrics.api.length,
        totalErrors: this.metrics.errors.length
      }
    };
  }
}

// Alert Rules Engine
export class AlertRulesEngine extends EventEmitter {
  constructor(metricsCollector) {
    super();

    this.metricsCollector = metricsCollector;
    this.rules = [];
    this.alerts = [];
    this.alertHistory = [];
  }

  /**
   * Add alert rule
   */
  addRule(name, condition, severity = 'WARNING', notificationChannels = []) {
    const rule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      condition,
      severity,
      notificationChannels,
      enabled: true,
      lastTriggered: null,
      triggerCount: 0
    };

    this.rules.push(rule);
    console.log(`✅ Alert rule added: ${name}`);
    return rule;
  }

  /**
   * Evaluate all rules
   */
  evaluateRules(metricsData) {
    this.rules.forEach(rule => {
      if (!rule.enabled) return;

      try {
        if (rule.condition(metricsData)) {
          this._triggerAlert(rule, metricsData);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.name}:`, error);
      }
    });
  }

  /**
   * Trigger alert
   */
  _triggerAlert(rule, metricsData) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      timestamp: Date.now(),
      metricsData: metricsData,
      acknowledged: false
    };

    this.alerts.push(alert);
    this.alertHistory.push(alert);

    rule.lastTriggered = Date.now();
    rule.triggerCount++;

    // Emit alert event
    this.emit('alert', alert);

    // Send notifications
    if (rule.notificationChannels.length > 0) {
      this._sendNotifications(alert, rule.notificationChannels);
    }

    console.warn(`🚨 ALERT: ${rule.name} (Severity: ${rule.severity})`);
  }

  /**
   * Send notifications
   */
  async _sendNotifications(alert, channels) {
    for (const channel of channels) {
      try {
        await channel.send(alert);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return this.alerts.filter(a => !a.acknowledged);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Get rules
   */
  getRules() {
    return this.rules;
  }

  /**
   * Enable/Disable rule
   */
  toggleRule(ruleId) {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = !rule.enabled;
      return true;
    }
    return false;
  }
}

// Incident Tracker
export class IncidentTracker {
  constructor() {
    this.incidents = [];
    this.incidentHistory = [];
  }

  /**
   * Create incident
   */
  createIncident(title, description, severity = 'MEDIUM') {
    const incident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      severity,
      status: 'OPEN',
      created: Date.now(),
      updated: Date.now(),
      resolvedAt: null,
      affectedServices: [],
      impacts: [],
      actions: []
    };

    this.incidents.push(incident);
    console.log(`📋 Incident created: ${title} (ID: ${incident.id})`);
    return incident;
  }

  /**
   * Add action to incident
   */
  addAction(incidentId, action, description) {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (incident) {
      incident.actions.push({
        timestamp: Date.now(),
        action,
        description
      });
      incident.updated = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Resolve incident
   */
  resolveIncident(incidentId, resolution) {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (incident) {
      incident.status = 'RESOLVED';
      incident.resolvedAt = Date.now();
      incident.resolution = resolution;
      incident.updated = Date.now();

      // Move to history
      this.incidentHistory.push(incident);
      this.incidents = this.incidents.filter(i => i.id !== incidentId);

      return true;
    }
    return false;
  }

  /**
   * Get open incidents
   */
  getOpenIncidents() {
    return this.incidents.filter(i => i.status === 'OPEN');
  }

  /**
   * Get incident history
   */
  getIncidentHistory(limit = 50) {
    return this.incidentHistory.slice(-limit);
  }

  /**
   * Get incident by ID
   */
  getIncident(incidentId) {
    return this.incidents.find(i => i.id === incidentId) ||
      this.incidentHistory.find(i => i.id === incidentId);
  }
}

// Notification Channels
export class EmailNotificationChannel {
  constructor(config = {}) {
    this.config = {
      from: config.from || 'alerts@pelbiot.com',
      to: config.to || [],
      smtp: config.smtp || {}
    };

    this.transporter = nodemailer.createTransport(this.config.smtp);
  }

  /**
   * Send alert via email
   */
  async send(alert) {
    const mailOptions = {
      from: this.config.from,
      to: this.config.to.join(','),
      subject: `[${alert.severity}] ${alert.ruleName} Alert`,
      html: this._generateEmailHtml(alert)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('📧 Alert email sent');
      return true;
    } catch (error) {
      console.error('Failed to send alert email:', error);
      return false;
    }
  }

  /**
   * Generate email HTML
   */
  _generateEmailHtml(alert) {
    return `
      <h2>Alert: ${alert.ruleName}</h2>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p><strong>Time:</strong> ${new Date(alert.timestamp).toISOString()}</p>
      <p><strong>Details:</strong></p>
      <pre>${JSON.stringify(alert.metricsData, null, 2)}</pre>
    `;
  }
}

// Health Score Calculator
export class HealthScoreCalculator {
  constructor() {
    this.weights = {
      cpu: 0.25,
      memory: 0.25,
      errors: 0.25,
      responseTime: 0.25
    };

    this.thresholds = {
      cpu: { good: 50, warning: 75, critical: 90 },
      memory: { good: 70, warning: 85, critical: 95 },
      errors: { good: 1, warning: 5, critical: 10 },
      responseTime: { good: 500, warning: 1000, critical: 2000 }
    };
  }

  /**
   * Calculate overall health score
   */
  calculateHealthScore(metrics) {
    const scores = {
      cpu: this._scoreMetric('cpu', metrics.cpu),
      memory: this._scoreMetric('memory', metrics.memory),
      errors: this._scoreMetric('errors', metrics.errorRate),
      responseTime: this._scoreMetric('responseTime', metrics.avgResponseTime)
    };

    const totalScore =
      (scores.cpu * this.weights.cpu) +
      (scores.memory * this.weights.memory) +
      (scores.errors * this.weights.errors) +
      (scores.responseTime * this.weights.responseTime);

    return {
      totalScore: Math.round(totalScore),
      componentScores: scores,
      status: this._getHealthStatus(totalScore)
    };
  }

  /**
   * Score individual metric
   */
  _scoreMetric(metricType, value) {
    const threshold = this.thresholds[metricType];

    if (value <= threshold.good) return 100;
    if (value <= threshold.warning) return 75;
    if (value <= threshold.critical) return 50;
    return 0;
  }

  /**
   * Get health status
   */
  _getHealthStatus(score) {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 50) return 'WARNING';
    return 'CRITICAL';
  }
}

// Monitoring Dashboard Service
export class MonitoringDashboardService {
  constructor(metricsCollector, alertsEngine, incidentTracker) {
    this.metricsCollector = metricsCollector;
    this.alertsEngine = alertsEngine;
    this.incidentTracker = incidentTracker;
    this.healthScore = new HealthScoreCalculator();
  }

  /**
   * Get dashboard data
   */
  getDashboardData() {
    const metrics = this.metricsCollector.getSummary();
    const activeAlerts = this.alertsEngine.getActiveAlerts();
    const openIncidents = this.incidentTracker.getOpenIncidents();

    return {
      timestamp: new Date().toISOString(),
      metrics,
      alerts: {
        active: activeAlerts.length,
        details: activeAlerts.slice(0, 10)
      },
      incidents: {
        open: openIncidents.length,
        details: openIncidents
      },
      systemHealth: this._calculateSystemHealth(metrics)
    };
  }

  /**
   * Calculate system health
   */
  _calculateSystemHealth(metrics) {
    const latestSystem = metrics.system[metrics.system.length - 1] || {};
    const errorCount = metrics.counts.totalErrors;

    const healthMetrics = {
      cpu: latestSystem.cpu || 0,
      memory: latestSystem.memory?.percentage || 0,
      errorRate: (errorCount / (metrics.counts.totalAPIMetrics || 1)) * 100,
      avgResponseTime: this._calculateAvgResponseTime(metrics.api)
    };

    return this.healthScore.calculateHealthScore(healthMetrics);
  }

  /**
   * Calculate average response time
   */
  _calculateAvgResponseTime(apiMetrics) {
    if (apiMetrics.length === 0) return 0;
    const sum = apiMetrics.reduce((acc, m) => acc + m.responseTime, 0);
    return sum / apiMetrics.length;
  }

  /**
   * Get historical data
   */
  getHistoricalData(timerange = 'last_hour') {
    return {
      timerange,
      metrics: this.metricsCollector.metrics,
      alerts: this.alertsEngine.getAlertHistory(100),
      incidents: this.incidentTracker.incidentHistory
    };
  }

  /**
   * Export monitoring report
   */
  exportMonitoringReport(filePath = './reports/monitoring-report.json') {
    const fs = require('fs');
    const path = require('path');

    const report = {
      timestamp: new Date().toISOString(),
      dashboard: this.getDashboardData(),
      historical: this.getHistoricalData(),
      rules: this.alertsEngine.getRules()
    };

    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
      return { success: true, path: filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Initialize Monitoring System
export function initializeMonitoringSystem(options = {}) {
  const metricsCollector = new MetricsCollector(options);
  const alertsEngine = new AlertRulesEngine(metricsCollector);
  const incidentTracker = new IncidentTracker();
  const dashboardService = new MonitoringDashboardService(
    metricsCollector,
    alertsEngine,
    incidentTracker
  );

  // Setup default alert rules
  alertsEngine.addRule(
    'High CPU Usage',
    (metrics) => metrics.cpu > 0.8,
    'CRITICAL'
  );

  alertsEngine.addRule(
    'High Memory Usage',
    (metrics) => metrics.memory?.percentage > 90,
    'CRITICAL'
  );

  alertsEngine.addRule(
    'High Error Rate',
    (metrics) => metrics.errors?.length > 10,
    'WARNING'
  );

  alertsEngine.addRule(
    'Slow API Response',
    (metrics) => metrics.api?.some(m => m.responseTime > 2000),
    'WARNING'
  );

  // Start metrics collection
  setInterval(() => {
    metricsCollector.collectSystemMetrics();
    const dashboard = dashboardService.getDashboardData();
    alertsEngine.evaluateRules(dashboard.metrics);
  }, options.collectionInterval || 30000);

  return {
    metricsCollector,
    alertsEngine,
    incidentTracker,
    dashboardService
  };
}

const MonitoringExports = {
  MetricsCollector,
  AlertRulesEngine,
  IncidentTracker,
  EmailNotificationChannel,
  HealthScoreCalculator,
  MonitoringDashboardService,
  initializeMonitoringSystem
};

export default MonitoringExports;
