-- PELBIOT Sensor Integration - Database Schema
-- Execute this file to create all sensor-related tables
-- mysql -u root pelbiot < backend/migrations/sensor_schema.sql

-- ===== SENSOR MANAGEMENT =====

-- Tabel untuk konfigurasi sensor
CREATE TABLE IF NOT EXISTS sensors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL COMMENT 'Nama sensor',
  protocol ENUM('mqtt', 'modbus-tcp', 'modbus-rtu', 'serial', 'rest') NOT NULL COMMENT 'Protokol koneksi',
  device_id INT COMMENT 'Reference ke device/perangkat',
  register_address INT COMMENT 'Untuk Modbus: alamat register',
  min_value DECIMAL(10, 2) COMMENT 'Nilai minimum yang diharapkan',
  max_value DECIMAL(10, 2) COMMENT 'Nilai maksimum yang diharapkan',
  unit VARCHAR(50) COMMENT 'Satuan (V, A, kW, °C, %, dll)',
  config JSON COMMENT 'Konfigurasi spesifik per protokol',
  status ENUM('active', 'inactive', 'error', 'registered') DEFAULT 'inactive' COMMENT 'Status sensor',
  location VARCHAR(255) COMMENT 'Lokasi fisik sensor',
  last_register TIMESTAMP COMMENT 'Terakhir kali sensor register',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(255),
  
  INDEX idx_protocol (protocol),
  INDEX idx_status (status),
  INDEX idx_device_id (device_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master data sensor';

-- Tabel untuk data real-time dari sensor
CREATE TABLE IF NOT EXISTS sensor_data (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sensor_id INT NOT NULL,
  value DECIMAL(15, 6) NOT NULL COMMENT 'Nilai yang diterima dari sensor',
  unit VARCHAR(50) COMMENT 'Satuan pengukuran',
  metadata JSON COMMENT 'Data tambahan (signal strength, etc)',
  quality_score INT DEFAULT 100 COMMENT 'Skor kualitas data (0-100)',
  is_anomaly BOOLEAN DEFAULT FALSE COMMENT 'Flag untuk anomaly detection',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
  INDEX idx_sensor_id (sensor_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_sensor_timestamp (sensor_id, timestamp),
  INDEX idx_quality_score (quality_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historical sensor data';

-- Tabel untuk sensor health monitoring
CREATE TABLE IF NOT EXISTS sensor_health (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sensor_id INT NOT NULL UNIQUE,
  is_connected BOOLEAN DEFAULT FALSE,
  last_data_time TIMESTAMP,
  error_count INT DEFAULT 0,
  warning_count INT DEFAULT 0,
  total_data_points BIGINT DEFAULT 0,
  uptime_percentage DECIMAL(5, 2) DEFAULT 100,
  last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
  INDEX idx_is_connected (is_connected)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sensor health status';

-- Tabel untuk sensor error/alarm log
CREATE TABLE IF NOT EXISTS sensor_error_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sensor_id INT NOT NULL,
  error_type VARCHAR(100) COMMENT 'Tipe error (connection, validation, timeout, etc)',
  error_message TEXT,
  severity ENUM('info', 'warning', 'error', 'critical') DEFAULT 'error',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
  INDEX idx_sensor_id (sensor_id),
  INDEX idx_severity (severity),
  INDEX idx_resolved (resolved),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sensor error and alarm tracking';

-- Tabel untuk devices (panel, trafo, gateway, dll)
CREATE TABLE IF NOT EXISTS devices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type ENUM('panel', 'trafo', 'weather_station', 'gateway', 'other') DEFAULT 'other',
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_type (type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Device/gateway master data';

-- Tabel untuk mapping sensor ke device
CREATE TABLE IF NOT EXISTS device_sensor_mapping (
  id INT PRIMARY KEY AUTO_INCREMENT,
  device_id INT NOT NULL,
  sensor_id INT NOT NULL,
  position VARCHAR(100) COMMENT 'Posisi/lokasi di device (R, Y, B phase; Input, Output; etc)',
  priority INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_device_sensor (device_id, sensor_id),
  INDEX idx_device_id (device_id),
  INDEX idx_sensor_id (sensor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Device to sensor mapping';

-- Tabel untuk sensor configuration backup/audit trail
CREATE TABLE IF NOT EXISTS sensor_config_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sensor_id INT NOT NULL,
  old_config JSON COMMENT 'Konfigurasi sebelumnya',
  new_config JSON COMMENT 'Konfigurasi baru',
  change_reason VARCHAR(500),
  changed_by VARCHAR(255),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
  INDEX idx_sensor_id (sensor_id),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for sensor config changes';

-- Verify tables created
SELECT 'Sensor tables created successfully!' AS status;
