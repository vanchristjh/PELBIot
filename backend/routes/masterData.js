import express from 'express';
import { query } from '../utils/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await query('SELECT * FROM master_data LIMIT 100');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const data = await query('SELECT * FROM master_data WHERE type = ?', [type]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { type, name, value } = req.body;
    const result = await query('INSERT INTO master_data (type, name, value) VALUES (?, ?, ?)', [type, name, value]);
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
