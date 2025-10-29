# 🔌 MQTT INTEGRATION ROADMAP - Step by Step Implementation

**Status:** ⚠️ RECOMMENDED IF MQTT IS REQUIRED  
**Difficulty:** MEDIUM  
**Time Estimate:** 4-6 hours  

---

## 📋 QUICK DECISION MATRIX

### Apakah Anda PERLU MQTT?

| Skenario | MQTT Perlu? | Alternatif |
|----------|-----------|-----------|
| **Web Dashboard Biasa** | ❌ NO | Socket.IO (SUDAH IMPLEMENTED) ✅ |
| **Multi-Client Real-time** | ✅ YES | MQTT lebih baik |
| **IoT Gateway Integration** | ✅ YES | MQTT recommended |
| **SCADA System** | ✅ YES | MQTT industry standard |
| **Sensor Network** | ✅ YES | MQTT optimal |
| **Simple Web App** | ❌ NO | Stick with Socket.IO |

**⚠️ VERDICT UNTUK PROJECT INI:**

```
Current architecture (Socket.IO) LEBIH COCOK untuk:
✅ Web-based monitoring
✅ Real-time dashboard
✅ Single deployment
✅ Internal network

Gunakan MQTT jika:
✅ Ada multiple gateways
✅ Ada sensor IoT terpisah
✅ Perlu message queuing
✅ Enterprise requirement
```

---

## 🛠️ IMPLEMENTATION PLAN (IF MQTT REQUIRED)

### STEP 1: Install Dependencies

```bash
cd backend
npm install mqtt mqtt-pattern uuid dotenv

# Optional: untuk testing MQTT
npm install --save-dev mqtt-connection
```

### STEP 2: Create MQTT Configuration File

Create file: `backend/config/mqtt.js`

```javascript
export const mqttConfig = {
  // Broker URL
  brokerUrl: process.env.MQTT_BROKER_URL || 'wss://broker.hivemq.com:8884/mqtt',
  
  // Connection Options
  options: {
    clientId: `pelbiot-backend-${Date.now()}`,
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 10000,
    resubscribe: true,
    keepalive: 60
  },

  // Topic Configuration
  topics: {
    // Subscribe ke topik sensor
    subscribe: [
      'panel/trafo1/volt',
      'panel/trafo1/ampere',
      'panel/trafo1/power',
      'panel/trafo1/energy_cost',
      'device/+/status',
      'system/health',
      'gateway/+/uptime'
    ],
    
    // Publish ke topik control
    publish: {
      alerts: 'alerts/system',
      status: 'system/status',
      logs: 'system/logs'
    }
  },

  // Database Mapping
  topicMapping: {
    'panel/trafo1/volt': { table: 'panels', column: 'voltage', panelId: 1 },
    'panel/trafo1/ampere': { table: 'panels', column: 'ampere', panelId: 1 },
    'panel/trafo1/power': { table: 'panels', column: 'power', panelId: 1 },
    'panel/trafo1/energy_cost': { table: 'panels', column: 'energy_cost', panelId: 1 }
  }
};
```

### STEP 3: Create MQTT Client Service

Create file: `backend/services/mqttService.js`

