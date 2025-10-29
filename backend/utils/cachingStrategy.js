/**
 * PELBIOT Caching Strategy Module
 * 
 * Comprehensive multi-layer caching system
 * - In-memory caching (LRU)
 * - Redis distributed caching
 * - Cache invalidation strategies
 * - Cache warming
 * - Cache analytics
 * - TTL management
 */

import redis from 'redis';

// LRU In-Memory Cache
export class LRUCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get value from cache
   */
  get(key) {
    if (this.cache.has(key)) {
      const item = this.cache.get(key);
      
      // Check expiration
      if (item.expiry && Date.now() > item.expiry) {
        this.cache.delete(key);
        this.misses++;
        return null;
      }

      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, item);
      this.hits++;
      return item.value;
    }

    this.misses++;
    return null;
  }

  /**
   * Set value in cache
   */
  set(key, value, ttlMs = null) {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const item = {
      value,
      expiry: ttlMs ? Date.now() + ttlMs : null
    };

    this.cache.set(key, item);
  }

  /**
   * Delete from cache
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? ((this.hits / total) * 100).toFixed(2) + '%' : 'N/A',
      total
    };
  }

  /**
   * Get all keys
   */
  keys() {
    return Array.from(this.cache.keys()).filter(key => {
      const item = this.cache.get(key);
      if (item.expiry && Date.now() > item.expiry) {
        this.cache.delete(key);
        return false;
      }
      return true;
    });
  }
}

// Redis Cache Manager
export class RedisCacheManager {
  constructor(config = {}) {
    this.config = {
      host: config.host || process.env.REDIS_HOST || 'localhost',
      port: config.port || process.env.REDIS_PORT || 6379,
      password: config.password || process.env.REDIS_PASSWORD,
      db: config.db || 0
    };

    this.client = null;
    this.connected = false;
  }

