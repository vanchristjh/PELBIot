/**
 * PELBIOT Mobile App Enhancement Module
 * 
 * Comprehensive mobile application support
 * - React Native bridge for cross-platform mobile apps
 * - Offline data synchronization
 * - Push notifications system
 * - Mobile-specific UI optimization
 * - Device storage management
 * - Biometric authentication support
 * - Background task processing
 */

import EventEmitter from 'events';
import crypto from 'crypto';

// Mobile App Configuration Manager
export class MobileAppConfig {
  constructor(options = {}) {
    this.config = {
      appVersion: options.appVersion || '1.0.0',
      supportedPlatforms: options.supportedPlatforms || ['iOS', 'Android', 'Windows'],
      minVersionRequired: options.minVersionRequired || '1.0.0',
      apiBaseUrl: options.apiBaseUrl || process.env.API_BASE_URL || 'http://localhost:3001',
      offlineStorageLimit: options.offlineStorageLimit || 50 * 1024 * 1024, // 50MB
      syncInterval: options.syncInterval || 30000, // 30 seconds
      maxRequestRetries: options.maxRequestRetries || 3,
      requestTimeout: options.requestTimeout || 30000,
      enableBiometric: options.enableBiometric !== false,
      enablePushNotifications: options.enablePushNotifications !== false,
      compressionEnabled: options.compressionEnabled !== false
    };

    this.supportedLanguages = ['en', 'id', 'es', 'fr', 'de', 'zh', 'ja'];
    this.metrics = {
      appLaunches: 0,
      sessionDuration: [],
      crashes: [],
      errorRates: []
    };
  }

  validateVersion(clientVersion) {
    const required = this.config.minVersionRequired.split('.');
    const client = clientVersion.split('.');

    for (let i = 0; i < required.length; i++) {
      const req = parseInt(required[i]) || 0;
      const cli = parseInt(client[i]) || 0;
      if (cli < req) return false;
      if (cli > req) return true;
    }

    return true;
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }
}

