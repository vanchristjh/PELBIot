import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService, socketService } from '../services/apiService';
import './Report.css';

const Report = () => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiService.reports.generate(startDate, endDate, 'daily');
        if (res.data) {
          const data = res.data.map((d, i) => ({ day: i + 1, energy: parseFloat(d.energy) || 0, cost: parseFloat(d.cost) || 0 }));
          setChartData(data);
        } else {
          setChartData([]);
        }
      } catch (err) {
        console.error('Error generating report:', err);
        setChartData([]);
      }
    };
    fetch();
  }, [startDate, endDate]);

  useEffect(() => {
    socketService.on('connect', () => setSocketConnected(true));
  }, []);

  return <div style={{ padding: '20px' }}>
    <h1> Reports</h1>
    <div style={{ padding: '10px', color: socketConnected ? '#00ff88' : '#ff6b6b' }}>
      {socketConnected ? ' Connected' : ' Disconnected'}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
      <input type='date' value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '8px', background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid #00d4ff' }} />
      <input type='date' value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '8px', background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid #00d4ff' }} />
      <button style={{ padding: '8px', background: '#00d4ff', color: '#000', cursor: 'pointer', borderRadius: '4px' }}>Export CSV</button>
    </div>
    {chartData.length > 0 && <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}><CartesianGrid /><XAxis dataKey='day' /><YAxis /><Tooltip /><Legend /><Bar dataKey='energy' fill='#00d4ff' name='Energy (kWh)' /><Bar dataKey='cost' fill='#ffa800' name='Cost ($)' /></BarChart>
    </ResponsiveContainer>}
  </div>;
};

export default Report;