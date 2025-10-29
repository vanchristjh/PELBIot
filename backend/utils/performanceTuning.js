/**
 * PELBIOT Performance Tuning Module
 * 
 * Comprehensive performance monitoring, analysis, and auto-tuning system
 * - Real-time metrics collection
 * - Bottleneck identification
 * - Performance recommendations
 * - Auto-tuning capabilities
 * - Memory optimization
 * - Request optimization
 * - Database query optimization
 */

import os from 'os';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

// Performance Metrics Collection
export class PerformanceMetrics {
  constructor() {
    this.metrics = {
      memory: [],
      cpu: [],
      requests: [],
      queries: [],
      timestamps: []
    };
    this.maxHistorySize = 1000;
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage();
  }

  /**
   * Collect memory metrics
   */
  collectMemoryMetrics() {
    const memUsage = process.memoryUsage();
    
    return {
      rss: memUsage.rss / 1024 / 1024,        // RSS in MB
      heapUsed: memUsage.heapUsed / 1024 / 1024,
      heapTotal: memUsage.heapTotal / 1024 / 1024,
      external: memUsage.external / 1024 / 1024,
      arrayBuffers: memUsage.arrayBuffers / 1024 / 1024,
      timestamp: Date.now()
    };
  }

  /**
   * Collect CPU metrics
   */
  collectCPUMetrics() {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    
    return {
      cores: cpus.length,
      loadAverage1min: loadAvg[0],
      loadAverage5min: loadAvg[1],
      loadAverage15min: loadAvg[2],
      cpuUsagePercent: (loadAvg[0] / cpus.length) * 100,
      freemem: os.freemem() / 1024 / 1024,   // MB
      totalmem: os.totalmem() / 1024 / 1024, // MB
      timestamp: Date.now()
    };
  }

  /**
   * Collect request metrics
   */
  recordRequest(method, path, responseTime, statusCode, requestSize = 0, responseSize = 0) {
    const metric = {
      method,
      path,
      responseTime,
      statusCode,
      requestSize,
      responseSize,
      timestamp: Date.now()
    };

    this.metrics.requests.push(metric);
    this._maintainHistorySize('requests');
    
    return metric;
  }

  /**
   * Collect query metrics
   */
  recordQuery(query, executionTime, rowsAffected = 0, error = null) {
    const metric = {
      query: query.substring(0, 200), // First 200 chars
      executionTime,
      rowsAffected,
      error: error ? error.message : null,
      timestamp: Date.now()
    };

    this.metrics.queries.push(metric);
    this._maintainHistorySize('queries');
    
    return metric;
  }

  /**
   * Maintain history size limit
   */
  _maintainHistorySize(metricType) {
    if (this.metrics[metricType].length > this.maxHistorySize) {
      this.metrics[metricType] = this.metrics[metricType].slice(-this.maxHistorySize);
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    return {
      uptime: (Date.now() - this.startTime) / 1000,
      memory: this.collectMemoryMetrics(),
      cpu: this.collectCPUMetrics(),
      requests: {
        total: this.metrics.requests.length,
        avgResponseTime: this._calculateAvg(this.metrics.requests, 'responseTime'),
        maxResponseTime: this._getMax(this.metrics.requests, 'responseTime'),
        minResponseTime: this._getMin(this.metrics.requests, 'responseTime'),
        errorRate: this._calculateErrorRate()
      },
      queries: {
        total: this.metrics.queries.length,
        avgExecutionTime: this._calculateAvg(this.metrics.queries, 'executionTime'),
        maxExecutionTime: this._getMax(this.metrics.queries, 'executionTime'),
        slowQueryCount: this.metrics.queries.filter(q => q.executionTime > 1000).length
      }
    };
  }

  /**
   * Calculate average
   */
  _calculateAvg(arr, field) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((acc, item) => acc + (item[field] || 0), 0);
    return sum / arr.length;
  }

  /**
   * Get maximum value
   */
  _getMax(arr, field) {
    if (arr.length === 0) return 0;
    return Math.max(...arr.map(item => item[field] || 0));
  }

  /**
   * Get minimum value
   */
  _getMin(arr, field) {
    if (arr.length === 0) return 0;
    return Math.min(...arr.map(item => item[field] || 0));
  }

  /**
   * Calculate error rate
   */
  _calculateErrorRate() {
    if (this.metrics.requests.length === 0) return 0;
    const errors = this.metrics.requests.filter(r => r.statusCode >= 400).length;
    return (errors / this.metrics.requests.length) * 100;
  }
}

// Bottleneck Analyzer
export class BottleneckAnalyzer {
  constructor(metricsCollector) {
    this.metrics = metricsCollector;
    this.bottlenecks = [];
  }

