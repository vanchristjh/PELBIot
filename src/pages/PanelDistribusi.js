import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService, socketService } from '../services/apiService';
import './PanelDistribusi.css';

const PanelDistribusi = () => {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [filter, setFilter] = useState('all');
  const [panelHistory, setPanelHistory] = useState([]);

  useEffect(() => {
    const fetchPanels = async () => {
      try {
        const response = await apiService.panels.getAll();
        if (response.data && Array.isArray(response.data)) {
          setPanels(response.data);
          if (response.data.length > 0) setSelectedPanel(response.data[0].id);
        } else {
          setPanels([]);
          console.warn('No panel data available');
        }
      } catch (err) {
        console.error('Error fetching panels:', err);
        setPanels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPanels();
  }, []);

  useEffect(() => {
    if (!selectedPanel) return;
    const fetchHistory = async () => {
      try {
        const response = await apiService.panels.getHistory(selectedPanel, 24);
        if (response.data) setPanelHistory(response.data.map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          beban: parseFloat(item.load) || 0,
          daya: parseFloat(item.power) || 0
        })));
      } catch {
        setPanelHistory([]);
      }
    };
    fetchHistory();
  }, [selectedPanel]);

  useEffect(() => {
    socketService.on('ampere-data-update', (data) => {
      setPanels(prev => prev.map(p => p.id === (data.panelId || 1) ? { ...p, daya: parseFloat(data.power) || p.daya, beban: Math.min(parseFloat(data.ampere) / 63 * 100, 100) } : p));
    });
    socketService.on('connect', () => setSocketConnected(true));
    socketService.on('disconnect', () => setSocketConnected(false));
    return () => {
      socketService.off('ampere-data-update');
      socketService.off('connect');
      socketService.off('disconnect');
    };
  }, []);

  const totalEnergi = panels.reduce((sum, p) => sum + p.energi, 0);
  const onlineCount = panels.filter(p => p.status === 'online').length;
  const filteredPanels = panels.filter(p => filter === 'all' || p.status === filter);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🔌 Distribusi Panel Real-Time</h1>
      <div style={{ marginBottom: '20px', padding: '10px', background: 'rgba(0, 212, 255, 0.08)', borderRadius: '8px' }}>
        <span style={{ color: socketConnected ? '#00ff88' : '#ff6b6b', fontWeight: 'bold' }}>
          {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
            <div style={{ padding: '20px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#a8b8c8' }}>Total Energi</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88' }}>{totalEnergi.toFixed(1)} kWh</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#a8b8c8' }}>Online</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88' }}>{onlineCount}/{panels.length}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '10px', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid #00d4ff', color: '#00d4ff' }}>
              <option value="all">Semua</option>
              <option value="online">Online</option>
              <option value="standby">Standby</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            {filteredPanels.map(panel => (
              <div key={panel.id} onClick={() => setSelectedPanel(panel.id)} style={{ padding: '20px', background: 'rgba(0, 212, 255, 0.05)', borderRadius: '8px', cursor: 'pointer', border: selectedPanel === panel.id ? '2px solid #00d4ff' : '1px solid rgba(0, 212, 255, 0.2)' }}>
                <h3 style={{ color: '#00d4ff', margin: '0 0 10px 0' }}>{panel.nama}</h3>
                <div style={{ color: '#a8b8c8' }}>Beban: <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>{panel.beban.toFixed(1)}%</span></div>
                <div style={{ color: '#a8b8c8' }}>Daya: <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>{panel.daya.toFixed(1)} kW</span></div>
              </div>
            ))}
          </div>

          {panelHistory.length > 0 && (
            <div style={{ background: 'rgba(0, 212, 255, 0.05)', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#00d4ff' }}>📈 Trend 24 Jam</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={panelHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="beban" stroke="#ffaa00" name="Beban %" dot={false} />
                  <Line type="monotone" dataKey="daya" stroke="#00d4ff" name="Daya kW" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PanelDistribusi;
