import express from 'express';
import * as alertController from '../controllers/alertController.js';

const router = express.Router();

router.get('/active', alertController.getActiveAlerts);
router.get('/', alertController.getAllAlerts);
router.post('/', alertController.createAlert);
router.post('/:id/acknowledge', alertController.acknowledgeAlert);
router.get('/:id/details', alertController.getAlertDetails);
router.get('/stats/summary', alertController.getAlertStats);

export default router;
