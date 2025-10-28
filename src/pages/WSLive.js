import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService, socketService } from '../services/apiService';
import './WSLive.css';

const WSLive = () => {
  const [liveData, setLiveData] = useState([]);
  const [current, setCurrent] = useState({ voltage: 0, ampere: 0, power: 0, frequency: 0, pf: 0 });
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiService.data.getCurrent();
        if (res.data) {
          setCurrent({ voltage: res.data.voltage || 380, ampere: res.data.ampere || 0, power: res.data.power || 0, frequency: 50, pf: 0.95 });
        }
      } catch {}
    };
    fetch();
  }, []);

  useEffect(() => {
    const handle = (data) => {
      setCurrent({ voltage: data.voltage || 380, ampere: data.ampere || 0, power: data.power || 0, frequency: 50, pf: 0.95 });
      setLiveData(p => [...p.slice(-99), { time: new Date().toLocaleTimeString('id-ID'), ampere: data.ampere, power: data.power }]);
    };
    socketService.on('ampere-data-update', handle);
    socketService.on('connect', () => setSocketConnected(true));
    return () => socketService.off('ampere-data-update');
  }, []);

  return <div style={{ padding: '20px' }}>
    <h1> WebSocket Live Meter</h1>
    <div style={{ padding: '10px', color: socketConnected ? '#00ff88' : '#ff6b6b' }}>
      {socketConnected ? ' Connected (Streaming)' : ' Disconnected'}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '20px' }}>
      <div style={{ padding: '20px', background: 'rgba(0,212,255,0.1)', textAlign: 'center' }}><div style={{ fontSize: '12px', color: '#a8b8c8' }}>Voltage</div><div style={{ fontSize: '32px', color: '#00d4ff', fontWeight: 'bold' }}>{current.voltage.toFixed(1)}</div><div style={{ fontSize: '10px', color: '#a8b8c8' }}>VAC</div></div>
      <div style={{ padding: '20px', background: 'rgba(0,255,136,0.1)', textAlign: 'center' }}><div style={{ fontSize: '12px', color: '#a8b8c8' }}>Current</div><div style={{ fontSize: '32px', color: '#00ff88', fontWeight: 'bold' }}>{current.ampere.toFixed(2)}</div><div style={{ fontSize: '10px', color: '#a8b8c8' }}>A</div></div>
      <div style={{ padding: '20px', background: 'rgba(255,168,0,0.1)', textAlign: 'center' }}><div style={{ fontSize: '12px', color: '#a8b8c8' }}>Power</div><div style={{ fontSize: '32px', color: '#ffa800', fontWeight: 'bold' }}>{current.power.toFixed(2)}</div><div style={{ fontSize: '10px', color: '#a8b8c8' }}>kW</div></div>
      <div style={{ padding: '20px', background: 'rgba(0,174,239,0.1)', textAlign: 'center' }}><div style={{ fontSize: '12px', color: '#a8b8c8' }}>Frequency</div><div style={{ fontSize: '32px', color: '#00aeef', fontWeight: 'bold' }}>{current.frequency}</div><div style={{ fontSize: '10px', color: '#a8b8c8' }}>Hz</div></div>
      <div style={{ padding: '20px', background: 'rgba(100,200,100,0.1)', textAlign: 'center' }}><div style={{ fontSize: '12px', color: '#a8b8c8' }}>PF</div><div style={{ fontSize: '32px', color: '#64c864', fontWeight: 'bold' }}>{current.pf.toFixed(3)}</div><div style={{ fontSize: '10px', color: '#a8b8c8' }}>PF</div></div>
    </div>
    {liveData.length > 1 && <ResponsiveContainer width='100%' height={350}>
      <LineChart data={liveData}><CartesianGrid /><XAxis dataKey='time' /><YAxis /><Tooltip /><Legend /><Line type='monotone' dataKey='ampere' stroke='#00ff88' name='Current (A)' isAnimationActive={false} /><Line type='monotone' dataKey='power' stroke='#ffa800' name='Power (kW)' isAnimationActive={false} /></LineChart>
    </ResponsiveContainer>}
  </div>;
};

export default WSLive;