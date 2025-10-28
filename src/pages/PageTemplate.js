import React from 'react';
import './PageTemplate.css';

export default function PageTemplate({ title, icon, description, comingSoon = true }) {
  return (
    <div className="page-template">
      <div className="template-header">
        <h1>{icon} {title}</h1>
      </div>

      <div className="template-content">
        <div className="coming-soon-card">
          <div className="coming-soon-icon">🚀</div>
          <h2>Coming Soon</h2>
          <p>{description || 'This feature is under development'}</p>
          {comingSoon && (
            <div className="development-info">
              <p>✨ We're working hard to bring you this amazing feature!</p>
            </div>
          )}
        </div>

        <div className="placeholder-grid">
          <div className="placeholder-item">
            <div className="placeholder-icon">📊</div>
            <p>Data Visualization</p>
          </div>
          <div className="placeholder-item">
            <div className="placeholder-icon">📈</div>
            <p>Analytics</p>
          </div>
          <div className="placeholder-item">
            <div className="placeholder-icon">⚙️</div>
            <p>Configuration</p>
          </div>
          <div className="placeholder-item">
            <div className="placeholder-icon">🔔</div>
            <p>Notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}
