/**
 * Sensor Connection Manager
 * Mengelola berbagai tipe koneksi sensor:
 * - MQTT
 * - Modbus RTU/TCP
 * - Serial Communication (RS-485, COM)
 * - HTTP REST API
 */

import EventEmitter from 'events';
import { query } from '../utils/database.js';

class SensorConnectionManager extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.connections = new Map(); // { sensorId => { type, connection, config } }
    this.sensorStatus = new Map(); // Track sensor health
    this.dataBuffer = []; // Buffer untuk data aggregation
    this.maxBufferSize = 1000;
  }

  /**
   * Register sensor connection
   */
  async registerSensor(sensorConfig) {
    try {
      const { id, type, protocol, config } = sensorConfig;
      
      if (!type || !protocol) {
        throw new Error('Sensor type dan protocol harus ditentukan');
      }

      console.log(`📡 Registering sensor: ${id} (${protocol})`);

      // Validasi dan simpan konfigurasi
      await query(
        `UPDATE sensors SET 
          connection_type = ?, protocol = ?, config = ?, 
          last_register = NOW(), status = 'registered'
         WHERE id = ?`,
        [type, protocol, JSON.stringify(config), id]
      );

      // Initialize sesuai tipe
      let connection;
      switch (protocol) {
        case 'mqtt':
          connection = this._createMQTTConnection(id, config);
          break;
        case 'modbus-tcp':
        case 'modbus-rtu':
          connection = this._createModbusConnection(id, config);
          break;
        case 'serial':
          connection = this._createSerialConnection(id, config);
          break;
        case 'rest':
          connection = this._createRESTConnection(id, config);
          break;
        default:
          throw new Error(`Protocol tidak didukung: ${protocol}`);
      }

      // Store connection
      this.connections.set(id, {
        type,
        protocol,
        connection,
        config,
        createdAt: new Date(),
        isActive: false
      });

      // Initialize health status
      this.sensorStatus.set(id, {
        id,
        protocol,
        isConnected: false,
        lastDataTime: null,
        errorCount: 0,
        warningCount: 0,
        dataCount: 0,
        uptime: 0
      });

      this.emit('sensor-registered', { sensorId: id, protocol });
      return connection;

    } catch (error) {
      console.error(`❌ Failed to register sensor ${sensorConfig.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Create MQTT Connection Wrapper
   */
  _createMQTTConnection(sensorId, config) {
    return {
      type: 'mqtt',
      connect: async (mqttService) => {
        // Subscribe ke topic sensor
        const topic = config.topic || `sensors/${sensorId}/data`;
        mqttService.client?.subscribe(topic, (err) => {
          if (!err) {
            this._updateSensorStatus(sensorId, { isConnected: true });
            console.log(`✅ MQTT sensor ${sensorId} subscribed to ${topic}`);
          }
        });
      },
      publish: async (topic, data) => {
        // Publish command ke sensor
        return new Promise((resolve) => {
          config.mqttClient?.publish(topic, JSON.stringify(data), resolve);
        });
      },
      disconnect: async () => {
        this._updateSensorStatus(sensorId, { isConnected: false });
      }
    };
  }

  /**
   * Create Modbus Connection Wrapper
   */
  _createModbusConnection(sensorId, config) {
    return {
      type: 'modbus',
      protocol: config.protocol,
      connect: async () => {
        // Akan diimplementasi dengan library modbus-serial
        console.log(`📡 Modbus connection configured for ${sensorId}`);
        console.log(`   Host: ${config.host}:${config.port}`);
        console.log(`   Unit ID: ${config.unitId}`);
      },
      readRegisters: async (address, quantity) => {
        // Placeholder untuk read modbus registers
        throw new Error('Modbus driver belum diinstall. Run: npm install modbus-serial');
      },
      writeRegister: async (address, value) => {
        // Placeholder untuk write modbus register
        throw new Error('Modbus driver belum diinstall. Run: npm install modbus-serial');
      },
      disconnect: async () => {
        this._updateSensorStatus(sensorId, { isConnected: false });
      }
    };
  }

  /**
   * Create Serial Connection Wrapper
   */
  _createSerialConnection(sensorId, config) {
    return {
      type: 'serial',
      connect: async () => {
        // Akan diimplementasi dengan library serialport
        console.log(`📡 Serial connection configured for ${sensorId}`);
        console.log(`   Port: ${config.port}`);
        console.log(`   BaudRate: ${config.baudRate}`);
      },
      send: async (data) => {
        // Placeholder untuk send data
        throw new Error('Serial driver belum diinstall. Run: npm install serialport');
      },
      disconnect: async () => {
        this._updateSensorStatus(sensorId, { isConnected: false });
      }
    };
  }

  /**
   * Create HTTP REST Connection Wrapper
   */
  _createRESTConnection(sensorId, config) {
    return {
      type: 'rest',
      fetch: async (axios) => {
        try {
          const response = await axios.get(config.apiUrl, {
            headers: config.headers || {},
            timeout: config.timeout || 5000
          });
          return response.data;
        } catch (error) {
          this._recordError(sensorId, `REST API Error: ${error.message}`);
          throw error;
        }
      },
      disconnect: async () => {
        // REST tidak perlu disconnect
      }
    };
  }

  /**
   * Process sensor data
   */
  async processSensorData(sensorId, data) {
    try {
      // Get sensor config
      const [sensor] = await query(
        'SELECT * FROM sensors WHERE id = ?',
        [sensorId]
      );

      if (!sensor) {
        throw new Error(`Sensor ${sensorId} tidak ditemukan`);
      }

      // Validate data
      const validated = this._validateData(data, sensor);

      // Store ke database
      await query(
        `INSERT INTO sensor_data 
          (sensor_id, value, unit, metadata, quality_score, timestamp)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          sensorId,
          validated.value,
          sensor.unit,
          JSON.stringify(validated.metadata || {}),
          validated.qualityScore || 100
        ]
      );

      // Update sensor status
      this._updateSensorStatus(sensorId, {
        lastDataTime: new Date(),
        dataCount: (this.sensorStatus.get(sensorId)?.dataCount || 0) + 1
      });

      // Emit real-time ke frontend
      this.io?.emit('sensor-data-update', {
        sensorId,
        value: validated.value,
        unit: sensor.unit,
        timestamp: new Date(),
        metadata: validated.metadata
      });

      // Check anomaly
      await this._checkAnomaly(sensorId, validated);

      return validated;

    } catch (error) {
      this._recordError(sensorId, error.message);
      throw error;
    }
  }

  /**
   * Validate sensor data
   */
  _validateData(data, sensor) {
    const minValue = sensor.min_value || -Infinity;
    const maxValue = sensor.max_value || Infinity;

    let value = data.value || data;

    // Convert ke number
    if (typeof value === 'string') {
      value = parseFloat(value);
    }

    if (isNaN(value)) {
      throw new Error('Invalid sensor value: bukan number');
    }

    // Check range
    if (value < minValue || value > maxValue) {
      console.warn(`⚠️  Sensor ${sensor.id} value out of range: ${value}`);
    }

    return {
      value,
      metadata: data.metadata || { timestamp: new Date() },
      qualityScore: this._calculateQualityScore(value, minValue, maxValue)
    };
  }

  /**
   * Calculate data quality score
   */
  _calculateQualityScore(value, min, max) {
    const range = max - min;
    const normalized = (value - min) / range;
    
    // Return score 0-100
    if (normalized < 0 || normalized > 1) return 50; // Out of range = lower quality
    return Math.round(normalized * 100);
  }

  /**
   * Check for anomaly
   */
  async _checkAnomaly(sensorId, data) {
    try {
      // Get last 10 data points
      const [lastData] = await query(
        `SELECT value FROM sensor_data 
         WHERE sensor_id = ? 
         ORDER BY timestamp DESC 
         LIMIT 10`,
        [sensorId]
      );

      if (!lastData || lastData.length < 3) return;

      // Simple anomaly detection: check for sudden spike
      const values = lastData.map(d => d.value);
      const avg = values.reduce((a, b) => a + b) / values.length;
      const deviation = Math.abs(data.value - avg);
      const threshold = avg * 0.5; // 50% threshold

      if (deviation > threshold) {
        // Possible anomaly
        console.warn(`⚠️  Anomaly detected in sensor ${sensorId}`);
        
        this.io?.emit('sensor-anomaly', {
          sensorId,
          value: data.value,
          average: avg,
          deviation,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Anomaly detection error:', error.message);
    }
  }

  /**
   * Update sensor status
   */
  _updateSensorStatus(sensorId, updates) {
    const status = this.sensorStatus.get(sensorId) || {};
    this.sensorStatus.set(sensorId, { ...status, ...updates });
  }

  /**
   * Record error untuk sensor
   */
  _recordError(sensorId, errorMessage) {
    const status = this.sensorStatus.get(sensorId) || {};
    status.errorCount = (status.errorCount || 0) + 1;
    this._updateSensorStatus(sensorId, status);

    console.error(`❌ Sensor ${sensorId}: ${errorMessage}`);

    this.io?.emit('sensor-error', {
      sensorId,
      error: errorMessage,
      errorCount: status.errorCount,
      timestamp: new Date()
    });
  }

  /**
   * Get sensor status
   */
  getSensorStatus(sensorId) {
    return this.sensorStatus.get(sensorId);
  }

  /**
   * Get all sensors status
   */
  getAllSensorStatus() {
    return Array.from(this.sensorStatus.values());
  }

  /**
   * Disconnect sensor
   */
  async disconnectSensor(sensorId) {
    const connConfig = this.connections.get(sensorId);
    if (connConfig?.connection?.disconnect) {
      await connConfig.connection.disconnect();
    }
    this.connections.delete(sensorId);
    console.log(`✅ Sensor ${sensorId} disconnected`);
  }

  /**
   * Disconnect all sensors
   */
  async disconnectAll() {
    for (const [sensorId] of this.connections) {
      await this.disconnectSensor(sensorId);
    }
    console.log('✅ All sensors disconnected');
  }
}

export default SensorConnectionManager;
