/**
 * MQTT Service
 * Menangani koneksi, subscribe, dan publish ke MQTT Broker
 * 
 * Fitur:
 * - Connect/Disconnect dari MQTT Broker
 * - Subscribe ke multiple topics
 * - Handle incoming messages
 * - Emit data ke frontend via Socket.IO
 * - Store data ke database dengan timestamp
 */

import mqtt from 'mqtt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../utils/database.js';
import { mqttConfig } from '../config/mqtt.js';

class MQTTService {
  constructor(io) {
    this.client = null;
    this.io = io;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.messageBuffer = []; // Buffer untuk message analytics
    this.lastValues = {}; // Store last received values
    this.subscriptionStatus = {}; // Track subscription status
  }

  /**
   * Connect ke MQTT Broker
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log(`\n🔌 Connecting to MQTT Broker: ${mqttConfig.brokerUrl}`);

        this.client = mqtt.connect(mqttConfig.brokerUrl, mqttConfig.options);

        // Connection success handler
        this.client.on('connect', () => {
          console.log('✅ MQTT Connected successfully!');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Subscribe ke semua topics
          this.subscribeToTopics();

          // Emit connection status ke frontend
          this.io.emit('mqtt-connected', {
            status: 'connected',
            broker: mqttConfig.brokerUrl,
            timestamp: new Date().toISOString()
          });

          resolve(true);
        });

        // Incoming message handler
        this.client.on('message', (topic, message) => {
          this.handleMessage(topic, message);
        });

        // Subscribe success handler
        this.client.on('subscribe', (err, granted) => {
          if (err) {
            console.error(`❌ Subscribe error: ${err.message}`);
          } else {
            granted.forEach(g => {
              this.subscriptionStatus[g.topic] = true;
              console.log(`✅ Subscribed to: ${g.topic}`);
            });
          }
        });

        // Error handler
        this.client.on('error', (error) => {
          console.error(`❌ MQTT Error: ${error.message}`);
          this.isConnected = false;
          this.io.emit('mqtt-error', {
            error: error.message,
            timestamp: new Date().toISOString()
          });
        });

        // Reconnect handler
        this.client.on('reconnect', () => {
          this.reconnectAttempts++;
          console.log(`⚠️  MQTT Reconnecting... (attempt ${this.reconnectAttempts})`);
        });

        // Disconnect handler
        this.client.on('disconnect', () => {
          console.log('⚠️  MQTT Disconnected');
          this.isConnected = false;
          this.io.emit('mqtt-disconnected', {
            timestamp: new Date().toISOString()
          });
        });

        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('MQTT connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error(`❌ Connection failed: ${error.message}`);
        reject(error);
      }
    });
  }

  /**
   * Subscribe ke semua MQTT topics
   */
  subscribeToTopics() {
    const topicsArray = Object.values(mqttConfig.topics);
    
    topicsArray.forEach(topic => {
      this.client.subscribe(topic, { qos: mqttConfig.qos }, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe ${topic}: ${err.message}`);
        }
      });
    });
  }

  /**
   * Handle incoming MQTT message
   */
  async handleMessage(topic, message) {
    const messageId = uuidv4();
    const receivedAt = new Date();

    try {
      // Parse message payload
      const payload = this.parsePayload(message);

      console.log(`📨 MQTT Message [${messageId}]`);
      console.log(`   Topic: ${topic}`);
      console.log(`   Value: ${payload}`);
      console.log(`   Time: ${receivedAt.toLocaleTimeString('id-ID')}`);

      // Store in buffer
      this.addToBuffer(topic, payload, receivedAt);

      // Store last value
      this.lastValues[topic] = {
        value: payload,
        timestamp: receivedAt,
        messageId
      };

      // Save to database
      await this.saveToDB(topic, payload, receivedAt);

      // Emit ke frontend via Socket.IO
      this.broadcastData(topic, payload, receivedAt);

    } catch (error) {
      console.error(`❌ Error processing message [${messageId}]: ${error.message}`);
      this.io.emit('mqtt-error', {
        messageId,
        topic,
        error: error.message,
        timestamp: receivedAt.toISOString()
      });
    }
  }

  /**
   * Parse message payload
   */
  parsePayload(message) {
    try {
      const str = message.toString().trim();
      
      // Try parse as JSON
      try {
        const json = JSON.parse(str);
        return json.value !== undefined ? json.value : json;
      } catch {
        // Parse as number
        const num = parseFloat(str);
        return isNaN(num) ? str : num;
      }
    } catch (error) {
      console.error(`Error parsing payload: ${error.message}`);
      return message.toString();
    }
  }

  /**
   * Save data to database dengan timestamp
   */
  async saveToDB(topic, value, timestamp) {
    try {
      const mapping = mqttConfig.dataMapping[topic];
      
      if (!mapping) {
        console.warn(`⚠️  No mapping found for topic: ${topic}`);
        return;
      }

      const { table, column } = mapping;

      // Update panel dengan latest data
      const sql = `
        UPDATE ${table} 
        SET ${column} = ?, updated_at = ? 
        WHERE id = 1
      `;

      await query(sql, [value, timestamp]);

      // Juga save ke metrics/history table untuk analytics (optional)
      const historySql = `
        INSERT INTO trends 
        (voltage, ampere, power, energy_cost, date, created_at) 
        VALUES (?, ?, ?, ?, DATE(NOW()), NOW())
        ON DUPLICATE KEY UPDATE
        voltage = VALUES(voltage),
        ampere = VALUES(ampere),
        power = VALUES(power),
        energy_cost = VALUES(energy_cost),
        updated_at = NOW()
      `;

      // Build values berdasarkan column yang di-update
      const historyValues = [
        column === 'voltage' ? value : this.lastValues['panel/trafo1/volt']?.value || 0,
        column === 'ampere' ? value : this.lastValues['panel/trafo1/ampere']?.value || 0,
        column === 'power' ? value : this.lastValues['panel/trafo1/power']?.value || 0,
        column === 'energy_cost' ? value : this.lastValues['panel/trafo1/energy_cost']?.value || 0
      ];

      try {
        await query(historySql, historyValues);
      } catch (historyError) {
        // Silent fail untuk history (tidak critical)
        if (historyError.code !== 'ER_TABLE_DOESNT_EXIST') {
          console.warn(`⚠️  History insert warning: ${historyError.message}`);
        }
      }

    } catch (error) {
      console.error(`❌ Database error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Broadcast data ke frontend via Socket.IO
   */
  broadcastData(topic, value, timestamp) {
    try {
      // Emit ke specific event based on topic
      const eventMap = {
        'panel/trafo1/volt': 'mqtt-voltage-update',
        'panel/trafo1/ampere': 'mqtt-ampere-update',
        'panel/trafo1/power': 'mqtt-power-update',
        'panel/trafo1/energy_cost': 'mqtt-cost-update'
      };

      const eventName = eventMap[topic] || 'mqtt-data-update';

      const payload = {
        topic,
        value,
        timestamp: timestamp.toISOString(),
        readableTime: timestamp.toLocaleString('id-ID'),
        messageId: this.lastValues[topic]?.messageId
      };

      // Emit ke all connected clients
      this.io.emit(eventName, payload);

      // Also emit aggregate update
      this.io.emit('mqtt-data-update', payload);

    } catch (error) {
      console.error(`❌ Broadcast error: ${error.message}`);
    }
  }

  /**
   * Add message to buffer untuk analytics
   */
  addToBuffer(topic, value, timestamp) {
    this.messageBuffer.push({
      id: uuidv4(),
      topic,
      value,
      timestamp: timestamp.toISOString(),
      receivedAt: new Date()
    });

    // Keep buffer size manageable (max 1000 messages)
    if (this.messageBuffer.length > 1000) {
      this.messageBuffer = this.messageBuffer.slice(-1000);
    }
  }

  /**
   * Get message history dari buffer
   */
  getMessageHistory(topic = null, limit = 100) {
    let history = this.messageBuffer;

    if (topic) {
      history = history.filter(m => m.topic === topic);
    }

    return history.slice(-limit);
  }

  /**
   * Publish message ke MQTT topic
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
        qos: mqttConfig.qos,
        retain: false,
        ...options
      };

      this.client.publish(topic, payload, publishOptions, (error) => {
        if (error) {
          console.error(`❌ Publish error to ${topic}: ${error.message}`);
          reject(error);
        } else {
          console.log(`✅ Published to ${topic}: ${payload}`);
          resolve(true);
        }
      });
    });
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      broker: mqttConfig.brokerUrl,
      clientId: this.client?.options?.clientId || 'unknown',
      subscriptions: Object.values(this.subscriptionStatus).length,
      subscriptionTopics: Object.keys(this.subscriptionStatus),
      bufferedMessages: this.messageBuffer.length,
      lastValues: this.lastValues,
      reconnectAttempts: this.reconnectAttempts,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get last received value untuk specific topic
   */
  getLastValue(topic) {
    return this.lastValues[topic] || null;
  }

  /**
   * Get all last values
   */
  getAllLastValues() {
    return this.lastValues;
  }

  /**
   * Graceful disconnect
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
}

export default MQTTService;
