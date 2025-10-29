import React, { useState } from 'react';
import { useAuth, useRoleCheck } from '../contexts/AuthContext';
import SensorManagement from '../components/admin/SensorManagement';
import './AdminPanel.css';

const AdminPanel = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState('admin');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { currentUser, registerUser, users, setUsers } = useAuth();
  const { isSuperAdmin } = useRoleCheck();

  // Cek apakah user adalah SUPER ADMIN (bukan hanya admin)
  if (!currentUser || !isSuperAdmin()) {
    return (
      <div className="admin-container">
        <div className="unauthorized-box">
          <h2>❌ Akses Ditolak</h2>
          <p>⚠️ Hanya Super Admin yang dapat mengakses Super Admin Panel!</p>
          <p className="role-info">Role Anda: <strong>{currentUser?.role === 'admin' ? '👤 Admin (Limited Access)' : currentUser?.role || 'Unknown'}</strong></p>
          <div className="unauthorized-tips">
            <h3>💡 Informasi untuk Admin:</h3>
            <ul>
              <li>✓ Anda dapat mengakses Dashboard, Panel Distribusi, Trafo, dan Laporan</li>
              <li>✓ Anda dapat melihat dan memantau data real-time</li>
              <li>✗ Hanya Super Admin yang dapat manage pengguna dan konfigurasi sistem</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    // Validasi
    if (!username || !password || !confirmPassword) {
      setMessageType('error');
      setMessage('Semua field harus diisi!');
      return;
    }

    if (password !== confirmPassword) {
      setMessageType('error');
      setMessage('Password dan konfirmasi password tidak cocok!');
      return;
    }

    if (password.length < 6) {
      setMessageType('error');
      setMessage('Password harus minimal 6 karakter!');
      return;
    }

    // Register user
    const result = registerUser(username, password, userRole);

    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setUserRole('admin');
      setTimeout(() => {
        setShowForm(false);
      }, 1500);
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'super_admin':
        return '👑 Super Admin';
      case 'admin':
        return '👤 Admin';
      case 'moderator':
        return '⚙️ Moderator';
      default:
        return '👤 User';
    }
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      setMessage('User tidak ditemukan');
      setMessageType('error');
      return;
    }

    if (user.role === 'super_admin' && !isSuperAdmin()) {
      setMessage('Hanya Super Admin dapat menghapus Super Admin');
      setMessageType('error');
      return;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setMessage(`User ${user.username} berhasil dihapus`);
    setMessageType('success');
  };

  const handleUpdateRole = (userId, newRole) => {
    if (!isSuperAdmin()) {
      setMessage('Hanya Super Admin dapat mengubah role user');
      setMessageType('error');
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      setMessage('User tidak ditemukan');
      setMessageType('error');
      return;
    }

    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setMessage(`Role ${user.username} berhasil diubah ke ${newRole}`);
    setMessageType('success');
  };

  return (
    <div className="admin-container">
      <div className="admin-header super-admin-header">
        <div className="admin-title">
          <h1>👑 Super Admin Control Panel</h1>
          <p>Kelola semua pengguna dan konfigurasi sistem (Akses Super Admin)</p>
          <div className="admin-current-user">
            <span className="current-role super-admin-role">👑 Super Administrator</span>
            <span className="current-username">{currentUser?.username}</span>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Section: Pendaftaran User Baru */}
        <div className="admin-section">
          <h2>📝 Pendaftaran User Baru</h2>
          
          {!showForm ? (
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ Tambah User Baru
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Konfirmasi Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="userRole">Role</label>
                <select
                  id="userRole"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  {isSuperAdmin() && <option value="super_admin">Super Admin</option>}
                </select>
              </div>

              {message && (
                <div className={`message ${messageType}`}>
                  {messageType === 'success' ? '✅' : '❌'} {message}
                </div>
              )}

              <div className="form-buttons">
                <button type="submit" className="btn btn-success">
                  ✓ Daftarkan User
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setMessage('');
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Section: Daftar User */}
        <div className="admin-section">
          <h2>👥 Daftar Pengguna Terdaftar ({users.length})</h2>
          
          {users.length > 0 ? (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Terdaftar Sejak</th>
                    {isSuperAdmin() && <th>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={`role-row role-${user.role}`}>
                      <td>{user.id}</td>
                      <td>
                        <strong>{user.username}</strong>
                        {(user.role === 'admin' || user.role === 'super_admin') && (
                          <span className={`admin-badge badge-${user.role}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        )}
                      </td>
                      <td>
                        {isSuperAdmin() ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className="role-select"
                          >
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        ) : (
                          <span className={`role-badge role-${user.role}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        )}
                      </td>
                      <td><code>{user.email}</code></td>
                      <td>
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      {isSuperAdmin() && (
                        <td>
                          <button
                            type="button"
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Hapus user ini"
                          >
                            🗑️ Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">Tidak ada pengguna terdaftar</p>
          )}
        </div>

        {/* Section: Sensor Management */}
        <div className="admin-section">
          <h2>📡 Manajemen Sensor IoT</h2>
          <SensorManagement />
        </div>

        {/* Section: Info Admin */}
        <div className="admin-section info-section">
          <h2>ℹ️ Informasi Admin Saat Ini</h2>
          <div className="info-box">
            <div className="info-item">
              <span className="info-label">Username:</span>
              <span className="info-value">{currentUser.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role:</span>
              <span className="info-value role-display">{getRoleLabel(currentUser.role)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{currentUser.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total User Terdaftar:</span>
              <span className="info-value">{users.length} pengguna</span>
            </div>
            {isSuperAdmin() && (
              <div className="info-item super-admin-badge">
                <span className="badge-icon">👑</span>
                <span>Anda adalah Super Administrator dengan akses penuh</span>
              </div>
            )}
          </div>
        </div>

        {/* Section: Statistik */}
        <div className="admin-section stats-section">
          <h2>📊 Statistik Sistem</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-label">Total Pengguna</span>
                <span className="stat-value">{users.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-info">
                <span className="stat-label">Super Admin</span>
                <span className="stat-value">{users.filter(u => u.role === 'super_admin').length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-info">
                <span className="stat-label">Admin</span>
                <span className="stat-value">{users.filter(u => u.role === 'admin').length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚙️</div>
              <div className="stat-info">
                <span className="stat-label">Moderator</span>
                <span className="stat-value">{users.filter(u => u.role === 'moderator').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
