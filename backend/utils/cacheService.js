import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

// Connection event handlers
redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redis.on('reconnecting', () => {
  console.log('🔄 Reconnecting to Redis...');
});

/**
 * Cache Service - Manages all caching operations
 */
export const cacheService = {
  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  set: async (key, value, ttl = null) => {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
      console.log(`✅ Cache SET: ${key}`);
    } catch (error) {
      console.error(`❌ Cache SET error for ${key}:`, error.message);
    }
  },

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  get: async (key) => {
    try {
      const value = await redis.get(key);
      if (value) {
        console.log(`✅ Cache HIT: ${key}`);
        return JSON.parse(value);
      }
      console.log(`⚠️  Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error(`❌ Cache GET error for ${key}:`, error.message);
      return null;
    }
  },

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  delete: async (key) => {
    try {
      await redis.del(key);
      console.log(`✅ Cache DELETE: ${key}`);
    } catch (error) {
      console.error(`❌ Cache DELETE error for ${key}:`, error.message);
    }
  },

  /**
   * Delete multiple keys matching pattern
   * @param {string} pattern - Key pattern (e.g., 'device:*')
   */
  deletePattern: async (pattern) => {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`✅ Cache DELETE pattern: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      console.error(`❌ Cache DELETE pattern error for ${pattern}:`, error.message);
    }
  },

  /**
   * Clear all cache
   */
  clear: async () => {
    try {
      await redis.flushdb();
      console.log('✅ Cache cleared all');
    } catch (error) {
      console.error('❌ Cache clear error:', error.message);
    }
  },

  /**
   * Get cache statistics
   */
  getStats: async () => {
    try {
      const info = await redis.info('stats');
      const keys = await redis.dbsize();
      return {
        totalKeys: keys,
        info: info
      };
    } catch (error) {
      console.error('❌ Cache stats error:', error.message);
      return null;
    }
  },

  /**
   * Check if key exists
   */
  exists: async (key) => {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ Cache EXISTS error for ${key}:`, error.message);
      return false;
    }
  },

  /**
   * Get remaining TTL for a key
   */
  getTTL: async (key) => {
    try {
      const ttl = await redis.ttl(key);
      return ttl;
    } catch (error) {
      console.error(`❌ Cache TTL error for ${key}:`, error.message);
      return -1;
    }
  },

  /**
   * Set multiple keys at once
   */
  mset: async (keyValuePairs) => {
    try {
      const pipeline = redis.pipeline();
      for (const [key, value] of Object.entries(keyValuePairs)) {
        pipeline.set(key, JSON.stringify(value));
      }
      await pipeline.exec();
      console.log(`✅ Cache MSET: ${Object.keys(keyValuePairs).length} keys`);
    } catch (error) {
      console.error('❌ Cache MSET error:', error.message);
    }
  },

  /**
   * Get multiple keys at once
   */
  mget: async (keys) => {
    try {
      const values = await redis.mget(...keys);
      const result = {};
      keys.forEach((key, index) => {
        result[key] = values[index] ? JSON.parse(values[index]) : null;
      });
      console.log(`✅ Cache MGET: ${keys.length} keys`);
      return result;
    } catch (error) {
      console.error('❌ Cache MGET error:', error.message);
      return {};
    }
  },

  /**
   * Increment a numeric value
   */
  increment: async (key, amount = 1) => {
    try {
      const result = await redis.incrby(key, amount);
      console.log(`✅ Cache INCR: ${key} (${result})`);
      return result;
    } catch (error) {
      console.error(`❌ Cache INCR error for ${key}:`, error.message);
      return null;
    }
  },

  /**
   * Add to a list
   */
  listPush: async (key, ...values) => {
    try {
      await redis.rpush(key, ...values);
      console.log(`✅ Cache RPUSH: ${key} (${values.length} items)`);
    } catch (error) {
      console.error(`❌ Cache RPUSH error for ${key}:`, error.message);
    }
  },

  /**
   * Get list range
   */
  listRange: async (key, start = 0, end = -1) => {
    try {
      const values = await redis.lrange(key, start, end);
      console.log(`✅ Cache LRANGE: ${key} (${values.length} items)`);
      return values;
    } catch (error) {
      console.error(`❌ Cache LRANGE error for ${key}:`, error.message);
      return [];
    }
  }
};

/**
 * Query Cache Keys - Standard key patterns
 */
export const cacheKeys = {
  // Device caching
  device: (id) => `device:${id}`,
  deviceList: (page = 1, limit = 10) => `devices:list:${page}:${limit}`,
  deviceStatus: (id) => `device:${id}:status`,
  allDevices: 'devices:all',

  // Panel caching
  panel: (id) => `panel:${id}`,
  panelLatest: (deviceId) => `panel:${deviceId}:latest`,
  panelList: (deviceId, page = 1, limit = 20) => `panel:${deviceId}:list:${page}:${limit}`,
  panelData: (deviceId, timeRange) => `panel:${deviceId}:data:${timeRange}`,

  // Trend caching
  trend: (deviceId, period) => `trend:${deviceId}:${period}`,
  trendStats: (deviceId) => `trend:${deviceId}:stats`,
  trendAnalysis: (deviceId, timeRange) => `trend:${deviceId}:analysis:${timeRange}`,

  // Alert caching
  alert: (id) => `alert:${id}`,
  alertList: (deviceId, page = 1) => `alert:${deviceId}:list:${page}`,
  alertStats: (deviceId) => `alert:${deviceId}:stats`,
  activeAlerts: (deviceId) => `alert:${deviceId}:active`,

  // Alert Rules caching
  alertRule: (id) => `alert-rule:${id}`,
  alertRuleList: (deviceId, page = 1) => `alert-rule:${deviceId}:list:${page}`,
  alertRuleAll: (deviceId) => `alert-rule:${deviceId}:all`,
  alertRulesByMetric: (deviceId, metric) => `alert-rule:${deviceId}:metric:${metric}`,

  // Alert Triggers caching
  alertTrigger: (id) => `alert-trigger:${id}`,
  alertTriggerHistory: (ruleId, page = 1) => `alert-trigger:${ruleId}:history:${page}`,

  // Load Profile caching
  loadProfile: (deviceId) => `load-profile:${deviceId}`,
  loadProfileList: (page = 1) => `load-profile:list:${page}`,

  // Report caching
  report: (id) => `report:${id}`,
  reportList: (deviceId, page = 1) => `report:${deviceId}:list:${page}`,

  // Master data caching
  metrics: 'master:metrics',
  units: 'master:units',

  // System caching
  systemHealth: 'system:health',
  systemConfig: 'system:config',

  // Session caching
  session: (userId) => `session:${userId}`,
  userSessions: (userId) => `user:${userId}:sessions`,

  // Rate limiting
  rateLimit: (identifier) => `rate-limit:${identifier}`,

  // Query deduplication
  queryPending: (hash) => `query:pending:${hash}`
};

/**
 * Middleware for caching GET requests
 */
export const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated requests with user-specific data
    if (req.query.skipCache === 'true') {
      return next();
    }

    const cacheKey = `route:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      // Continue without cache on error
    }

    // Override res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      // Cache successful responses
      if (res.statusCode === 200) {
        cacheService.set(cacheKey, data, ttl).catch(err => {
          console.error('Failed to cache response:', err.message);
        });
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalidate related caches when data changes
 */
export const invalidateCaches = {
  /**
   * Invalidate all device caches
   */
  device: async (deviceId) => {
    const keys = [
      cacheKeys.device(deviceId),
      cacheKeys.deviceStatus(deviceId),
      cacheKeys.allDevices,
      `devices:list:*`,
      cacheKeys.panelLatest(deviceId),
      `panel:${deviceId}:*`,
      `trend:${deviceId}:*`,
      `alert:${deviceId}:*`,
      `alert-rule:${deviceId}:*`
    ];

    for (const key of keys) {
      if (key.includes('*')) {
        await cacheService.deletePattern(key);
      } else {
        await cacheService.delete(key);
      }
    }
  },

  /**
   * Invalidate all panel caches for device
   */
  panel: async (deviceId) => {
    const patterns = [
      `panel:${deviceId}:*`,
      `trend:${deviceId}:*`
    ];

    for (const pattern of patterns) {
      await cacheService.deletePattern(pattern);
    }
  },

  /**
   * Invalidate alert rule caches
   */
  alertRule: async (deviceId, ruleId = null) => {
    if (ruleId) {
      await cacheService.delete(cacheKeys.alertRule(ruleId));
    }
    await cacheService.deletePattern(`alert-rule:${deviceId}:*`);
  },

  /**
   * Invalidate alert trigger caches
   */
  alertTrigger: async (ruleId) => {
    await cacheService.deletePattern(`alert-trigger:${ruleId}:*`);
  },

  /**
   * Invalidate all caches
   */
  all: async () => {
    await cacheService.clear();
    console.log('✅ All caches invalidated');
  }
};

export default redis;
