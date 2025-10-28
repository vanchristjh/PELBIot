import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRoleCheck } from '../contexts/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [touchStart, setTouchStart] = useState(null);
  const sidebarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSuperAdmin } = useRoleCheck();

  // Menu untuk SUPER ADMIN (akses lengkap)
  const superAdminMenuItems = [
    { id: 'overview', label: 'Overview', icon: '📊', path: '/dashboard' },
    { id: 'verifiable', label: 'Verifiable', icon: '⚙️', path: '/dashboard/verifiable' },
    { id: 'alarm', label: 'Alarm', icon: '🚨', path: '/dashboard/alarm' },
    { id: 'report', label: 'Report', icon: '📋', path: '/dashboard/report' },
    { id: 'load-profile', label: 'Load Profile', icon: '📊', path: '/dashboard/load-profile' },
    { id: 'weather', label: 'Weather', icon: '🌤️', path: '/dashboard/weather-station' },
    { id: 'ws-live', label: 'WS Live', icon: '📡', path: '/dashboard/ws-live' },
    { id: 'master-data', label: 'Master Data', icon: '💾', path: '/dashboard/master-data' },
    { id: 'trend', label: 'Trend', icon: '📈', path: '/dashboard/trend' },
    { id: 'tutorial', label: 'Tutorial', icon: '❓', path: '/dashboard/tutorial' }
  ];

  // Menu untuk ADMIN (akses terbatas - tanpa advanced features)
  const adminMenuItems = [
    { id: 'overview', label: 'Overview', icon: '📊', path: '/dashboard' },
    { id: 'alarm', label: 'Alarm', icon: '🚨', path: '/dashboard/alarm' },
    { id: 'report', label: 'Report', icon: '📋', path: '/dashboard/report' },
    { id: 'weather', label: 'Weather', icon: '🌤️', path: '/dashboard/weather-station' },
    { id: 'tutorial', label: 'Tutorial', icon: '❓', path: '/dashboard/tutorial' }
  ];

  const menuItems = isSuperAdmin() ? superAdminMenuItems : adminMenuItems;

  // Responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      
      // Auto-close sidebar on mobile
      if (newWidth <= 768) {
        setIsOpen(false);
      } else if (newWidth > 768 && newWidth <= 1200) {
        setIsOpen(true);
      } else {
        setIsOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle touch swipe to open/close sidebar
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const swipeDistance = touchEnd - touchStart;
    
    // Swipe right to open (from left edge)
    if (swipeDistance > 50 && touchStart < 50 && !isOpen) {
      setIsOpen(true);
    }
    // Swipe left to close
    else if (swipeDistance < -50 && isOpen && windowWidth <= 768) {
      setIsOpen(false);
    }
    
    setTouchStart(null);
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Close sidebar when menu item is clicked on mobile
  const handleMenuItemClick = (path) => {
    if (windowWidth <= 768 && isOpen) {
      setIsOpen(false);
    }
    handleMenuClick(path);
  };

  return (
    <div 
      ref={sidebarRef}
      className={`sidebar ${isOpen ? 'open' : 'closed'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="sidebar-header">
        {isOpen && (
          <h2 className={isSuperAdmin() ? 'super-admin-title' : 'admin-title'}>
            {isSuperAdmin() ? '👑 SUPER ADMIN' : '👤 ADMIN'}
          </h2>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Tutup' : 'Buka'}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-menu">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => handleMenuItemClick(item.path)}
            title={item.label}
          >
            <span className="menu-icon">{item.icon}</span>
            {isOpen && <span className="menu-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer with Clock */}
      <div className="sidebar-footer">
        <div className="status-indicator">
          <span className="status-dot"></span>
          {isOpen && <span className="status-text">Connected</span>}
        </div>
        {isOpen && (
          <div className="clock-display">
            {currentTime.toLocaleTimeString('id-ID')}
          </div>
        )}
      </div>
    </div>
  );
}
