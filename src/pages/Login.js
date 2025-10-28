import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Auto-initialize default users on component mount
  useEffect(() => {
    const initializeDefaultUsers = () => {
      const stored = localStorage.getItem('users');
      
      // If no users, initialize them
      if (!stored) {
        const defaultUsers = [
          {
            id: 1,
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            email: 'admin@pelbiot.com',
            name: 'Administrator',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            username: 'superadmin',
            password: 'superadmin123',
            role: 'super_admin',
            email: 'superadmin@pelbiot.com',
            name: 'Super Administrator',
            createdAt: new Date().toISOString()
          }
        ];
        
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        console.log('✅ Login page: Default users initialized');
        console.log('Users:', defaultUsers.map(u => u.username));
      } else {
        try {
          const parsed = JSON.parse(stored);
          console.log('✅ Users found:', parsed.map(u => u.username));
        } catch (e) {
          console.error('❌ Corrupted users data, reinitializing...');
          const defaultUsers = [
            {
              id: 1,
              username: 'admin',
              password: 'admin123',
              role: 'admin',
              email: 'admin@pelbiot.com',
              name: 'Administrator',
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              username: 'superadmin',
              password: 'superadmin123',
              role: 'super_admin',
              email: 'superadmin@pelbiot.com',
              name: 'Super Administrator',
              createdAt: new Date().toISOString()
            }
          ];
          localStorage.setItem('users', JSON.stringify(defaultUsers));
          console.log('✅ Users re-initialized after corruption');
        }
      }
    };

    initializeDefaultUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasi input
    if (!username || !password) {
      setError('Username dan password harus diisi!');
      setLoading(false);
      return;
    }

    // Simulasi delay untuk UX yang lebih baik
    setTimeout(() => {
      const result = login(username, password);
      if (result.success) {
        setLoading(false);
        navigate('/dashboard');
      } else {
        setError(result.message);
        setLoading(false);
      }
    }, 500);
  };



  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>🔐 Login</h1>
          <p>Sistem Manajemen Akun</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
