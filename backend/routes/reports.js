import express from 'express';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

router.post('/generate', reportController.generateReport);
router.post('/export', reportController.exportReport);
router.get('/', reportController.getReports);

export default router;
