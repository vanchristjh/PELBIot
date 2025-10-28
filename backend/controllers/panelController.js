import { query } from '../utils/database.js';

export const getAllPanels = async (req, res) => {
  try {
    const panels = await query(`
      SELECT p.*, d.name as device_name 
      FROM panels p 
      JOIN devices d ON p.device_id = d.id
    `);
    res.json({ success: true, data: panels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPanelById = async (req, res) => {
  try {
    const { id } = req.params;
    const panel = await query('SELECT * FROM panels WHERE id = ?', [id]);
    res.json({ success: true, data: panel[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPanelHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await query('SELECT * FROM panels WHERE device_id = ? ORDER BY created_at DESC LIMIT 100', [id]);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPanel = async (req, res) => {
  try {
    const { device_id, panel_number, voltage, ampere, power, status } = req.body;
    const result = await query('INSERT INTO panels (device_id, panel_number, voltage, ampere, power, status) VALUES (?, ?, ?, ?, ?, ?)', [device_id, panel_number, voltage, ampere, power, status]);
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePanel = async (req, res) => {
  try {
    const { id } = req.params;
    const { voltage, ampere, power, status } = req.body;
    await query('UPDATE panels SET voltage = ?, ampere = ?, power = ?, status = ? WHERE id = ?', [voltage, ampere, power, status, id]);
    res.json({ success: true, message: 'Panel updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const controlPanel = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    res.json({ success: true, message: `Panel ${action} command sent` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
