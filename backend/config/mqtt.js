/**
 * MQTT Configuration
 * Konfigurasi untuk koneksi MQTT Broker
 */

export const mqttConfig = {
  // Broker URL - menggunakan HiveMQ Public Cloud
  brokerUrl: process.env.MQTT_BROKER_URL || 'wss://broker.hivemq.com:8884/mqtt',

  // Connection Options
  options: {
    clientId: `pelbiot-backend-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    clean: true,
    connectTimeout: 10000,
    reconnectPeriod: 1000,
    resubscribe: true,
    keepalive: 60,
    protocol: 'wss', // WebSocket Secure untuk HiveMQ Cloud
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined
  },

  // Topics untuk subscribe
  topics: {
    // Panel/Trafo 1 metrics
    voltage: 'panel/trafo1/volt',
    ampere: 'panel/trafo1/ampere',
    power: 'panel/trafo1/power',
    energyCost: 'panel/trafo1/energy_cost',
    
    // Status topics
    status: 'panel/trafo1/status',
    timestamp: 'panel/trafo1/timestamp'
  },

  // QoS (Quality of Service)
  qos: 1, // At least once delivery

  // Retain messages
  retain: false,

  // Data mapping untuk database
  dataMapping: {
    'panel/trafo1/volt': {
      table: 'panels',
      column: 'voltage',
      dataType: 'decimal'
    },
    'panel/trafo1/ampere': {
      table: 'panels',
      column: 'ampere',
      dataType: 'decimal'
    },
    'panel/trafo1/power': {
      table: 'panels',
      column: 'power',
      dataType: 'decimal'
    },
    'panel/trafo1/energy_cost': {
      table: 'panels',
      column: 'energy_cost',
      dataType: 'decimal'
    }
  }
};

export default mqttConfig;