  /**
   * Analyze performance bottlenecks
   */
  analyze() {
    const summary = this.metrics.getSummary();
    this.bottlenecks = [];

    // Memory analysis
    if (summary.memory.heapUsed > summary.memory.heapTotal * 0.8) {
      this.bottlenecks.push({
        severity: 'CRITICAL',
        type: 'MEMORY',
        message: `Heap memory usage at ${(summary.memory.heapUsed / summary.memory.heapTotal * 100).toFixed(2)}%`,
        recommendation: 'Implement memory optimization - consider increasing Node.js heap size or optimizing data structures'
      });
    }

    // CPU analysis
    if (summary.cpu.cpuUsagePercent > 80) {
      this.bottlenecks.push({
        severity: 'CRITICAL',
        type: 'CPU',
        message: `CPU usage at ${summary.cpu.cpuUsagePercent.toFixed(2)}%`,
        recommendation: 'CPU bottleneck detected - consider load balancing or query optimization'
      });
    }

    // Request performance analysis
    if (summary.requests.avgResponseTime > 1000) {
      this.bottlenecks.push({
        severity: 'WARNING',
        type: 'REQUEST_PERFORMANCE',
        message: `Average response time: ${summary.requests.avgResponseTime.toFixed(2)}ms`,
        recommendation: 'Implement caching, optimize queries, or use CDN for static assets'
      });
    }

    // Slow queries analysis
    if (summary.queries.slowQueryCount > 0) {
      this.bottlenecks.push({
        severity: 'WARNING',
        type: 'SLOW_QUERIES',
        message: `${summary.queries.slowQueryCount} slow queries detected (>1000ms)`,
        recommendation: 'Add database indexes, optimize query logic, or increase connection pool'
      });
    }

    // Error rate analysis
    if (summary.requests.errorRate > 5) {
      this.bottlenecks.push({
        severity: 'WARNING',
        type: 'ERROR_RATE',
        message: `Error rate at ${summary.requests.errorRate.toFixed(2)}%`,
        recommendation: 'Review error logs and fix failing endpoints'
      });
    }

    return this.bottlenecks;
  }

  /**
   * Get recommendations
   */
  getRecommendations() {
    this.analyze();
    
    return {
      bottlenecks: this.bottlenecks,
      summary: this._generateSummary(),
      actionItems: this._generateActionItems()
    };
  }

  /**
   * Generate summary
   */
  _generateSummary() {
    const critical = this.bottlenecks.filter(b => b.severity === 'CRITICAL');
    const warnings = this.bottlenecks.filter(b => b.severity === 'WARNING');
    
    return {
      criticalIssues: critical.length,
      warnings: warnings.length,
      overallHealth: this._calculateHealth()
    };
  }

  /**
   * Calculate overall health score
   */
  _calculateHealth() {
    const critical = this.bottlenecks.filter(b => b.severity === 'CRITICAL').length;
    const warnings = this.bottlenecks.filter(b => b.severity === 'WARNING').length;
    
    let health = 100;
    health -= critical * 25;
    health -= warnings * 10;
    
    return Math.max(0, Math.min(100, health));
  }

  /**
   * Generate action items
   */
  _generateActionItems() {
    const items = [];
    
    this.bottlenecks.forEach((bottleneck, index) => {
      items.push({
        priority: bottleneck.severity === 'CRITICAL' ? 1 : 2,
        issue: bottleneck.message,
        recommendation: bottleneck.recommendation,
        type: bottleneck.type
      });
    });

    return items.sort((a, b) => a.priority - b.priority);
  }
}

// Auto-Tuning Engine
export class AutoTuningEngine {
  constructor(metricsCollector) {
    this.metrics = metricsCollector;
    this.tuningStrategies = {};
  }

  /**
   * Memory optimization recommendations
   */
  optimizeMemory() {
    const summary = this.metrics.getSummary();
    const strategies = [];

    if (summary.memory.heapUsed > summary.memory.heapTotal * 0.8) {
      strategies.push({
        strategy: 'HEAP_SIZE_INCREASE',
        current: `${summary.memory.heapTotal.toFixed(2)}MB`,
        recommended: `${(summary.memory.heapTotal * 1.5).toFixed(2)}MB`,
        command: `NODE_OPTIONS="--max-old-space-size=${Math.round(summary.memory.heapTotal * 1.5)}" npm start`
      });
    }

    if (summary.memory.rss > summary.memory.heapTotal * 1.5) {
      strategies.push({
        strategy: 'GARBAGE_COLLECTION',
        recommendation: 'Enable aggressive garbage collection',
        command: `NODE_OPTIONS="--expose-gc" npm start && global.gc()`,
        notes: 'Call global.gc() periodically in long-running operations'
      });
    }

    return strategies;
  }

  /**
   * CPU optimization recommendations
   */
  optimizeCPU() {
    const summary = this.metrics.getSummary();
    const strategies = [];

    if (summary.cpu.cpuUsagePercent > 80) {
      strategies.push({
        strategy: 'WORKER_THREADS',
        recommendation: 'Implement worker threads for CPU-intensive tasks',
        implementation: 'Use worker_threads module for async operations'
      });

      strategies.push({
        strategy: 'CLUSTERING',
        recommendation: 'Enable Node.js clustering',
        workerCount: summary.cpu.cores,
        implementation: 'Use cluster module to create worker processes'
      });
    }

    return strategies;
  }

