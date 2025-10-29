/**
 * MQTT Data Simulator
 * Script untuk publish simulated ampere meter data ke MQTT broker
 * 
 * Usage:
 * node utils/mqttSimulator.js
 * 
 * Ini akan publish simulated data ke HiveMQ public broker
 * setiap 2 detik dengan nilai yang realistic
 */

import mqtt from 'mqtt';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

// MQTT Configuration
const BROKER_URL = process.env.MQTT_BROKER_URL || 'wss://broker.hivemq.com:8884/mqtt';

const MQTT_OPTIONS = {
  clientId: `pelbiot-simulator-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  clean: true,
  connectTimeout: 10000,
  reconnectPeriod: 1000,
  resubscribe: true,
  keepalive: 60,
  protocol: 'wss'
};

const TOPICS = {
  voltage: 'panel/trafo1/volt',
  ampere: 'panel/trafo1/ampere',
  power: 'panel/trafo1/power',
  energyCost: 'panel/trafo1/energy_cost'
};

// Simulation data ranges (realistic values)
const DATA_RANGES = {
  voltage: { min: 215, max: 245, step: 0.1 }, // 215V - 245V (realistic range)
  ampere: { min: 5, max: 25, step: 0.1 },      // 5A - 25A
  power: null                                    // Calculated: V * A
};

// Tracking current values
let currentValues = {
  voltage: 230,
  ampere: 15,
  power: 3450
};

// Utility: Generate random value dalam range
function getRandomValue(min, max, step) {
  const range = max - min;
  const randomStep = Math.floor(Math.random() * (range / step));
  const randomWithStep = Math.round((min + randomStep * step) * 100) / 100;
  return Math.max(min, Math.min(max, randomWithStep));
}

// Utility: Add small fluctuation untuk realistic data
function fluctuateValue(current, min, max, fluctuation = 0.05) {
  const change = (Math.random() - 0.5) * fluctuation * (max - min);
  const newValue = current + change;
  return Math.max(min, Math.min(max, Math.round(newValue * 100) / 100));
}

// Generate simulated data
function generateData() {
  // Fluctuate voltage (sedikit variasi)
  currentValues.voltage = fluctuateValue(
    currentValues.voltage,
    DATA_RANGES.voltage.min,
    DATA_RANGES.voltage.max,
    0.03
  );

  // Fluctuate ampere (sedikit variasi)
  currentValues.ampere = fluctuateValue(
    currentValues.ampere,
    DATA_RANGES.ampere.min,
    DATA_RANGES.ampere.max,
    0.02
  );

  // Calculate power: P = V * I (watt)
  currentValues.power = Math.round(currentValues.voltage * currentValues.ampere * 100) / 100;

  // Energy cost: Rp 1250 per watt per jam (typical rate)
  currentValues.energyCost = Math.round(currentValues.power * 1250);

  return currentValues;
}

// MQTT Client
let client = null;
let publishInterval = null;
let messageCount = 0;

// Functions
async function connect() {
  return new Promise((resolve, reject) => {
    try {
      console.log(chalk.blue.bold('\n🚀 MQTT Data Simulator'));
      console.log(chalk.gray('═'.repeat(50)));
      console.log(chalk.cyan(`📡 Broker: ${BROKER_URL}`));
      console.log(chalk.cyan(`🔌 Client: ${MQTT_OPTIONS.clientId}`));
      console.log(chalk.gray('═'.repeat(50)));
      console.log(chalk.yellow('\n⏳ Connecting to MQTT broker...'));

      client = mqtt.connect(BROKER_URL, MQTT_OPTIONS);

      client.on('connect', () => {
        console.log(chalk.green('✅ Connected to MQTT broker!\n'));
        resolve();
      });

      client.on('error', (error) => {
        console.error(chalk.red(`❌ Connection error: ${error.message}`));
        reject(error);
      });

      client.on('reconnect', () => {
        console.log(chalk.yellow('⚠️  Reconnecting to MQTT broker...'));
      });

      setTimeout(() => {
        if (!client.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 15000);

    } catch (error) {
      reject(error);
    }
  });
}

async function publishData() {
  try {
    const data = generateData();

    // Publish ke individual topics
    await publishTopic(TOPICS.voltage, data.voltage.toString());
    await publishTopic(TOPICS.ampere, data.ampere.toString());
    await publishTopic(TOPICS.power, data.power.toString());
    await publishTopic(TOPICS.energyCost, data.energyCost.toString());

    messageCount++;

    // Display summary setiap 5 pesan
    if (messageCount % 5 === 0) {
      console.log(chalk.green(`✅ Published ${messageCount} data cycles`));
      console.log(chalk.gray(`   Current values: V=${data.voltage}V | A=${data.ampere}A | P=${data.power}W | Cost=Rp${data.energyCost}`));
    }

  } catch (error) {
    console.error(chalk.red(`❌ Publish error: ${error.message}`));
  }
}

async function publishTopic(topic, value) {
  return new Promise((resolve, reject) => {
    client.publish(topic, value, { qos: 1, retain: false }, (error) => {
      if (error) {
        reject(error);
      } else {
        console.log(chalk.gray(`   📤 ${topic}: ${value}`));
        resolve();
      }
    });
  });
}

function startPublishing() {
  console.log(chalk.cyan('📊 Starting data simulation...'));
  console.log(chalk.cyan('📤 Publishing every 2 seconds\n'));
  console.log(chalk.gray('Topic Data Being Published:'));
  console.log(chalk.gray('-'.repeat(50)));

  // Publish immediately
  publishData();

  // Then every 2 seconds
  publishInterval = setInterval(() => {
    publishData();
  }, 2000);
}

async function stop() {
  console.log(chalk.yellow('\n⏹️  Stopping simulator...'));

  if (publishInterval) {
    clearInterval(publishInterval);
  }

  if (client) {
    await client.end();
    console.log(chalk.green('✅ Disconnected from broker'));
  }

  console.log(chalk.cyan(`\n📊 Simulator Statistics:`));
  console.log(chalk.gray(`   Total messages published: ${messageCount * 4}`)); // 4 topics per cycle
  console.log(chalk.gray(`   Total cycles: ${messageCount}`));
  console.log(chalk.gray(`   Duration: ${(messageCount * 2) / 1000} seconds\n`));

  process.exit(0);
}

// Handle process signals
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

// Main
async function main() {
  try {
    // Connect
    await connect();

    // Start publishing
    startPublishing();

    console.log(chalk.yellow('\n⏸️  Press CTRL+C to stop\n'));

  } catch (error) {
    console.error(chalk.red(`\n❌ Fatal error: ${error.message}`));
    process.exit(1);
  }
}

// Run
main();

// Export untuk penggunaan programmatic
export { connect, publishData, stop };