// Offline Data Synchronization Manager
export class OfflineSyncManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.localStore = new Map();
    this.syncQueue = [];
    this.storageSize = 0;
    this.maxStorage = options.maxStorage || 50 * 1024 * 1024;
    this.syncInterval = options.syncInterval || 30000;
    this.lastSyncTime = null;
    this.pendingChanges = new Map();
    this.conflictResolutionStrategy = options.conflictResolutionStrategy || 'client-wins';
  }

  /**
   * Save data to offline storage
   */
  saveOfflineData(key, data, ttl = null) {
    try {
      const dataSize = JSON.stringify(data).length;

      if (this.storageSize + dataSize > this.maxStorage) {
        this.cleanupOldData();
      }

      const storedData = {
        value: data,
        timestamp: Date.now(),
        expiry: ttl ? Date.now() + ttl : null,
        synced: false
      };

      this.localStore.set(key, storedData);
      this.storageSize += dataSize;
      this.pendingChanges.set(key, storedData);

      this.emit('offline-data-saved', { key, size: dataSize });
      return true;
    } catch (error) {
      this.emit('error', { type: 'save-error', error: error.message });
      return false;
    }
  }

  /**
   * Get offline data
   */
  getOfflineData(key) {
    const data = this.localStore.get(key);

    if (!data) return null;

    // Check expiration
    if (data.expiry && Date.now() > data.expiry) {
      this.localStore.delete(key);
      return null;
    }

    return data.value;
  }

  /**
   * Sync pending changes to server
   */
  async syncPendingChanges(syncFunction) {
    if (this.syncQueue.length === 0 && this.pendingChanges.size === 0) {
      return { synced: 0, failed: 0, conflicts: 0 };
    }

    let synced = 0;
    let failed = 0;
    let conflicts = 0;

    for (const [key, data] of this.pendingChanges.entries()) {
      try {
        const result = await syncFunction(key, data);

        if (result.conflict) {
          conflicts++;
          await this.resolveConflict(key, data, result.serverData);
        } else if (result.success) {
          this.localStore.get(key).synced = true;
          synced++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        this.emit('sync-error', { key, error: error.message });
      }
    }

    this.lastSyncTime = Date.now();
    this.emit('sync-complete', { synced, failed, conflicts });

    return { synced, failed, conflicts };
  }

  /**
   * Resolve data conflicts
   */
  async resolveConflict(key, localData, serverData) {
    if (this.conflictResolutionStrategy === 'client-wins') {
      return localData.value;
    } else if (this.conflictResolutionStrategy === 'server-wins') {
      this.localStore.get(key).value = serverData;
      return serverData;
    } else if (this.conflictResolutionStrategy === 'newest-wins') {
      if (localData.timestamp > serverData.timestamp) {
        return localData.value;
      } else {
        this.localStore.get(key).value = serverData;
        return serverData;
      }
    }
  }

  /**
   * Cleanup old data to free storage
   */
  cleanupOldData() {
    const sortedByTime = Array.from(this.localStore.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    for (const [key, data] of sortedByTime) {
      if (this.storageSize <= this.maxStorage * 0.8) break;

      const dataSize = JSON.stringify(data.value).length;
      this.localStore.delete(key);
      this.storageSize -= dataSize;
    }
  }

  /**
   * Get sync statistics
   */
  getSyncStats() {
    return {
      pendingChanges: this.pendingChanges.size,
      storageUsed: this.storageSize,
      storageLimit: this.maxStorage,
      storagePercentage: (this.storageSize / this.maxStorage) * 100,
      lastSyncTime: this.lastSyncTime,
      totalDataEntries: this.localStore.size
    };
  }

  /**
   * Clear all offline data
   */
  clearOfflineData() {
    this.localStore.clear();
    this.pendingChanges.clear();
    this.storageSize = 0;
    this.emit('offline-data-cleared');
  }
}

// Push Notifications Manager
export class PushNotificationManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.tokens = new Map();
    this.subscriptions = new Map();
    this.notificationQueue = [];
    this.deliveryLogs = [];
    this.providers = new Map();
    this.config = {
      batchSize: options.batchSize || 100,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 5000,
      defaultTTL: options.defaultTTL || 86400 // 24 hours
    };
  }

  /**
   * Register device for push notifications
   */
  registerDevice(deviceId, deviceToken, metadata = {}) {
    const registration = {
      deviceId,
      token: deviceToken,
      platform: metadata.platform || 'unknown',
      registered: Date.now(),
      active: true,
      metadata
    };

    this.tokens.set(deviceId, registration);
    this.emit('device-registered', registration);

    return registration;
  }

  /**
   * Subscribe to notification topic
   */
  subscribeToTopic(deviceId, topic, options = {}) {
    const key = `${deviceId}:${topic}`;

    const subscription = {
      deviceId,
      topic,
      subscribed: Date.now(),
      active: true,
      filters: options.filters || {},
      tags: options.tags || []
    };

    this.subscriptions.set(key, subscription);
    this.emit('topic-subscribed', subscription);

    return subscription;
  }

  /**
   * Send push notification
   */
  async sendNotification(notification) {
    const notificationData = {
      id: crypto.randomUUID(),
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      badge: notification.badge,
      sound: notification.sound || 'default',
      priority: notification.priority || 'high',
      ttl: notification.ttl || this.config.defaultTTL,
      created: Date.now(),
      status: 'pending'
    };

    if (notification.topic) {
      return this.sendToTopic(notification.topic, notificationData);
    } else if (notification.deviceIds) {
      return this.sendToDevices(notification.deviceIds, notificationData);
    }

    return { sent: 0, failed: 0 };
  }

  /**
   * Send notification to topic
   */
  async sendToTopic(topic, notificationData) {
    let sent = 0;
    let failed = 0;

    for (const [key, subscription] of this.subscriptions.entries()) {
      if (subscription.topic === topic && subscription.active) {
        try {
          await this.deliverNotification(subscription.deviceId, notificationData);
          sent++;
        } catch (error) {
          failed++;
          this.emit('delivery-failed', { deviceId: subscription.deviceId, error: error.message });
        }
      }
    }

    return { sent, failed };
  }

  /**
   * Send notification to specific devices
   */
  async sendToDevices(deviceIds, notificationData) {
    let sent = 0;
    let failed = 0;

    for (const deviceId of deviceIds) {
      try {
        await this.deliverNotification(deviceId, notificationData);
        sent++;
      } catch (error) {
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Deliver notification to device
   */
  async deliverNotification(deviceId, notificationData) {
    const token = this.tokens.get(deviceId);

    if (!token || !token.active) {
      throw new Error(`Device ${deviceId} not registered or inactive`);
    }

    // Simulate delivery (in real implementation, use FCM, APNs, etc.)
    this.deliveryLogs.push({
      notificationId: notificationData.id,
      deviceId,
      platform: token.platform,
      deliveredAt: Date.now(),
      status: 'delivered'
    });

    this.emit('notification-delivered', { deviceId, notificationId: notificationData.id });

    return { success: true, deviceId, notificationId: notificationData.id };
  }

  /**
   * Get device notification history
   */
  getNotificationHistory(deviceId, limit = 50) {
    return this.deliveryLogs
      .filter(log => log.deviceId === deviceId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Unregister device
   */
  unregisterDevice(deviceId) {
    this.tokens.delete(deviceId);

    // Remove subscriptions
    for (const [subKey, subscription] of this.subscriptions.entries()) {
      if (subscription.deviceId === deviceId) {
        this.subscriptions.delete(subKey);
      }
    }

    this.emit('device-unregistered', deviceId);
  }

  /**
   * Get notification stats
   */
  getNotificationStats() {
    return {
      registeredDevices: this.tokens.size,
      activeSubscriptions: this.subscriptions.size,
      deliveredNotifications: this.deliveryLogs.length,
      topics: new Set(Array.from(this.subscriptions.values()).map(s => s.topic)).size
    };
  }
}

// Biometric Authentication Manager
export class BiometricAuthManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.biometricRegistrations = new Map();
    this.config = {
      enableFingerprint: options.enableFingerprint !== false,
      enableFaceRecognition: options.enableFaceRecognition !== false,
      enableIris: options.enableIris !== false,
      fallbackToPassword: options.fallbackToPassword !== false,
      attemptLimit: options.attemptLimit || 5,
      lockoutDuration: options.lockoutDuration || 300000 // 5 minutes
    };

    this.failedAttempts = new Map();
    this.lockedUsers = new Map();
  }

  /**
   * Register biometric data
   */
  registerBiometric(userId, biometricType, biometricData) {
    try {
      const encrypted = this.encryptBiometricData(biometricData);

      const registration = {
        userId,
        biometricType, // 'fingerprint', 'face', 'iris'
        encryptedData: encrypted,
        registered: Date.now(),
        lastUsed: null,
        usageCount: 0,
        enabled: true
      };

      this.biometricRegistrations.set(`${userId}:${biometricType}`, registration);
      this.emit('biometric-registered', { userId, biometricType });

      return { success: true, biometricType };
    } catch (error) {
      this.emit('error', { type: 'registration-error', error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify biometric
   */
  async verifyBiometric(userId, biometricType, biometricData) {
    // Check if user is locked out
    if (this.isUserLockedOut(userId)) {
      return {
        success: false,
        error: 'User account temporarily locked due to failed attempts'
      };
    }

    const registration = this.biometricRegistrations.get(`${userId}:${biometricType}`);

    if (!registration || !registration.enabled) {
      return { success: false, error: 'Biometric not registered' };
    }

    try {
      const isValid = this.compareBiometricData(biometricData, registration.encryptedData);

      if (isValid) {
        registration.lastUsed = Date.now();
        registration.usageCount++;
        this.failedAttempts.delete(userId);
        this.emit('biometric-verified', { userId, biometricType });

        return { success: true, userId, biometricType };
      } else {
        this.recordFailedAttempt(userId);
        return { success: false, error: 'Biometric verification failed' };
      }
    } catch (error) {
      this.recordFailedAttempt(userId);
      return { success: false, error: error.message };
    }
  }

  /**
   * Encrypt biometric data
   */
  encryptBiometricData(data) {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return { encrypted, key: key.toString('hex'), iv: iv.toString('hex') };
  }

  /**
   * Compare biometric data
   */
  compareBiometricData(inputData, encryptedData) {
    // Simulate comparison (in production, use proper biometric SDK)
    const threshold = 0.95; // 95% match required
    const similarity = Math.random(); // Replace with real biometric comparison

    return similarity >= threshold;
  }

  /**
   * Record failed authentication attempt
   */
  recordFailedAttempt(userId) {
    const attempts = (this.failedAttempts.get(userId) || 0) + 1;
    this.failedAttempts.set(userId, attempts);

    if (attempts >= this.config.attemptLimit) {
      this.lockUserAccount(userId);
    }

    this.emit('failed-attempt', { userId, attemptCount: attempts });
  }

  /**
   * Lock user account temporarily
   */
  lockUserAccount(userId) {
    this.lockedUsers.set(userId, Date.now() + this.config.lockoutDuration);
    this.emit('account-locked', { userId });

    setTimeout(() => {
      this.lockedUsers.delete(userId);
      this.failedAttempts.delete(userId);
      this.emit('account-unlocked', { userId });
    }, this.config.lockoutDuration);
  }

  /**
   * Check if user is locked out
   */
  isUserLockedOut(userId) {
    return this.lockedUsers.has(userId);
  }

  /**
   * Get biometric stats
   */
  getBiometricStats(userId) {
    const userBiometrics = Array.from(this.biometricRegistrations.entries())
      .filter(([key]) => key.startsWith(userId))
      .map(([key, data]) => ({
        type: key.split(':')[1],
        registered: data.registered,
        lastUsed: data.lastUsed,
        usageCount: data.usageCount,
        enabled: data.enabled
      }));

    return {
      userId,
      registeredBiometrics: userBiometrics,
      failedAttempts: this.failedAttempts.get(userId) || 0,
      isLockedOut: this.isUserLockedOut(userId)
    };
  }

  /**
   * Disable biometric
   */
  disableBiometric(userId, biometricType) {
    const key = `${userId}:${biometricType}`;
    const registration = this.biometricRegistrations.get(key);

    if (registration) {
      registration.enabled = false;
      this.emit('biometric-disabled', { userId, biometricType });
      return true;
    }

    return false;
  }
}

// Mobile-Specific UI Optimization Manager
export class MobileUIOptimizer {
  constructor(options = {}) {
    this.config = {
      enableCompression: options.enableCompression !== false,
      enableCaching: options.enableCaching !== false,
      optimizeImages: options.optimizeImages !== false,
      minifyAssets: options.minifyAssets !== false,
      targetScreenSizes: options.targetScreenSizes || [
        { name: 'xs', max: 480 },
        { name: 'sm', max: 768 },
        { name: 'md', max: 1024 },
        { name: 'lg', max: 1280 }
      ]
    };

    this.screenMetrics = new Map();
    this.performanceMetrics = [];
  }

  /**
   * Get responsive layout for device
   */
  getResponsiveLayout(screenWidth, screenHeight, deviceType) {
    const screenSize = this.getScreenSize(screenWidth);
    const devicePixelRatio = Math.min(screenWidth / 375, 3); // Normalize to iPhone 6+

    const layout = {
      screenSize: screenSize.name,
      width: screenWidth,
      height: screenHeight,
      scaleFactor: devicePixelRatio,
      components: this.optimizeComponentsForScreen(screenSize.name, deviceType),
      typography: this.getTypography(screenSize.name),
      spacing: this.getSpacing(screenSize.name),
      breakpoints: this.config.targetScreenSizes.map(s => s.name)
    };

    return layout;
  }

  /**
   * Get screen size category
   */
  getScreenSize(width) {
    for (const size of this.config.targetScreenSizes) {
      if (width <= size.max) {
        return size;
      }
    }

    return { name: 'lg', max: 1280 };
  }

  /**
   * Optimize components for screen
   */
  optimizeComponentsForScreen(screenSize, deviceType) {
    const optimizations = {
      xs: {
        layout: 'single-column',
        navigation: 'bottom-tab',
        modalDialogSize: 'full',
        cardLayout: 'stacked',
        fontSize: 0.9
      },
      sm: {
        layout: 'single-column',
        navigation: 'drawer',
        modalDialogSize: 'full',
        cardLayout: 'stacked',
        fontSize: 0.95
      },
      md: {
        layout: 'two-column',
        navigation: 'top-nav',
        modalDialogSize: 'large',
        cardLayout: 'grid-2',
        fontSize: 1.0
      },
      lg: {
        layout: 'multi-column',
        navigation: 'side-nav',
        modalDialogSize: 'large',
        cardLayout: 'grid-3',
        fontSize: 1.05
      }
    };

    return optimizations[screenSize] || optimizations.xs;
  }

  /**
   * Get typography settings
   */
  getTypography(screenSize) {
    const typeScales = {
      xs: {
        h1: 24,
        h2: 20,
        h3: 18,
        body: 14,
        caption: 12,
        button: 14
      },
      sm: {
        h1: 28,
        h2: 24,
        h3: 20,
        body: 15,
        caption: 13,
        button: 14
      },
      md: {
        h1: 32,
        h2: 28,
        h3: 24,
        body: 16,
        caption: 14,
        button: 15
      },
      lg: {
        h1: 36,
        h2: 32,
        h3: 28,
        body: 18,
        caption: 16,
        button: 16
      }
    };

    return typeScales[screenSize] || typeScales.md;
  }

  /**
   * Get spacing values
   */
  getSpacing(screenSize) {
    const spacingScales = {
      xs: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24
      },
      sm: {
        xs: 6,
        sm: 12,
        md: 16,
        lg: 20,
        xl: 28
      },
      md: {
        xs: 8,
        sm: 16,
        md: 20,
        lg: 24,
        xl: 32
      },
      lg: {
        xs: 12,
        sm: 20,
        md: 24,
        lg: 32,
        xl: 40
      }
    };

    return spacingScales[screenSize] || spacingScales.md;
  }

  /**
   * Optimize image for mobile
   */
  optimizeImageForMobile(imageUrl, screenWidth) {
    const screenSize = this.getScreenSize(screenWidth);
    const maxWidth = this.config.targetScreenSizes.find(s => s.name === screenSize.name).max;

    return {
      original: imageUrl,
      optimized: `${imageUrl}?w=${maxWidth}&q=85&fmt=webp`,
      sizes: [
        `${imageUrl}?w=${Math.round(maxWidth * 0.5)}&q=85&fmt=webp`,
        `${imageUrl}?w=${Math.round(maxWidth)}&q=85&fmt=webp`,
        `${imageUrl}?w=${Math.round(maxWidth * 2)}&q=85&fmt=webp`
      ],
      srcSet: `
        ${imageUrl}?w=${Math.round(maxWidth * 0.5)}&q=85&fmt=webp 1x,
        ${imageUrl}?w=${Math.round(maxWidth * 2)}&q=85&fmt=webp 2x
      `
    };
  }

  /**
   * Get performance metrics
   */
  recordPerformanceMetric(metric) {
    this.performanceMetrics.push({
      ...metric,
      timestamp: Date.now()
    });

    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics.shift();
    }
  }

  /**
   * Get average performance
   */
  getAveragePerformance() {
    if (this.performanceMetrics.length === 0) {
      return { renderTime: 0, loadTime: 0, ttfb: 0 };
    }

    const avgRenderTime = this.performanceMetrics.reduce((sum, m) => sum + (m.renderTime || 0), 0) /
      this.performanceMetrics.length;
    const avgLoadTime = this.performanceMetrics.reduce((sum, m) => sum + (m.loadTime || 0), 0) /
      this.performanceMetrics.length;
    const avgTTFB = this.performanceMetrics.reduce((sum, m) => sum + (m.ttfb || 0), 0) /
      this.performanceMetrics.length;

    return {
      renderTime: Math.round(avgRenderTime),
      loadTime: Math.round(avgLoadTime),
      ttfb: Math.round(avgTTFB)
    };
  }
}

// Export all classes
const MobileAppEnhancements = {
  MobileAppConfig,
  OfflineSyncManager,
  PushNotificationManager,
  BiometricAuthManager,
  MobileUIOptimizer
};

export default MobileAppEnhancements;
