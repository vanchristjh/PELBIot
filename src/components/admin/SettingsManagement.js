import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../AdminDashboard.css';

const SettingsManagement = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [newValue, setNewValue] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/settings');
      setSettings(res.data.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (key, currentValue) => {
    setEditingKey(key);
    setNewValue(String(currentValue));
    setMessage('');
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/admin/settings/${editingKey}`, {
        value: newValue,
      });

      setMessage('✅ Setting updated successfully');
      setEditingKey(null);
      fetchSettings();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving setting:', error);
      setMessage('❌ Error updating setting');
    }
  };

  return (
    <div className="admin-section">
      <h2>⚙️ System Settings</h2>

      {message && (
        <div style={{
          padding: '12px',
          margin: '15px 0',
          borderRadius: '6px',
          background: message.includes('✅') ? '#c6f6d5' : '#fed7d7',
          color: message.includes('✅') ? '#22543d' : '#742a2a',
          border: `1px solid ${message.includes('✅') ? '#9ae6b4' : '#fc8181'}`,
        }}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading settings...</div>
      ) : Object.keys(settings).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          No settings found. Please initialize the database.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Setting Name</th>
                <th>Value</th>
                <th>Type</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(settings).map(([key, setting]) => (
                <tr key={key}>
                  <td><strong>{key}</strong></td>
                  <td>
                    {editingKey === key ? (
                      <input
                        type={setting.type === 'number' ? 'number' : 'text'}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        style={{
                          padding: '8px',
                          border: '1px solid #667eea',
                          borderRadius: '4px',
                          width: '200px',
                        }}
                      />
                    ) : (
                      <code style={{ background: '#f8f9fa', padding: '4px 8px', borderRadius: '4px' }}>
                        {String(setting.value)}
                      </code>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">{setting.type}</span>
                  </td>
                  <td>{setting.description || '—'}</td>
                  <td>
                    {editingKey === key ? (
                      <>
                        <button className="btn btn-primary" onClick={handleSave} style={{ marginRight: '5px' }}>
                          💾 Save
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setEditingKey(null)}
                        >
                          ❌ Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEdit(key, setting.value)}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SettingsManagement;
