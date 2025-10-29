import { query } from '../utils/database.js';

/**
 * Create new alert rule
 */
export const createAlertRule = async (req, res) => {
  try {
    const {
      deviceId,
      name,
      description,
      severity,
      triggerType,
      thresholdValue,
      comparisonOperator,
      metric,
      durationSeconds,
      cooldownSeconds,
      notificationEnabled,
      emailRecipients,
      conditionLogic
    } = req.body;

    // Validate required fields
    if (!deviceId || !name || !metric) {
      return res.status(400).json({ error: 'Missing required fields: deviceId, name, metric' });
    }

    // Verify device exists
    const devices = await query('SELECT id FROM devices WHERE id = ?', [deviceId]);
    if (!devices.length) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Insert alert rule
    const result = await query(
      `INSERT INTO alert_rules 
       (device_id, name, description, severity, trigger_type, threshold_value, comparison_operator, metric, duration_seconds, cooldown_seconds, notification_enabled, email_recipients, condition_logic, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        deviceId,
        name,
        description || null,
        severity || 'warning',
        triggerType || 'threshold',
        thresholdValue || null,
        comparisonOperator || '>',
        metric,
        durationSeconds || 300,
        cooldownSeconds || 600,
        notificationEnabled !== false,
        emailRecipients || null,
        conditionLogic || null,
        req.user?.id || null
      ]
    );

    res.json({
      success: true,
      message: 'Alert rule created successfully',
      ruleId: result.insertId,
      rule: {
        id: result.insertId,
        deviceId,
        name,
        severity,
        triggerType,
        metric,
        isEnabled: true
      }
    });
  } catch (error) {
    console.error('Error creating alert rule:', error.message);
    res.status(500).json({ error: 'Failed to create alert rule', details: error.message });
  }
};

/**
 * Get all alert rules for a device
 */
export const getAlertRules = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const rules = await query(
      `SELECT id, device_id, name, description, severity, is_enabled, trigger_type, metric, 
              threshold_value, comparison_operator, notification_enabled, duration_seconds, cooldown_seconds, 
              last_triggered_at, created_at, updated_at 
       FROM alert_rules 
       WHERE device_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [deviceId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM alert_rules WHERE device_id = ?',
      [deviceId]
    );

    res.json({
      success: true,
      data: rules,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting alert rules:', error.message);
    res.status(500).json({ error: 'Failed to get alert rules', details: error.message });
  }
};

/**
 * Get single alert rule with conditions
 */
export const getAlertRuleDetail = async (req, res) => {
  try {
    const { ruleId } = req.params;

    if (!ruleId) {
      return res.status(400).json({ error: 'ruleId is required' });
    }

    const rules = await query(
      'SELECT * FROM alert_rules WHERE id = ?',
      [ruleId]
    );

    if (!rules.length) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    const rule = rules[0];

    // Get conditions
    const conditions = await query(
      'SELECT * FROM alert_rule_conditions WHERE rule_id = ? ORDER BY created_at',
      [ruleId]
    );

    // Get recent triggers
    const recentTriggers = await query(
      'SELECT * FROM alert_rule_triggers WHERE rule_id = ? ORDER BY trigger_time DESC LIMIT 10',
      [ruleId]
    );

    res.json({
      success: true,
      data: {
        ...rule,
        conditions,
        recentTriggers
      }
    });
  } catch (error) {
    console.error('Error getting alert rule detail:', error.message);
    res.status(500).json({ error: 'Failed to get alert rule details', details: error.message });
  }
};

/**
 * Update alert rule
 */
export const updateAlertRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const {
      name,
      description,
      severity,
      triggerType,
      thresholdValue,
      comparisonOperator,
      metric,
      durationSeconds,
      cooldownSeconds,
      notificationEnabled,
      emailRecipients,
      isEnabled,
      conditionLogic
    } = req.body;

    if (!ruleId) {
      return res.status(400).json({ error: 'ruleId is required' });
    }

    // Verify rule exists
    const rules = await query('SELECT id FROM alert_rules WHERE id = ?', [ruleId]);
    if (!rules.length) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    // Update rule
    await query(
      `UPDATE alert_rules 
       SET name = ?, description = ?, severity = ?, trigger_type = ?, threshold_value = ?, 
           comparison_operator = ?, metric = ?, duration_seconds = ?, cooldown_seconds = ?, 
           notification_enabled = ?, email_recipients = ?, is_enabled = ?, condition_logic = ?, 
           updated_at = NOW() 
       WHERE id = ?`,
      [
        name || undefined,
        description || undefined,
        severity || undefined,
        triggerType || undefined,
        thresholdValue || undefined,
        comparisonOperator || undefined,
        metric || undefined,
        durationSeconds || undefined,
        cooldownSeconds || undefined,
        notificationEnabled,
        emailRecipients || undefined,
        isEnabled,
        conditionLogic || undefined,
        ruleId
      ]
    );

    res.json({
      success: true,
      message: 'Alert rule updated successfully',
      ruleId: parseInt(ruleId)
    });
  } catch (error) {
    console.error('Error updating alert rule:', error.message);
    res.status(500).json({ error: 'Failed to update alert rule', details: error.message });
  }
};

/**
 * Delete alert rule
 */
export const deleteAlertRule = async (req, res) => {
  try {
    const { ruleId } = req.params;

    if (!ruleId) {
      return res.status(400).json({ error: 'ruleId is required' });
    }

    // Verify rule exists
    const rules = await query('SELECT id FROM alert_rules WHERE id = ?', [ruleId]);
    if (!rules.length) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    // Delete rule (cascade deletes conditions and triggers)
    await query('DELETE FROM alert_rules WHERE id = ?', [ruleId]);

    res.json({
      success: true,
      message: 'Alert rule deleted successfully',
      ruleId: parseInt(ruleId)
    });
  } catch (error) {
    console.error('Error deleting alert rule:', error.message);
    res.status(500).json({ error: 'Failed to delete alert rule', details: error.message });
  }
};

/**
 * Toggle alert rule enabled/disabled
 */
export const toggleAlertRule = async (req, res) => {
  try {
    const { ruleId } = req.params;

    if (!ruleId) {
      return res.status(400).json({ error: 'ruleId is required' });
    }

    // Get current state
    const rules = await query('SELECT is_enabled FROM alert_rules WHERE id = ?', [ruleId]);
    if (!rules.length) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    const newState = !rules[0].is_enabled;

    // Update state
    await query('UPDATE alert_rules SET is_enabled = ?, updated_at = NOW() WHERE id = ?', [
      newState,
      ruleId
    ]);

    res.json({
      success: true,
      message: `Alert rule ${newState ? 'enabled' : 'disabled'} successfully`,
      ruleId: parseInt(ruleId),
      isEnabled: newState
    });
  } catch (error) {
    console.error('Error toggling alert rule:', error.message);
    res.status(500).json({ error: 'Failed to toggle alert rule', details: error.message });
  }
};

/**
 * Add condition to alert rule
 */
export const addAlertCondition = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const { conditionType, metric, operator, value, unit, logicalOperator } = req.body;

    if (!ruleId || !metric || !operator || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify rule exists
    const rules = await query('SELECT id FROM alert_rules WHERE id = ?', [ruleId]);
    if (!rules.length) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    // Add condition
    const result = await query(
      `INSERT INTO alert_rule_conditions 
       (rule_id, condition_type, metric, operator, value, unit, logical_operator) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ruleId, conditionType || null, metric, operator, value, unit || null, logicalOperator || 'AND']
    );

    res.json({
      success: true,
      message: 'Condition added successfully',
      conditionId: result.insertId
    });
  } catch (error) {
    console.error('Error adding alert condition:', error.message);
    res.status(500).json({ error: 'Failed to add condition', details: error.message });
  }
};

/**
 * Delete alert condition
 */
export const deleteAlertCondition = async (req, res) => {
  try {
    const { conditionId } = req.params;

    if (!conditionId) {
      return res.status(400).json({ error: 'conditionId is required' });
    }

    // Verify condition exists
    const conditions = await query('SELECT id FROM alert_rule_conditions WHERE id = ?', [conditionId]);
    if (!conditions.length) {
      return res.status(404).json({ error: 'Condition not found' });
    }

    // Delete condition
    await query('DELETE FROM alert_rule_conditions WHERE id = ?', [conditionId]);

    res.json({
      success: true,
      message: 'Condition deleted successfully',
      conditionId: parseInt(conditionId)
    });
  } catch (error) {
    console.error('Error deleting alert condition:', error.message);
    res.status(500).json({ error: 'Failed to delete condition', details: error.message });
  }
};

/**
 * Get alert triggers/history
 */
export const getAlertTriggerHistory = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!ruleId) {
      return res.status(400).json({ error: 'ruleId is required' });
    }

    const triggers = await query(
      `SELECT * FROM alert_rule_triggers 
       WHERE rule_id = ? 
       ORDER BY trigger_time DESC 
       LIMIT ? OFFSET ?`,
      [ruleId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM alert_rule_triggers WHERE rule_id = ?',
      [ruleId]
    );

    res.json({
      success: true,
      data: triggers,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting alert trigger history:', error.message);
    res.status(500).json({ error: 'Failed to get trigger history', details: error.message });
  }
};

/**
 * Acknowledge alert trigger
 */
export const acknowledgeAlertTrigger = async (req, res) => {
  try {
    const { triggerId } = req.params;
    const { status } = req.body;

    if (!triggerId) {
      return res.status(400).json({ error: 'triggerId is required' });
    }

    if (!['acknowledged', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify trigger exists
    const triggers = await query('SELECT id FROM alert_rule_triggers WHERE id = ?', [triggerId]);
    if (!triggers.length) {
      return res.status(404).json({ error: 'Trigger not found' });
    }

    // Update trigger
    await query(
      'UPDATE alert_rule_triggers SET ack_status = ?, ack_time = NOW(), ack_by = ? WHERE id = ?',
      [status, req.user?.id || null, triggerId]
    );

    res.json({
      success: true,
      message: `Alert trigger marked as ${status}`,
      triggerId: parseInt(triggerId),
      status
    });
  } catch (error) {
    console.error('Error acknowledging alert trigger:', error.message);
    res.status(500).json({ error: 'Failed to acknowledge trigger', details: error.message });
  }
};

/**
 * Test alert rule with current device data
 */
export const testAlertRule = async (req, res) => {
  try {
    const { ruleId } = req.params;

    if (!ruleId) {
      return res.status(400).json({ error: 'ruleId is required' });
    }

    // Get rule
    const rules = await query('SELECT * FROM alert_rules WHERE id = ?', [ruleId]);
    if (!rules.length) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    const rule = rules[0];

    // Get latest data for device
    const latestData = await query(
      `SELECT * FROM trends 
       WHERE device_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [rule.device_id]
    );

    if (!latestData.length) {
      return res.json({
        success: true,
        test: false,
        reason: 'No data available for testing',
        message: 'Device has no recent data'
      });
    }

    const data = latestData[0];
    const metricValue = data[rule.metric];

    if (metricValue === undefined || metricValue === null) {
      return res.json({
        success: true,
        test: false,
        reason: `Metric '${rule.metric}' not available in current data`,
        message: 'Metric not found'
      });
    }

    // Test condition
    let conditionMet = false;
    switch (rule.comparison_operator) {
      case '<':
        conditionMet = metricValue < rule.threshold_value;
        break;
      case '>':
        conditionMet = metricValue > rule.threshold_value;
        break;
      case '<=':
        conditionMet = metricValue <= rule.threshold_value;
        break;
      case '>=':
        conditionMet = metricValue >= rule.threshold_value;
        break;
      case '=':
        conditionMet = metricValue === rule.threshold_value;
        break;
      case '!=':
        conditionMet = metricValue !== rule.threshold_value;
        break;
      default:
        conditionMet = false;
    }

    res.json({
      success: true,
      test: conditionMet,
      ruleName: rule.name,
      metric: rule.metric,
      currentValue: metricValue,
      threshold: rule.threshold_value,
      operator: rule.comparison_operator,
      message: conditionMet ? 'Alert condition MET' : 'Alert condition NOT met',
      severity: rule.severity,
      isEnabled: rule.is_enabled
    });
  } catch (error) {
    console.error('Error testing alert rule:', error.message);
    res.status(500).json({ error: 'Failed to test alert rule', details: error.message });
  }
};

const alertManagementController = {
  createAlertRule,
  getAlertRules,
  getAlertRuleDetail,
  updateAlertRule,
  deleteAlertRule,
  toggleAlertRule,
  addAlertCondition,
  deleteAlertCondition,
  getAlertTriggerHistory,
  acknowledgeAlertTrigger,
  testAlertRule
};

export default alertManagementController;
