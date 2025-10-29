/**
 * Sensor Routes
 * API endpoints untuk sensor management
 */

import express from 'express';
import { sensorController } from '../controllers/sensorController.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

// All sensor routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/sensors
 * @desc    Get all sensors
 * @access  Private
 */
router.get('/', sensorController.getAllSensors);

/**
 * @route   GET /api/sensors/:id
 * @desc    Get sensor by ID
 * @access  Private
 */
router.get('/:id', sensorController.getSensorById);

/**
 * @route   POST /api/sensors
 * @desc    Create new sensor
 * @access  Private (Admin only)
 */
router.post('/', sensorController.createSensor);

/**
 * @route   PUT /api/sensors/:id
 * @desc    Update sensor
 * @access  Private (Admin only)
 */
router.put('/:id', sensorController.updateSensor);

/**
 * @route   DELETE /api/sensors/:id
 * @desc    Delete sensor
 * @access  Private (Admin only)
 */
router.delete('/:id', sensorController.deleteSensor);

/**
 * @route   GET /api/sensors/:id/data
 * @desc    Get sensor data
 * @access  Private
 */
router.get('/:id/data', sensorController.getSensorData);

/**
 * @route   GET /api/sensors/:id/data/range
 * @desc    Get sensor data within date range
 * @access  Private
 */
router.get('/:id/data/range', sensorController.getSensorDataRange);

/**
 * @route   POST /api/sensors/:id/test
 * @desc    Test sensor connection
 * @access  Private (Admin only)
 */
router.post('/:id/test', sensorController.testSensorConnection);

/**
 * @route   GET /api/sensors/:id/health
 * @desc    Get sensor health status
 * @access  Private
 */
router.get('/:id/health', sensorController.getSensorHealth);

/**
 * @route   POST /api/sensors/ingest/:sensorId
 * @desc    Ingest sensor data (dari sensor/gateway)
 * @access  Public (dengan API key)
 */
router.post('/ingest/:sensorId', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { value, metadata } = req.body;

    // Validate API key if required
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: 'API key diperlukan' });
    }

    // Process data
    await sensorController.processSensorData(sensorId, { value, metadata });

    res.json({ success: true, message: 'Data ingested' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
