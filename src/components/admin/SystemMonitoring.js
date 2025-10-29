import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../AdminDashboard.css';

const SystemMonitoring = ({ health: initialHealth }) => {
  const [health, setHealth] = useState(initialHealth);
  const [activityLogs, setActivityLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 15;

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/activity-logs', {
        params: {
          page,
          limit,
        },
      });

      setActivityLogs(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  // Refresh health data
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get('/api/admin/health');
        setHealth(res.data.data);
      } catch (error) {
        console.error('Failed to fetch system health:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalPages = Math.ceil(total / limit);

  const getMemoryPercentage = () => {
    if (!health || !health.memory) return 0;
    return Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100);
  };

  const getDeviceOnlinePercentage = () => {
    if (!health || !health.devices) return 0;
    if (health.devices.total === 0) return 0;
    return Math.round((health.devices.online / health.devices.total) * 100);
  };

  const memoryPercentage = getMemoryPercentage();
  const devicePercentage = getDeviceOnlinePercentage();

  return (
    <div className="admin-section">
      <h2>📈 System Monitoring</h2>

      {health && (
        <div className="monitoring-grid" style={{ marginBottom: '30px' }}>
          <div className="monitor-card">
            <h4>🕐 Server Uptime</h4>
            <div className="uptime-display">
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                {Math.floor(health.uptime / 86400)}d {Math.floor((health.uptime % 86400) / 3600)}h
              </span>
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#718096' }}>
              Total seconds: {health.uptime}
            </p>
          </div>

          <div className="monitor-card">
            <h4>💾 Memory Usage</h4>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${memoryPercentage}%`,
                  background: memoryPercentage > 80 ? '#f5576c' : '#667eea',
                }}
              />
            </div>
            <p style={{ margin: '10px 0 0 0' }}>
              {health.memory.heapUsed}MB / {health.memory.heapTotal}MB ({memoryPercentage}%)
            </p>
          </div>

          <div className="monitor-card">
            <h4>🔧 External Memory</h4>
            <div className="uptime-display">
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                {health.memory.external}MB
              </span>
            </div>
          </div>

          <div className="monitor-card">
            <h4>⚡ CPU Usage</h4>
            <p style={{ fontSize: '14px', margin: '0' }}>
              User: {(health.cpu.user / 1000).toFixed(2)}ms
            </p>
            <p style={{ fontSize: '14px', margin: '5px 0 0 0' }}>
              System: {(health.cpu.system / 1000).toFixed(2)}ms
            </p>
          </div>

          <div className="monitor-card">
            <h4>🔌 Devices Status</h4>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${devicePercentage}%`,
                  background: devicePercentage === 100 ? '#22c55e' : '#f59e0b',
                }}
              />
            </div>
            <p style={{ margin: '10px 0 0 0' }}>
              {health.devices.online} / {health.devices.total} online ({devicePercentage}%)
            </p>
          </div>

          <div className="monitor-card">
            <h4>⚙️ Average Panel</h4>
            <p style={{ fontSize: '14px', margin: '0' }}>
              Voltage: {parseFloat(health.currentPanel.avgVoltage).toFixed(2)}V
            </p>
            <p style={{ fontSize: '14px', margin: '5px 0 0 0' }}>
              Ampere: {parseFloat(health.currentPanel.avgAmpere).toFixed(2)}A
            </p>
          </div>
        </div>
      )}

      <h3>📊 Recent Activity Logs</h3>

      {loading ? (
        <div className="loading">Loading activity logs...</div>
      ) : activityLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          No activity logs found
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Activity</th>
                <th>IP Address</th>
                <th>Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.username || 'System'}</td>
                  <td>
                    <span className="badge badge-info">{log.activity_type}</span>
                  </td>
                  <td><code>{log.ip_address}</code></td>
                  <td>{log.description}</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            First
          </button>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = page > 2 ? page + i - 2 : i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={page === pageNum ? 'active' : ''}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </button>
        </div>
      )}

      <style>{`
        .monitoring-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .monitor-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .monitor-card h4 {
          margin: 0 0 15px 0;
          font-size: 14px;
          opacity: 0.95;
        }

        .monitor-card p {
          margin: 0;
          font-size: 13px;
          opacity: 0.85;
        }

        .uptime-display {
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          margin: 10px 0;
        }

        .progress-bar {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          height: 8px;
          overflow: hidden;
          margin: 10px 0;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default SystemMonitoring;