import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService, socketService } from '../services/apiService';
import './LoadProfile.css';

const LoadProfile = () => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [profileData, setProfileData] = useState([]);
  const [stats, setStats] = useState({ peak: 0, avg: 0, min: 0, factor: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiService.loadProfile.getHistory(24);
        const data = res.data ? res.data.map((d, i) => ({ hour: i + ':00', load: parseFloat(d.load) })) : [];
        setProfileData(data);
        if (data.length) {
          const vals = data.map(d => d.load);
          const peak = Math.max(...vals);
          const avg = vals.reduce((a, b) => a + b) / vals.length;
          setStats({ peak, avg: avg.toFixed(1), min: Math.min(...vals), factor: ((avg / peak) * 100).toFixed(1) });
        }
      } catch {
        const mock = Array.from({ length: 24 }, (_, i) => ({ hour: i + ':00', load: Math.random() * 80 + 20 }));
        setProfileData(mock);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    socketService.on('connect', () => setSocketConnected(true));
  }, []);

  return <div style={{ padding: '20px' }}>
    <h1> Load Profile</h1>
    <div style={{ padding: '10px', color: socketConnected ? '#00ff88' : '#ff6b6b' }}>
      {socketConnected ? ' Connected' : ' Disconnected'}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
      <div style={{ padding: '15px', background: '#4d2a0a' }}><div style={{ color: '#a8b8c8' }}>Peak</div><div style={{ fontSize: '20px', color: '#ffa800' }}>{stats.peak.toFixed(1)} kW</div></div>
      <div style={{ padding: '15px', background: '#0a4d0a' }}><div style={{ color: '#a8b8c8' }}>Avg</div><div style={{ fontSize: '20px', color: '#00ff88' }}>{stats.avg} kW</div></div>
      <div style={{ padding: '15px', background: '#0a2d4d' }}><div style={{ color: '#a8b8c8' }}>Min</div><div style={{ fontSize: '20px', color: '#00d4ff' }}>{stats.min.toFixed(1)} kW</div></div>
      <div style={{ padding: '15px', background: '#2d4d0a' }}><div style={{ color: '#a8b8c8' }}>Factor</div><div style={{ fontSize: '20px', color: '#64c864' }}>{stats.factor}%</div></div>
    </div>
    {profileData.length > 0 && <ResponsiveContainer width='100%' height={350}>
      <AreaChart data={profileData}><CartesianGrid /><XAxis dataKey='hour' /><YAxis /><Tooltip /><Area type='monotone' dataKey='load' fill='#00d4ff' stroke='#00d4ff' /></AreaChart>
    </ResponsiveContainer>}
  </div>;
};

export default LoadProfile;