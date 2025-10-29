import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AlertManagement.css';

const AlertManagement = ({ deviceId }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [showTestResult, setShowTestResult] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'warning',
    triggerType: 'threshold',
    metric: 'power',
    thresholdValue: 0,
    comparisonOperator: '>',
    durationSeconds: 300,
    cooldownSeconds: 600,
    notificationEnabled: true,
    emailRecipients: '',
    conditionLogic: ''
  });

  // Operators for comparison
  const operators = ['<', '>', '<=', '>=', '=', '!='];
  const severities = ['info', 'warning', 'critical'];
  const triggerTypes = ['threshold', 'change', 'pattern'];
  const metrics = ['power', 'voltage', 'ampere', 'energy', 'temperature', 'load'];

  // Load alert rules
  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/alert-management/rules/device/${deviceId}`,
          {
            params: { page: pagination.page, limit: pagination.limit },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        setRules(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      } catch (error) {
        console.error('Error loading alert rules:', error);
        alert('Failed to load alert rules');
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) {
      loadRules();
    }
  }, [deviceId, pagination.page, pagination.limit]);

  const loadAlertRules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/alert-management/rules/device/${deviceId}`,
        {
          params: { page: pagination.page, limit: pagination.limit },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setRules(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      });
    } catch (error) {
      console.error('Error loading alert rules:', error);
      alert('Failed to load alert rules');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const payload = {
        deviceId: parseInt(deviceId),
        ...formData,
        thresholdValue: parseFloat(formData.thresholdValue),
        durationSeconds: parseInt(formData.durationSeconds),
        cooldownSeconds: parseInt(formData.cooldownSeconds)
      };

      if (editingRule) {
        await axios.put(
          `/api/alert-management/rules/${editingRule.id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        alert('Alert rule updated successfully');
      } else {
        await axios.post(
          '/api/alert-management/rules',
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        alert('Alert rule created successfully');
      }

      resetForm();
      loadAlertRules();
    } catch (error) {
      console.error('Error saving alert rule:', error);
      alert('Failed to save alert rule: ' + error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      severity: rule.severity,
      triggerType: rule.trigger_type,
      metric: rule.metric,
      thresholdValue: rule.threshold_value || 0,
      comparisonOperator: rule.comparison_operator,
      durationSeconds: rule.duration_seconds,
      cooldownSeconds: rule.cooldown_seconds,
      notificationEnabled: rule.notification_enabled,
      emailRecipients: rule.email_recipients || '',
      conditionLogic: rule.condition_logic || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this alert rule?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(
        `/api/alert-management/rules/${ruleId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Alert rule deleted successfully');
      loadAlertRules();
    } catch (error) {
      console.error('Error deleting alert rule:', error);
      alert('Failed to delete alert rule');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (ruleId, currentState) => {
    try {
      setLoading(true);
      await axios.patch(
        `/api/alert-management/rules/${ruleId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      loadAlertRules();
    } catch (error) {
      console.error('Error toggling alert rule:', error);
      alert('Failed to toggle alert rule');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (ruleId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `/api/alert-management/rules/${ruleId}/test`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setTestResult(response.data);
      setShowTestResult(true);
    } catch (error) {
      console.error('Error testing alert rule:', error);
      alert('Failed to test alert rule');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      severity: 'warning',
      triggerType: 'threshold',
      metric: 'power',
      thresholdValue: 0,
      comparisonOperator: '>',
      durationSeconds: 300,
      cooldownSeconds: 600,
      notificationEnabled: true,
      emailRecipients: '',
      conditionLogic: ''
    });
    setEditingRule(null);
    setShowForm(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#dc3545';
      case 'warning':
        return '#ffc107';
      case 'info':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="alert-management-container">
      <div className="am-header">
        <h2>Alert Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Alert Rule'}
        </button>
      </div>

      {showForm && (
        <div className="am-form-card">
          <h3>{editingRule ? 'Edit Alert Rule' : 'Create New Alert Rule'}</h3>
          <form onSubmit={handleSubmit} className="am-form">
            <div className="form-row">
              <div className="form-group">
                <label>Rule Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., High Temperature Alert"
                  required
                />
              </div>

              <div className="form-group">
                <label>Severity</label>
                <select name="severity" value={formData.severity} onChange={handleInputChange}>
                  {severities.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Trigger Type</label>
                <select name="triggerType" value={formData.triggerType} onChange={handleInputChange}>
                  {triggerTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Metric *</label>
                <select name="metric" value={formData.metric} onChange={handleInputChange} required>
                  {metrics.map((m) => (
                    <option key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Operator</label>
                <select
                  name="comparisonOperator"
                  value={formData.comparisonOperator}
                  onChange={handleInputChange}
                >
                  {operators.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Threshold Value</label>
                <input
                  type="number"
                  step="0.1"
                  name="thresholdValue"
                  value={formData.thresholdValue}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration (seconds)</label>
                <input
                  type="number"
                  name="durationSeconds"
                  value={formData.durationSeconds}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Cooldown (seconds)</label>
                <input
                  type="number"
                  name="cooldownSeconds"
                  value={formData.cooldownSeconds}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Email Recipients</label>
                <input
                  type="email"
                  name="emailRecipients"
                  value={formData.emailRecipients}
                  onChange={handleInputChange}
                  placeholder="email@example.com, email2@example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="notificationEnabled"
                    checked={formData.notificationEnabled}
                    onChange={handleInputChange}
                  />
                  Enable Notifications
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showTestResult && testResult && (
        <div className={`am-test-result ${testResult.test ? 'alert-met' : 'alert-not-met'}`}>
          <div className="test-result-header">
            <h4>Test Result: {testResult.message}</h4>
            <button className="btn-close" onClick={() => setShowTestResult(false)}>×</button>
          </div>
          <div className="test-result-content">
            <p><strong>Rule:</strong> {testResult.ruleName}</p>
            <p><strong>Metric:</strong> {testResult.metric}</p>
            <p><strong>Current Value:</strong> {testResult.currentValue}</p>
            <p><strong>Condition:</strong> {testResult.currentValue} {testResult.operator} {testResult.threshold}</p>
            <p><strong>Severity:</strong> <span style={{ color: getSeverityColor(testResult.severity) }}>{testResult.severity}</span></p>
            <p><strong>Status:</strong> {testResult.isEnabled ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      )}

      <div className="am-rules-list">
        <h3>Active Alert Rules ({pagination.total})</h3>

        {loading && !rules.length && <div className="loading">Loading alert rules...</div>}

        {!loading && rules.length === 0 && (
          <div className="empty-state">
            <p>No alert rules configured yet</p>
            <p>Click "New Alert Rule" to create one</p>
          </div>
        )}

        {rules.map((rule) => (
          <div key={rule.id} className="am-rule-card">
            <div className="rule-header">
              <div className="rule-title">
                <h4>{rule.name}</h4>
                <span className="rule-metric">{rule.metric}</span>
              </div>
              <div className="rule-status">
                <span
                  className={`severity-badge severity-${rule.severity}`}
                  style={{ backgroundColor: getSeverityColor(rule.severity) }}
                >
                  {rule.severity}
                </span>
                <span className={`status-badge ${rule.is_enabled ? 'enabled' : 'disabled'}`}>
                  {rule.is_enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="rule-details">
              {rule.description && (
                <p className="description">{rule.description}</p>
              )}

              <div className="condition-info">
                <p>
                  <strong>Condition:</strong> {rule.metric} {rule.comparison_operator} {rule.threshold_value}
                </p>
                <p>
                  <strong>Duration:</strong> {rule.duration_seconds}s | <strong>Cooldown:</strong> {rule.cooldown_seconds}s
                </p>
                {rule.last_triggered_at && (
                  <p>
                    <strong>Last Triggered:</strong> {new Date(rule.last_triggered_at).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="rule-actions">
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => handleTest(rule.id)}
                  disabled={loading}
                  title="Test this alert rule with current data"
                >
                  🧪 Test
                </button>

                <button
                  className={`btn btn-sm ${rule.is_enabled ? 'btn-warning' : 'btn-success'}`}
                  onClick={() => handleToggle(rule.id, rule.is_enabled)}
                  disabled={loading}
                  title={rule.is_enabled ? 'Disable this rule' : 'Enable this rule'}
                >
                  {rule.is_enabled ? '⏸ Disable' : '▶ Enable'}
                </button>

                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleEdit(rule)}
                  disabled={loading}
                  title="Edit this alert rule"
                >
                  ✎ Edit
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(rule.id)}
                  disabled={loading}
                  title="Delete this alert rule"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {pagination.pages > 1 && (
          <div className="am-pagination">
            <button
              className="btn btn-sm"
              onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="btn btn-sm"
              onClick={() =>
                setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })
              }
              disabled={pagination.page === pagination.pages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertManagement;
