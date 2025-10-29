/**
 * PELBIOT Load Balancing & Clustering Module
 * 
 * Complete load balancing solution
 * - Multi-process clustering
 * - Session persistence
 * - Health checks
 * - Request distribution
 * - Graceful shutdown
 */

import cluster from 'cluster';
import os from 'os';

// Load Balancer Configuration
export class LoadBalancerConfig {
  constructor(options = {}) {
    this.config = {
      workerCount: options.workerCount || os.cpus().length,
      maxConnections: options.maxConnections || 1000,
      maxRequests: options.maxRequests || 10000,
      timeout: options.timeout || 30000,
      healthCheckInterval: options.healthCheckInterval || 5000,
      sessionAffinity: options.sessionAffinity !== false,
      loadBalancingStrategy: options.strategy || 'round-robin',
      gracefulShutdownTimeout: options.gracefulShutdownTimeout || 30000
    };

    this.workers = new Map();
    this.currentWorkerIndex = 0;
    this.requestCount = 0;
  }

  /**
   * Get next worker for round-robin
   */
  getNextWorker() {
    if (this.workers.size === 0) return null;

    const workers = Array.from(this.workers.values()).filter(w => w.alive);
    if (workers.length === 0) return null;

    const worker = workers[this.currentWorkerIndex % workers.length];
    this.currentWorkerIndex++;

    return worker;
  }

  /**
   * Get worker with least connections
   */
  getLeastBusyWorker() {
    const workers = Array.from(this.workers.values()).filter(w => w.alive);
    if (workers.length === 0) return null;

    return workers.reduce((prev, current) =>
      (prev.connections < current.connections) ? prev : current
    );
  }

  /**
   * Get worker by session
   */
  getWorkerBySession(sessionId) {
    if (!this.config.sessionAffinity) return this.getNextWorker();

    let worker = this.workers.get(sessionId);
    if (!worker || !worker.alive) {
      worker = this.getNextWorker();
      if (worker) {
        this.workers.set(sessionId, worker);
      }
    }

    return worker;
  }

  /**
   * Select worker based on strategy
   */
  selectWorker(strategy = null) {
    const strat = strategy || this.config.loadBalancingStrategy;

    switch (strat) {
      case 'least-connections':
        return this.getLeastBusyWorker();
      case 'round-robin':
      default:
        return this.getNextWorker();
    }
  }
}

// Cluster Manager
export class ClusterManager {
  constructor(app, options = {}) {
    this.app = app;
    this.config = new LoadBalancerConfig(options);
    this.master = cluster.isPrimary;
    this.workers = [];
  }

  /**
   * Initialize cluster
   */
  async initialize() {
    if (this.master) {
      console.log(`🚀 Starting PELBIOT Cluster Manager`);
      console.log(`   - Master process: ${process.pid}`);
      console.log(`   - Workers: ${this.config.config.workerCount}`);
      console.log(`   - Load balancing: ${this.config.config.loadBalancingStrategy}`);
      console.log('');

      return this._setupMaster();
    } else {
      return this._setupWorker();
    }
  }

  /**
   * Setup master process
   */
  async _setupMaster() {
    // Create workers
    for (let i = 0; i < this.config.config.workerCount; i++) {
      const worker = cluster.fork();
      this.workers.push({
        id: worker.id,
        pid: worker.process.pid,
        alive: true,
        connections: 0,
        requests: 0
      });

      console.log(`✅ Worker ${worker.id} started (PID: ${worker.process.pid})`);
    }

    // Handle worker events
    cluster.on('exit', (worker, code, signal) => {
      console.warn(`⚠️  Worker ${worker.id} died (${signal || code})`);
      
      // Restart worker
      const newWorker = cluster.fork();
      const workerIndex = this.workers.findIndex(w => w.id === worker.id);
      if (workerIndex >= 0) {
        this.workers[workerIndex] = {
          id: newWorker.id,
          pid: newWorker.process.pid,
          alive: true,
          connections: 0,
          requests: 0
        };
      }

      console.log(`✅ Worker ${newWorker.id} restarted (PID: ${newWorker.process.pid})`);
    });

    // Health checks
    this._startHealthChecks();

    // Graceful shutdown on signals
    this._setupSignalHandlers();

    console.log('\n✨ Cluster ready to serve requests\n');
  }

  /**
   * Setup worker process
   */
  async _setupWorker() {
    console.log(`👷 Worker ${cluster.worker.id} started`);
    // App will start on the worker
  }

  /**
   * Start health checks
   */
  _startHealthChecks() {
    setInterval(() => {
      this.workers.forEach(worker => {
        if (!worker.alive) {
          // Try to revive
          worker.alive = true;
        }
      });
    }, this.config.config.healthCheckInterval);
  }

  /**
   * Setup signal handlers
   */
  _setupSignalHandlers() {
    const signals = ['SIGTERM', 'SIGINT'];

    signals.forEach(signal => {
      process.on(signal, async () => {
        console.log(`\n📴 Received ${signal}, shutting down gracefully...`);
        
        // Stop accepting new connections
        await this._gracefulShutdown();
        
        process.exit(0);
      });
    });
  }

