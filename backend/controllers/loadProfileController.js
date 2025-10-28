import { query } from '../utils/database.js';

export const getLoadProfileHistory = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const profiles = await query(`
      SELECT 
        hour,
        AVG(load) as load,
        MAX(peak) as peak,
        AVG(average) as average
      FROM load_profiles
      WHERE hour >= ? 
      GROUP BY hour
      ORDER BY hour ASC
    `, [24 - hours]);
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPeakLoad = async (req, res) => {
  try {
    const peak = await query(`
      SELECT 
        MAX(peak) as peak_load,
        DATE(created_at) as peak_date
      FROM load_profiles
      GROUP BY DATE(created_at)
      ORDER BY peak_load DESC
      LIMIT 1
    `);
    res.json({ success: true, data: peak[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAverageLoad = async (req, res) => {
  try {
    const average = await query(`
      SELECT 
        AVG(average) as average_load
      FROM load_profiles
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    res.json({ success: true, data: average[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLoadFactor = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        AVG(average) as avg_load,
        MAX(peak) as peak_load,
        (AVG(average) / MAX(peak)) * 100 as load_factor
      FROM load_profiles
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
