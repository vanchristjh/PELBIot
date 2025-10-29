import { query } from '../utils/database.js';

/**
 * Get all system settings
 */
export const getSettings = async (req, res) => {
  try {
    const settings = await query('SELECT setting_key, setting_value, setting_type, description FROM system_settings ORDER BY setting_key');

    const settingsObj = {};
    settings.forEach(setting => {
      let value = setting.setting_value;
      if (setting.setting_type === 'boolean') {
        value = value === 'true' || value === '1';
      } else if (setting.setting_type === 'number') {
        value = parseFloat(value);
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
      settingsObj[setting.setting_key] = {
        value,
        type: setting.setting_type,
        description: setting.description,
      };
    });

    res.json({
      success: true,
      data: settingsObj,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message,
    });
  }
};

/**
 * Get single setting
 */
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const settings = await query(
      'SELECT setting_key, setting_value, setting_type, description FROM system_settings WHERE setting_key = ?',
      [key]
    );

    if (settings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found',
      });
    }

    const setting = settings[0];
    let value = setting.setting_value;

    if (setting.setting_type === 'boolean') {
      value = value === 'true' || value === '1';
    } else if (setting.setting_type === 'number') {
      value = parseFloat(value);
    } else if (setting.setting_type === 'json') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Keep as string
      }
    }

    res.json({
      success: true,
      data: {
        key: setting.setting_key,
        value,
        type: setting.setting_type,
        description: setting.description,
      },
    });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch setting',
      error: error.message,
    });
  }
};

/**
 * Update setting
 */
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const settings = await query(
      'SELECT id FROM system_settings WHERE setting_key = ?',
      [key]
    );

    if (settings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found',
      });
    }

    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

    await query(
      'UPDATE system_settings SET setting_value = ? WHERE setting_key = ?',
      [valueStr, key]
    );

    res.json({
      success: true,
      message: 'Setting updated successfully',
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting',
      error: error.message,
    });
  }
};

/**
 * Get system statistics
 */
export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await query('SELECT COUNT(*) as count FROM users');
    const activeUsers = await query('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE');
    const totalDevices = await query('SELECT COUNT(*) as count FROM devices');
    const onlineDevices = await query('SELECT COUNT(*) as count FROM devices WHERE status = "online"');
    const totalAlerts = await query('SELECT COUNT(*) as count FROM alerts');
    const openAlerts = await query('SELECT COUNT(*) as count FROM alerts WHERE status = "open"');
    const criticalAlerts = await query('SELECT COUNT(*) as count FROM alerts WHERE severity = "critical" AND status = "open"');

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers[0]?.count || 0,
          active: activeUsers[0]?.count || 0,
        },
        devices: {
          total: totalDevices[0]?.count || 0,
          online: onlineDevices[0]?.count || 0,
        },
        alerts: {
          total: totalAlerts[0]?.count || 0,
          open: openAlerts[0]?.count || 0,
          critical: criticalAlerts[0]?.count || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};

/**
 * Get activity logs
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, user_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];

    if (user_id) {
      whereClause = 'WHERE user_id = ?';
      params.push(user_id);
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM activity_logs ${whereClause}`, params);
    const total = countResult[0]?.total || 0;

    const logs = await query(
      `SELECT al.*, u.username FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message,
    });
  }
};

/**
 * Get system health
 */
export const getSystemHealth = async (req, res) => {
  try {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const devices = await query('SELECT COUNT(*) as total, SUM(CASE WHEN status = "online" THEN 1 ELSE 0 END) as online FROM devices');
    const panels = await query('SELECT AVG(voltage) as avg_voltage, AVG(ampere) as avg_ampere FROM panels');

    res.json({
      success: true,
      data: {
        uptime: Math.floor(uptime),
        memory: {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        devices: {
          total: devices[0]?.total || 0,
          online: devices[0]?.online || 0,
        },
        currentPanel: {
          avgVoltage: panels[0]?.avg_voltage || 0,
          avgAmpere: panels[0]?.avg_ampere || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: error.message,
    });
  }
};