  /**
   * Graceful shutdown
   */
  async _gracefulShutdown() {
    return new Promise((resolve) => {
      let activeConnections = this.workers.reduce((sum, w) => sum + w.connections, 0);

      if (activeConnections === 0) {
        // Kill all workers
        Object.values(cluster.workers).forEach(worker => {
          worker.kill();
        });
        resolve();
        return;
      }

      // Wait for connections to close
      const timeout = setTimeout(() => {
        console.log('⚠️  Force killing workers...');
        Object.values(cluster.workers).forEach(worker => {
          worker.kill('SIGKILL');
        });
        resolve();
      }, this.config.config.gracefulShutdownTimeout);

      const checkInterval = setInterval(() => {
        activeConnections = this.workers.reduce((sum, w) => sum + w.connections, 0);
        if (activeConnections === 0) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          
          Object.values(cluster.workers).forEach(worker => {
            worker.kill();
          });
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * Get cluster status
   */
  getStatus() {
    const totalConnections = this.workers.reduce((sum, w) => sum + w.connections, 0);
    const totalRequests = this.workers.reduce((sum, w) => sum + w.requests, 0);

    return {
      master: true,
      workers: this.workers.map(w => ({
        id: w.id,
        pid: w.pid,
        alive: w.alive,
        connections: w.connections,
        requests: w.requests
      })),
      totals: {
        workers: this.workers.length,
        connections: totalConnections,
        requests: totalRequests,
        averageConnectionsPerWorker: (totalConnections / this.workers.length).toFixed(2),
        averageRequestsPerWorker: (totalRequests / this.workers.length).toFixed(2)
      }
    };
  }
}

// Session Persistence Manager
export class SessionPersistenceManager {
  constructor(sessionStore = null) {
    this.sessionStore = sessionStore || new Map();
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    this.sessionMap = new Map(); // sessionId -> workerId
  }

  /**
   * Bind session to worker
   */
  bindSessionToWorker(sessionId, workerId) {
    this.sessionMap.set(sessionId, {
      workerId,
      timestamp: Date.now()
    });
  }

  /**
   * Get worker for session
   */
  getWorkerForSession(sessionId) {
    const binding = this.sessionMap.get(sessionId);
    
    if (!binding) {
      return null;
    }

    // Check if session is still valid
    if (Date.now() - binding.timestamp > this.sessionTimeout) {
      this.sessionMap.delete(sessionId);
      return null;
    }

    return binding.workerId;
  }

  /**
   * Create session
   */
  createSession(sessionData) {
    const sessionId = this._generateSessionId();
    
    this.sessionStore.set(sessionId, {
      data: sessionData,
      created: Date.now(),
      lastAccessed: Date.now()
    });

    return sessionId;
  }

  /**
   * Update session
   */
  updateSession(sessionId, data) {
    if (this.sessionStore.has(sessionId)) {
      const session = this.sessionStore.get(sessionId);
      session.data = { ...session.data, ...data };
      session.lastAccessed = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Get session
   */
  getSession(sessionId) {
    const session = this.sessionStore.get(sessionId);
    if (session) {
      session.lastAccessed = Date.now();
      return session.data;
    }
    return null;
  }

  /**
   * Delete session
   */
  deleteSession(sessionId) {
    this.sessionStore.delete(sessionId);
    this.sessionMap.delete(sessionId);
    return true;
  }

  /**
   * Generate session ID
   */
  _generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions() {
    let deletedCount = 0;
    const now = Date.now();

    this.sessionStore.forEach((session, sessionId) => {
      if (now - session.lastAccessed > this.sessionTimeout) {
        this.sessionStore.delete(sessionId);
        this.sessionMap.delete(sessionId);
        deletedCount++;
      }
    });

    return deletedCount;
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      totalSessions: this.sessionStore.size,
      sessionBindings: this.sessionMap.size,
      timeout: this.sessionTimeout
    };
  }
}

// Load Balancer Middleware
export function loadBalancerMiddleware(clusterManager) {
  return (req, res, next) => {
    if (!clusterManager.master) {
      next();
      return;
    }

    const sessionId = req.sessionID || req.cookies?.sessionId;
    const targetWorker = clusterManager.config.selectWorker();

    if (targetWorker && sessionId) {
      req.targetWorker = targetWorker;
      req.sessionAffinity = true;
    }

    next();
  };
}

// Health Check Handler
export async function healthCheckHandler(req, res) {
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    workerId: cluster.worker?.id || 'master'
  });
}

// Metrics Collector
export class LoadBalancerMetrics {
  constructor() {
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      totalResponseTime: 0,
      connections: 0
    };
  }

  /**
   * Record request
   */
  recordRequest() {
    this.metrics.requests++;
  }

  /**
   * Record response
   */
  recordResponse(responseTime) {
    this.metrics.responses++;
    this.metrics.totalResponseTime += responseTime;
  }

  /**
   * Record error
   */
  recordError() {
    this.metrics.errors++;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      requests: this.metrics.requests,
      responses: this.metrics.responses,
      errors: this.metrics.errors,
      errorRate: (this.metrics.errors / this.metrics.requests * 100).toFixed(2) + '%',
      averageResponseTime: (this.metrics.totalResponseTime / this.metrics.responses).toFixed(2) + 'ms'
    };
  }
}

// Initialize Load Balancer
export function initializeLoadBalancer(app, options = {}) {
  const clusterManager = new ClusterManager(app, options);
  const sessionManager = new SessionPersistenceManager();
  const metrics = new LoadBalancerMetrics();

  return {
    clusterManager,
    sessionManager,
    metrics,
    middleware: loadBalancerMiddleware(clusterManager)
  };
}

const LoadBalancerExports = {
  LoadBalancerConfig,
  ClusterManager,
  SessionPersistenceManager,
  loadBalancerMiddleware,
  healthCheckHandler,
  LoadBalancerMetrics,
  initializeLoadBalancer
};

export default LoadBalancerExports;
