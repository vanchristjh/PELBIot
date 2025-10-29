/**
 * Sensor Data Validation & Quality Service
 * Validasi data dari sensor, deteksi anomali, dan quality scoring
 */

import { query } from '../utils/database.js';

class SensorDataValidationService {
  constructor() {
    this.thresholds = {
      outlierStdDev: 3, // Standard deviations untuk outlier detection
      minDataPoints: 5, // Minimum points untuk statistical analysis
      staleDataLimit: 60000, // 60 seconds
    };
    this.validationRules = new Map(); // Per-sensor rules
  }

  /**
   * Validate sensor data
   */
  async validateData(sensorId, value, sensorConfig) {
    const errors = [];
    const warnings = [];
    let qualityScore = 100;

    // 1. Basic type check
    if (typeof value !== 'number') {
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
          errors.push('Invalid value: tidak bisa diparse menjadi number');
          return { valid: false, errors, warnings, qualityScore: 0 };
        }
        value = parsed;
      } else {
        errors.push('Value harus berupa number');
        return { valid: false, errors, warnings, qualityScore: 0 };
      }
    }

    // 2. Check NaN dan Infinity
    if (isNaN(value) || !isFinite(value)) {
      errors.push('Value adalah NaN atau Infinity');
      return { valid: false, errors, warnings, qualityScore: 0 };
    }

    // 3. Range check
    if (sensorConfig.min_value !== null && sensorConfig.min_value !== undefined) {
      if (value < sensorConfig.min_value) {
        warnings.push(
          `Value ${value} dibawah minimum ${sensorConfig.min_value}`
        );
        qualityScore -= 20;
      }
    }

    if (sensorConfig.max_value !== null && sensorConfig.max_value !== undefined) {
      if (value > sensorConfig.max_value) {
        warnings.push(
          `Value ${value} diatas maximum ${sensorConfig.max_value}`
        );
        qualityScore -= 20;
      }
    }

    // 4. Statistical anomaly detection
    try {
      const anomalyCheck = await this._detectAnomaly(sensorId, value);
      if (anomalyCheck.isAnomaly) {
        warnings.push(
          `Possible anomaly: ${anomalyCheck.reason}`
        );
        qualityScore -= 15;
      }
    } catch (error) {
      console.warn('Anomaly detection error:', error.message);
    }

    // 5. Rate of change check
    try {
      const rateCheck = await this._checkRateOfChange(sensorId, value);
      if (rateCheck.excessive) {
        warnings.push(
          `Excessive rate of change: ${rateCheck.rate.toFixed(2)}/s`
        );
        qualityScore -= 10;
      }
    } catch (error) {
      console.warn('Rate of change check error:', error.message);
    }

    qualityScore = Math.max(0, Math.min(100, qualityScore));

    return {
      valid: errors.length === 0,
      value,
      errors,
      warnings,
      qualityScore,
      timestamp: new Date()
    };
  }

  /**
   * Detect anomaly menggunakan statistical method
   */
  async _detectAnomaly(sensorId, currentValue) {
    try {
      // Get last N data points
      const [recentData] = await query(
        `SELECT value FROM sensor_data 
         WHERE sensor_id = ? 
         ORDER BY timestamp DESC 
         LIMIT ?`,
        [sensorId, this.thresholds.minDataPoints]
      );

      if (!recentData || recentData.length < this.thresholds.minDataPoints) {
        return { isAnomaly: false, reason: 'Insufficient data for analysis' };
      }

      const values = recentData.map(d => d.value);
      values.push(currentValue);

      // Calculate mean dan std deviation
      const mean = values.reduce((a, b) => a + b) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
      );

      // Check if value is outlier (beyond 3 std dev)
      const zScore = Math.abs((currentValue - mean) / stdDev);

      if (zScore > this.thresholds.outlierStdDev) {
        return {
          isAnomaly: true,
          reason: `Z-Score ${zScore.toFixed(2)} > ${this.thresholds.outlierStdDev}`,
          zScore,
          mean,
          stdDev
        };
      }

      return { isAnomaly: false, reason: 'Normal range' };
    } catch (error) {
      return { isAnomaly: false, reason: 'Analysis skipped' };
    }
  }

  /**
   * Check rate of change
   */
  async _checkRateOfChange(sensorId, currentValue) {
    try {
      // Get last data point
      const [lastData] = await query(
        `SELECT value, timestamp FROM sensor_data 
         WHERE sensor_id = ? 
         ORDER BY timestamp DESC 
         LIMIT 1`,
        [sensorId]
      );

      if (!lastData || lastData.length === 0) {
        return { excessive: false, rate: 0 };
      }

      const previous = lastData[0];
      const timeDiff = (Date.now() - new Date(previous.timestamp).getTime()) / 1000;

      if (timeDiff === 0) {
        return { excessive: false, rate: 0 };
      }

      const rate = Math.abs(currentValue - previous.value) / timeDiff;
      const maxRate = 1000; // Threshold: 1000 units per second

      return {
        excessive: rate > maxRate,
        rate,
        timeDiff,
        valueDiff: currentValue - previous.value
      };
    } catch (error) {
      return { excessive: false, rate: 0 };
    }
  }

  /**
   * Check data freshness
   */
  async _checkDataFreshness(sensorId) {
    try {
      const [lastData] = await query(
        `SELECT timestamp FROM sensor_data 
         WHERE sensor_id = ? 
         ORDER BY timestamp DESC 
         LIMIT 1`,
        [sensorId]
      );

      if (!lastData || lastData.length === 0) {
        return { isFresh: false, staleness: Infinity, age: 'unknown' };
      }

      const staleness = Date.now() - new Date(lastData[0].timestamp).getTime();
      const isFresh = staleness < this.thresholds.staleDataLimit;

      return {
        isFresh,
        staleness,
        age: this._formatTime(staleness),
        threshold: this._formatTime(this.thresholds.staleDataLimit)
      };
    } catch (error) {
      return { isFresh: false, staleness: Infinity };
    }
  }

  /**
   * Set validation rules untuk sensor
   */
  setValidationRules(sensorId, rules) {
    this.validationRules.set(sensorId, rules);
    console.log(`✅ Validation rules set for sensor ${sensorId}`);
  }

  /**
   * Get validation report
   */
  async getValidationReport(sensorId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [allData] = await query(
        `SELECT * FROM sensor_data 
         WHERE sensor_id = ? 
         AND timestamp > ? 
         ORDER BY timestamp DESC`,
        [sensorId, startDate]
      );

      if (!allData || allData.length === 0) {
        return {
          sensorId,
          period: `${days} days`,
          totalPoints: 0,
          issues: ['No data found']
        };
      }

      const values = allData.map(d => d.value);
      const timestamps = allData.map(d => new Date(d.timestamp).getTime());

      // Calculate statistics
      const stats = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b) / values.length,
        stdDev: Math.sqrt(
          values.reduce((sq, n) => sq + Math.pow(n - values.reduce((a, b) => a + b) / values.length, 2), 0) / values.length
        )
      };

      // Find outliers
      const outliers = values.filter(v => {
        const zScore = Math.abs((v - stats.avg) / stats.stdDev);
        return zScore > 3;
      });

      // Find gaps in data
      const gaps = [];
      for (let i = 0; i < timestamps.length - 1; i++) {
        const gap = timestamps[i] - timestamps[i + 1];
        if (gap > 5000) { // More than 5 seconds
          gaps.push({ gap, between: i });
        }
      }

      // Out of range values
      const sensor = await query('SELECT min_value, max_value FROM sensors WHERE id = ?', [sensorId]);
      const outOfRange = values.filter(v => {
        if (sensor[0][0]?.min_value && v < sensor[0][0].min_value) return true;
        if (sensor[0][0]?.max_value && v > sensor[0][0].max_value) return true;
        return false;
      });

      return {
        sensorId,
        period: `${days} days`,
        statistics: stats,
        dataQuality: {
          totalPoints: values.length,
          outliers: outliers.length,
          outOfRange: outOfRange.length,
          dataGaps: gaps.length,
          healthScore: this._calculateHealthScore({
            totalPoints: values.length,
            outliers: outliers.length,
            outOfRange: outOfRange.length,
            dataGaps: gaps.length
          })
        },
        issues: [
          outliers.length > 0 ? `${outliers.length} outliers detected` : null,
          outOfRange.length > 0 ? `${outOfRange.length} out-of-range values` : null,
          gaps.length > 0 ? `${gaps.length} data gaps` : null
        ].filter(Boolean)
      };
    } catch (error) {
      console.error('Error generating validation report:', error);
      throw error;
    }
  }

  /**
   * Calculate health score
   */
  _calculateHealthScore(metrics) {
    let score = 100;

    // Deduct for outliers (max -30)
    score -= Math.min(30, metrics.outliers * 5);

    // Deduct for out-of-range (max -20)
    score -= Math.min(20, metrics.outOfRange * 2);

    // Deduct for gaps (max -20)
    score -= Math.min(20, metrics.dataGaps * 1);

    return Math.max(0, Math.round(score));
  }

  /**
   * Format time duration
   */
  _formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor((ms / 1000 / 60 / 60) % 24);
    const days = Math.floor(ms / 1000 / 60 / 60 / 24);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }
}

const dataValidationService = new SensorDataValidationService();
export default dataValidationService;
