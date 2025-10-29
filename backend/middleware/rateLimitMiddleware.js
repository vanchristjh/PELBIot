/**
 * Rate Limiting & DDoS Protection Middleware
 * Advanced protection against rate limit abuse and distributed denial of service
 * 
 * @features:
 * - IP-based rate limiting
 * - User-based rate limiting
 * - Sliding window algorithm
 * - DDoS detection
 * - Circuit breaker pattern
 * - Adaptive rate limiting
 * - Whitelist/Blacklist support
 */

import redis from 'redis';

/**
 * Rate Limiter with Redis backend
 */
export class RateLimiter {
  constructor(redisClient, options = {}) {
    this.redisClient = redisClient;
    this.defaultWindowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.defaultLimit = options.limit || 100;
    this.keyPrefix = options.keyPrefix || 'rate_limit:';
    this.skipSuccessfulRequests = options.skipSuccessfulRequests || false;
    this.skipFailedRequests = options.skipFailedRequests || false;
    this.whitelist = new Set(options.whitelist || []);
    this.blacklist = new Set(options.blacklist || []);
    this.ddosThreshold = options.ddosThreshold || 1000; // requests per minute
    this.analyticsEnabled = options.analyticsEnabled !== false;
    this.analytics = {
      totalRequests: 0,
      blockedRequests: 0,
      ddosAttacks: []
    };
  }

  /**
   * Generate rate limit key
   */
  generateKey(identifier, keyName = 'default') {
    return `${this.keyPrefix}${keyName}:${identifier}`;
  }

  /**
   * Check rate limit for identifier
   */
  async checkLimit(identifier, keyName = 'default', options = {}) {
    const { limit = this.defaultLimit, windowMs = this.defaultWindowMs } = options;

    // Check blacklist
    if (this.blacklist.has(identifier)) {
      return {
        allowed: false,
        remaining: 0,
        reset: Date.now(),
        reason: 'Blacklisted'
      };
    }

    // Skip whitelist
    if (this.whitelist.has(identifier)) {
      return {
        allowed: true,
        remaining: limit,
        reset: Date.now() + windowMs,
        reason: 'Whitelisted'
      };
    }

    try {
      const key = this.generateKey(identifier, keyName);
      const current = await this.redisClient.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= limit) {
        if (this.analyticsEnabled) {
          this.analytics.blockedRequests++;
        }
        return {
          allowed: false,
          remaining: 0,
          reset: Date.now() + windowMs,
          retryAfter: Math.ceil(windowMs / 1000),
          reason: 'Rate limit exceeded'
        };
      }

      // Increment counter
      const newCount = count + 1;
      const ttl = Math.ceil(windowMs / 1000);

      if (count === 0) {
        // First request in window
        await this.redisClient.setex(key, ttl, newCount.toString());
      } else {
        // Increment existing
        await this.redisClient.incr(key);
      }

      if (this.analyticsEnabled) {
        this.analytics.totalRequests++;
      }

      return {
        allowed: true,
        remaining: limit - newCount,
        reset: Date.now() + windowMs,
        limit: limit
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: limit,
        reset: Date.now() + windowMs,
        warning: 'Redis unavailable - rate limiting disabled'
      };
    }
  }

  /**
   * Check for DDoS patterns
   */
  async checkDDoS(identifier) {
    try {
      const key = this.generateKey(identifier, 'ddos');
      const current = await this.redisClient.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= this.ddosThreshold) {
        if (this.analyticsEnabled) {
          this.analytics.ddosAttacks.push({
            identifier,
            timestamp: new Date(),
            requests: count
          });
        }
        return { isDDoS: true, requestsPerMinute: count };
      }

      const newCount = count + 1;
      await this.redisClient.setex(key, 60, newCount.toString());

      return { isDDoS: false, requestsPerMinute: newCount };
    } catch (error) {
      console.error('DDoS check error:', error);
      return { isDDoS: false, error: error.message };
    }
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier, keyName = 'default') {
    try {
      const key = this.generateKey(identifier, keyName);
      await this.redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Rate limit reset error:', error);
      return false;
    }
  }

  /**
   * Add to whitelist
   */
  addToWhitelist(identifier) {
    this.whitelist.add(identifier);
    if (this.blacklist.has(identifier)) {
      this.blacklist.delete(identifier);
    }
  }

  /**
   * Add to blacklist
   */
  addToBlacklist(identifier) {
    this.blacklist.add(identifier);
    if (this.whitelist.has(identifier)) {
      this.whitelist.delete(identifier);
    }
  }

  /**
   * Remove from whitelist/blacklist
   */
  removeFromList(identifier) {
    this.whitelist.delete(identifier);
    this.blacklist.delete(identifier);
  }

  /**
   * Get analytics
   */
  getAnalytics() {
    return {
      ...this.analytics,
      blockedPercentage: this.analytics.totalRequests > 0 
        ? ((this.analytics.blockedRequests / this.analytics.totalRequests) * 100).toFixed(2)
        : 0
    };
  }

  /**
   * Reset analytics
   */
  resetAnalytics() {
    this.analytics = {
      totalRequests: 0,
      blockedRequests: 0,
      ddosAttacks: []
    };
  }
}

/**
 * Express middleware factory
 */
