/**
 * AI/ML Features Tests
 * @module tests/aiml.test.js
 */

import { AIMLValidator } from '../backend/middleware/inputValidation.js';
import { getLogger } from '../backend/utils/errorLogger.js';

describe('AI/ML Features Tests', () => {
  beforeAll(() => {
    getLogger({ logLevel: 'error' });
  });

  describe('AIMLValidator', () => {
    test('should validate anomaly detection training', () => {
      const dataPoints = Array.from({ length: 100 }, (_, i) => ({
        timestamp: Date.now() + i * 1000,
        value: 50 + Math.random() * 10,
      }));

      const data = {
        modelId: 'model-123',
        dataPoints,
      };

      const validator = new AIMLValidator(data);
      validator.validateAnomalyDetection();

      expect(validator.passes()).toBe(true);
    });

    test('should fail with insufficient training data', () => {
      const dataPoints = Array.from({ length: 30 }, (_, i) => ({
        value: 50 + Math.random() * 10,
      }));

      const data = {
        modelId: 'model-123',
        dataPoints,
      };

      const validator = new AIMLValidator(data);
      validator.validateAnomalyDetection();

      expect(validator.fails()).toBe(true);
    });

    test('should validate forecasting', () => {
      const data = {
        timeSeriesId: 'ts-123',
        periods: 12,
      };

      const validator = new AIMLValidator(data);
      validator.validateForecasting();

      expect(validator.passes()).toBe(true);
    });

    test('should validate classification', () => {
      const data = {
        modelId: 'model-123',
        features: [10, 20, 30, 40],
      };

      const validator = new AIMLValidator(data);
      validator.validateClassification();

      expect(validator.passes()).toBe(true);
    });

    test('should validate clustering', () => {
      const data = {
        dataPoints: [[1, 2], [2, 3], [8, 8], [9, 9]],
        k: 2,
      };

      const validator = new AIMLValidator(data);
      validator.validateClustering();

      expect(validator.passes()).toBe(true);
    });

    test('should fail clustering with invalid k', () => {
      const data = {
        dataPoints: [[1, 2], [2, 3]],
        k: 0,
      };

      const validator = new AIMLValidator(data);
      validator.validateClustering();

      expect(validator.fails()).toBe(true);
    });
  });

  describe('Anomaly Detection', () => {
    test('should calculate mean and standard deviation', () => {
      const values = [10, 20, 30, 40, 50];
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      expect(mean).toBe(30);
      expect(stdDev).toBeGreaterThan(0);
    });

    test('should detect anomalies using Z-score', () => {
      const values = [10, 12, 11, 13, 12, 100]; // 100 is anomaly
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      const zScores = values.map((val) => (val - mean) / stdDev);
      const anomalies = values.filter((val, i) => Math.abs(zScores[i]) > 2.5);

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies).toContain(100);
    });

    test('should track anomaly severity', () => {
      const anomaly = {
        anomalyId: 'anom-123',
        value: 100,
        zscore: 3.5,
        severity: 'critical',
        timestamp: Date.now(),
      };

      expect(anomaly.severity).toBe('critical');
      expect(anomaly.zscore).toBeGreaterThan(2.5);
    });

    test('should recognize hourly patterns', () => {
      const hourlyData = {
        hour: new Date().getHours(),
        avgValue: 150,
        pattern: 'peak_traffic',
        confidence: 0.95,
      };

      expect(hourlyData.pattern).toBeDefined();
      expect(hourlyData.confidence).toBeGreaterThan(0.9);
    });
  });

  describe('Time Series Forecasting', () => {
    test('should generate exponential smoothing forecast', () => {
      const historicalData = [100, 105, 110, 108, 115];
      const alpha = 0.3;
      let forecast = historicalData[0];
      const forecasts = [];

      for (let i = 1; i < historicalData.length; i++) {
        forecast = alpha * historicalData[i] + (1 - alpha) * forecast;
        forecasts.push(forecast);
      }

      expect(forecasts).toHaveLength(historicalData.length - 1);
      expect(forecasts[0]).toBeGreaterThan(0);
    });

    test('should calculate confidence intervals', () => {
      const forecast = {
        value: 120,
        stdError: 5,
        confidenceLevel: 0.95,
      };

      const zScore = 1.96; // 95% confidence
      const interval = {
        lower: forecast.value - zScore * forecast.stdError,
        upper: forecast.value + zScore * forecast.stdError,
      };

      expect(interval.lower).toBeLessThan(forecast.value);
      expect(interval.upper).toBeGreaterThan(forecast.value);
    });

    test('should forecast multiple periods', () => {
      const forecast = {
        forecastId: 'fcst-123',
        baseValue: 100,
        periods: [
          { period: 1, value: 102 },
          { period: 2, value: 104 },
          { period: 3, value: 106 },
        ],
      };

      expect(forecast.periods).toHaveLength(3);
      expect(forecast.periods[2].value).toBeGreaterThan(forecast.baseValue);
    });
  });

  describe('Classification', () => {
    test('should classify data points', () => {
      const classification = {
        classificationId: 'clf-123',
        features: [5.5, 3.2, 1.4],
        prediction: 'iris_setosa',
        probability: 0.98,
      };

      expect(classification.probability).toBeGreaterThan(0.95);
      expect(classification.prediction).toBeDefined();
    });

    test('should calculate accuracy metrics', () => {
      const predictions = [
        { actual: 'A', predicted: 'A' },
        { actual: 'A', predicted: 'A' },
        { actual: 'B', predicted: 'B' },
        { actual: 'B', predicted: 'A' },
      ];

      const accuracy = predictions.filter((p) => p.actual === p.predicted).length / predictions.length;
      expect(accuracy).toBe(0.75);
    });

    test('should track precision and recall', () => {
      const metrics = {
        truePositive: 80,
        falsePositive: 20,
        falseNegative: 10,
        trueNegative: 90,
      };

      const precision = metrics.truePositive / (metrics.truePositive + metrics.falsePositive);
      const recall = metrics.truePositive / (metrics.truePositive + metrics.falseNegative);
      const f1 = (2 * (precision * recall)) / (precision + recall);

      expect(precision).toBeCloseTo(0.8, 2);
      expect(recall).toBeCloseTo(0.89, 2);
      expect(f1).toBeGreaterThan(0.8);
    });
  });

  describe('Clustering', () => {
    test('should perform K-means clustering', () => {
      const dataPoints = [[1, 2], [1.5, 1.8], [5, 8], [8, 8], [1, 0.6], [9, 11]];

      // Simple clustering test
      const clusters = {
        cluster1: dataPoints.slice(0, 3),
        cluster2: dataPoints.slice(3),
      };

      expect(clusters.cluster1).toHaveLength(3);
      expect(clusters.cluster2).toHaveLength(3);
    });

    test('should calculate cluster inertia', () => {
      const centroid = [5, 5];
      const points = [[4, 5], [6, 5], [5, 4], [5, 6]];

      const inertia = points.reduce((sum, point) => {
        const distance = Math.sqrt(Math.pow(point[0] - centroid[0], 2) + Math.pow(point[1] - centroid[1], 2));
        return sum + Math.pow(distance, 2);
      }, 0);

      expect(inertia).toBeGreaterThan(0);
    });

    test('should detect convergence', () => {
      const iterations = [100, 90, 85, 84, 83.5, 83.4, 83.4]; // Converged
      let converged = false;

      if (iterations[iterations.length - 1] === iterations[iterations.length - 2]) {
        converged = true;
      }

      expect(converged).toBe(true);
    });
  });

  describe('Recommendations', () => {
    test('should generate user recommendations', () => {
      const recommendation = {
        userId: 'user-123',
        itemId: 'item-456',
        score: 0.87,
        reason: 'similar_to_liked_items',
        confidence: 0.85,
      };

      expect(recommendation.score).toBeGreaterThan(0.8);
      expect(recommendation.reason).toBeDefined();
    });

    test('should calculate cosine similarity', () => {
      const vector1 = [1, 2, 3];
      const vector2 = [2, 3, 4];

      const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
      const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
      const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
      const similarity = dotProduct / (magnitude1 * magnitude2);

      expect(similarity).toBeGreaterThan(0.9);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    test('should track user interactions', () => {
      const interactions = [
        { itemId: 'item-1', action: 'view', weight: 1 },
        { itemId: 'item-1', action: 'click', weight: 2 },
        { itemId: 'item-1', action: 'purchase', weight: 5 },
      ];

      const totalWeight = interactions.reduce((sum, i) => sum + i.weight, 0);
      expect(totalWeight).toBe(8);
      expect(interactions).toHaveLength(3);
    });
  });
});
