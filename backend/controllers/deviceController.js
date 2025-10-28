import { query } from '../utils/database.js';

export const getAllDevices = async (req, res) => {
  try {
    const devices = await query('SELECT * FROM devices');
    res.json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await query('SELECT * FROM devices WHERE id = ?', [id]);
    res.json({ success: true, data: device[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDevice = async (req, res) => {
  try {
    const { name, type, status, location, ip_address } = req.body;
    const result = await query('INSERT INTO devices (name, type, status, location, ip_address) VALUES (?, ?, ?, ?, ?)', [name, type, status, location, ip_address]);
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, status, location, ip_address } = req.body;
    await query('UPDATE devices SET name = ?, type = ?, status = ?, location = ?, ip_address = ? WHERE id = ?', [name, type, status, location, ip_address, id]);
    res.json({ success: true, message: 'Device updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM devices WHERE id = ?', [id]);
    res.json({ success: true, message: 'Device deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDeviceStatus = async (req, res) => {
  try {
    const devices = await query('SELECT id, name, status FROM devices');
    res.json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