  /**
   * Query optimization recommendations
   */
  optimizeQueries() {
    const summary = this.metrics.getSummary();
    const strategies = [];

    if (summary.queries.slowQueryCount > 0) {
      strategies.push({
        strategy: 'DATABASE_INDEXING',
        action: 'Review slow queries and add appropriate indexes',
        benefit: 'Can reduce query time by 50-90%'
      });

      strategies.push({
        strategy: 'CONNECTION_POOLING',
        action: 'Increase database connection pool size',
        benefit: 'Reduce connection overhead'
      });

      strategies.push({
        strategy: 'QUERY_CACHING',
        action: 'Implement Redis caching for frequently executed queries',
        benefit: 'Drastically reduce database load'
      });
    }

    return strategies;
  }

  /**
   * Request optimization recommendations
   */
  optimizeRequests() {
    const summary = this.metrics.getSummary();
    const strategies = [];

    if (summary.requests.avgResponseTime > 1000) {
      strategies.push({
        strategy: 'GZIP_COMPRESSION',
        recommendation: 'Enable Gzip compression for responses',
        benefit: 'Reduce response size by 70-80%'
      });

      strategies.push({
        strategy: 'HTTP_CACHING',
        recommendation: 'Implement HTTP caching headers',
        benefit: 'Reduce server load and improve perceived performance'
      });

      strategies.push({
        strategy: 'CDN_INTEGRATION',
        recommendation: 'Use CDN for static assets',
        benefit: 'Reduce server load and improve global performance'
      });
    }

    return strategies;
  }

  /**
   * Get all tuning recommendations
   */
  getTuningStrategies() {
    return {
      memory: this.optimizeMemory(),
      cpu: this.optimizeCPU(),
      queries: this.optimizeQueries(),
      requests: this.optimizeRequests(),
      timestamp: new Date().toISOString()
    };
  }
}

// Performance Tracker Middleware
export function performanceTrackerMiddleware(metricsCollector) {
  return (req, res, next) => {
    const startTime = performance.now();
    const startSize = JSON.stringify(req).length;

    // Track response
    const originalSend = res.send;
    res.send = function(data) {
      const responseTime = performance.now() - startTime;
      const responseSize = JSON.stringify(data).length;

      metricsCollector.recordRequest(
        req.method,
        req.path,
        responseTime,
        res.statusCode,
        startSize,
        responseSize
      );

      return originalSend.call(this, data);
    };

    next();
  };
}

// Performance Export Service
export class PerformanceReportService {
  constructor(metricsCollector, analyzer) {
    this.metrics = metricsCollector;
    this.analyzer = analyzer;
  }

  /**
   * Generate performance report
   */
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      summary: this.metrics.getSummary(),
      analysis: this.analyzer.getRecommendations(),
      metrics: {
        requests: this.metrics.metrics.requests.slice(-100),
        queries: this.metrics.metrics.queries.slice(-100)
      }
    };
  }

  /**
   * Export report to file
   */
  exportToFile(filePath = './reports/performance-report.json') {
    const report = this.generateReport();
    
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
      
      return {
        success: true,
        path: filePath,
        size: fs.statSync(filePath).size
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get performance trend
   */
  getPerformanceTrend(minutes = 60) {
    const now = Date.now();
    const timeWindow = minutes * 60 * 1000;
    
    const recentRequests = this.metrics.metrics.requests.filter(
      r => r.timestamp > now - timeWindow
    );

    const timeSlots = {};
    for (let i = 0; i < minutes; i++) {
      const slotTime = now - (minutes - i) * 60 * 1000;
      timeSlots[new Date(slotTime).toISOString().slice(11, 16)] = {
        requests: 0,
        avgTime: 0,
        errors: 0
      };
    }

    recentRequests.forEach(req => {
      const slot = new Date(req.timestamp).toISOString().slice(11, 16);
      if (timeSlots[slot]) {
        timeSlots[slot].requests++;
        timeSlots[slot].avgTime += req.responseTime;
        if (req.statusCode >= 400) timeSlots[slot].errors++;
      }
    });

    Object.keys(timeSlots).forEach(slot => {
      if (timeSlots[slot].requests > 0) {
        timeSlots[slot].avgTime = timeSlots[slot].avgTime / timeSlots[slot].requests;
      }
    });

    return timeSlots;
  }
}

// Initialize Performance System
export function initializePerformanceSystem() {
  const metricsCollector = new PerformanceMetrics();
  const bottleneckAnalyzer = new BottleneckAnalyzer(metricsCollector);
  const autoTuningEngine = new AutoTuningEngine(metricsCollector);
  const reportService = new PerformanceReportService(metricsCollector, bottleneckAnalyzer);

  return {
    metricsCollector,
    bottleneckAnalyzer,
    autoTuningEngine,
    reportService,
    middleware: performanceTrackerMiddleware(metricsCollector)
  };
}