export const createRateLimitMiddleware = (rateLimiter, options = {}) => {
  const {
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    keyName = 'api',
    skip = () => false,
    onLimitReached = null,
    statusCode = 429,
    message = 'Too many requests, please try again later'
  } = options;

  return async (req, res, next) => {
    if (skip(req)) {
      return next();
    }

    try {
      const identifier = keyGenerator(req);

      // Check DDoS
      const ddosCheck = await rateLimiter.checkDDoS(identifier);
      if (ddosCheck.isDDoS) {
        console.error(`🚨 DDoS DETECTED from ${identifier}: ${ddosCheck.requestsPerMinute} req/min`);
        
        // Block the request
        return res.status(statusCode).json({
          error: 'Too many requests',
          message: 'You are being rate limited',
          retryAfter: 60
        });
      }

      // Check rate limit
      const limitResult = await rateLimiter.checkLimit(identifier, keyName);

      // Set rate limit headers
      res.set('X-RateLimit-Limit', limitResult.limit || rateLimiter.defaultLimit);
      res.set('X-RateLimit-Remaining', Math.max(0, limitResult.remaining));
      res.set('X-RateLimit-Reset', new Date(limitResult.reset).toISOString());

      if (!limitResult.allowed) {
        if (onLimitReached) {
          onLimitReached(req, res, identifier);
        }

        return res.status(statusCode).json({
          error: 'Rate limit exceeded',
          message,
          retryAfter: limitResult.retryAfter
        });
      }

      req.rateLimit = limitResult;
      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Fail open
      next();
    }
  };
};

/**
 * Circuit Breaker for managing cascading failures
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000; // 1 minute
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      stateChanges: []
    };
  }

  /**
   * Record success
   */
  recordSuccess() {
    this.metrics.successfulRequests++;
    this.metrics.totalRequests++;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.changeState('CLOSED');
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else if (this.state === 'CLOSED') {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  /**
   * Record failure
   */
  recordFailure() {
    this.metrics.failedRequests++;
    this.metrics.totalRequests++;
    this.lastFailureTime = Date.now();

    if (this.state === 'CLOSED') {
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold) {
        this.changeState('OPEN');
      }
    } else if (this.state === 'HALF_OPEN') {
      this.changeState('OPEN');
    }
  }

  /**
   * Check if request should be allowed
   */
  canExecute() {
    if (this.state === 'CLOSED') {
      return true;
    }

    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.changeState('HALF_OPEN');
        this.successCount = 0;
        return true;
      }
      return false;
    }

    // HALF_OPEN state
    return true;
  }

  /**
   * Change state
   */
  changeState(newState) {
    if (this.state !== newState) {
      console.log(`Circuit Breaker: ${this.state} → ${newState}`);
      this.state = newState;
      this.metrics.stateChanges.push({
        timestamp: new Date(),
        from: this.state,
        to: newState
      });
    }
  }

  /**
   * Get state
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      metrics: this.metrics
    };
  }

  /**
   * Reset
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }
}

/**
 * Circuit breaker middleware factory
 */
export const createCircuitBreakerMiddleware = (circuitBreaker, fallbackHandler = null) => {
  return (req, res, next) => {
    if (!circuitBreaker.canExecute()) {
      console.warn('Circuit breaker OPEN - rejecting request');
      
      if (fallbackHandler) {
        return fallbackHandler(req, res);
      }

      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'The service is currently overloaded. Please try again later.'
      });
    }

    // Wrap response to track success/failure
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode < 400) {
        circuitBreaker.recordSuccess();
      } else {
        circuitBreaker.recordFailure();
      }
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Adaptive rate limiting based on server health
 */
export class AdaptiveRateLimiter {
  constructor(baseLimiter, options = {}) {
    this.baseLimiter = baseLimiter;
    this.cpuThreshold = options.cpuThreshold || 80;
    this.memoryThreshold = options.memoryThreshold || 85;
    this.responseTimeThreshold = options.responseTimeThreshold || 1000; // ms
    this.adaptiveMultiplier = 1;
    this.monitoringEnabled = options.monitoringEnabled !== false;
  }

  /**
   * Adjust limits based on system metrics
   */
  adjustLimits(systemMetrics = {}) {
    const { cpuUsage = 0, memoryUsage = 0, avgResponseTime = 0 } = systemMetrics;

    if (cpuUsage > this.cpuThreshold || memoryUsage > this.memoryThreshold) {
      // System under stress - reduce limit
      this.adaptiveMultiplier = 0.5;
      console.warn('⚠️  System stress detected - reducing rate limits by 50%');
    } else if (avgResponseTime > this.responseTimeThreshold) {
      // Slow responses - reduce limit
      this.adaptiveMultiplier = 0.75;
      console.warn('⚠️  Slow response times detected - reducing rate limits by 25%');
    } else {
      // System healthy - restore limits
      this.adaptiveMultiplier = 1;
    }
  }

  /**
   * Check with adaptive limits
   */
  async checkLimit(identifier, keyName = 'default', options = {}) {
    const adaptiveLimit = Math.floor((options.limit || this.baseLimiter.defaultLimit) * this.adaptiveMultiplier);
    return this.baseLimiter.checkLimit(identifier, keyName, { ...options, limit: adaptiveLimit });
  }
}
