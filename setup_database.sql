-- PELBIOT Database Setup Script
-- Copy and paste this entire content into MySQL Workbench or mysql command line

CREATE DATABASE IF NOT EXISTS pelbiot;
USE pelbiot;

-- Create tables
CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS panels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  device_id INT,
  voltage DECIMAL(10, 2),
  current DECIMAL(10, 2),
  power DECIMAL(15, 2),
  frequency DECIMAL(5, 2),
  status VARCHAR(50) DEFAULT 'active',
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  INDEX idx_device_id (device_id),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS transformers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capacity DECIMAL(10, 2),
  efficiency DECIMAL(5, 2),
  status VARCHAR(50) DEFAULT 'active',
  temperature DECIMAL(5, 2),
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT,
  title VARCHAR(255),
  message TEXT,
  severity VARCHAR(50),
  status VARCHAR(50) DEFAULT 'open',
  acknowledged_at TIMESTAMP NULL,
  acknowledged_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  INDEX idx_status (status),
  INDEX idx_severity (severity),
  INDEX idx_device_id (device_id)
);

CREATE TABLE IF NOT EXISTS trends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT,
  metric_type VARCHAR(100),
  value DECIMAL(15, 2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  INDEX idx_device_id (device_id),
  INDEX idx_metric_type (metric_type),
  INDEX idx_timestamp (timestamp)
);

CREATE TABLE IF NOT EXISTS load_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT,
  hour INT,
  load DECIMAL(10, 2),
  date DATE,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  INDEX idx_device_id (device_id),
  INDEX idx_date (date)
);

CREATE TABLE IF NOT EXISTS weather_stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  temperature DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  wind_speed DECIMAL(5, 2),
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS verification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT,
  accuracy_percentage DECIMAL(5, 2),
  verification_status VARCHAR(50),
  last_verified TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  INDEX idx_device_id (device_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  report_type VARCHAR(100),
  date_from DATE,
  date_to DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  INDEX idx_report_type (report_type),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS master_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data_key VARCHAR(255),
  data_value TEXT,
  data_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_data_key (data_key)
);

-- Verify tables were created
SHOW TABLES;
