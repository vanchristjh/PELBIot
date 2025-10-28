import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useRoleCheck } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { isSuperAdmin, isAdmin } = useRoleCheck();

  // Menu untuk Super Admin (lengkap dengan Admin Panel)
  const superAdminMenuItems = [
    { path: '/dashboard', label: '📊 Dashboard', id: 'dashboard' },
    { path: '/admin-panel', label: '⚙️ Super Admin Panel', id: 'admin', superAdminOnly: true },
    { path: '/panel-distribusi', label: '⚡ Panel Distribusi', id: 'panel' },
    { path: '/trafo', label: '🔌 Trafo', id: 'trafo' },
    { path: '/laporan', label: '📋 Laporan', id: 'laporan' }
  ];

  // Menu untuk Admin (tanpa Admin Panel)
  const adminMenuItems = [
    { path: '/dashboard', label: '📊 Dashboard', id: 'dashboard' },
    { path: '/panel-distribusi', label: '⚡ Panel Distribusi', id: 'panel' },
    { path: '/trafo', label: '🔌 Trafo', id: 'trafo' },
    { path: '/laporan', label: '📋 Laporan', id: 'laporan' }
  ];

  const menuItems = isSuperAdmin() ? superAdminMenuItems : adminMenuItems;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplay = () => {
    if (isSuperAdmin()) return '👑 Super Admin';
    if (isAdmin()) return '👤 Admin';
    return '👤 User';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo & Title */}
        <div className="navbar-brand">
          <div className="navbar-logo">⚡</div>
          <div className="navbar-title">
            <h1>Sistem Monitoring Energi Listrik</h1>
            <p>Berbasis IoT - Simulasi Trafo & Panel Distribusi</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="navbar-menu">
          {menuItems.map((item) => {
            return (
              <button
                key={item.id}
                className={`navbar-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={item.superAdminOnly ? 'Hanya Super Admin' : ''}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          <div className="user-info">
            <span className={`role-badge ${isSuperAdmin() ? 'super-admin' : 'admin'}`} title={`Username: ${currentUser?.username || 'User'}`}>
              {getRoleDisplay()}
            </span>
            <span className="username">{currentUser?.username || 'User'}</span>
          </div>
          
          <div className="status-badge">
            <span className="status-dot">🟢</span>
            <span>Online</span>
          </div>

          <button className="logout-btn" onClick={handleLogout} title="Logout">
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
