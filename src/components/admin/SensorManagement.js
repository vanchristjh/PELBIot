/**
 * Sensor Management Component
 * Admin UI untuk add/edit/delete sensor dan test koneksi
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SensorManagement.css';

const SensorManagement = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSensor, setEditingSensor] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    protocol: 'mqtt',
    device_id: '',
    unit: '',
    min_value: '',
    max_value: '',
    config: {}
  });

  // Load sensors
  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 10000); // Refresh setiap 10 detik
    return () => clearInterval(interval);
  }, []);

  const fetchSensors = async () => {
    try {
      const response = await axios.get('/api/sensors');
      setSensors(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data sensor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSensor) {
        await axios.put(`/api/sensors/${editingSensor.id}`, formData);
        setSuccess('Sensor berhasil diupdate');
      } else {
        await axios.post('/api/sensors', formData);
        setSuccess('Sensor berhasil dibuat');
      }

      resetForm();
      fetchSensors();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan sensor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus sensor ini?')) return;

    try {
      await axios.delete(`/api/sensors/${id}`);
      setSuccess('Sensor berhasil dihapus');
      fetchSensors();
    } catch (err) {
      setError('Gagal menghapus sensor');
    }
  };

  const handleTest = async (id) => {
    setTestingId(id);
    try {
      const response = await axios.post(`/api/sensors/${id}/test`);
      setSuccess(
        response.data.testResult.success
          ? 'Koneksi sensor berhasil! ✅'
          : 'Koneksi sensor gagal ❌'
      );
    } catch (err) {
      setError('Gagal test koneksi');
    } finally {
      setTestingId(null);
    }
  };

  const handleEdit = (sensor) => {
    setEditingSensor(sensor);
    setFormData({
      name: sensor.name,
      protocol: sensor.protocol,
      device_id: sensor.device_id || '',
      unit: sensor.unit || '',
      min_value: sensor.min_value || '',
      max_value: sensor.max_value || '',
      config: sensor.config || {}
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      protocol: 'mqtt',
      device_id: '',
      unit: '',
      min_value: '',
      max_value: '',
      config: {}
    });
    setEditingSensor(null);
    setShowForm(false);
  };

  const protocols = [
    { value: 'mqtt', label: 'MQTT (IoT Modern)', description: 'Publish/Subscribe untuk IoT' },
    { value: 'modbus-tcp', label: 'Modbus TCP', description: 'Industrial standard, network based' },
    { value: 'modbus-rtu', label: 'Modbus RTU', description: 'Industrial standard, serial based' },
    { value: 'serial', label: 'Serial (COM)', description: 'Arduino, simple devices' },
    { value: 'rest', label: 'HTTP REST', description: 'Cloud API, web services' }
  ];

  const getProtocolConfig = (protocol) => {
    const configs = {
      mqtt: { topic: 'pelbiot/sensors/default', retain: true },
      'modbus-tcp': { host: '192.168.1.1', port: 502, unitId: 1 },
      'modbus-rtu': { port: 'COM3', baudRate: 9600 },
      serial: { port: 'COM1', baudRate: 9600 },
      rest: { apiUrl: '', method: 'GET', timeout: 5000 }
    };
    return configs[protocol] || {};
  };

  return (
    <div className="sensor-management">
      <h1>📡 Manajemen Sensor</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="sensor-header">
        <button
          className="btn btn-primary"
          onClick={() => !showForm ? setShowForm(true) : resetForm()}
        >
          {showForm ? '❌ Batal' : '➕ Tambah Sensor Baru'}
        </button>
      </div>

      {/* Form untuk tambah/edit sensor */}
      {showForm && (
        <div className="sensor-form">
          <h2>{editingSensor ? 'Edit Sensor' : 'Tambah Sensor Baru'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nama Sensor *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Panel A Current"
                required
              />
            </div>

            <div className="form-group">
              <label>Protokol Koneksi *</label>
              <select
                value={formData.protocol}
                onChange={(e) => {
                  const protocol = e.target.value;
                  setFormData({
                    ...formData,
                    protocol,
                    config: getProtocolConfig(protocol)
                  });
                }}
              >
                {protocols.map(p => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <small>{protocols.find(p => p.value === formData.protocol)?.description}</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Satuan (Unit)</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="A, V, kW, °C, %, etc"
                />
              </div>

              <div className="form-group">
                <label>Nilai Minimum</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_value}
                  onChange={(e) => setFormData({ ...formData, min_value: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Nilai Maksimum</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.max_value}
                  onChange={(e) => setFormData({ ...formData, max_value: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>

            {/* Protocol-specific config */}
            {formData.protocol === 'mqtt' && (
              <div className="form-group">
                <label>MQTT Topic</label>
                <input
                  type="text"
                  value={formData.config.topic || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, topic: e.target.value }
                  })}
                  placeholder="pelbiot/sensors/sensor-name"
                />
              </div>
            )}

            {formData.protocol === 'modbus-tcp' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Host</label>
                    <input
                      type="text"
                      value={formData.config.host || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, host: e.target.value }
                      })}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div className="form-group">
                    <label>Port</label>
                    <input
                      type="number"
                      value={formData.config.port || 502}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, port: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit ID</label>
                    <input
                      type="number"
                      value={formData.config.unitId || 1}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, unitId: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.protocol === 'rest' && (
              <div className="form-group">
                <label>API URL</label>
                <input
                  type="url"
                  value={formData.config.apiUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, apiUrl: e.target.value }
                  })}
                  placeholder="https://api.example.com/data"
                />
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? '⏳ Menyimpan...' : editingSensor ? '💾 Update' : '➕ Buat'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar sensor */}
      <div className="sensors-list">
        <h2>Daftar Sensor ({sensors.length})</h2>
        {sensors.length === 0 ? (
          <p className="empty-state">Belum ada sensor. Buat sensor baru untuk memulai.</p>
        ) : (
          <div className="sensors-grid">
            {sensors.map(sensor => (
              <div key={sensor.id} className="sensor-card">
                <div className="sensor-header-card">
                  <h3>{sensor.name}</h3>
                  <span className={`badge badge-${sensor.status}`}>
                    {sensor.status}
                  </span>
                </div>

                <div className="sensor-info">
                  <p><strong>Protocol:</strong> {sensor.protocol}</p>
                  <p><strong>Unit:</strong> {sensor.unit || '-'}</p>
                  <p><strong>Range:</strong> {sensor.min_value} - {sensor.max_value}</p>
                  <p><strong>Data Points:</strong> {sensor.total_data_points || 0}</p>
                  <p><strong>Last Update:</strong> {sensor.last_data_time ? new Date(sensor.last_data_time).toLocaleString() : 'N/A'}</p>
                </div>

                <div className="sensor-actions">
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleTest(sensor.id)}
                    disabled={testingId === sensor.id}
                  >
                    {testingId === sensor.id ? '⏳ Testing...' : '🧪 Test'}
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleEdit(sensor)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(sensor.id)}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorManagement;
