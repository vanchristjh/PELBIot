import { query } from '../utils/database.js';

const parseDays = (value, fallback = 30) => {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return fallback;
  return Math.min(n, 365);
};

export const getPowerTrend = async (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    const trends = await query(`
      SELECT 
        DATE(created_at) as date,
        AVG(power) as power,
        MAX(power) as peak_power,
        MIN(power) as min_power
      FROM trends
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnergyTrend = async (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    const trends = await query(`
      SELECT 
        DATE(created_at) as date,
        SUM(energy) as energy,
        AVG(energy) as avg_energy
      FROM trends
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTemperatureTrend = async (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    const trends = await query(`
      SELECT 
        DATE(created_at) as date,
        AVG(temperature) as temperature,
        MAX(temperature) as max_temp,
        MIN(temperature) as min_temp
      FROM trends
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLoadTrend = async (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    const trends = await query(`
      SELECT 
        DATE(created_at) as date,
        AVG(\`load\`) as \`load\`,
        MAX(\`load\`) as peak_load
      FROM trends
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
