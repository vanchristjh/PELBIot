import React, { useState } from 'react';
import '../pages/Alarm.css';

export default function Alarm() {
  const [alarms, setAlarms] = useState([
    { id: 1, type: 'Critical', message: 'Transformer UTM-01 High Temperature', time: '10:45 AM', acknowledged: false },
    { id: 2, type: 'Warning', message: 'Power Factor Below 0.95', time: '09:30 AM', acknowledged: false },
    { id: 3, type: 'Info', message: 'Maintenance Schedule Due', time: '08:15 AM', acknowledged: true },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredAlarms = filter === 'all' ? alarms : alarms.filter(alarm => alarm.type.toLowerCase() === filter);

  return (
    <div className="alarm-page">
      <div className="alarm-header">
        <h1>🚨 Alarm Management</h1>
      </div>
      <div className="filter-controls">
        <button className="filter-btn active" onClick={() => setFilter('all')}>All</button>
        <button className="filter-btn" onClick={() => setFilter('critical')}>Critical</button>
      </div>
      <div className="alarms-list">
        {filteredAlarms.map(alarm => (
          <div key={alarm.id} className="alarm-item">
            <div className="alarm-header-item">
              <span className="alarm-type">{alarm.type}</span>
              <span className="alarm-time">{alarm.time}</span>
            </div>
            <div className="alarm-content">
              <p>{alarm.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
