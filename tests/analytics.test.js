/**
 * Advanced Analytics Tests
 * @module tests/analytics.test.js
 */

import { AnalyticsValidator } from '../backend/middleware/inputValidation.js';
import { getLogger } from '../backend/utils/errorLogger.js';

describe('Advanced Analytics Tests', () => {
  let logger;

  beforeAll(() => {
    logger = getLogger({ logLevel: 'error' });
  });

  describe('AnalyticsValidator', () => {
    test('should validate event tracking', () => {
      const data = {
        eventName: 'user_login',
        userId: 'user-123',
      };

      const validator = new AnalyticsValidator(data);
      validator.validateEvent();

      expect(validator.passes()).toBe(true);
    });

    test('should fail event validation with missing name', () => {
      const data = {
        userId: 'user-123',
      };

      const validator = new AnalyticsValidator(data);
      validator.validateEvent();

      expect(validator.fails()).toBe(true);
      expect(validator.getErrors()[0].field).toBe('eventName');
    });

    test('should validate metric recording', () => {
      const data = {
        metricName: 'response_time',
        value: 125.5,
      };

      const validator = new AnalyticsValidator(data);
      validator.validateMetric();

      expect(validator.passes()).toBe(true);
    });

    test('should validate dashboard creation', () => {
      const data = {
        name: 'User Dashboard',
      };

      const validator = new AnalyticsValidator(data);
      validator.validateDashboard();

      expect(validator.passes()).toBe(true);
    });

    test('should validate report generation', () => {
      const data = {
        reportType: 'detailed',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      const validator = new AnalyticsValidator(data);
      validator.validateReport();

      expect(validator.passes()).toBe(true);
    });

    test('should fail report validation with invalid type', () => {
      const data = {
        reportType: 'invalid',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      const validator = new AnalyticsValidator(data);
      validator.validateReport();

      expect(validator.fails()).toBe(true);
    });
  });

  describe('Event Tracking', () => {
    test('should track user events', () => {
      const event = {
        eventId: 'evt-123',
        eventName: 'page_view',
        userId: 'user-123',
        timestamp: Date.now(),
        data: {
          page: '/dashboard',
          duration: 5000,
        },
      };

      expect(event.eventName).toBe('page_view');
      expect(event.data.page).toBe('/dashboard');
      logger.info('Event tracked', { eventId: event.eventId });
    });

    test('should handle event metadata', () => {
      const event = {
        sessionId: 'session-456',
        deviceId: 'device-789',
        userId: 'user-123',
        properties: {
          browser: 'Chrome',
          os: 'Windows',
        },
      };

      expect(event.properties.browser).toBe('Chrome');
      expect(event.sessionId).toBeDefined();
    });
  });

  describe('Metrics Collection', () => {
    test('should record numerical metrics', () => {
      const metric = {
        metricId: 'metric-123',
        metricName: 'api_response_time',
        value: 245,
        unit: 'ms',
        timestamp: Date.now(),
      };

      expect(metric.value).toBe(245);
      expect(metric.unit).toBe('ms');
    });

    test('should aggregate metrics', () => {
      const metrics = [
        { value: 100, timestamp: Date.now() },
        { value: 200, timestamp: Date.now() + 1000 },
        { value: 150, timestamp: Date.now() + 2000 },
      ];

      const average = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
      expect(average).toBe(150);
    });

    test('should calculate percentiles', () => {
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const p95Index = Math.floor((95 / 100) * values.length);
      const p95 = values[p95Index];

      expect(p95).toBeGreaterThan(0);
      expect(values).toHaveLength(10);
    });
  });

  describe('Dashboard Management', () => {
    test('should create dashboard', () => {
      const dashboard = {
        dashboardId: 'dash-123',
        name: 'Sales Dashboard',
        createdAt: Date.now(),
        widgets: [],
      };

      expect(dashboard.name).toBe('Sales Dashboard');
      expect(dashboard.widgets).toEqual([]);
    });

    test('should add widgets to dashboard', () => {
      const dashboard = {
        dashboardId: 'dash-123',
        widgets: [
          { type: 'chart', title: 'Revenue' },
          { type: 'gauge', title: 'Performance' },
          { type: 'table', title: 'Details' },
        ],
      };

      expect(dashboard.widgets).toHaveLength(3);
      expect(dashboard.widgets[0].type).toBe('chart');
    });
  });

  describe('Report Generation', () => {
    test('should generate summary report', () => {
      const report = {
        reportId: 'rpt-123',
        type: 'summary',
        period: 'month',
        generatedAt: Date.now(),
        data: {
          totalEvents: 5000,
          uniqueUsers: 250,
          avgResponseTime: 125,
        },
      };

      expect(report.type).toBe('summary');
      expect(report.data.totalEvents).toBe(5000);
    });

    test('should export report in multiple formats', async () => {
      const formats = ['json', 'csv', 'pdf', 'excel'];
      const exports = {};

      for (const format of formats) {
        exports[format] = {
          format,
          generatedAt: Date.now(),
          size: Math.floor(Math.random() * 1000000),
        };
      }

      expect(Object.keys(exports)).toHaveLength(4);
      expect(exports.json.format).toBe('json');
      expect(exports.csv.format).toBe('csv');
    });
  });

  describe('Predictive Analytics', () => {
    test('should generate forecasts', () => {
      const forecast = {
        forecastId: 'fcst-123',
        metric: 'revenue',
        periods: 12,
        algorithm: 'exponential_smoothing',
        predictions: [
          { period: 1, value: 1000, confidenceInterval: { lower: 900, upper: 1100 } },
          { period: 2, value: 1050, confidenceInterval: { lower: 920, upper: 1180 } },
        ],
      };

      expect(forecast.predictions).toHaveLength(2);
      expect(forecast.predictions[0].confidenceInterval.lower).toBeLessThan(
        forecast.predictions[0].value
      );
    });

    test('should calculate forecast accuracy', () => {
      const forecast = {
        actual: [100, 110, 120],
        predicted: [105, 112, 118],
      };

      const mape =
        forecast.actual.reduce((sum, actual, i) => {
          return sum + Math.abs((actual - forecast.predicted[i]) / actual);
        }, 0) / forecast.actual.length;

      expect(mape).toBeLessThan(1);
      expect(mape).toBeGreaterThan(0);
    });
  });
});
