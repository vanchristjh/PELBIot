import express from 'express';
import * as systemController from '../controllers/systemController.js';

const router = express.Router();

router.get('/health', systemController.getSystemHealth);
router.get('/status', systemController.getSystemStatus);
router.get('/stats', systemController.getSystemStats);
router.get('/energy/stats', systemController.getEnergyStats);

export default router;
