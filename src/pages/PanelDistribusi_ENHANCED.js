import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { socketService } from '../services/apiService';
import './PanelDistribusi.css';

const PanelDistribusi = () => {
  const [panels, setPanels] = useState([
    {
      id: 1,
      nama: 'Panel Utama',
      lokasi: 'Lantai 1',
      energi: 12.5,
      tegangan: 380,
      arus: 35.2,
      daya: 12.8,
      status: 'online',
      beban: 68,
      biaya: 15625000,
      lastUpdate: new Date(),
      faktorDaya: 0.95,
      rugiDaya: 0.5
    },
    {
      id: 2,
      nama: 'Panel Cabang A',
      lokasi: 'Lantai 2',
      energi: 8.3,
      tegangan: 380,
      arus: 22.5,
      daya: 8.2,
      status: 'online',
      beban: 45,
      biaya: 10375000,
      lastUpdate: new Date(),
      faktorDaya: 0.92,
      rugiDaya: 0.8
    },
    {
      id: 3,
      nama: 'Panel Cabang B',
      lokasi: 'Lantai 3',
      energi: 10.1,
      tegangan: 378,
      arus: 28.3,
      daya: 10.4,
      status: 'online',
      beban: 58,
      biaya: 12625000,
      lastUpdate: new Date(),
      faktorDaya: 0.93,
      rugiDaya: 0.6
    },
    {
      id: 4,
      nama: 'Panel Cadangan',
      lokasi: 'Ruang Teknis',
      energi: 5.2,
      tegangan: 375,
      arus: 12.8,
      daya: 4.8,
      status: 'standby',
      beban: 32,
      biaya: 6500000,
      lastUpdate: new Date(),
      faktorDaya: 0.88,
      rugiDaya: 1.2
    },
    {
      id: 5,
      nama: 'Panel Backup',
      lokasi: 'Ruang Teknis',
      energi: 9.7,
      tegangan: 379,
      arus: 26.7,
      daya: 9.8,
      status: 'online',
      beban: 52,
      biaya: 12125000,
      lastUpdate: new Date(),
      faktorDaya: 0.91,
      rugiDaya: 0.7
    }
  ]);

  const [chartData, setChartData] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filter, setFilter] = useState('all');

  // Initialize chart data
  useEffect(() => {
    const initialChartData = panels.map(panel => ({
      name: panel.nama.substring(0, 8),
      beban: panel.beban,
      energi: panel.energi,
      daya: panel.daya,
      fill: panel.status === 'online' ? '#00d4ff' : '#ff6b6b'
    }));
    setChartData(initialChartData);
  }, [panels]);

  // Real-time Socket.IO integration
  useEffect(() => {
    const handleAmperUpdate = (data) => {
      setPanels((prevPanels) =>
        prevPanels.map((panel) => {
          // Update first panel with real-time data
          if (panel.id === 1) {
            const newPower = parseFloat(data.power) || panel.daya;
            const newArus = parseFloat(data.ampere) || panel.arus;
            const newBeban = Math.min((newArus / 63) * 100, 100);
            
            return {
              ...panel,
              daya: newPower,
              arus: newArus,
              beban: newBeban,
              status: newArus > 2 ? 'online' : 'standby',
              lastUpdate: new Date()
            };
          }
          // Simulate updates for other panels
          if (panel.id > 1) {
            const variation = (Math.random() - 0.5) * 2;
            const newBeban = Math.max(10, Math.min(90, panel.beban + variation));
            const newArus = (newBeban / 100) * 63;
            const newDaya = (newArus * 380) / 1000;
            
            return {
              ...panel,
              beban: newBeban,
              arus: newArus,
              daya: newDaya,
              lastUpdate: new Date()
            };
          }
          return panel;
        })
      );
    };

    socketService.on('ampere-data-update', handleAmperUpdate);
    socketService.on('connect', () => setSocketConnected(true));
    socketService.on('disconnect', () => setSocketConnected(false));

    return () => {
      socketService.off('ampere-data-update', handleAmperUpdate);
      socketService.off('connect');
      socketService.off('disconnect');
    };
  }, []);

  // Update chart data when panels change
  useEffect(() => {
    const updated = panels.map(panel => ({
      name: panel.nama.substring(0, 8),
      beban: Math.round(panel.beban),
      energi: panel.energi.toFixed(1),
      daya: panel.daya.toFixed(1),
      fill: panel.status === 'online' ? '#00d4ff' : '#ff6b6b'
    }));
    setChartData(updated);
  }, [panels]);

  // Calculate summary statistics
  const totalEnergi = panels.reduce((sum, p) => sum + p.energi, 0);
  const totalBiaya = panels.reduce((sum, p) => sum + p.biaya, 0);
  const avgBeban = (panels.reduce((sum, p) => sum + p.beban, 0) / panels.length).toFixed(1);
  const onlineCount = panels.filter(p => p.status === 'online').length;

  // Filter panels
  const filteredPanels = panels.filter(p => {
    if (filter === 'online') return p.status === 'online';
    if (filter === 'standby') return p.status === 'standby';
    return true;
  });

  // Pie chart data for status distribution
  const statusData = [
    { name: 'Online', value: onlineCount, fill: '#00ff88' },
    { name: 'Standby', value: panels.length - onlineCount, fill: '#ffaa00' }
  ];

  // Power distribution data
  const powerData = panels.map(p => ({
    name: p.nama.substring(0, 6),
    energi: p.energi,
    daya: p.daya
  }));

  return (
    <div className="panel-distribusi-container">
      {/* Header */}
      <div className="pd-header">
        <h1>Distribusi Panel Real-Time</h1>
        <div className="pd-status-indicator">
          <span className={`status-dot ${socketConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">{socketConnected ? 'Live Connected' : 'Offline'}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="pd-summary-cards">
        <div className="summary-card energy">
          <div className="card-icon">⚡</div>
          <div className="card-content">
            <span className="card-label">Total Energi</span>
            <span className="card-value">{totalEnergi.toFixed(1)} kWh</span>
          </div>
        </div>
        <div className="summary-card cost">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <span className="card-label">Total Biaya</span>
            <span className="card-value">Rp {(totalBiaya / 1000000).toFixed(1)}M</span>
          </div>
        </div>
        <div className="summary-card load">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <span className="card-label">Avg Beban</span>
            <span className="card-value">{avgBeban}%</span>
          </div>
        </div>
        <div className="summary-card online">
          <div className="card-icon">🟢</div>
          <div className="card-content">
            <span className="card-label">Panel Online</span>
            <span className="card-value">{onlineCount}/{panels.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="pd-filter-buttons">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Semua Panel ({panels.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'online' ? 'active' : ''}`}
          onClick={() => setFilter('online')}
        >
          Online ({onlineCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'standby' ? 'active' : ''}`}
          onClick={() => setFilter('standby')}
        >
          Standby ({panels.length - onlineCount})
        </button>
      </div>

      {/* Panel Cards Grid */}
      <div className="pd-cards-grid">
        {filteredPanels.map(panel => (
          <div key={panel.id} className={`panel-card ${panel.status}`}>
            <div className="panel-header">
              <h3>{panel.nama}</h3>
              <span className={`status-badge ${panel.status}`}>
                {panel.status === 'online' ? '🟢 Online' : '⚠️ Standby'}
              </span>
            </div>
            <div className="panel-info">
              <p><strong>Lokasi:</strong> {panel.lokasi}</p>
              <p><strong>Tegangan:</strong> {panel.tegangan}V</p>
              <p><strong>Arus:</strong> {panel.arus.toFixed(1)}A</p>
              <p><strong>Daya:</strong> {panel.daya.toFixed(1)}kW</p>
              <p><strong>Beban:</strong> {Math.round(panel.beban)}%</p>
            </div>
            <div className="panel-load-bar">
              <div 
                className="load-fill"
                style={{ 
                  width: `${Math.min(panel.beban, 100)}%`,
                  backgroundColor: panel.beban > 80 ? '#ff6b6b' : panel.beban > 60 ? '#ffaa00' : '#00ff88'
                }}
              ></div>
            </div>
            <button 
              className="detail-btn"
              onClick={() => {
                setSelectedPanel(panel);
                setShowDetail(true);
              }}
            >
              Detail
            </button>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="pd-charts-grid">
        {/* Load Distribution Bar Chart */}
        <div className="chart-container">
          <h3>Distribusi Beban</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a4d5c" />
              <XAxis dataKey="name" stroke="#00d4ff" fontSize={12} />
              <YAxis stroke="#00d4ff" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid #00d4ff' }}
                cursor={{ fill: 'rgba(0, 212, 255, 0.1)' }}
              />
              <Bar dataKey="beban" fill="#00d4ff" isAnimationActive={true} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Power Distribution Area Chart */}
        <div className="chart-container">
          <h3>Distribusi Daya</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a4d5c" />
              <XAxis dataKey="name" stroke="#00d4ff" fontSize={12} />
              <YAxis stroke="#00d4ff" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid #00d4ff' }}
                cursor={{ fill: 'rgba(0, 212, 255, 0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="daya" stroke="#00ff88" isAnimationActive={true} />
              <Line type="monotone" dataKey="energi" stroke="#ffaa00" isAnimationActive={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Energy Per Panel Line Chart */}
        <div className="chart-container">
          <h3>Energi Per Panel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a4d5c" />
              <XAxis dataKey="name" stroke="#00d4ff" fontSize={12} />
              <YAxis stroke="#00d4ff" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid #00d4ff' }}
                cursor={{ fill: 'rgba(0, 212, 255, 0.1)' }}
              />
              <Line type="monotone" dataKey="energi" stroke="#ff6b6b" isAnimationActive={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="chart-container">
          <h3>Status Panel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#00d4ff"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid #00d4ff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedPanel && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPanel.nama}</h2>
              <button className="modal-close" onClick={() => setShowDetail(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Lokasi</span>
                  <span className="detail-value">{selectedPanel.lokasi}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value ${selectedPanel.status}`}>
                    {selectedPanel.status === 'online' ? '🟢 Online' : '⚠️ Standby'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tegangan</span>
                  <span className="detail-value">{selectedPanel.tegangan}V</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Arus</span>
                  <span className="detail-value">{selectedPanel.arus.toFixed(2)}A</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Daya</span>
                  <span className="detail-value">{selectedPanel.daya.toFixed(2)}kW</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Energi</span>
                  <span className="detail-value">{selectedPanel.energi.toFixed(2)}kWh</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Beban</span>
                  <span className="detail-value">{Math.round(selectedPanel.beban)}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Faktor Daya</span>
                  <span className="detail-value">{selectedPanel.faktorDaya.toFixed(3)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Rugi Daya</span>
                  <span className="detail-value">{selectedPanel.rugiDaya.toFixed(2)}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Biaya</span>
                  <span className="detail-value">Rp {(selectedPanel.biaya / 1000000).toFixed(1)}M</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Update Terakhir</span>
                  <span className="detail-value">{selectedPanel.lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowDetail(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelDistribusi;
