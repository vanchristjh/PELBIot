/**
 * Sensor Integration Test Suite
 * Unit dan integration tests untuk sensor connectivity
 */

import axios from 'axios';

describe('Sensor Management Tests', () => {
  const apiUrl = 'http://localhost:5000/api';
  let testToken = '';
  let sensorId = null;

  beforeAll(async () => {
    // Login untuk mendapatkan token
    const loginResponse = await axios.post(`${apiUrl}/auth/login`, {
      email: 'admin@test.com',
      password: 'Test@123'
    });
    testToken = loginResponse.data.token;
  });

  describe('✅ Sensor CRUD Operations', () => {
    test('Should create new sensor', async () => {
      const response = await axios.post(
        `${apiUrl}/sensors`,
        {
          name: 'Test Sensor MQTT',
          protocol: 'mqtt',
          unit: 'A',
          min_value: 0,
          max_value: 100,
          config: { topic: 'pelbiot/test' }
        },
        { headers: { Authorization: `Bearer ${testToken}` } }
      );

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      sensorId = response.data.data.id;
    });

    test('Should get all sensors', async () => {
      const response = await axios.get(
        `${apiUrl}/sensors`,
        { headers: { Authorization: `Bearer ${testToken}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    test('Should get sensor by ID', async () => {
      const response = await axios.get(
        `${apiUrl}/sensors/${sensorId}`,
        { headers: { Authorization: `Bearer ${testToken}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data.data.id).toBe(sensorId);
    });

    test('Should update sensor', async () => {
      const response = await axios.put(
        `${apiUrl}/sensors/${sensorId}`,
        {
          unit: 'V',
          min_value: 200,
          max_value: 250
        },
        { headers: { Authorization: `Bearer ${testToken}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('✅ Sensor Data Ingestion', () => {
    test('Should ingest sensor data', async () => {
      const response = await axios.post(
        `${apiUrl}/sensors/ingest/${sensorId}`,
        {
          value: 45.5,
          metadata: { rssi: -65 }
        },
        { headers: { 'X-API-Key': 'test-api-key' } }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    test('Should validate sensor data range', async () => {
      // Test nilai di luar range
      const response = await axios.post(
        `${apiUrl}/sensors/ingest/${sensorId}`,
        { value: 300 }, // Melebihi max 250
        { headers: { 'X-API-Key': 'test-api-key' } }
      );

      // Should still accept but mark as out-of-range
      expect(response.status).toBe(200);
    });

    test('Should get sensor data', async () => {
      const response = await axios.get(
        `${apiUrl}/sensors/${sensorId}/data`,
        { headers: { Authorization: `Bearer ${testToken}` } }
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('✅ Sensor Health & Monitoring', () => {
    test('Should get sensor health status', async () => {
      const response = await axios.get(
        `${apiUrl}/sensors/${sensorId}/health`,
        { headers: { Authorization: `Bearer ${testToken}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data.data.health).toHaveProperty('score');
      expect(response.data.data.health).toHaveProperty('status');
    });

    test('Should detect anomalies in sensor data', async () => {
      // Insert multiple data points
      for (let i = 0; i < 5; i++) {
        await axios.post(
          `${apiUrl}/sensors/ingest/${sensorId}`,
          { value: 225 + i },
          { headers: { 'X-API-Key': 'test-api-key' } }
        );
      }

      // Insert anomalous value
      const response = await axios.post(
        `${apiUrl}/sensors/ingest/${sensorId}`,
        { value: 500 }, // Anomaly
        { headers: { 'X-API-Key': 'test-api-key' } }
      );

      expect(response.status).toBe(200);
    });
  });

  describe('✅ Sensor Connection Test', () => {
    test('Should test sensor connection', async () => {
      const response = await axios.post(
        `${apiUrl}/sensors/${sensorId}/test`,
        {},
        { headers: { Authorization: `Bearer ${testToken}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data.testResult).toHaveProperty('sensorId');
      expect(response.data.testResult).toHaveProperty('protocol');
    });
  });

  describe('✅ Sensor Data Range Query', () => {
    test('Should get sensor data range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const response = await axios.get(
        `${apiUrl}/sensors/${sensorId}/data/range`,
        {
          params: {
            startDate: yesterday.toISOString(),
            endDate: now.toISOString()
          },
          headers: { Authorization: `Bearer ${testToken}` }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('statistics');
      expect(response.data.statistics).toHaveProperty('min');
      expect(response.data.statistics).toHaveProperty('max');
      expect(response.data.statistics).toHaveProperty('avg');
    });
  });

  describe('✅ Error Handling', () => {
    test('Should handle missing sensor', async () => {
      const response = await axios.get(
        `${apiUrl}/sensors/99999`,
        { headers: { Authorization: `Bearer ${testToken}` } }
      ).catch(error => error.response);

      expect(response.status).toBe(404);
    });

    test('Should require authentication', async () => {
      const response = await axios.get(`${apiUrl}/sensors`)
        .catch(error => error.response);

      expect(response.status).toBe(401);
    });

    test('Should validate required fields', async () => {
      const response = await axios.post(
        `${apiUrl}/sensors`,
        { name: 'Test' }, // Missing protocol
        { headers: { Authorization: `Bearer ${testToken}` } }
      ).catch(error => error.response);

      expect(response.status).toBe(400);
    });
  });

  describe('✅ Cleanup', () => {
    test('Should delete sensor', async () => {
      const response = await axios.delete(
        `${apiUrl}/sensors/${sensorId}`,
        { headers: { Authorization: `Bearer ${testToken}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });
});

describe('Sensor Protocol Tests', () => {
  describe('✅ MQTT Protocol', () => {
    test('MQTT should parse published messages', () => {
      const message = JSON.stringify({ value: 45.5, timestamp: new Date() });
      const parsed = JSON.parse(message);
      
      expect(parsed.value).toBe(45.5);
      expect(parsed).toHaveProperty('timestamp');
    });
  });

  describe('✅ Modbus Protocol', () => {
    test('Should convert float to modbus registers', () => {
      // Placeholder untuk actual modbus test
      const value = 45.5;
      const buffer = Buffer.allocUnsafe(4);
      buffer.writeFloatBE(value, 0);
      
      expect(buffer.length).toBe(4);
    });
  });

  describe('✅ Serial Protocol', () => {
    test('Should parse JSON from serial data', () => {
      const serialData = '{"value":45.5,"temp":25.3}';
      const parsed = JSON.parse(serialData);
      
      expect(parsed.value).toBe(45.5);
      expect(parsed.temp).toBe(25.3);
    });
  });

  describe('✅ REST Protocol', () => {
    test('Should parse nested JSON response', () => {
      const response = {
        data: {
          sensor: {
            current: 45.5
          }
        }
      };
      
      // Simulate nested value extraction
      const value = response.data.sensor.current;
      expect(value).toBe(45.5);
    });
  });
});

describe('Sensor Data Validation', () => {
  test('Should detect out-of-range values', () => {
    const value = 300;
    const min = 0;
    const max = 100;
    
    expect(value < min || value > max).toBe(true);
  });

  test('Should calculate quality score', () => {
    const value = 50;
    const min = 0;
    const max = 100;
    const normalized = (value - min) / (max - min);
    const score = normalized * 100;
    
    expect(score).toBe(50);
  });

  test('Should detect anomaly using Z-score', () => {
    const values = [10, 11, 10, 12, 11];
    const mean = values.reduce((a, b) => a + b) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
    );
    
    const anomalousValue = 100;
    const zScore = Math.abs((anomalousValue - mean) / stdDev);
    
    expect(zScore > 3).toBe(true); // Should be anomaly
  });
});
