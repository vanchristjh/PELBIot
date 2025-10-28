import { query } from '../utils/database.js';

export const getSystemHealth = async (req, res) => {
  try {
    const devices = await query('SELECT COUNT(*) as total, SUM(CASE WHEN status = "online" THEN 1 ELSE 0 END) as online FROM devices');
    const alerts = await query('SELECT COUNT(*) as critical FROM alerts WHERE severity = "critical" AND status = "open"');
    
    const totalDevices = devices[0].total;
    const onlineDevices = devices[0].online;
    const uptime = (onlineDevices / totalDevices) * 100;

    res.json({
      success: true,
      data: {
        total_devices: totalDevices,
        online_devices: onlineDevices,
        offline_devices: totalDevices - onlineDevices,
        uptime_percentage: uptime.toFixed(2),
        critical_alerts: alerts[0].critical,
        system_status: uptime > 80 ? 'healthy' : 'warning',
        health_score: uptime.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSystemStatus = async (req, res) => {
  try {
    const devices = await query('SELECT id, name, status FROM devices');
    res.json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(DISTINCT device_id) as total_devices,
        AVG(power) as avg_power,
        MAX(power) as peak_power,
        SUM(energy) as total_energy
      FROM trends
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
    `);
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnergyStats = async (req, res) => {
  try {
    const today = await query('SELECT SUM(energy) as today_energy FROM trends WHERE DATE(created_at) = CURDATE()');
    const thisMonth = await query('SELECT SUM(energy) as month_energy FROM trends WHERE MONTH(created_at) = MONTH(NOW())');
    
    res.json({
      success: true,
      data: {
        today_energy: today[0].today_energy || 0,
        this_month_energy: thisMonth[0].month_energy || 0,
        estimated_cost: ((thisMonth[0].month_energy || 0) * 1500) / 1000
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
