/**
 * MQTT Routes
 * Endpoints untuk manage MQTT connection dan data
 */

import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Global MQTT Service reference (akan di-inject)
let mqttService = null;

export function setMQTTService(service) {
  mqttService = service;
}

/**
 * GET /api/mqtt/status
 * Get MQTT connection status
 */
router.get('/status', authenticateToken, (req, res) => {
  try {
    if (!mqttService) {
      return res.json({
        status: 'not-initialized',
        message: 'MQTT service not available'
      });
    }

    const status = mqttService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mqtt/last-values
 * Get last received values dari all topics
 */
router.get('/last-values', authenticateToken, (req, res) => {
  try {
    if (!mqttService) {
      return res.status(503).json({
        success: false,
        error: 'MQTT service not available'
      });
    }

    const values = mqttService.getAllLastValues();
    const formatted = {};

    // Format data untuk frontend
    Object.keys(values).forEach(topic => {
      const key = topic.split('/').pop();
      formatted[key] = values[topic].value;
      formatted[`${key}_timestamp`] = values[topic].timestamp;
    });

    res.json({
      success: true,
      data: formatted,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mqtt/history
 * Get message history
 * Query params: topic (optional), limit (optional, default: 100)
 */
router.get('/history', authenticateToken, (req, res) => {
  try {
    if (!mqttService) {
      return res.status(503).json({
        success: false,
        error: 'MQTT service not available'
      });
    }

    const { topic, limit = 100 } = req.query;
    const history = mqttService.getMessageHistory(topic, parseInt(limit));

    res.json({
      success: true,
      data: history,
      count: history.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mqtt/last-value/:topic
 * Get last value untuk specific topic
 */
router.get('/last-value/:topic', authenticateToken, (req, res) => {
  try {
    if (!mqttService) {
      return res.status(503).json({
        success: false,
        error: 'MQTT service not available'
      });
    }

    const { topic } = req.params;
    const value = mqttService.getLastValue(topic);

    if (!value) {
      return res.json({
        success: true,
        data: null,
        message: `No data received for topic: ${topic}`
      });
    }

    res.json({
      success: true,
      data: value
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mqtt/publish
 * Publish message ke MQTT topic
 * Body: { topic, message }
 */
router.post('/publish', authenticateToken, async (req, res) => {
  try {
    if (!mqttService) {
      return res.status(503).json({
        success: false,
        error: 'MQTT service not available'
      });
    }

    const { topic, message } = req.body;

    if (!topic || message === undefined) {
      return res.status(400).json({
        success: false,
        error: 'topic and message are required'
      });
    }

    await mqttService.publish(topic, message);

    res.json({
      success: true,
      message: `Message published to ${topic}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mqtt/topics
 * Get list of subscribed topics
 */
router.get('/topics', authenticateToken, (req, res) => {
  try {
    if (!mqttService) {
      return res.status(503).json({
        success: false,
        error: 'MQTT service not available'
      });
    }

    const status = mqttService.getStatus();
    res.json({
      success: true,
      data: {
        subscriptions: status.subscriptions,
        topics: status.subscriptionTopics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
