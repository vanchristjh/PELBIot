import express from 'express';
import * as trendController from '../controllers/trendController.js';

const router = express.Router();

router.get('/power', trendController.getPowerTrend);
router.get('/energy', trendController.getEnergyTrend);
router.get('/temperature', trendController.getTemperatureTrend);
router.get('/load', trendController.getLoadTrend);

export default router;
