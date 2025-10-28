import { query } from '../utils/database.js';

export const generateReport = async (req, res) => {
  try {
    const { start_date, end_date, report_type } = req.body;
    
    let sqlQuery = `
      SELECT 
        DATE(created_at) as date,
        SUM(power) as daily_energy,
        AVG(power) as avg_power,
        MAX(power) as max_power,
        MIN(power) as min_power
      FROM trends
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const data = await query(sqlQuery, [start_date, end_date]);
    
    res.json({
      success: true,
      data: {
        report_type,
        period: { start: start_date, end: end_date },
        records: data,
        total_records: data.length,
        generated_at: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportReport = async (req, res) => {
  try {
    const { start_date, end_date, format } = req.body;
    
    const data = await query(`
      SELECT 
        DATE(created_at) as date,
        SUM(power) as daily_energy,
        AVG(power) as avg_power
      FROM trends
      WHERE DATE(created_at) BETWEEN ? AND ?
      ORDER BY date DESC
    `, [start_date, end_date]);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
      
      let csv = 'Date,Daily Energy,Avg Power\n';
      data.forEach(row => {
        csv += `${row.date},${row.daily_energy},${row.avg_power}\n`;
      });
      
      res.send(csv);
    } else if (format === 'json') {
      res.json({ success: true, data });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = [
      { id: 1, name: 'Daily Energy Report', type: 'daily' },
      { id: 2, name: 'Weekly Performance', type: 'weekly' },
      { id: 3, name: 'Monthly Summary', type: 'monthly' }
    ];
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