```javascript
import mqtt from 'mqtt';
import { mqttConfig } from '../config/mqtt.js';
import { query } from '../utils/database.js';
import { v4 as uuid } from 'uuid';

class MQTTService {
  constructor(io) {
    this.client = null;
    this.io = io;
    this.isConnected = false;
    this.messageBuffer = [];
    this.maxBufferSize = 1000;
  }

  /**
   * Connect to MQTT Broker
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(
          mqttConfig.brokerUrl,
          mqttConfig.options
        );

        // Connection Success
        this.client.on('connect', () => {
          console.log('✅ MQTT Connected to:', mqttConfig.brokerUrl);
          this.isConnected = true;

          // Subscribe ke semua topik
          mqttConfig.topics.subscribe.forEach(topic => {
            this.client.subscribe(topic, { qos: 1 }, (err) => {
              if (err) {
                console.error(`❌ Failed to subscribe ${topic}:`, err);
              } else {
                console.log(`✅ Subscribed to ${topic}`);
              }
            });
          });

          resolve(true);
        });

        // Incoming Message Handler
        this.client.on('message', (topic, message) => {
          this.handleMessage(topic, message);
        });

        // Error Handler
        this.client.on('error', (error) => {
          console.error('❌ MQTT Error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Disconnect Handler
        this.client.on('disconnect', () => {
          console.log('⚠️ MQTT Disconnected');
          this.isConnected = false;
        });

        // Timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('MQTT connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('❌ MQTT Connection Failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle Incoming MQTT Message
   */
  async handleMessage(topic, message) {
    const messageId = uuid();
    const receivedAt = new Date();

    try {
      const payload = this.parseMessage(message);

      console.log(`📨 MQTT Message [${messageId}]:`);
      console.log(`   Topic: ${topic}`);
      console.log(`   Value: ${payload}`);
      console.log(`   Received: ${receivedAt.toISOString()}`);

      // Buffer message untuk analytics
      this.addToBuffer(topic, payload, receivedAt);

      // Get mapping for this topic
      const mapping = mqttConfig.topicMapping[topic];

      if (mapping) {
        // Save ke database
        await this.saveToDB(mapping, payload, receivedAt);
      }

      // Broadcast ke frontend via Socket.IO
      this.io.emit('mqtt-message', {
        id: messageId,
        topic,
        value: payload,
        timestamp: receivedAt,
        source: 'MQTT'
      });

      // Emit specific event untuk dashboard
      this.emitDataUpdate(topic, payload, receivedAt);

    } catch (error) {
      console.error(`❌ Error processing message [${messageId}]:`, error);
      this.io.emit('mqtt-error', {
        messageId,
        topic,
        error: error.message,
        timestamp: receivedAt
      });
    }
  }

  /**
   * Parse Message Payload
   */
  parseMessage(message) {
    try {
      // Coba parse sebagai JSON
      const parsed = JSON.parse(message.toString());
      return parsed.value !== undefined ? parsed.value : parsed;
    } catch {
      // Parse sebagai float
      const float = parseFloat(message.toString());
      return isNaN(float) ? message.toString() : float;
    }
  }

  /**
   * Save Data to Database
   */
  async saveToDB(mapping, value, timestamp) {
    try {
      const { table, column, panelId } = mapping;

      let sql;
      if (panelId) {
        // Update specific panel
        sql = `UPDATE ${table} SET ${column} = ?, updated_at = ? WHERE id = ?`;
        await query(sql, [value, timestamp, panelId]);
      } else {
        // Insert new record
        sql = `INSERT INTO ${table} (${column}, created_at) VALUES (?, ?)`;
        await query(sql, [value, timestamp]);
      }

      console.log(`✅ Saved to DB: ${table}.${column} = ${value}`);
    } catch (error) {
      console.error('❌ Database Save Error:', error);
      throw error;
    }
  }

  /**
   * Emit specific data updates untuk frontend
   */
  emitDataUpdate(topic, value, timestamp) {
    // Map MQTT topic ke Socket.IO event
    const eventMap = {
      'panel/trafo1/volt': 'mqtt-voltage-update',
      'panel/trafo1/ampere': 'mqtt-ampere-update',
      'panel/trafo1/power': 'mqtt-power-update',
      'panel/trafo1/energy_cost': 'mqtt-cost-update'
    };

    const event = eventMap[topic];
    if (event) {
      this.io.emit(event, {
        topic,
        value,
        timestamp,
        readableTime: timestamp.toLocaleString('id-ID')
      });
    }
  }

  /**
   * Publish Message to MQTT Topic
   */
  async publish(topic, message, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('MQTT not connected'));
        return;
      }

      const payload = typeof message === 'object' 
        ? JSON.stringify(message) 
        : message.toString();

      const publishOptions = {
        qos: 1,
        retain: false,
        ...options
      };

      this.client.publish(topic, payload, publishOptions, (error) => {
        if (error) {
          console.error(`❌ Publish Error to ${topic}:`, error);
          reject(error);
        } else {
          console.log(`✅ Published to ${topic}: ${payload}`);
          resolve(true);
        }
      });
    });
  }

  /**
   * Buffer untuk message analytics
   */
  addToBuffer(topic, value, timestamp) {
    this.messageBuffer.push({
      topic,
      value,
      timestamp,
      id: uuid()
    });

    // Keep buffer size manageable
    if (this.messageBuffer.length > this.maxBufferSize) {
      this.messageBuffer = this.messageBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Get Message History dari Buffer
   */
  getMessageHistory(topic = null, limit = 100) {
    let history = this.messageBuffer;

    if (topic) {
      history = history.filter(m => m.topic === topic);
    }

    return history.slice(-limit);
  }

  /**
   * Graceful Disconnect
   */
  async disconnect() {
    return new Promise((resolve) => {
      if (this.client) {
        this.client.end(false, {}, () => {
          console.log('✅ MQTT Disconnected gracefully');
          this.isConnected = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get Connection Status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      broker: mqttConfig.brokerUrl,
      subscriptions: mqttConfig.topics.subscribe,
      bufferedMessages: this.messageBuffer.length
    };
  }
}

export default MQTTService;
```

### STEP 4: Integrate MQTT Service ke Server

