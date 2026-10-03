#!/usr/bin/env node

/**
 * MQTT Integration Test Suite
 * Quick verification of MQTT backend integration
 * Usage: node test-mqtt-integration.js
 */

import chalk from 'chalk';
import fetch from 'node-fetch';
import mqtt from 'mqtt';

const BACKEND_URL = 'http://localhost:5000';
const MQTT_BROKER = 'wss://broker.hivemq.com:8884/mqtt';
const TEST_TIMEOUT = 10000;

let testsPassed = 0;
let testsFailed = 0;

// ============= Test Utilities =============

async function testEndpoint(name, method, url, options = {}) {
  try {
    console.log(chalk.blue(`\n🧪 Testing: ${name}`));
    console.log(chalk.gray(`   ${method} ${url}`));

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
      timeout: TEST_TIMEOUT
    });

    if (!response.ok) {
      console.log(chalk.red(`   ❌ Failed: ${response.status} ${response.statusText}`));
      testsFailed++;
      return null;
    }

    const data = await response.json();
    console.log(chalk.green(`   ✅ Success`));
    console.log(chalk.gray(`   Response: ${JSON.stringify(data).substring(0, 100)}...`));
    testsPassed++;
    return data;
  } catch (error) {
    console.log(chalk.red(`   ❌ Error: ${error.message}`));
    testsFailed++;
    return null;
  }
}

async function testMQTTConnection() {
  return new Promise((resolve) => {
    try {
      console.log(chalk.blue(`\n🧪 Testing: MQTT Broker Connection`));
      console.log(chalk.gray(`   Connecting to ${MQTT_BROKER}`));

      const client = mqtt.connect(MQTT_BROKER, {
        protocolId: 'MQTT',
        protocolVersion: 4,
        clientId: `test-client-${Date.now()}`,
        connectTimeout: 5000,
        reconnectPeriod: 1000,
        keepalive: 60,
        rejectUnauthorized: false
      });

      const timeout = setTimeout(() => {
        client.end();
        console.log(chalk.yellow(`   ⚠️  Connection timeout`));
        testsFailed++;
        resolve(false);
      }, TEST_TIMEOUT);

      client.on('connect', () => {
        clearTimeout(timeout);
        console.log(chalk.green(`   ✅ Connected`));
        client.end();
        testsPassed++;
        resolve(true);
      });

      client.on('error', (error) => {
        clearTimeout(timeout);
        console.log(chalk.red(`   ❌ Error: ${error.message}`));
        testsFailed++;
        resolve(false);
      });
    } catch (error) {
      console.log(chalk.red(`   ❌ Error: ${error.message}`));
      testsFailed++;
      resolve(false);
    }
  });
}

// ============= Main Test Suite =============

async function runTests() {
  console.log(chalk.cyan.bold('\n╔════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║  MQTT Integration Verification Suite   ║'));
  console.log(chalk.cyan.bold('╚════════════════════════════════════════╝'));

  console.log(chalk.gray(`Backend URL: ${BACKEND_URL}`));
  console.log(chalk.gray(`MQTT Broker: ${MQTT_BROKER}\n`));

  // Test 1: Backend Health
  console.log(chalk.yellow.bold('\n═ Backend Connectivity ═'));
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    if (response.ok) {
      console.log(chalk.green('✅ Backend is running'));
      testsPassed++;
    } else {
      console.log(chalk.red('❌ Backend health check failed'));
      testsFailed++;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Cannot connect to backend: ${error.message}`));
    console.log(chalk.yellow('   Make sure backend is running: cd backend && npm start'));
    testsFailed++;
  }

  // Test 2: MQTT Status Endpoint
  await testEndpoint(
    'GET /api/mqtt/status',
    'GET',
    `${BACKEND_URL}/api/mqtt/status`
  );

  // Test 3: MQTT Last Values
  await testEndpoint(
    'GET /api/mqtt/last-values',
    'GET',
    `${BACKEND_URL}/api/mqtt/last-values`
  );

  // Test 4: MQTT Topics
  await testEndpoint(
    'GET /api/mqtt/topics',
    'GET',
    `${BACKEND_URL}/api/mqtt/topics`
  );

  // Test 5: MQTT History
  await testEndpoint(
    'GET /api/mqtt/history?limit=5',
    'GET',
    `${BACKEND_URL}/api/mqtt/history?limit=5`
  );

  // Test 6: MQTT Connection
  console.log(chalk.yellow.bold('\n═ MQTT Broker Connectivity ═'));
  await testMQTTConnection();

  // Test 7: Publish to MQTT
  await testEndpoint(
    'POST /api/mqtt/publish (test message)',
    'POST',
    `${BACKEND_URL}/api/mqtt/publish`,
    {
      body: {
        topic: 'panel/trafo1/volt',
        message: 230.5
      }
    }
  );

  // Summary
  console.log(chalk.cyan.bold('\n╔════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║  Test Results Summary                  ║'));
  console.log(chalk.cyan.bold('╚════════════════════════════════════════╝\n'));

  console.log(chalk.green(`✅ Passed: ${testsPassed}`));
  console.log(chalk.red(`❌ Failed: ${testsFailed}`));
  console.log(chalk.cyan(`📊 Total: ${testsPassed + testsFailed}`));

  const passRate = Math.round((testsPassed / (testsPassed + testsFailed)) * 100);
  console.log(chalk.bold(`\n📈 Pass Rate: ${passRate}%\n`));

  if (testsFailed === 0) {
    console.log(chalk.green.bold('🎉 All tests passed! MQTT integration is working correctly.'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('1. Start the MQTT simulator: node backend/utils/mqttSimulator.js'));
    console.log(chalk.gray('2. Open dashboard: http://localhost:3000'));
    console.log(chalk.gray('3. Watch metrics update in real-time\n'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold(`⚠️  ${testsFailed} test(s) failed. Check the errors above.`));
    console.log(chalk.gray('\nTroubleshooting:'));
    console.log(chalk.gray('- Backend not running? Start: cd backend && npm start'));
    console.log(chalk.gray('- Dependencies installed? Run: cd backend && npm install'));
    console.log(chalk.gray('- Network issues? Check firewall and internet connection\n'));
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(chalk.red(`\n❌ Fatal error: ${error.message}`));
  process.exit(1);
});
