import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>📡 Tentang Sistem</h4>
          <p>
            Sistem Monitoring Energi Listrik Berbasis IoT yang dirancang khusus untuk 
            memantau distribusi daya dari transformator hingga panel distribusi secara real-time 
            dengan akurasi tinggi.
          </p>
        </div>

        <div className="footer-section">
          <h4>✨ Fitur Utama</h4>
          <ul className="features-list">
            <li>⚡ Monitoring Real-time</li>
            <li>📊 Analisis Data Komprehensif</li>
            <li>🔔 Sistem Alarm Otomatis</li>
            <li>💾 Penyimpanan Data Historis</li>
            <li>📱 Dashboard Responsif</li>
            <li>🔒 Keamanan Tingkat Enterprise</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>🛠️ Teknologi</h4>
          <div className="tech-stack">
            <div className="tech-group">
              <span className="tech-label">Frontend:</span>
              <span className="tech-value">React 19, React Router, CSS3</span>
            </div>
            <div className="tech-group">
              <span className="tech-label">Backend:</span>
              <span className="tech-value">Node.js, Express, MongoDB</span>
            </div>
            <div className="tech-group">
              <span className="tech-label">Real-time:</span>
              <span className="tech-value">Socket.IO, MQTT</span>
            </div>
            <div className="tech-group">
              <span className="tech-label">Visualisasi:</span>
              <span className="tech-value">Recharts, Canvas</span>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4>📞 Kontak & Informasi</h4>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <span>info@pelbiot.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <span>+62 21 1234 5678</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🌐</span>
              <span>www.pelbiot.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>Jakarta, Indonesia</span>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4>📈 Statistik Sistem</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Panel Terpantau</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Transformer</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-links">
          <a href="#privacy">🔒 Privacy Policy</a>
          <span className="divider">•</span>
          <a href="#terms">📜 Terms of Service</a>
          <span className="divider">•</span>
          <a href="#support">💬 Support</a>
          <span className="divider">•</span>
          <a href="#documentation">📚 Documentation</a>
        </div>
        <div className="footer-copyright">
          <p>© 2024 PT PELBIOT - Sistem Monitoring Energi Listrik. All rights reserved.</p>
          <p>Developed with ❤️ | Last Updated: {new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
