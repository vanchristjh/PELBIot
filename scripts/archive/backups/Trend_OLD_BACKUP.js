import React, { useState } from 'react';
import '../pages/Trend.css';

export default function Trend() {
  const [timeRange, setTimeRange] = useState('24h');

  const generateTrendData = () => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({
        time: i + ':00',
        energy: Math.floor(Math.random() * 100) + 50,
        power: Math.floor(Math.random() * 80) + 40,
        temperature: Math.floor(Math.random() * 15) + 20,
        efficiency: Math.floor(Math.random() * 20) + 85,
      });
    }
    return data;
  };

  const [trendData] = useState(generateTrendData());

  return (
    <div className="trend-page">
      <div className="trend-header">
        <h1>Trend Analysis</h1>
        <p>Historical Data & Performance Trends</p>
      </div>

      <div className="time-range-selector">
        <button className="active" onClick={() => setTimeRange('24h')}>Last 24h</button>
        <button onClick={() => setTimeRange('7d')}>Last 7 Days</button>
        <button onClick={() => setTimeRange('30d')}>Last 30 Days</button>
      </div>

      <div className="trend-charts">
        <div className="trend-card">
          <h3>Energy Consumption</h3>
          <div className="chart-container">
            <p>Chart data loading...</p>
          </div>
        </div>

        <div className="trend-card">
          <h3>Power Output</h3>
          <div className="chart-container">
            <p>Chart data loading...</p>
          </div>
        </div>

        <div className="trend-card">
          <h3>Temperature</h3>
          <div className="chart-container">
            <p>Chart data loading...</p>
          </div>
        </div>

        <div className="trend-card">
          <h3>Efficiency Rate</h3>
          <div className="chart-container">
            <p>Chart data loading...</p>
          </div>
        </div>
      </div>

      <div className="trend-summary">
        <h3>Summary Statistics</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Total Energy</span>
            <span className="value">{trendData.reduce((a, b) => a + b.energy, 0)} kWh</span>
          </div>
          <div className="summary-item">
            <span className="label">Avg Power</span>
            <span className="value">{Math.floor(trendData.reduce((a, b) => a + b.power, 0) / trendData.length)} kW</span>
          </div>
          <div className="summary-item">
            <span className="label">Avg Efficiency</span>
            <span className="value">{Math.floor(trendData.reduce((a, b) => a + b.efficiency, 0) / trendData.length)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

