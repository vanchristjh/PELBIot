import React, { useState, useEffect } from 'react';
import { apiService, socketService } from '../services/apiService';
import './Alarm.css';

const Alarm = () => {
  const [alarms, setAlarms] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ critical: 0, warning: 0, info: 0 });

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const res = await apiService.alerts.getActive();
        if (res.data) setAlarms(res.data);
      } catch {
        setAlarms([{ id: 1, severity: 'critical', message: 'Temperature High', source: 'Trafo', timestamp: new Date(), acknowledged: false }]);
      }
    };
    fetchAlarms();
  }, []);

  useEffect(() => {
    socketService.on('alert-created', (data) => setAlarms(p => [data, ...p.slice(0, 99)]));
    socketService.on('connect', () => setSocketConnected(true));
    return () => socketService.off('alert-created');
  }, []);

  useEffect(() => {
    setStats({
      critical: alarms.filter(a => a.severity === 'critical').length,
      warning: alarms.filter(a => a.severity === 'warning').length,
      info: alarms.filter(a => a.severity === 'info').length
    });
  }, [alarms]);

  const filtered = alarms.filter(a => filter === 'all' || a.severity === filter);
  const colors = { critical: '#ff4757', warning: '#ffa502', info: '#0066ff' };

  return <div style={{ padding: '20px' }}>
    <h1> Alarm Real-Time</h1>
    <div style={{ padding: '10px', color: socketConnected ? '#00ff88' : '#ff6b6b' }}>
      {socketConnected ? ' Connected' : ' Disconnected'}
    </div>
    <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '8px', marginBottom: '20px' }}>
      <option value='all'>All</option>
      <option value='critical'>Critical ({stats.critical})</option>
      <option value='warning'>Warning ({stats.warning})</option>
      <option value='info'>Info ({stats.info})</option>
    </select>
    <div>{filtered.map(a => <div key={a.id} style={{ padding: '15px', marginBottom: '10px', border: '1px solid ' + colors[a.severity], borderRadius: '8px' }}>
      <div style={{ color: colors[a.severity], fontWeight: 'bold' }}>{a.message}</div>
      <div style={{ fontSize: '12px', color: '#a8b8c8' }}>{a.source}</div>
    </div>)}</div>
  </div>;
};

export default Alarm;