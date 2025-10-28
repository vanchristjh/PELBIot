import React, { useState, useEffect } from 'react';
import { apiService, socketService } from '../services/apiService';
import './MasterData.css';

const MasterData = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newDevice, setNewDevice] = useState({
    name: '',
    status: 'Active',
    location: ''
  });

  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.devices.getAll();
        
        if (response.data && Array.isArray(response.data)) {
          setDevices(response.data);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Gagal memuat data devices: ' + (err.response?.statusText || err.message));
        
        // Fallback dengan sample data
        setDevices([
          { id: 1, name: 'Device Panel Utama', status: 'Active', location: 'Lantai 1', type: 'Panel' },
          { id: 2, name: 'Device Trafo Unit 1', status: 'Active', location: 'Ruang Teknis', type: 'Transformer' },
          { id: 3, name: 'Device Weather Station', status: 'Active', location: 'Rooftop', type: 'Sensor' },
          { id: 4, name: 'Device Panel Cabang A', status: 'Standby', location: 'Lantai 2', type: 'Panel' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 10 * 60 * 1000); // Refresh setiap 10 menit
    return () => clearInterval(interval);
  }, []);

  // Real-time updates
  useEffect(() => {
    const handleStatusChange = (data) => {
      if (data.deviceId) {
        setDevices(prev => prev.map(device =>
          device.id === data.deviceId
            ? { ...device, status: data.status, lastUpdate: new Date() }
            : device
        ));
      }
    };

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socketService.on('device-status-change', handleStatusChange);
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    return () => {
      socketService.off('device-status-change', handleStatusChange);
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, []);

  const handleAddDevice = async () => {
    if (!newDevice.name || !newDevice.location) {
      alert('Nama dan lokasi harus diisi');
      return;
    }

    try {
      const response = await apiService.masterData.create(newDevice);
      if (response.data) {
        setDevices(prev => [...prev, response.data]);
        setNewDevice({ name: '', status: 'Active', location: '' });
        alert('Device berhasil ditambahkan');
      }
    } catch (err) {
      console.error('Error adding device:', err);
      alert('Gagal menambahkan device');
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesFilter = filter === 'all' || device.status === filter;
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          device.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    if (status === 'Active') return '#00ff88';
    if (status === 'Standby') return '#ffaa00';
    return '#ff6b6b';
  };

  return (
    <div className="masterdata-container">
      <div style={{ marginBottom: '20px' }}>
        <h1>📊 Master Data - Device Management</h1>
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
          <span style={{ color: '#00d4ff' }}>Total: {devices.length} devices</span>
          {error && <span style={{ color: '#ff6b6b', fontSize: '12px' }}>⚠️ {error}</span>}
        </div>
      </div>

      {/* Add Device Section */}
      <div style={{
        background: 'rgba(0, 255, 136, 0.08)',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#00ff88', marginTop: 0 }}>➕ Tambah Device Baru</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          <input
            type="text"
            placeholder="Nama Device"
            value={newDevice.name}
            onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
            style={{
              padding: '8px',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '4px',
              color: '#00ff88'
            }}
          />
          <input
            type="text"
            placeholder="Lokasi"
            value={newDevice.location}
            onChange={(e) => setNewDevice(prev => ({ ...prev, location: e.target.value }))}
            style={{
              padding: '8px',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '4px',
              color: '#00ff88'
            }}
          />
          <select
            value={newDevice.status}
            onChange={(e) => setNewDevice(prev => ({ ...prev, status: e.target.value }))}
            style={{
              padding: '8px',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '4px',
              color: '#00ff88'
            }}
          >
            <option value="Active">Active</option>
            <option value="Standby">Standby</option>
            <option value="Offline">Offline</option>
          </select>
          <button
            onClick={handleAddDevice}
            style={{
              padding: '8px 15px',
              background: '#00ff88',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Tambah
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Cari device..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '4px',
            color: '#00d4ff'
          }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '10px',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '4px',
            color: '#00d4ff',
            cursor: 'pointer'
          }}
        >
          <option value="all">Semua Status</option>
          <option value="Active">Active</option>
          <option value="Standby">Standby</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      {/* Devices Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#a8b8c8' }}>
          ⏳ Loading devices...
        </div>
      ) : (
        <div style={{
          overflowX: 'auto',
          background: 'rgba(0, 212, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 212, 255, 0.2)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                background: 'rgba(0, 212, 255, 0.1)',
                borderBottom: '2px solid rgba(0, 212, 255, 0.3)'
              }}>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>ID</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>Nama Device</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#00d4ff', fontWeight: 'bold' }}>Lokasi</th>
                <th style={{ padding: '15px', textAlign: 'center', color: '#00d4ff', fontWeight: 'bold' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#a8b8c8' }}>
                    Tidak ada device yang sesuai filter
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device, idx) => (
                  <tr key={device.id} style={{
                    borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(0, 212, 255, 0.02)',
                    transition: 'background 0.3s'
                  }}>
                    <td style={{ padding: '15px', color: '#00d4ff' }}>{device.id}</td>
                    <td style={{ padding: '15px', color: '#a8b8c8' }}>{device.name}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px 10px',
                        background: getStatusColor(device.status) + '20',
                        color: getStatusColor(device.status),
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}>
                        ● {device.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: '#a8b8c8' }}>{device.location}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button style={{
                        padding: '5px 10px',
                        background: '#00d4ff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistics */}
      <div style={{
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px'
      }}>
        <div style={{
          padding: '15px',
          background: 'rgba(0, 255, 136, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#a8b8c8', fontSize: '12px' }}>Total Active</div>
          <div style={{ color: '#00ff88', fontSize: '20px', fontWeight: 'bold' }}>
            {devices.filter(d => d.status === 'Active').length}
          </div>
        </div>
        <div style={{
          padding: '15px',
          background: 'rgba(255, 170, 0, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 170, 0, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#a8b8c8', fontSize: '12px' }}>Standby</div>
          <div style={{ color: '#ffaa00', fontSize: '20px', fontWeight: 'bold' }}>
            {devices.filter(d => d.status === 'Standby').length}
          </div>
        </div>
        <div style={{
          padding: '15px',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 107, 107, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#a8b8c8', fontSize: '12px' }}>Offline</div>
          <div style={{ color: '#ff6b6b', fontSize: '20px', fontWeight: 'bold' }}>
            {devices.filter(d => d.status === 'Offline').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterData;
