import express from 'express';
import * as loadController from '../controllers/loadProfileController.js';

const router = express.Router();

router.get('/history', loadController.getLoadProfileHistory);
router.get('/peak', loadController.getPeakLoad);
router.get('/average', loadController.getAverageLoad);
router.get('/factor', loadController.getLoadFactor);

export default router;
