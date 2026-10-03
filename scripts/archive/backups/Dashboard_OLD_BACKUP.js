/* eslint-disable-next-line unicode-bom */
import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { socketService, apiService } from '../services/apiService';
import './Dashboard.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalEnergiHari: 45.8,
    totalBiaya: 57250000,
    panelAktif: 3,
    panelTotal: 5,
    voltageSekarang: 380,
    arusSekarang: 125.5,
    dayaSekarang: 45.8,
    lastUpdate: new Date()
  });

  const [chartData, setChartData] = useState([]);
  const [energyHistory, setEnergyHistory] = useState([]);
  const [panelStatus, setPanelStatus] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await apiService.data.getHistory(24);
        if (response.data && Array.isArray(response.data)) {
          const formattedData = response.data.slice(-48).map((item, idx) => ({
            time: new Date(item.timestamp).getHours() + ':' + String(new Date(item.timestamp).getMinutes()).padStart(2, '0'),
            power: parseFloat(item.power) || 0,
            ampere: parseFloat(item.ampere) || 0,
            voltage: parseFloat(item.voltage) || 0,
            idx
          }));
          setChartData(formattedData);
          setEnergyHistory(formattedData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch initial data');
      }
    };
    fetchInitialData();
  }, []);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const handleAmperUpdate = useCallback((data) => {
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
          time: new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, '0'),
          power: parseFloat(data.power) || 0,
          ampere: parseFloat(data.ampere) || 0,
          voltage: parseFloat(data.voltage) || 0,
          idx: prev.length
        }];
        return newData.slice(-48); // Keep last 48 points
      });
    }, []);

    const handleConnect = () => {
      console.log('✅ Dashboard connected to Socket.IO');
      setSocketConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      console.log('❌ Dashboard disconnected from Socket.IO');
      setSocketConnected(false);
    };

    socketService.on('ampere-data-update', handleAmperUpdate);
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    // Set initial panel status
    setPanelStatus([
      { name: 'Panel Utama', value: 68, fill: '#00d4ff' },
      { name: 'Panel A', value: 45, fill: '#00ff88' },
      { name: 'Panel B', value: 58, fill: '#ffaa00' },
      { name: 'Panel C', value: 32, fill: '#00d4ff' },
      { name: 'Panel D', value: 52, fill: '#00ff88' }
    ]);

    return () => {
      socketService.off('ampere-data-update', handleAmperUpdate);
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, []);

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

  return (
    <div className="dashboard-page">
      <div className="summary-cards-section">
        <div className="summary-card energy-card">
          <div className="card-icon"></div>
          <div className="card-content">
            <h3>Total Energi Hari Ini</h3>
            <div className="card-value">{formatEnergy(metrics.totalEnergiHari)}</div>
            <div className="card-subtext">Konsumsi real-time</div>
          </div>
        </div>

        <div className="summary-card cost-card">
          <div className="card-icon"></div>
          <div className="card-content">
            <h3>Total Biaya</h3>
            <div className="card-value">{formatCurrency(metrics.totalBiaya)}</div>
            <div className="card-subtext">Estimasi per hari</div>
          </div>
        </div>

        <div className="summary-card panel-card">
          <div className="card-icon"></div>
          <div className="card-content">
            <h3>Panel Aktif</h3>
            <div className="card-value">{metrics.panelAktif}/{metrics.panelTotal}</div>
            <div className="card-subtext">Status terpantau</div>
          </div>
        </div>

        <div className="summary-card power-card">
          <div className="card-icon"></div>
          <div className="card-content">
            <h3>Daya Real-Time</h3>
            <div className="card-value">{metrics.dayaSekarang.toFixed(1)} kW</div>
            <div className="card-subtext">Daya aktif sistem</div>
          </div>
        </div>
      </div>

      <div className="realtime-metrics-section">
        <h2> Metrik Real-Time</h2>
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

      <div className="energy-flow-section">
        <h2> Aliran Energi</h2>
        <div className="energy-flow-diagram">
          <div className="flow-item">
            <div className="flow-icon"></div>
            <h4>Trafo Utama</h4>
            <div className="flow-spec">20kV Input</div>
            <div className="flow-spec">380V Output</div>
          </div>

          <div className="flow-arrow"></div>

          <div className="flow-item">
            <div className="flow-icon"></div>
            <h4>Panel Distribusi</h4>
            <div className="flow-spec">5 Panel Aktif</div>
            <div className="flow-spec">380V Distribusi</div>
          </div>

          <div className="flow-arrow"></div>

          <div className="flow-item">
            <div className="flow-icon"></div>
            <h4>Konsumen</h4>
            <div className="flow-spec">Beban Terhubung</div>
            <div className="flow-spec">45.8 kW Aktif</div>
          </div>
        </div>
      </div>

      <div className="statistics-section">
        <h2> Statistik Harian</h2>
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
    </div>
  );
};

export default Dashboard;

