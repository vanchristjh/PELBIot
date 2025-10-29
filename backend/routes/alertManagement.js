import express from 'express';
import alertManagementController from '../controllers/alertManagementController.js';
import { authMiddleware } from '../utils/authUtils.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Alert Rule Management
router.post('/rules', alertManagementController.createAlertRule);
router.get('/rules/device/:deviceId', alertManagementController.getAlertRules);
router.get('/rules/:ruleId', alertManagementController.getAlertRuleDetail);
router.put('/rules/:ruleId', alertManagementController.updateAlertRule);
router.delete('/rules/:ruleId', alertManagementController.deleteAlertRule);
router.patch('/rules/:ruleId/toggle', alertManagementController.toggleAlertRule);

// Alert Conditions
router.post('/rules/:ruleId/conditions', alertManagementController.addAlertCondition);
router.delete('/conditions/:conditionId', alertManagementController.deleteAlertCondition);

// Alert Triggers/History
router.get('/rules/:ruleId/triggers', alertManagementController.getAlertTriggerHistory);
router.put('/triggers/:triggerId/acknowledge', alertManagementController.acknowledgeAlertTrigger);

// Test Alert Rule
router.post('/rules/:ruleId/test', alertManagementController.testAlertRule);

export default router;
