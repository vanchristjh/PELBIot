import express from 'express';
import * as panelController from '../controllers/panelController.js';

const router = express.Router();

router.get('/', panelController.getAllPanels);
router.get('/:id', panelController.getPanelById);
router.get('/:id/history', panelController.getPanelHistory);
router.post('/', panelController.createPanel);
router.put('/:id', panelController.updatePanel);
router.post('/:id/control', panelController.controlPanel);

export default router;
