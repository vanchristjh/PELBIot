/**
 * PELBIOT Database Optimization Module
 * 
 * Comprehensive database optimization system
 * - Connection pooling and management
 * - Query optimization analysis
 * - Index management
 * - Slow query logging
 * - Connection diagnostics
 * - Query performance metrics
 */

import mysql from 'mysql2/promise';
import { performance } from 'perf_hooks';

// Database Connection Pool Manager
export class DatabasePoolManager {
  constructor(config = {}) {
    this.config = {
      host: config.host || process.env.DB_HOST || 'localhost',
      user: config.user || process.env.DB_USER || 'root',
      password: config.password || process.env.DB_PASSWORD || '',
      database: config.database || process.env.DB_NAME || 'pelbiot',
      waitForConnections: config.waitForConnections !== false,
      connectionLimit: config.connectionLimit || 10,
      queueLimit: config.queueLimit || 0,
      enableKeepAlive: config.enableKeepAlive !== false,
      keepAliveInitialDelayMs: config.keepAliveInitialDelayMs || 0
    };

    this.pool = null;
    this.queryMetrics = [];
    this.slowQueryThreshold = config.slowQueryThreshold || 1000; // ms
  }

  /**
   * Initialize connection pool
   */
  async initialize() {
    try {
      this.pool = mysql.createPool(this.config);
      
      // Test connection
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();

      console.log('✅ Database pool initialized successfully');
      console.log(`   - Connection limit: ${this.config.connectionLimit}`);
      console.log(`   - Database: ${this.config.database}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize database pool:', error.message);
      throw error;
    }
  }

  /**
   * Execute query with performance tracking
   */
  async executeQuery(query, params = []) {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    const startTime = performance.now();
    let connection;

    try {
      connection = await this.pool.getConnection();
      
      const [results] = await connection.execute(query, params);
      
      const executionTime = performance.now() - startTime;
      this._recordQueryMetric(query, executionTime, results.length);
      
      return {
        success: true,
        data: results,
        executionTime: executionTime.toFixed(2),
        rowsAffected: results.length || 0
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      this._recordQueryMetric(query, executionTime, 0, error);
      
      return {
        success: false,
        error: error.message,
        executionTime: executionTime.toFixed(2)
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Record query metrics
   */
  _recordQueryMetric(query, executionTime, rowsAffected = 0, error = null) {
    const metric = {
      query: query.substring(0, 200),
      executionTime,
      rowsAffected,
      timestamp: Date.now(),
      isSlow: executionTime > this.slowQueryThreshold,
      error: error ? error.message : null
    };

    this.queryMetrics.push(metric);

    // Keep only last 1000 metrics
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }

    // Log slow queries
    if (metric.isSlow) {
      console.warn(`⚠️  Slow query detected (${executionTime.toFixed(2)}ms): ${query.substring(0, 100)}...`);
    }
  }

  /**
   * Get pool statistics
   */
  async getPoolStats() {
    if (!this.pool) {
      return null;
    }

    const connection = await this.pool.getConnection();
    try {
      const [stats] = await connection.query(`
        SELECT
          count(*) as connection_count
        FROM information_schema.processlist
        WHERE db = ?
      `, [this.config.database]);

      connection.release();

      return {
        config: {
          connectionLimit: this.config.connectionLimit,
          queueLimit: this.config.queueLimit
        },
        current: {
          activeConnections: stats[0].connection_count,
          availableConnections: this.config.connectionLimit - stats[0].connection_count
        }
      };
    } catch (error) {
      connection.release();
      return { error: error.message };
    }
  }

  /**
   * Close pool
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Database pool closed');
    }
  }
}

// Query Performance Analyzer
export class QueryPerformanceAnalyzer {
  constructor(poolManager) {
    this.poolManager = poolManager;
  }

  /**
   * Analyze slow queries
   */
  analyzeSlowQueries() {
    const slowQueries = this.poolManager.queryMetrics.filter(
      m => m.isSlow && !m.error
    );

    const analysis = {
      totalQueries: this.poolManager.queryMetrics.length,
      slowQueryCount: slowQueries.length,
      slowQueryPercentage: ((slowQueries.length / this.poolManager.queryMetrics.length) * 100).toFixed(2),
      averageExecutionTime: (
        this.poolManager.queryMetrics.reduce((sum, m) => sum + m.executionTime, 0) /
        this.poolManager.queryMetrics.length
      ).toFixed(2),
      slowestQueries: slowQueries
        .sort((a, b) => b.executionTime - a.executionTime)
        .slice(0, 10)
    };

    return analysis;
  }

  /**
   * Identify missing indexes
   */
  async identifyMissingIndexes() {
    const recommendations = [];

    // Analyze slow queries for missing index patterns
    const slowQueries = this.poolManager.queryMetrics
      .filter(m => m.isSlow && !m.error)
      .map(m => m.query);

    const wherePatterns = slowQueries.filter(q => q.toUpperCase().includes('WHERE'));
    
    if (wherePatterns.length > 0) {
      recommendations.push({
        type: 'INDEX_OPTIMIZATION',
        severity: 'HIGH',
        message: `${wherePatterns.length} slow queries with WHERE clauses detected`,
        recommendation: 'Consider adding indexes on frequently filtered columns',
        affectedQueries: wherePatterns.slice(0, 5)
      });
    }

    const joinPatterns = slowQueries.filter(q => q.toUpperCase().includes('JOIN'));
    if (joinPatterns.length > 0) {
      recommendations.push({
        type: 'JOIN_OPTIMIZATION',
        severity: 'MEDIUM',
        message: `${joinPatterns.length} slow queries with JOINs detected`,
        recommendation: 'Ensure foreign key columns are indexed',
        affectedQueries: joinPatterns.slice(0, 5)
      });
    }

    return recommendations;
  }

  /**
   * Get query statistics
   */
  getQueryStatistics() {
    const metrics = this.poolManager.queryMetrics;

    if (metrics.length === 0) {
      return { message: 'No query metrics available' };
    }

    const stats = {
      total: metrics.length,
      successful: metrics.filter(m => !m.error).length,
      failed: metrics.filter(m => m.error).length,
      errorRate: ((metrics.filter(m => m.error).length / metrics.length) * 100).toFixed(2),
      executionTime: {
        average: (metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length).toFixed(2),
        min: Math.min(...metrics.map(m => m.executionTime)).toFixed(2),
        max: Math.max(...metrics.map(m => m.executionTime)).toFixed(2)
      },
      topSlowQueries: metrics
        .filter(m => !m.error)
        .sort((a, b) => b.executionTime - a.executionTime)
        .slice(0, 5)
    };

    return stats;
  }
}

// Index Management
export class IndexManager {
  constructor(poolManager) {
    this.poolManager = poolManager;
  }

  /**
   * Create optimization indexes
   */
  async createOptimizationIndexes() {
    const indexes = [
      // User indexes
      'CREATE INDEX idx_users_email ON users(email)',
      'CREATE INDEX idx_users_role ON users(role)',
      'CREATE INDEX idx_users_status ON users(status)',
      
      // Device indexes
      'CREATE INDEX idx_devices_serial_number ON devices(serial_number)',
      'CREATE INDEX idx_devices_status ON devices(status)',
      'CREATE INDEX idx_devices_type ON devices(device_type)',
      
      // Alert indexes
      'CREATE INDEX idx_alerts_device_id ON alerts(device_id)',
      'CREATE INDEX idx_alerts_created_at ON alerts(created_at)',
      'CREATE INDEX idx_alerts_severity ON alerts(severity)',
      'CREATE INDEX idx_alerts_status ON alerts(status)',
      
      // Report indexes
      'CREATE INDEX idx_reports_user_id ON reports(user_id)',
      'CREATE INDEX idx_reports_created_at ON reports(created_at)',
      'CREATE INDEX idx_reports_type ON reports(report_type)',
      
      // Load Profile indexes
      'CREATE INDEX idx_load_profile_device_id ON load_profile(device_id)',
      'CREATE INDEX idx_load_profile_timestamp ON load_profile(timestamp)',
      
      // Composite indexes for common queries
      'CREATE INDEX idx_alerts_device_status ON alerts(device_id, status)',
      'CREATE INDEX idx_reports_user_type ON reports(user_id, report_type)',
      'CREATE INDEX idx_load_profile_device_time ON load_profile(device_id, timestamp)'
    ];

    const results = [];

    for (const indexSQL of indexes) {
      try {
        const result = await this.poolManager.executeQuery(indexSQL);
        results.push({
          query: indexSQL,
          status: result.success ? '✅ Created' : '⚠️ Exists or Failed',
          error: result.error
        });
      } catch (error) {
        results.push({
          query: indexSQL,
          status: '❌ Failed',
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get current indexes
   */
  async getCurrentIndexes() {
    try {
      const result = await this.poolManager.executeQuery(`
        SELECT 
          TABLE_NAME, 
          INDEX_NAME, 
          COLUMN_NAME,
          SEQ_IN_INDEX,
          CARDINALITY
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME, INDEX_NAME
      `, [this.poolManager.config.database]);

      if (!result.success) {
        return { error: result.error };
      }

      // Group by table and index
      const grouped = {};
      result.data.forEach(row => {
        if (!grouped[row.TABLE_NAME]) {
          grouped[row.TABLE_NAME] = {};
        }
        if (!grouped[row.TABLE_NAME][row.INDEX_NAME]) {
          grouped[row.TABLE_NAME][row.INDEX_NAME] = [];
        }
        grouped[row.TABLE_NAME][row.INDEX_NAME].push({
          column: row.COLUMN_NAME,
          position: row.SEQ_IN_INDEX,
          cardinality: row.CARDINALITY
        });
      });

      return grouped;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Analyze table statistics
   */
  async analyzeTableStats() {
    try {
      const result = await this.poolManager.executeQuery(`
        SELECT 
          TABLE_NAME,
          TABLE_ROWS,
          AVG_ROW_LENGTH,
          DATA_LENGTH,
          INDEX_LENGTH,
          FREE_SPACE
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ?
        ORDER BY DATA_LENGTH DESC
      `, [this.poolManager.config.database]);

      if (!result.success) {
        return { error: result.error };
      }

      const stats = result.data.map(row => ({
        table: row.TABLE_NAME,
        rows: row.TABLE_ROWS,
        avgRowLength: row.AVG_ROW_LENGTH,
        dataSize: (row.DATA_LENGTH / 1024 / 1024).toFixed(2) + ' MB',
        indexSize: (row.INDEX_LENGTH / 1024 / 1024).toFixed(2) + ' MB',
        totalSize: ((row.DATA_LENGTH + row.INDEX_LENGTH) / 1024 / 1024).toFixed(2) + ' MB'
      }));

      return stats;
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Database Health Monitor
export class DatabaseHealthMonitor {
  constructor(poolManager) {
    this.poolManager = poolManager;
    this.healthHistory = [];
  }

  /**
   * Check database health
   */
  async checkHealth() {
    const health = {
      timestamp: new Date().toISOString(),
      status: 'UNKNOWN',
      checks: {}
    };

    try {
      // Check connection pool
      const poolStats = await this.poolManager.getPoolStats();
      health.checks.connectionPool = {
        status: poolStats.current ? '✅ OK' : '❌ Failed',
        details: poolStats
      };

      // Check database size
      const sizeResult = await this.poolManager.executeQuery(`
        SELECT SUM(data_length + index_length) as size
        FROM information_schema.tables
        WHERE table_schema = ?
      `, [this.poolManager.config.database]);

      if (sizeResult.success) {
        const dbSize = sizeResult.data[0].size / 1024 / 1024;
        health.checks.databaseSize = {
          status: dbSize > 1000 ? '⚠️ Warning' : '✅ OK',
          sizeGB: (dbSize / 1024).toFixed(2)
        };
      }

      // Check query performance
      const queryStats = new QueryPerformanceAnalyzer(this.poolManager).getQueryStatistics();
      health.checks.queryPerformance = {
        status: queryStats.errorRate > 5 ? '⚠️ Warning' : '✅ OK',
        errorRate: queryStats.errorRate
      };

      // Determine overall status
      const allOK = Object.values(health.checks).every(check => 
        check.status && check.status.includes('✅')
      );
      health.status = allOK ? 'HEALTHY' : 'WARNING';

      this.healthHistory.push(health);
      if (this.healthHistory.length > 100) {
        this.healthHistory = this.healthHistory.slice(-100);
      }

      return health;
    } catch (error) {
      health.status = 'UNHEALTHY';
      health.error = error.message;
      return health;
    }
  }

  /**
   * Get health history
   */
  getHealthHistory() {
    return this.healthHistory;
  }
}

// Database Optimization Service
export class DatabaseOptimizationService {
  constructor(config = {}) {
    this.poolManager = new DatabasePoolManager(config);
    this.analyzer = new QueryPerformanceAnalyzer(this.poolManager);
    this.indexManager = new IndexManager(this.poolManager);
    this.healthMonitor = new DatabaseHealthMonitor(this.poolManager);
  }

  /**
   * Initialize service
   */
  async initialize() {
    await this.poolManager.initialize();
  }

  /**
   * Run full optimization
   */
  async runFullOptimization() {
    console.log('🔧 Running database optimization...\n');

    const report = {
      timestamp: new Date().toISOString(),
      steps: []
    };

    try {
      // Step 1: Analyze current performance
      console.log('📊 Step 1: Analyzing current performance...');
      const slowQueryAnalysis = this.analyzer.analyzeSlowQueries();
      report.steps.push({
        step: 'Slow Query Analysis',
        result: slowQueryAnalysis
      });
      console.log(`   Found ${slowQueryAnalysis.slowQueryCount} slow queries\n`);

      // Step 2: Create optimization indexes
      console.log('🔑 Step 2: Creating optimization indexes...');
      const indexResults = await this.indexManager.createOptimizationIndexes();
      report.steps.push({
        step: 'Create Indexes',
        result: indexResults
      });
      console.log(`   ${indexResults.length} indexes processed\n`);

      // Step 3: Analyze table statistics
      console.log('📈 Step 3: Analyzing table statistics...');
      const tableStats = await this.indexManager.analyzeTableStats();
      report.steps.push({
        step: 'Table Statistics',
        result: tableStats
      });
      console.log(`   ${tableStats.length} tables analyzed\n`);

      // Step 4: Check health
      console.log('💚 Step 4: Checking database health...');
      const health = await this.healthMonitor.checkHealth();
      report.steps.push({
        step: 'Health Check',
        result: health
      });
      console.log(`   Status: ${health.status}\n`);

      console.log('✅ Optimization complete!');
      return report;
    } catch (error) {
      console.error('❌ Optimization failed:', error.message);
      report.error = error.message;
      return report;
    }
  }

  /**
   * Get optimization report
   */
  async getOptimizationReport() {
    return {
      slowQueries: this.analyzer.analyzeSlowQueries(),
      tableStats: await this.indexManager.analyzeTableStats(),
      currentIndexes: await this.indexManager.getCurrentIndexes(),
      health: await this.healthMonitor.checkHealth(),
      poolStats: await this.poolManager.getPoolStats()
    };
  }
}

// Export for use
export default DatabaseOptimizationService;
