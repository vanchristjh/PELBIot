import express from 'express';
import * as deviceController from '../controllers/deviceController.js';

const router = express.Router();

router.get('/', deviceController.getAllDevices);
router.get('/:id', deviceController.getDeviceById);
router.post('/', deviceController.createDevice);
router.put('/:id', deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);
router.get('/status/all', deviceController.getDeviceStatus);

export default router;
