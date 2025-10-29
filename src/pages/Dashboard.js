import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { socketService, apiService } from '../services/apiService';
import { useRoleCheck } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { isSuperAdmin } = useRoleCheck();
  
  // Initialize with empty values - will be populated from API
  const [metrics, setMetrics] = useState({
    totalEnergiHari: 0,
    totalBiaya: 0,
    panelAktif: 0,
    panelTotal: 0,
    voltageSekarang: 0,
    arusSekarang: 0,
    dayaSekarang: 0,
    lastUpdate: new Date()
  });

  const [chartData, setChartData] = useState([]);
  const [panelStatus, setPanelStatus] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState(null);

  // Fetch real data from API on mount
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // Fetch all panels
        const panelsResponse = await apiService.panels.getAll();
        const panelsData = panelsResponse.data || [];
        
        // Count online panels
        const onlinePanels = panelsData.filter(p => p.status === 'online');
        
        // Calculate panel status distribution
        const status = panelsData.map(p => ({
          name: p.name || `Panel ${p.id}`,
          value: p.power ? Math.min((p.power / 20000) * 100, 100) : 0,
          fill: p.status === 'online' ? '#00ff88' : '#ff6b6b',
          id: p.id
        }));
        
        // Calculate total energy and cost
        const totalPower = panelsData.reduce((sum, p) => sum + (p.power || 0), 0);
        const totalCost = totalPower * 1250; // Rp 1250 per watt
        
        // Set real metrics
        setMetrics(prev => ({
          ...prev,
          panelAktif: onlinePanels.length,
          panelTotal: panelsData.length,
          voltageSekarang: panelsData[0]?.voltage || 0,
          arusSekarang: panelsData[0]?.ampere || 0,
          dayaSekarang: totalPower || 0,
          totalEnergiHari: totalPower / 1000, // Convert to kWh
          totalBiaya: totalCost
        }));
        
        setPanelStatus(status);
        
        // Fetch historical chart data
        const response = await apiService.data.getHistory(24);
        if (response.data && Array.isArray(response.data)) {
          const formattedData = response.data.slice(-48).map((item) => ({
            time: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            power: parseFloat(item.power) || 0,
            ampere: parseFloat(item.ampere) || 0,
            voltage: parseFloat(item.voltage) || 0
          }));
          setChartData(formattedData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch dashboard data');
      }
    };
    
    fetchRealData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchRealData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time updates via Socket.IO (both traditional dan MQTT)
  useEffect(() => {
    const handleAmperUpdate = (data) => {
      setMetrics((prev) => ({
        ...prev,
        arusSekarang: parseFloat(data.ampere) || prev.arusSekarang,
        voltageSekarang: parseFloat(data.voltage) || prev.voltageSekarang,
        dayaSekarang: parseFloat((data.power || 0).toFixed(2)),
        totalEnergiHari: prev.totalEnergiHari + (parseFloat(data.power) || 0) / 3600,
        totalBiaya: prev.totalBiaya + (parseFloat(data.power) || 0) * 1250 / 3600,
        lastUpdate: new Date()
      }));

      // Update chart data
      setChartData((prev) => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          power: parseFloat(data.power) || 0,
          ampere: parseFloat(data.ampere) || 0,
          voltage: parseFloat(data.voltage) || 0
        }];
        return newData.slice(-48); // Keep last 48 points
      });
    };

    // MQTT Events via Socket.IO
    const handleMQTTVoltageUpdate = (data) => {
      console.log('📡 MQTT Voltage Update:', data.value);
      setMetrics((prev) => ({
        ...prev,
        voltageSekarang: parseFloat(data.value) || prev.voltageSekarang,
        lastUpdate: new Date()
      }));
    };

    const handleMQTTAmpereUpdate = (data) => {
      console.log('📡 MQTT Ampere Update:', data.value);
      setMetrics((prev) => ({
        ...prev,
        arusSekarang: parseFloat(data.value) || prev.arusSekarang,
        lastUpdate: new Date()
      }));
    };

    const handleMQTTPowerUpdate = (data) => {
      console.log('📡 MQTT Power Update:', data.value);
      setMetrics((prev) => ({
        ...prev,
        dayaSekarang: parseFloat(data.value) || prev.dayaSekarang,
        totalEnergiHari: prev.totalEnergiHari + (parseFloat(data.value) || 0) / 3600,
        lastUpdate: new Date()
      }));

      // Update chart
      setChartData((prev) => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          power: parseFloat(data.value) || 0,
          ampere: metrics.arusSekarang,
          voltage: metrics.voltageSekarang
        }];
        return newData.slice(-48);
      });
    };

    const handleMQTTCostUpdate = (data) => {
      console.log('📡 MQTT Cost Update:', data.value);
      setMetrics((prev) => ({
        ...prev,
        totalBiaya: parseFloat(data.value) || prev.totalBiaya,
        lastUpdate: new Date()
      }));
    };

    const handleConnect = () => {
      console.log('✅ Dashboard connected to Socket.IO');
      setSocketConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      console.log('❌ Dashboard disconnected from Socket.IO');
      setSocketConnected(false);
    };

    const handleMQTTConnected = () => {
      console.log('✅ MQTT Broker Connected');
      setSocketConnected(true);
    };

    const handleMQTTError = (error) => {
      console.error('❌ MQTT Error:', error);
    };

    // Register all handlers
    socketService.on('ampere-data-update', handleAmperUpdate);
    socketService.on('mqtt-voltage-update', handleMQTTVoltageUpdate);
    socketService.on('mqtt-ampere-update', handleMQTTAmpereUpdate);
    socketService.on('mqtt-power-update', handleMQTTPowerUpdate);
    socketService.on('mqtt-cost-update', handleMQTTCostUpdate);
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('mqtt-connected', handleMQTTConnected);
    socketService.on('mqtt-error', handleMQTTError);

    return () => {
      socketService.off('ampere-data-update', handleAmperUpdate);
      socketService.off('mqtt-voltage-update', handleMQTTVoltageUpdate);
      socketService.off('mqtt-ampere-update', handleMQTTAmpereUpdate);
      socketService.off('mqtt-power-update', handleMQTTPowerUpdate);
      socketService.off('mqtt-cost-update', handleMQTTCostUpdate);
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('mqtt-connected', handleMQTTConnected);
      socketService.off('mqtt-error', handleMQTTError);
    };
  }, [metrics]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatEnergy = (value) => {
    return `${value.toFixed(1)} MWh`;
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('id-ID').format(parseFloat(value).toFixed(2));
  };

  const statusColor = socketConnected ? '#00ff88' : '#ff6b6b';

  // Dashboard untuk ADMIN - versi terbatas
  if (!isSuperAdmin()) {
    return (
      <div className="dashboard-page">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '15px 20px',
          background: 'rgba(0, 212, 255, 0.08)',
          borderRadius: '10px',
          border: '2px solid rgba(0, 212, 255, 0.3)'
        }}>
          <div>
            <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>📊 Admin Dashboard (Limited View)</span>
            <p style={{ fontSize: '12px', color: '#a8b8c8', margin: '5px 0 0 0' }}>Untuk fitur lengkap, silahkan minta akses ke Super Admin</p>
          </div>
          <span style={{ color: statusColor, fontWeight: 'bold' }}>
            {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>

        {/* Summary Cards - Admin Version */}
        <div className="summary-cards-section">
          <div className="summary-card energy-card">
            <div className="card-icon">⚡</div>
            <div className="card-content">
              <h3>Total Energi Hari Ini</h3>
              <div className="card-value">{formatEnergy(metrics.totalEnergiHari)}</div>
              <div className="card-subtext">Konsumsi real-time</div>
            </div>
          </div>

          <div className="summary-card power-card">
            <div className="card-icon">⚙️</div>
            <div className="card-content">
              <h3>Daya Real-Time</h3>
              <div className="card-value">{metrics.dayaSekarang.toFixed(1)} kW</div>
              <div className="card-subtext">Daya aktif sistem</div>
            </div>
          </div>
        </div>

        {/* Real-time Metrics - Admin Version */}
        <div className="realtime-metrics-section">
          <h2>⚡ Metrik Real-Time</h2>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-header">
                <span className="metric-label">Tegangan Sistem</span>
                <span className="metric-unit">V</span>
              </div>
              <div className="metric-value">{formatNumber(metrics.voltageSekarang)}</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill voltage-progress"
                  style={{width: `${(metrics.voltageSekarang / 400) * 100}%`}}
                ></div>
              </div>
              <span className="metric-status">Normal (380V - 400V)</span>
            </div>

            <div className="metric-item">
              <div className="metric-header">
                <span className="metric-label">Arus Sistem</span>
                <span className="metric-unit">A</span>
              </div>
              <div className="metric-value">{formatNumber(metrics.arusSekarang)}</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill ampere-progress"
                  style={{width: `${Math.min((metrics.arusSekarang / 200) * 100, 100)}%`}}
                ></div>
              </div>
              <span className="metric-status">Max Load 200A</span>
            </div>
          </div>
          <div className="update-timestamp">
            Pembaruan terakhir: {metrics.lastUpdate.toLocaleTimeString('id-ID')}
          </div>
        </div>

        {/* Power Trend Chart - Admin Version */}
        <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
          <h3 style={{ marginBottom: '20px', color: '#00d4ff' }}>📈 Trend Daya Real-Time (Last 48 points)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.1)" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid #00d4ff', borderRadius: '5px' }}
                  labelStyle={{ color: '#00d4ff' }}
                />
                <Area type="monotone" dataKey="power" stroke="#00d4ff" fill="url(#colorPower)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading chart data...</div>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid #ff6b6b',
            borderRadius: '10px',
            color: '#ff6b6b'
          }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Dashboard untuk SUPER ADMIN - versi lengkap
  return (
    <div className="dashboard-page">
      {/* Connection Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px 20px',
        background: 'rgba(0, 212, 255, 0.05)',
        borderRadius: '10px',
        border: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <div>
          <span>📊 Super Admin Dashboard (Full Access)</span>
          <div style={{ fontSize: '11px', color: '#a8b8c8', marginTop: '5px' }}>
            Socket.IO: <span style={{color: statusColor, fontWeight: 'bold'}}>
              {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            {' | '}
            MQTT: <span style={{color: '#ffa500', fontWeight: 'bold'}}>📡 Ready</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#a8b8c8' }}>
          <div>Last Update: {metrics.lastUpdate.toLocaleTimeString('id-ID')}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-section">
        <div className="summary-card energy-card">
          <div className="card-icon">⚡</div>
          <div className="card-content">
            <h3>Total Energi Hari Ini</h3>
            <div className="card-value">{formatEnergy(metrics.totalEnergiHari)}</div>
            <div className="card-subtext">Konsumsi real-time</div>
          </div>
        </div>

        <div className="summary-card cost-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Biaya</h3>
            <div className="card-value">{formatCurrency(metrics.totalBiaya)}</div>
            <div className="card-subtext">Estimasi per hari</div>
          </div>
        </div>

        <div className="summary-card panel-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Panel Aktif</h3>
            <div className="card-value">{metrics.panelAktif}/{metrics.panelTotal}</div>
            <div className="card-subtext">Status terpantau</div>
          </div>
        </div>

        <div className="summary-card power-card">
          <div className="card-icon">⚙️</div>
          <div className="card-content">
            <h3>Daya Real-Time</h3>
            <div className="card-value">{metrics.dayaSekarang.toFixed(1)} kW</div>
            <div className="card-subtext">Daya aktif sistem</div>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="realtime-metrics-section">
        <h2>⚡ Metrik Real-Time</h2>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-label">Tegangan Sistem</span>
              <span className="metric-unit">V</span>
            </div>
            <div className="metric-value">{formatNumber(metrics.voltageSekarang)}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill voltage-progress"
                style={{width: `${(metrics.voltageSekarang / 400) * 100}%`}}
              ></div>
            </div>
            <span className="metric-status">Normal (380V - 400V)</span>
          </div>

          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-label">Arus Sistem</span>
              <span className="metric-unit">A</span>
            </div>
            <div className="metric-value">{formatNumber(metrics.arusSekarang)}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill ampere-progress"
                style={{width: `${Math.min((metrics.arusSekarang / 200) * 100, 100)}%`}}
              ></div>
            </div>
            <span className="metric-status">Max Load 200A</span>
          </div>

          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-label">Daya Aktif</span>
              <span className="metric-unit">kW</span>
            </div>
            <div className="metric-value">{formatNumber(metrics.dayaSekarang)}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill power-progress"
                style={{width: `${Math.min((metrics.dayaSekarang / 100) * 100, 100)}%`}}
              ></div>
            </div>
            <span className="metric-status">Max 100 kW</span>
          </div>
        </div>
        <div className="update-timestamp">
          Pembaruan terakhir: {metrics.lastUpdate.toLocaleTimeString('id-ID')}
        </div>
      </div>

      {/* Power Trend Chart */}
      <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
        <h3 style={{ marginBottom: '20px', color: '#00d4ff' }}>📈 Trend Daya Real-Time (Last 48 points)</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.1)" />
              <XAxis dataKey="time" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid #00d4ff', borderRadius: '5px' }}
                labelStyle={{ color: '#00d4ff' }}
              />
              <Area type="monotone" dataKey="power" stroke="#00d4ff" fill="url(#colorPower)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading chart data...</div>
        )}
      </div>

      {/* Ampere Trend Chart */}
      <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(0, 255, 136, 0.05)', borderRadius: '15px', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
        <h3 style={{ marginBottom: '20px', color: '#00ff88' }}>📊 Trend Arus (Last 48 points)</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 136, 0.1)" />
              <XAxis dataKey="time" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid #00ff88', borderRadius: '5px' }}
                labelStyle={{ color: '#00ff88' }}
              />
              <Legend />
              <Line type="monotone" dataKey="ampere" stroke="#00ff88" strokeWidth={2} dot={false} name="Arus (A)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading chart data...</div>
        )}
      </div>

      {/* Panel Status Chart */}
      <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255, 170, 0, 0.05)', borderRadius: '15px', border: '1px solid rgba(255, 170, 0, 0.2)' }}>
        <h3 style={{ marginBottom: '20px', color: '#ffaa00' }}>📍 Status Panel Beban</h3>
        {panelStatus.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={panelStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 170, 0, 0.1)" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid #ffaa00', borderRadius: '5px' }}
                labelStyle={{ color: '#ffaa00' }}
              />
              <Bar dataKey="value" name="Beban (%)">
                {panelStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading chart data...</div>
        )}
      </div>

      {/* Energy Flow Diagram */}
      <div className="energy-flow-section" style={{ marginTop: '40px' }}>
        <h2>⚡ Aliran Energi</h2>
        <div className="energy-flow-diagram">
          <div className="flow-item">
            <div className="flow-icon">🔌</div>
            <h4>Trafo Utama</h4>
            <div className="flow-spec">20kV Input</div>
            <div className="flow-spec">380V Output</div>
          </div>

          <div className="flow-arrow"></div>

          <div className="flow-item">
            <div className="flow-icon">📦</div>
            <h4>Panel Distribusi</h4>
            <div className="flow-spec">5 Panel Aktif</div>
            <div className="flow-spec">380V Distribusi</div>
          </div>

          <div className="flow-arrow"></div>

          <div className="flow-item">
            <div className="flow-icon">🏭</div>
            <h4>Konsumen</h4>
            <div className="flow-spec">Beban Terhubung</div>
            <div className="flow-spec">{metrics.dayaSekarang.toFixed(1)} kW Aktif</div>
          </div>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="statistics-section" style={{ marginTop: '40px' }}>
        <h2>📋 Statistik Harian</h2>
        <div className="statistics-table">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Energi (MWh)</th>
                <th>Biaya (IDR)</th>
                <th>Daya Rata-Rata (kW)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-01-10</td>
                <td>45.8</td>
                <td>Rp 57.250.000</td>
                <td>38.2</td>
              </tr>
              <tr>
                <td>2024-01-09</td>
                <td>44.2</td>
                <td>Rp 55.250.000</td>
                <td>36.8</td>
              </tr>
              <tr>
                <td>2024-01-08</td>
                <td>46.5</td>
                <td>Rp 58.125.000</td>
                <td>38.8</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid #ff6b6b',
          borderRadius: '10px',
          color: '#ff6b6b'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
