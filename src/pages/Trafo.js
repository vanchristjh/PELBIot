import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService, socketService } from '../services/apiService';
import './Trafo.css';

const Trafo = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitHistory, setUnitHistory] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // Fetch transformer data
  useEffect(() => {
    const fetchTransformers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.transformers.getAll();
        
        if (response.data && Array.isArray(response.data)) {
          setUnits(response.data);
          if (response.data.length > 0) {
            setSelectedUnit(response.data[0].id);
          }
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching transformers:', err);
        setError('Gagal memuat data trafo: ' + (err.response?.statusText || err.message));
        setUnits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransformers();
    const interval = setInterval(fetchTransformers, 5 * 60 * 1000); // Refresh setiap 5 menit
    return () => clearInterval(interval);
  }, []);

  // Fetch history untuk selected unit
  useEffect(() => {
    if (!selectedUnit) return;

    const fetchHistory = async () => {
      try {
        const response = await apiService.transformers.getHistory(selectedUnit, 24);
        if (response.data && Array.isArray(response.data)) {
          const formattedData = response.data.map(item => ({
            time: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            load: parseFloat(item.load) || 0,
            temp: parseFloat(item.temperature) || parseFloat(item.temp) || 0,
            voltage: parseFloat(item.voltage) || 0,
            current: parseFloat(item.current) || 0
          }));
          setUnitHistory(formattedData);
        }
      } catch (err) {
        console.error('Error fetching transformer history:', err);
        
        // Generate sample data
        setUnitHistory(Array.from({ length: 24 }, (_, i) => ({
          time: i + ':00',
          load: 70 + Math.random() * 20,
          temp: 60 + Math.random() * 20,
          voltage: 378 + Math.random() * 4,
          current: 120 + Math.random() * 30
        })));
      }
    };

    fetchHistory();
  }, [selectedUnit]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const handleTransformerUpdate = (data) => {
      if (data.transformerId) {
        setUnits(prev => prev.map(unit =>
          unit.id === data.transformerId
            ? {
                ...unit,
                load: parseFloat(data.load) || unit.load,
                temp: parseFloat(data.temperature) || parseFloat(data.temp) || unit.temp,
                voltage: parseFloat(data.voltage) || unit.voltage,
                current: parseFloat(data.current) || unit.current,
                lastUpdate: new Date()
              }
            : unit
        ));

        // Update history jika selected unit
        if (data.transformerId === selectedUnit) {
          setUnitHistory(prev => {
            const newData = [...prev, {
              time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              load: parseFloat(data.load) || 0,
              temp: parseFloat(data.temperature) || parseFloat(data.temp) || 0,
              voltage: parseFloat(data.voltage) || 0,
              current: parseFloat(data.current) || 0
            }];
            return newData.slice(-48); // Keep last 48 points
          });
        }
      }
    };

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socketService.on('transformer-update', handleTransformerUpdate);
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    return () => {
      socketService.off('transformer-update', handleTransformerUpdate);
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, [selectedUnit]);

  const getStatusColor = (status) => {
    if (status === 'Active') return '#00ff88';
    if (status === 'Standby') return '#ffaa00';
    return '#ff6b6b';
  };

  const getLoadColor = (load) => {
    if (load < 50) return '#00d4ff';
    if (load < 80) return '#ffaa00';
    return '#ff6b6b';
  };

  const getTempColor = (temp) => {
    if (temp < 60) return '#00d4ff';
    if (temp < 75) return '#ffaa00';
    return '#ff6b6b';
  };

  const currentUnit = units.find(u => u.id === selectedUnit);

  return (
    <div className="trafo-container">
      <div style={{ marginBottom: '20px' }}>
        <h1>🔄 Transformer Monitoring</h1>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          padding: '10px',
          background: 'rgba(0, 212, 255, 0.08)',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <span style={{ color: socketConnected ? '#00ff88' : '#ff6b6b', fontWeight: 'bold' }}>
            {socketConnected ? '🟢 Real-time Connected' : '🔴 Disconnected'}
          </span>
          {error && <span style={{ color: '#ff6b6b', fontSize: '12px' }}>⚠️ {error}</span>}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#a8b8c8' }}>
          ⏳ Loading transformers...
        </div>
      ) : (
        <>
          {/* Units Grid */}
          <div className="units-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            {units.map(unit => (
              <div
                key={unit.id}
                className={`unit-card ${selectedUnit === unit.id ? 'active' : ''}`}
                onClick={() => setSelectedUnit(unit.id)}
                style={{
                  padding: '20px',
                  background: selectedUnit === unit.id 
                    ? 'rgba(0, 212, 255, 0.15)' 
                    : 'rgba(0, 212, 255, 0.05)',
                  borderRadius: '8px',
                  border: selectedUnit === unit.id 
                    ? '2px solid rgba(0, 212, 255, 0.6)' 
                    : '1px solid rgba(0, 212, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <h3 style={{ color: '#00d4ff', marginTop: 0 }}>{unit.name}</h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '5px 10px',
                    background: getStatusColor(unit.status) + '20',
                    color: getStatusColor(unit.status),
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    ● {unit.status}
                  </span>
                </div>

                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                  <div style={{ color: '#a8b8c8' }}>
                    Load: <span style={{ color: getLoadColor(unit.load), fontWeight: 'bold' }}>{unit.load}%</span>
                  </div>
                  <div style={{ color: '#a8b8c8' }}>
                    Temp: <span style={{ color: getTempColor(unit.temp), fontWeight: 'bold' }}>{unit.temp}°C</span>
                  </div>
                  <div style={{ color: '#a8b8c8' }}>
                    Voltage: <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{unit.voltage}V</span>
                  </div>
                  <div style={{ color: '#a8b8c8' }}>
                    Current: <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>{unit.current}A</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed View */}
          {currentUnit && (
            <div style={{
              background: 'rgba(0, 212, 255, 0.05)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: '#00d4ff', marginTop: 0 }}>📊 Detail: {currentUnit.name}</h2>

              {/* Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '15px',
                  background: 'rgba(0, 255, 136, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 255, 136, 0.2)'
                }}>
                  <div style={{ color: '#a8b8c8', fontSize: '12px' }}>Load Beban</div>
                  <div style={{ color: getLoadColor(currentUnit.load), fontSize: '24px', fontWeight: 'bold' }}>
                    {currentUnit.load}%
                  </div>
                </div>

                <div style={{
                  padding: '15px',
                  background: 'rgba(255, 170, 0, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 170, 0, 0.2)'
                }}>
                  <div style={{ color: '#a8b8c8', fontSize: '12px' }}>Suhu</div>
                  <div style={{ color: getTempColor(currentUnit.temp), fontSize: '24px', fontWeight: 'bold' }}>
                    {currentUnit.temp}°C
                  </div>
                </div>

                <div style={{
                  padding: '15px',
                  background: 'rgba(0, 212, 255, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 212, 255, 0.2)'
                }}>
                  <div style={{ color: '#a8b8c8', fontSize: '12px' }}>Tegangan</div>
                  <div style={{ color: '#00d4ff', fontSize: '24px', fontWeight: 'bold' }}>
                    {currentUnit.voltage}V
                  </div>
                </div>

                <div style={{
                  padding: '15px',
                  background: 'rgba(0, 255, 136, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 255, 136, 0.2)'
                }}>
                  <div style={{ color: '#a8b8c8', fontSize: '12px' }}>Arus</div>
                  <div style={{ color: '#00ff88', fontSize: '24px', fontWeight: 'bold' }}>
                    {currentUnit.current}A
                  </div>
                </div>
              </div>

              {/* History Chart */}
              <h3 style={{ color: '#00d4ff' }}>📈 Trend 24 Jam</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={unitHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00d4ff" opacity={0.1} />
                  <XAxis dataKey="time" stroke="#a8b8c8" />
                  <YAxis stroke="#a8b8c8" />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a2e', border: '1px solid #00d4ff' }}
                    labelStyle={{ color: '#00d4ff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="load" stroke="#ffaa00" name="Load %" dot={false} />
                  <Line type="monotone" dataKey="temp" stroke="#ff6b6b" name="Temp °C" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Trafo;