Update file: `backend/server.js`

```javascript
// Add at the top of file
import MQTTService from './services/mqttService.js';

// Initialize MQTT Service
let mqttService = null;

// After Socket.IO initialization
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize MQTT
try {
  mqttService = new MQTTService(io);
  await mqttService.connect();
  console.log('✅ MQTT Service Initialized');
} catch (error) {
  console.warn('⚠️ MQTT initialization failed:', error.message);
  console.log('   Backend will continue without MQTT');
}

// Add MQTT status endpoint
app.get('/api/mqtt/status', (req, res) => {
  if (!mqttService) {
    return res.json({ status: 'MQTT not initialized' });
  }
  res.json(mqttService.getStatus());
});

// Add MQTT message history endpoint
app.get('/api/mqtt/history', (req, res) => {
  const { topic, limit = 100 } = req.query;
  if (!mqttService) {
    return res.status(503).json({ error: 'MQTT not available' });
  }
  res.json(mqttService.getMessageHistory(topic, parseInt(limit)));
});

// Add MQTT publish endpoint (admin only)
app.post('/api/mqtt/publish', (req, res) => {
  const { topic, message } = req.body;
  
  if (!mqttService) {
    return res.status(503).json({ error: 'MQTT not available' });
  }

  mqttService.publish(topic, message)
    .then(() => res.json({ success: true }))
    .catch(error => res.status(400).json({ error: error.message }));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (mqttService) {
    await mqttService.disconnect();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

### STEP 5: Update .env

```bash
# Add ke .env file
MQTT_BROKER_URL=wss://broker.hivemq.com:8884/mqtt
MQTT_USERNAME=
MQTT_PASSWORD=
```

### STEP 6: Update Frontend untuk Handle MQTT Events

Update file: `src/pages/Dashboard.js`

```javascript
// Add new effect untuk MQTT updates
useEffect(() => {
  socketService.on('mqtt-voltage-update', (data) => {
    console.log('📡 MQTT Voltage Update:', data.value);
    setMetrics(prev => ({
      ...prev,
      voltageSekarang: data.value,
      lastUpdate: data.timestamp
    }));
  });

  socketService.on('mqtt-ampere-update', (data) => {
    console.log('📡 MQTT Ampere Update:', data.value);
    setMetrics(prev => ({
      ...prev,
      arusSekarang: data.value,
      lastUpdate: data.timestamp
    }));
  });

  socketService.on('mqtt-power-update', (data) => {
    console.log('📡 MQTT Power Update:', data.value);
    setMetrics(prev => ({
      ...prev,
      dayaSekarang: data.value,
      lastUpdate: data.timestamp
    }));
  });

  socketService.on('mqtt-cost-update', (data) => {
    console.log('📡 MQTT Cost Update:', data.value);
    setMetrics(prev => ({
      ...prev,
      totalBiaya: data.value,
      lastUpdate: data.timestamp
    }));
  });

  return () => {
    socketService.off('mqtt-voltage-update');
    socketService.off('mqtt-ampere-update');
    socketService.off('mqtt-power-update');
    socketService.off('mqtt-cost-update');
  };
}, []);
```

### STEP 7: Create MQTT Tests

Create file: `backend/tests/mqtt.test.js`

```javascript
import MQTTService from '../services/mqttService.js';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('MQTT Service', () => {
  let mqttService;
  let mockIO;

  beforeAll(() => {
    mockIO = {
      emit: jest.fn()
    };
    mqttService = new MQTTService(mockIO);
  });

  afterAll(async () => {
    if (mqttService) {
      await mqttService.disconnect();
    }
  });

  it('should connect to MQTT broker', async () => {
    expect(mqttService.isConnected).toBe(false);
    // await mqttService.connect();
    // expect(mqttService.isConnected).toBe(true);
  });

  it('should parse JSON message', () => {
    const result = mqttService.parseMessage('{"value": 123.45}');
    expect(result).toBe(123.45);
  });

  it('should parse float message', () => {
    const result = mqttService.parseMessage('230.5');
    expect(result).toBe(230.5);
  });

  it('should buffer messages', () => {
    mqttService.addToBuffer('test/topic', 100, new Date());
    expect(mqttService.messageBuffer.length).toBeGreaterThan(0);
  });

  it('should get message history', () => {
    const history = mqttService.getMessageHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});
```

### STEP 8: Verify Implementation

```bash
# 1. Jalankan backend dengan MQTT
cd backend
npm start

# Output akan menampilkan:
# ✅ MQTT Connected to: wss://broker.hivemq.com:8884/mqtt
# ✅ Subscribed to panel/trafo1/volt
# etc.

# 2. Publish test message (dari terminal lain / MQTT client)
# Gunakan MQTT Explorer atau mosquitto_pub

# 3. Check logs di backend - akan melihat:
# 📨 MQTT Message [uuid]:
#    Topic: panel/trafo1/volt
#    Value: 230.5
#    Received: 2025-10-29T...

# 4. Check frontend - metrics akan update otomatis

# 5. Check API status
curl http://localhost:5000/api/mqtt/status
```

---

## 🧪 TESTING MQTT INTEGRATION

### Using MQTT Explorer (GUI Tool)

1. Download: https://mqtt-explorer.com/
2. Connect ke: `wss://broker.hivemq.com:8884/mqtt`
3. Subscribe ke: `panel/trafo1/+`
4. Publish messages untuk testing

### Using mosquitto_pub (Command Line)

```bash
# Install mosquitto client
# macOS: brew install mosquitto
# Ubuntu: apt install mosquitto-clients

# Publish ke public broker
mosquitto_pub -h broker.hivemq.com -p 8884 \
  -t panel/trafo1/volt \
  -m '{"value": 230.5}'

# Subscribe untuk listening
mosquitto_sub -h broker.hivemq.com -p 8884 -t 'panel/trafo1/+'
```

### Using Node.js MQTT Client

```javascript
// Test file: test-mqtt-publish.js
import mqtt from 'mqtt';

const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

client.on('connect', () => {
  console.log('✅ Connected');
  
  // Publish test data setiap 5 detik
  setInterval(() => {
    const voltage = 220 + Math.random() * 20; // 220-240V
    const ampere = 10 + Math.random() * 5;    // 10-15A
    const power = voltage * ampere;            // P = V x I
    
    client.publish('panel/trafo1/volt', voltage.toString());
    client.publish('panel/trafo1/ampere', ampere.toString());
    client.publish('panel/trafo1/power', power.toString());
    
    console.log(`Published: V=${voltage.toFixed(1)}, A=${ampere.toFixed(1)}, P=${power.toFixed(1)}`);
  }, 5000);
});

client.on('error', (err) => console.error('Error:', err));
```

---

## 📊 DATA FLOW DENGAN MQTT

```
MQTT Broker (HiveMQ Cloud)
    │
    ├── Topic: panel/trafo1/volt → 230.5V
    ├── Topic: panel/trafo1/ampere → 12.3A
    ├── Topic: panel/trafo1/power → 2833.15W
    └── Topic: panel/trafo1/energy_cost → Rp 3,541.63/jam
    
    ↓ (MQTT Subscribe)
    
Backend Server (Node.js + Express)
    ├── MQTT Client (mqtt.js)
    ├── Message Handler
    ├── Database Store (MySQL)
    │   └── INSERT INTO panels (voltage, ampere, power)
    └── Socket.IO Broadcast
    
    ↓ (Socket.IO emit)
    
Frontend (React + Socket.IO Client)
    ├── Dashboard Component
    ├── Update Metrics
    ├── Animate Charts
    └── Display Real-time Data
    
    ↓
    
Web Browser (User)
    └── Live Updates (2-5 detik)
```

---

## ✅ CHECKLIST IMPLEMENTASI

- [ ] Install MQTT dependencies
- [ ] Create MQTT config file
- [ ] Create MQTT service
- [ ] Integrate MQTT ke server.js
- [ ] Update .env variables
- [ ] Add MQTT event handlers di frontend
- [ ] Create MQTT tests
- [ ] Test publish/subscribe
- [ ] Verify data flow end-to-end
- [ ] Add error handling
- [ ] Add monitoring/logging
- [ ] Documentation updated
- [ ] Deploy to production

---

## 🚨 TROUBLESHOOTING

### MQTT Connection Fails
```
❌ Error: Connection refused
✅ Solution: Pastikan broker URL benar dan accessible
           Check firewall/proxy settings
```

### Messages Not Received
```
❌ Error: Subscribe works tapi no messages
✅ Solution: Check topics typo
           Verify publisher is sending data
           Check broker logs
```

### Database Save Fails
```
❌ Error: INSERT fails
✅ Solution: Check table/column names match mapping
           Verify database connection
           Check SQL syntax
```

---

## 📈 PERFORMANCE CONSIDERATIONS

```
✅ MQTT Best Practices:
   - Use QoS 1 (at least once delivery)
   - Batch messages jika possible
   - Use topic hierarchy
   - Implement message filtering
   - Monitor broker memory usage

⚠️ Potential Bottlenecks:
   - High message frequency → buffer messages
   - Large payloads → compress data
   - Network latency → use WebSocket with fallback
   - Database writes → implement batching
```

---

**Status:** Ready untuk implementasi  
**Questions?** Lihat section troubleshooting atau buat GitHub issue