  /**
   * Initialize Redis connection
   */
  async initialize() {
    try {
      this.client = redis.createClient({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db
      });

      this.client.on('error', (err) => {
        console.error('Redis connection error:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        this.connected = true;
        console.log('✅ Redis cache connected');
      });

      await this.client.connect();
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      this.connected = false;
      return false;
    }
  }

  /**
   * Get value from Redis
   */
  async get(key) {
    if (!this.connected) return null;

    try {
      const value = await this.client.get(key);
      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set value in Redis
   */
  async set(key, value, ttlSeconds = 3600) {
    if (!this.connected) return false;

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttlSeconds > 0) {
        await this.client.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Delete from Redis
   */
  async delete(key) {
    if (!this.connected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * Delete pattern
   */
  async deletePattern(pattern) {
    if (!this.connected) return 0;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      await this.client.del(keys);
      return keys.length;
    } catch (error) {
      console.error('Redis delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    if (!this.connected) return false;

    try {
      await this.client.flushDb();
      return true;
    } catch (error) {
      console.error('Redis clear error:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   */
  async getInfo() {
    if (!this.connected) return null;

    try {
      const info = await this.client.info();
      return this._parseInfo(info);
    } catch (error) {
      console.error('Redis info error:', error);
      return null;
    }
  }

  /**
   * Parse Redis info
   */
  _parseInfo(info) {
    const lines = info.split('\r\n');
    const result = {};
    let section = '';

    lines.forEach(line => {
      if (line.startsWith('#')) {
        section = line.substring(2);
        result[section] = {};
      } else if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (section && key) {
          result[section][key] = value;
        }
      }
    });

    return result;
  }

  /**
   * Close connection
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
      console.log('✅ Redis connection closed');
    }
  }
}

// Multi-Layer Cache System
export class MultiLayerCache {
  constructor(config = {}) {
    this.lruCache = new LRUCache(config.lruSize || 1000);
    this.redisManager = new RedisCacheManager(config.redis);
    this.stats = {
      lruHits: 0,
      redisHits: 0,
      misses: 0
    };
  }

  /**
   * Initialize system
   */
  async initialize() {
    return await this.redisManager.initialize();
  }

  /**
   * Get value with fallback chain
   */
  async get(key) {
    // Try L1: In-memory LRU
    let value = this.lruCache.get(key);
    if (value !== null) {
      this.stats.lruHits++;
      return value;
    }

    // Try L2: Redis
    if (this.redisManager.connected) {
      value = await this.redisManager.get(key);
      if (value !== null) {
        this.stats.redisHits++;
        // Populate L1
        this.lruCache.set(key, value);
        return value;
      }
    }

    // Miss
    this.stats.misses++;
    return null;
  }

  /**
   * Set value in both layers
   */
  async set(key, value, ttlSeconds = 3600) {
    // Set in L1: LRU
    this.lruCache.set(key, value, ttlSeconds * 1000);

    // Set in L2: Redis
    if (this.redisManager.connected) {
      await this.redisManager.set(key, value, ttlSeconds);
    }

    return true;
  }

  /**
   * Delete from both layers
   */
  async delete(key) {
    this.lruCache.delete(key);
    
    if (this.redisManager.connected) {
      await this.redisManager.delete(key);
    }

    return true;
  }

  /**
   * Invalidate pattern
   */
  async invalidatePattern(pattern) {
    // Remove from LRU
    const lruKeys = this.lruCache.keys();
    const regex = new RegExp(pattern);
    let lruCount = 0;

    lruKeys.forEach(key => {
      if (regex.test(key)) {
        this.lruCache.delete(key);
        lruCount++;
      }
    });

    // Remove from Redis
    let redisCount = 0;
    if (this.redisManager.connected) {
      redisCount = await this.redisManager.deletePattern(pattern);
    }

    return { lruInvalidated: lruCount, redisInvalidated: redisCount };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      lru: this.lruCache.getStats(),
      redis: this.redisManager.connected ? 'Connected' : 'Disconnected',
      hits: {
        lru: this.stats.lruHits,
        redis: this.stats.redisHits,
        total: this.stats.lruHits + this.stats.redisHits
      },
      misses: this.stats.misses,
      hitRate: ((this.stats.lruHits + this.stats.redisHits) / 
        (this.stats.lruHits + this.stats.redisHits + this.stats.misses) * 100).toFixed(2) + '%'
    };
  }

  /**
   * Clear all caches
   */
  async clear() {
    this.lruCache.clear();
    
    if (this.redisManager.connected) {
      await this.redisManager.clear();
    }

    return true;
  }
}

// Cache Warming Service
export class CacheWarmingService {
  constructor(multiLayerCache) {
    this.cache = multiLayerCache;
    this.warmupStrategies = [];
  }

  /**
   * Add warmup strategy
   */
  addStrategy(name, dataFetcher, ttl = 3600) {
    this.warmupStrategies.push({
      name,
      dataFetcher,
      ttl,
      lastRun: null,
      nextRun: null
    });
  }

  /**
   * Warm up specific strategy
   */
  async warmupStrategy(strategyName) {
    const strategy = this.warmupStrategies.find(s => s.name === strategyName);
    if (!strategy) {
      throw new Error(`Strategy not found: ${strategyName}`);
    }

    try {
      const data = await strategy.dataFetcher();
      
      // Store in cache with strategy-specific prefix
      const cacheKey = `warmup:${strategyName}`;
      await this.cache.set(cacheKey, data, strategy.ttl);

      strategy.lastRun = Date.now();
      strategy.nextRun = Date.now() + (strategy.ttl * 1000);

      return { success: true, dataSize: Object.keys(data).length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Warm up all strategies
   */
  async warmupAll() {
    const results = {};

    for (const strategy of this.warmupStrategies) {
      results[strategy.name] = await this.warmupStrategy(strategy.name);
    }

    return results;
  }

  /**
   * Get warmup status
   */
  getStatus() {
    return this.warmupStrategies.map(s => ({
      name: s.name,
      ttl: s.ttl,
      lastRun: s.lastRun ? new Date(s.lastRun).toISOString() : 'Never',
      nextRun: s.nextRun ? new Date(s.nextRun).toISOString() : 'Pending'
    }));
  }
}

// Cache Invalidation Manager
export class CacheInvalidationManager {
  constructor(multiLayerCache) {
    this.cache = multiLayerCache;
    this.invalidationRules = [];
  }

  /**
   * Add invalidation rule
   */
  addRule(trigger, pattern, description = '') {
    this.invalidationRules.push({
      trigger,  // e.g., 'user_update', 'device_change'
      pattern,  // Cache key pattern to invalidate
      description,
      enabled: true
    });
  }

  /**
   * Trigger invalidation
   */
  async onTrigger(triggerName) {
    const applicableRules = this.invalidationRules.filter(
      r => r.trigger === triggerName && r.enabled
    );

    const results = [];

    for (const rule of applicableRules) {
      const result = await this.cache.invalidatePattern(rule.pattern);
      results.push({
        trigger: triggerName,
        pattern: rule.pattern,
        description: rule.description,
        invalidated: result
      });
    }

    return results;
  }

  /**
   * Get all rules
   */
  getRules() {
    return this.invalidationRules;
  }

  /**
   * Disable rule
   */
  disableRule(trigger, pattern) {
    const rule = this.invalidationRules.find(r => r.trigger === trigger && r.pattern === pattern);
    if (rule) {
      rule.enabled = false;
    }
  }

  /**
   * Enable rule
   */
  enableRule(trigger, pattern) {
    const rule = this.invalidationRules.find(r => r.trigger === trigger && r.pattern === pattern);
    if (rule) {
      rule.enabled = true;
    }
  }
}

// Middleware for HTTP caching
export function cachingMiddleware(multiLayerCache, cacheDuration = 300) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `http:${req.method}:${req.originalUrl}`;

    // Try to get from cache
    const cachedResponse = await multiLayerCache.get(cacheKey);
    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // Intercept response
    const originalSend = res.json;
    res.json = function(data) {
      // Cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        multiLayerCache.set(cacheKey, data, cacheDuration);
        res.set('X-Cache', 'MISS');
      }

      return originalSend.call(this, data);
    };

    next();
  };
}

// Export for use
const CachingStrategies = {
  LRUCache,
  RedisCacheManager,
  MultiLayerCache,
  CacheWarmingService,
  CacheInvalidationManager,
  cachingMiddleware
};

export default CachingStrategies;
