/**
 * Sensor Configuration Controller
 * Mengelola CRUD sensor, mapping device, dan koneksi
 */

import { query } from '../utils/database.js';

export const sensorController = {
  /**
   * Get all sensors
   */
  async getAllSensors(req, res) {
    try {
      const sensors = await query(
        `SELECT s.*, 
                COUNT(sd.id) as total_data_points,
                MAX(sd.timestamp) as last_data_time
         FROM sensors s
         LEFT JOIN sensor_data sd ON s.id = sd.sensor_id
         GROUP BY s.id
         ORDER BY s.created_at DESC`
      );

      return res.json({
        success: true,
        data: sensors,
        count: sensors.length
      });
    } catch (error) {
      console.error('Error getting sensors:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  /**
   * Get sensor by ID
   */
  async getSensorById(req, res) {
    try {
      const { id } = req.params;

      const [sensor] = await query(
        'SELECT * FROM sensors WHERE id = ?',
        [id]
      );

      if (!sensor) {
        return res.status(404).json({ 
          success: false, 
          error: 'Sensor tidak ditemukan' 
        });
      }

      // Parse JSON fields
      if (sensor.config) {
        sensor.config = JSON.parse(sensor.config);
      }

      return res.json({ success: true, data: sensor });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  /**
   * Create new sensor
   */
  async createSensor(req, res) {
    try {
      const { 
        name, 
        protocol, 
        device_id, 
        register_address,
        min_value,
        max_value,
        unit,
        config 
      } = req.body;

      // Validasi
      if (!name || !protocol) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name dan protocol wajib diisi' 
        });
      }

      const allowedProtocols = ['mqtt', 'modbus-tcp', 'modbus-rtu', 'serial', 'rest'];
      if (!allowedProtocols.includes(protocol)) {
        return res.status(400).json({ 
          success: false, 
          error: `Protocol harus salah satu: ${allowedProtocols.join(', ')}` 
        });
      }

      // Insert sensor
      const result = await query(
        `INSERT INTO sensors 
          (name, protocol, device_id, register_address, min_value, max_value, 
           unit, config, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'inactive', ?)`,
        [
          name,
          protocol,
          device_id || null,
          register_address || null,
          min_value || null,
          max_value || null,
          unit || null,
          JSON.stringify(config || {}),
          req.user?.id || 'system'
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Sensor berhasil dibuat',
        data: { id: result.insertId, name, protocol }
      });
    } catch (error) {
      console.error('Error creating sensor:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  /**
   * Update sensor
   */
  async updateSensor(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        protocol, 
        device_id,
        min_value,
        max_value,
        unit,
        config,
        status 
      } = req.body;

      // Check if sensor exists
      const [sensor] = await query(
        'SELECT * FROM sensors WHERE id = ?',
        [id]
      );

      if (!sensor) {
        return res.status(404).json({ 
          success: false, 
          error: 'Sensor tidak ditemukan' 
        });
      }

      // Update
      await query(
        `UPDATE sensors SET 
          name = COALESCE(?, name),
          protocol = COALESCE(?, protocol),
          device_id = COALESCE(?, device_id),
          min_value = COALESCE(?, min_value),
          max_value = COALESCE(?, max_value),
          unit = COALESCE(?, unit),
          config = COALESCE(?, config),
          status = COALESCE(?, status),
          updated_at = NOW()
         WHERE id = ?`,
        [
          name || null,
          protocol || null,
          device_id || null,
          min_value || null,
          max_value || null,
          unit || null,
          config ? JSON.stringify(config) : null,
          status || null,
          id
        ]
      );

      return res.json({
        success: true,
        message: 'Sensor berhasil diupdate'
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  /**
   * Delete sensor
   */
  async deleteSensor(req, res) {
    try {
      const { id } = req.params;

      // Check if sensor exists
      const [sensor] = await query(
        'SELECT * FROM sensors WHERE id = ?',
        [id]
      );

      if (!sensor) {
        return res.status(404).json({ 
          success: false, 
          error: 'Sensor tidak ditemukan' 
        });
      }

      // Delete sensor data first
      await query('DELETE FROM sensor_data WHERE sensor_id = ?', [id]);

      // Delete sensor
      await query('DELETE FROM sensors WHERE id = ?', [id]);

      return res.json({
        success: true,
        message: 'Sensor berhasil dihapus'
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  /**
   * Get sensor data
   */
  async getSensorData(req, res) {
    try {
      const { sensorId, limit = 100, offset = 0 } = req.query;

      if (!sensorId) {
        return res.status(400).json({ 
          success: false, 
          error: 'sensorId parameter diperlukan' 
        });
      }

      const data = await query(
        `SELECT * FROM sensor_data 
         WHERE sensor_id = ? 
         ORDER BY timestamp DESC 
         LIMIT ? OFFSET ?`,
        [sensorId, parseInt(limit), parseInt(offset)]
      );

      const [count] = await query(
        'SELECT COUNT(*) as total FROM sensor_data WHERE sensor_id = ?',
        [sensorId]
      );

      return res.json({
        success: true,
        data,
        pagination: {
          limit,
          offset,
          total: count[0]?.total || 0
        }
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  /**
   * Get sensor data range (untuk chart/trend)
   */
  async getSensorDataRange(req, res) {
    try {
      const { sensorId, startDate, endDate } = req.query;

      if (!sensorId || !startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          error: 'sensorId, startDate, endDate diperlukan' 
        });
      }

      const data = await query(
        `SELECT * FROM sensor_data 
         WHERE sensor_id = ? 
         AND timestamp BETWEEN ? AND ? 
         ORDER BY timestamp ASC`,
        [sensorId, startDate, endDate]
      );

      // Calculate statistics
      const values = data.map(d => d.value);
      const stats = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        total: values.length
      };

      return res.json({
        success: true,
        data,
        statistics: stats
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  /**
   * Test sensor connection
   */
  async testSensorConnection(req, res) {
    try {
      const { id } = req.params;
      const { timeout = 5000 } = req.body;

      const [sensor] = await query(
        'SELECT * FROM sensors WHERE id = ?',
        [id]
      );

      if (!sensor) {
        return res.status(404).json({ 
          success: false, 
          error: 'Sensor tidak ditemukan' 
        });
      }

      // Test berdasarkan protocol
      let testResult;
      const startTime = Date.now();

      try {
        switch (sensor.protocol) {
          case 'mqtt':
            testResult = await testMQTTConnection(sensor, timeout);
            break;
          case 'modbus-tcp':
          case 'modbus-rtu':
            testResult = await testModbusConnection(sensor, timeout);
            break;
          case 'serial':
            testResult = await testSerialConnection(sensor, timeout);
            break;
          case 'rest':
            testResult = await testRESTConnection(sensor, timeout);
            break;
          default:
            testResult = { success: false, error: 'Protocol tidak dikenali' };
        }
      } catch (error) {
        testResult = { success: false, error: error.message };
      }

      const duration = Date.now() - startTime;

      return res.json({
        success: true,
        testResult: {
          ...testResult,
          sensorId: id,
          protocol: sensor.protocol,
          duration,
          timestamp: new Date()
        }
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  /**
   * Get sensor status & health
   */
  async getSensorHealth(req, res) {
    try {
      const { id } = req.params;

      const [sensor] = await query(
        'SELECT * FROM sensors WHERE id = ?',
        [id]
      );

      if (!sensor) {
        return res.status(404).json({ 
          success: false, 
          error: 'Sensor tidak ditemukan' 
        });
      }

      // Get last 100 data points untuk analisis
      const recentData = await query(
        `SELECT value, timestamp FROM sensor_data 
         WHERE sensor_id = ? 
         ORDER BY timestamp DESC 
         LIMIT 100`,
        [id]
      );

      // Calculate health metrics
      const health = calculateSensorHealth(recentData, sensor);

      return res.json({
        success: true,
        data: {
          sensor: {
            id: sensor.id,
            name: sensor.name,
            protocol: sensor.protocol,
            status: sensor.status
          },
          health,
          lastUpdate: sensor.last_register ? new Date(sensor.last_register) : null
        }
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
};

/**
 * Test function placeholders
 */
async function testMQTTConnection(sensor, timeout) {
  return {
    success: true,
    message: 'MQTT connection test - requires active MQTT broker',
    config: {
      broker: 'configured in mqttService',
      topic: `sensors/${sensor.id}/data`
    }
  };
}

async function testModbusConnection(sensor, timeout) {
  return {
    success: false,
    error: 'Modbus-serial library tidak diinstall. Run: npm install modbus-serial',
    config: sensor.config || {}
  };
}

async function testSerialConnection(sensor, timeout) {
  return {
    success: false,
    error: 'Serialport library tidak diinstall. Run: npm install serialport',
    config: sensor.config || {}
  };
}

async function testRESTConnection(sensor, timeout) {
  const config = sensor.config || {};
  if (!config.apiUrl) {
    return {
      success: false,
      error: 'API URL tidak dikonfigurasi'
    };
  }

  try {
    const response = await fetch(config.apiUrl, {
      timeout
    });
    
    return {
      success: response.ok,
      statusCode: response.status,
      message: response.ok ? 'Connection successful' : 'Connection failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate sensor health score
 */
function calculateSensorHealth(data, sensor) {
  if (data.length === 0) {
    return {
      score: 0,
      status: 'No Data',
      uptime: 0,
      dataPoints: 0,
      issues: ['No data received']
    };
  }

  const issues = [];
  let score = 100;

  // Check for gaps in data
  const timestamps = data.map(d => new Date(d.timestamp).getTime());
  const gaps = [];
  for (let i = 0; i < timestamps.length - 1; i++) {
    const gap = timestamps[i] - timestamps[i + 1];
    if (gap > 5000) { // More than 5 seconds gap
      gaps.push(gap);
    }
  }

  if (gaps.length > 0) {
    issues.push(`${gaps.length} data gaps detected`);
    score -= 10;
  }

  // Check for out-of-range values
  if (sensor.min_value || sensor.max_value) {
    const outOfRange = data.filter(d => 
      (sensor.min_value && d.value < sensor.min_value) ||
      (sensor.max_value && d.value > sensor.max_value)
    );

    if (outOfRange.length > 0) {
      issues.push(`${outOfRange.length}/${data.length} values out of range`);
      score -= Math.min(30, (outOfRange.length / data.length) * 50);
    }
  }

  // Check for stale data
  const lastDataTime = new Date(data[0].timestamp);
  const staleness = Date.now() - lastDataTime.getTime();
  
  if (staleness > 60000) { // More than 1 minute
    issues.push('Data is stale');
    score -= 20;
  }

  return {
    score: Math.max(0, Math.round(score)),
    status: score >= 80 ? 'Healthy' : score >= 50 ? 'Warning' : 'Critical',
    uptime: staleness < 60000 ? 'Online' : 'Offline',
    dataPoints: data.length,
    lastUpdate: lastDataTime,
    issues
  };
}

export default sensorController;
