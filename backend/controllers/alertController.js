import { query } from '../utils/database.js';

export const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await query(`
      SELECT a.*, d.name as device_name 
      FROM alerts a 
      JOIN devices d ON a.device_id = d.id 
      WHERE a.status = 'open'
      ORDER BY a.created_at DESC
    `);
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await query(`
      SELECT a.*, d.name as device_name 
      FROM alerts a 
      JOIN devices d ON a.device_id = d.id 
      ORDER BY a.created_at DESC 
      LIMIT 100
    `);
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAlert = async (req, res) => {
  try {
    const { device_id, severity, message } = req.body;
    const result = await query('INSERT INTO alerts (device_id, severity, message, status) VALUES (?, ?, ?, ?)', [device_id, severity, message, 'open']);
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE alerts SET status = ? WHERE id = ?', ['acknowledged', id]);
    res.json({ success: true, message: 'Alert acknowledged' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlertDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await query('SELECT * FROM alerts WHERE id = ?', [id]);
    res.json({ success: true, data: alert[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlertStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT severity, COUNT(*) as count 
      FROM alerts 
      WHERE status = 'open'
      GROUP BY severity
    `);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
