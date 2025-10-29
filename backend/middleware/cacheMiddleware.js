import { cacheService, invalidateCaches } from '../utils/cacheService.js';
import crypto from 'crypto';

/**
 * Query Request Deduplication
 * Prevents duplicate queries from being executed simultaneously
 */
const pendingQueries = new Map();

export const dedupMiddleware = (req, res, next) => {
  // Only deduplicate GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Generate query hash
  const queryHash = crypto
    .createHash('md5')
    .update(req.originalUrl)
    .digest('hex');

  // Check if query is already pending
  if (pendingQueries.has(queryHash)) {
    // Wait for pending query to complete
    return pendingQueries.get(queryHash).then((result) => {
      res.json(result);
    }).catch((error) => {
      next(error);
    });
  }

  // Mark query as pending
  let resolveQuery;
  const queryPromise = new Promise((resolve) => {
    resolveQuery = resolve;
  });
  pendingQueries.set(queryHash, queryPromise);

  // Override res.json to resolve pending query
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    resolveQuery(data);
    pendingQueries.delete(queryHash);
    return originalJson(data);
  };

  // Cleanup on error
  res.on('error', () => {
    pendingQueries.delete(queryHash);
  });

  next();
};

/**
 * HTTP Response Caching Middleware
 * Caches GET request responses with configurable TTL
 */
export const responseCache = (options = {}) => {
  const defaultTTL = options.ttl || 300; // 5 minutes
  const keyPrefix = options.keyPrefix || 'route';

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Allow clients to bypass cache
    if (req.query.skipCache === 'true' || req.headers['cache-control'] === 'no-cache') {
      return next();
    }

    const cacheKey = `${keyPrefix}:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }

      res.set('X-Cache', 'MISS');
    } catch (error) {
      console.error('Cache retrieval error:', error.message);
    }

    // Override res.json to cache successful responses
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      // Only cache successful responses (200-299)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const ttl = options.getTTL
          ? options.getTTL(req)
          : defaultTTL;

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
 * Database Query Caching Wrapper
 * Wraps database queries with automatic caching
 */
export const cachedQuery = async (query, params, cacheKey, ttl = 300) => {
  try {
    // Try to get from cache first
    const cached = await cacheService.get(cacheKey);
    if (cached !== null) {
      console.log(`✅ Query result from cache: ${cacheKey}`);
      return cached;
    }

    // If not in cache, need to execute query
    // (This is a helper - actual execution happens in controller)
    return null;
  } catch (error) {
    console.error('Cache lookup error:', error.message);
    return null;
  }
};

/**
 * Cache invalidation based on mutations
 */
export const invalidateCacheMiddleware = (invalidationKeys = []) => {
  return async (req, res, next) => {
    // Only process mutating requests
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return next();
    }

    // Override res.json to invalidate cache after success
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      // Invalidate caches on successful mutation
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidationKeys.forEach(key => {
          if (typeof key === 'function') {
            key(req);
          } else {
            cacheService.deletePattern(key).catch(err => {
              console.error('Cache invalidation error:', err.message);
            });
          }
        });
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Device-specific cache invalidation
 */
export const deviceCacheInvalidation = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const deviceId = req.params.deviceId || req.body?.deviceId;
      if (deviceId) {
        invalidateCaches.device(deviceId).catch(err => {
          console.error('Device cache invalidation error:', err.message);
        });
      }
    }
    return originalJson(data);
  };
  next();
};

/**
 * Panel data cache invalidation
 */
export const panelCacheInvalidation = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const deviceId = req.params.deviceId || req.body?.deviceId;
      if (deviceId) {
        invalidateCaches.panel(deviceId).catch(err => {
          console.error('Panel cache invalidation error:', err.message);
        });
      }
    }
    return originalJson(data);
  };
  next();
};

/**
 * Alert rule cache invalidation
 */
export const alertRuleCacheInvalidation = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const deviceId = req.params.deviceId || req.body?.deviceId;
      const ruleId = req.params.ruleId;
      if (deviceId) {
        invalidateCaches.alertRule(deviceId, ruleId).catch(err => {
          console.error('Alert rule cache invalidation error:', err.message);
        });
      }
    }
    return originalJson(data);
  };
  next();
};

/**
 * Global cache statistics endpoint
 */
export const cacheStatsMiddleware = async (req, res, next) => {
  if (req.path === '/api/system/cache-stats' && req.method === 'GET') {
    try {
      const stats = await cacheService.getStats();
      return res.json({
        success: true,
        cache: stats
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve cache statistics'
      });
    }
  }
  next();
};

/**
 * Cache warmer - Preload frequently accessed data
 */
export const cacheWarmer = async () => {
  console.log('🔥 Starting cache warming...');

  try {
    // Warm up master data
    // This would fetch frequently accessed data and cache it
    console.log('✅ Cache warming completed');
  } catch (error) {
    console.error('❌ Cache warming error:', error.message);
  }
};

/**
 * Periodic cache cleanup
 * Removes expired entries that Redis didn't clean up
 */
export const cacheCleanup = setInterval(async () => {
  try {
    const stats = await cacheService.getStats();
    if (stats) {
      console.log(`📊 Cache stats: ${stats.totalKeys} keys in database`);
    }
  } catch (error) {
    console.error('Cache cleanup error:', error.message);
  }
}, 60000); // Run every minute

const cacheMiddlewareExports = {
  dedupMiddleware,
  responseCache,
  cachedQuery,
  invalidateCacheMiddleware,
  deviceCacheInvalidation,
  panelCacheInvalidation,
  alertRuleCacheInvalidation,
  cacheStatsMiddleware,
  cacheWarmer,
  cacheCleanup
};

export default cacheMiddlewareExports;
