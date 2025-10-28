import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService, socketService } from '../services/apiService';
import './Overview.css';

const Overview = () => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [overview, setOverview] = useState({ totalEnergy: 0, totalCost: 0, peakPower: 0, avgLoad: 0, devices: 0, online: 0, health: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiService.data.getHistory(24);
        if (res.data) {
          const data = res.data.map((d, i) => ({ hour: i + ':00', power: parseFloat(d.power) || 0, energy: parseFloat(d.energy) || 0, efficiency: Math.random() * 30 + 70 }));
          setChartData(data);
          const totalEnergy = data.reduce((sum, d) => sum + d.energy, 0);
          const powers = data.map(d => d.power);
          const peakPower = Math.max(...powers);
          const avgLoad = (powers.reduce((a, b) => a + b) / powers.length).toFixed(2);
          setOverview(p => ({ ...p, totalEnergy: totalEnergy.toFixed(2), totalCost: (totalEnergy * 1.5).toFixed(2), peakPower: peakPower.toFixed(2), avgLoad }));
        }
      } catch {
        const mock = Array.from({ length: 24 }, (_, i) => ({ hour: i + ':00', power: Math.random() * 80 + 20, energy: Math.random() * 100 + 50, efficiency: Math.random() * 30 + 70 }));
        setChartData(mock);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    socketService.on('connect', () => setSocketConnected(true));
  }, []);

  return <div style={{ padding: '20px' }}>
    <h1> System Overview</h1>
    <div style={{ padding: '10px', color: socketConnected ? '#00ff88' : '#ff6b6b' }}>
      {socketConnected ? ' Connected' : ' Disconnected'}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
      <div style={{ padding: '20px', background: '#0a4d0a' }}><div style={{ color: '#a8b8c8' }}>Today Energy</div><div style={{ fontSize: '24px', color: '#00ff88', fontWeight: 'bold' }}>{overview.totalEnergy} kWh</div></div>
      <div style={{ padding: '20px', background: '#4d2a0a' }}><div style={{ color: '#a8b8c8' }}>Cost</div><div style={{ fontSize: '24px', color: '#ffa800', fontWeight: 'bold' }}></div></div>
      <div style={{ padding: '20px', background: '#0a2d4d' }}><div style={{ color: '#a8b8c8' }}>Peak</div><div style={{ fontSize: '24px', color: '#00d4ff', fontWeight: 'bold' }}>{overview.peakPower} kW</div></div>
      <div style={{ padding: '20px', background: '#2d4d0a' }}><div style={{ color: '#a8b8c8' }}>Avg Load</div><div style={{ fontSize: '24px', color: '#64c864', fontWeight: 'bold' }}>{overview.avgLoad} kW</div></div>
    </div>
    {chartData.length > 0 && <>
      <div style={{ marginBottom: '20px' }}><ResponsiveContainer width='100%' height={300}>
        <LineChart data={chartData}><CartesianGrid /><XAxis dataKey='hour' /><YAxis /><Tooltip /><Legend /><Line type='monotone' dataKey='power' stroke='#00d4ff' name='Power (kW)' /><Line type='monotone' dataKey='energy' stroke='#00ff88' name='Energy (kWh)' /></LineChart>
      </ResponsiveContainer></div>
      <ResponsiveContainer width='100%' height={250}>
        <AreaChart data={chartData}><CartesianGrid /><XAxis dataKey='hour' /><YAxis domain={[0, 100]} /><Tooltip /><Area type='monotone' dataKey='efficiency' fill='#00ff88' stroke='#00d4ff' name='Efficiency %' /></AreaChart>
      </ResponsiveContainer>
    </>}
  </div>;
};

export default Overview;