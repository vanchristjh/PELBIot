import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import UserManagement from './admin/UserManagement';
import SettingsManagement from './admin/SettingsManagement';
import AuditLogs from './admin/AuditLogs';
import SystemMonitoring from './admin/SystemMonitoring';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is super admin
  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchStats();
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isSuperAdmin]);

  const fetchStats = async () => {
    try {
      const [statsRes, healthRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/health'),
      ]);

      setStats(statsRes.data.data);
      setHealth(healthRes.data.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setError(err.response?.data?.message || 'Failed to load admin data');
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="admin-container">
        <div className="error-box">
          <h2>❌ Access Denied</h2>
          <p>Only Super Admin users can access this panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>👑 Admin Panel</h2>
          <p className="admin-user">Hello, {currentUser?.username}!</p>
        </div>

        <nav className="admin-nav">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
          <button
            className={`nav-btn ${activeTab === 'monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitoring')}
          >
            📈 Monitoring
          </button>
          <button
            className={`nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            📋 Audit Logs
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="admin-section">
            <h1>📊 Admin Dashboard</h1>
            {loading ? (
              <div className="loading">Loading statistics...</div>
            ) : error ? (
              <div className="error-box">{error}</div>
            ) : (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>👥 Users</h3>
                  <div className="stat-value">{stats?.users?.total || 0}</div>
                  <div className="stat-detail">Active: {stats?.users?.active || 0}</div>
                </div>

                <div className="stat-card">
                  <h3>🔌 Devices</h3>
                  <div className="stat-value">{stats?.devices?.total || 0}</div>
                  <div className="stat-detail">Online: {stats?.devices?.online || 0}</div>
                </div>

                <div className="stat-card">
                  <h3>🚨 Alerts</h3>
                  <div className="stat-value">{stats?.alerts?.total || 0}</div>
                  <div className="stat-detail">Open: {stats?.alerts?.open || 0}</div>
                </div>

                <div className="stat-card critical">
                  <h3>⚠️ Critical Alerts</h3>
                  <div className="stat-value">{stats?.alerts?.critical || 0}</div>
                  <div className="stat-detail">Requires attention</div>
                </div>
              </div>
            )}

            {health && (
              <div className="health-section">
                <h2>🏥 System Health</h2>
                <div className="health-grid">
                  <div className="health-card">
                    <h4>Uptime</h4>
                    <p>{Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</p>
                  </div>
                  <div className="health-card">
                    <h4>Memory Usage</h4>
                    <p>{health.memory.heapUsed} MB / {health.memory.heapTotal} MB</p>
                  </div>
                  <div className="health-card">
                    <h4>Devices Status</h4>
                    <p>{health.devices.online}/{health.devices.total} online</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && <UserManagement />}

        {/* Settings Tab */}
        {activeTab === 'settings' && <SettingsManagement />}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && <SystemMonitoring health={health} />}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && <AuditLogs />}
      </div>
    </div>
  );
};

export default AdminDashboard;
