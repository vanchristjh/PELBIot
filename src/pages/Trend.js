import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService, socketService } from '../services/apiService';
import './Trend.css';

const Trend = () => {
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [stats, setStats] = useState({ avg: 0, max: 0, min: 0 });
  const [metric, setMetric] = useState('power');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiService.trends.getPowerTrend(7);
        const data = res.data ? res.data.map((d, i) => ({ day: i + 1, value: parseFloat(d.value) })) : [];
        setTrendData(data);
        if (data.length) {
          const vals = data.map(d => d.value);
          setStats({ avg: (vals.reduce((a, b) => a + b) / vals.length).toFixed(2), max: Math.max(...vals), min: Math.min(...vals) });
        }
      } catch {
        const mock = Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: Math.random() * 100 }));
        setTrendData(mock);
      } finally { setLoading(false); }
    };
    fetch();
  }, [metric]);

  useEffect(() => {
    socketService.on('connect', () => setSocketConnected(true));
    return () => socketService.off('connect');
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return <div style={{ padding: '20px' }}>
    <h1> Trend Analysis</h1>
    <div style={{ padding: '10px', color: socketConnected ? '#00ff88' : '#ff6b6b' }}>
      {socketConnected ? ' Connected' : ' Disconnected'}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
      <div style={{ padding: '15px', background: '#0a4d0a' }}><div style={{ color: '#a8b8c8' }}>Avg</div><div style={{ fontSize: '24px', color: '#00ff88' }}>{stats.avg}</div></div>
      <div style={{ padding: '15px', background: '#4d2a0a' }}><div style={{ color: '#a8b8c8' }}>Max</div><div style={{ fontSize: '24px', color: '#ffa800' }}>{stats.max}</div></div>
      <div style={{ padding: '15px', background: '#4d0a0a' }}><div style={{ color: '#a8b8c8' }}>Min</div><div style={{ fontSize: '24px', color: '#ff4757' }}>{stats.min}</div></div>
    </div>
    {trendData.length > 0 && <ResponsiveContainer width='100%' height={350}>
      <LineChart data={trendData}><CartesianGrid /><XAxis dataKey='day' /><YAxis /><Tooltip /><Line type='monotone' dataKey='value' stroke='#00d4ff' /></LineChart>
    </ResponsiveContainer>}
  </div>;
};

export default Trend;