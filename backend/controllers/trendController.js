import { query } from '../utils/database.js';

export const getPowerTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await query(`
      SELECT 
        DATE(created_at) as date,
        AVG(power) as power,
        MAX(power) as peak_power,
        MIN(power) as min_power
      FROM trends
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [days]);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnergyTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await query(`
      SELECT 
        DATE(created_at) as date,
        SUM(energy) as energy,
        AVG(energy) as avg_energy
      FROM trends
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [days]);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTemperatureTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await query(`
      SELECT 
        DATE(created_at) as date,
        AVG(temperature) as temperature,
        MAX(temperature) as max_temp,
        MIN(temperature) as min_temp
      FROM trends
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [days]);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLoadTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await query(`
      SELECT 
        DATE(created_at) as date,
        AVG(load) as load,
        MAX(load) as peak_load
      FROM trends
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [days]);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
