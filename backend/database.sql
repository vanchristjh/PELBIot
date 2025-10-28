-- PELBIOT Database Schema
-- Run this script to setup the database

CREATE DATABASE IF NOT EXISTS pelbiot;
USE pelbiot;

-- Devices Table
CREATE TABLE IF NOT EXISTS devices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status ENUM('online', 'offline', 'error') DEFAULT 'online',
  location VARCHAR(255),
  ip_address VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_status (status)
);

-- Panels Table
CREATE TABLE IF NOT EXISTS panels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  device_id INT NOT NULL,
  panel_number INT,
  voltage DECIMAL(10,2),
  ampere DECIMAL(10,2),
  power DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'online',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_device_id (device_id),
  INDEX idx_status (status)
);

-- Transformers Table
CREATE TABLE IF NOT EXISTS transformers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  device_id INT NOT NULL,
  name VARCHAR(255),
  primary_voltage DECIMAL(10,2),
  secondary_voltage DECIMAL(10,2),
  efficiency DECIMAL(5,2),
  temperature DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'online',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_device_id (device_id)
);

-- Weather Table
CREATE TABLE IF NOT EXISTS weather (
  id INT PRIMARY KEY AUTO_INCREMENT,
  device_id INT,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  pressure DECIMAL(7,2),
  wind_speed DECIMAL(5,2),
  condition VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_device_id (device_id),
  INDEX idx_created_at (created_at)
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  device_id INT,
  severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
  message VARCHAR(500),
  status ENUM('open', 'acknowledged', 'resolved') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_device_id (device_id),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Trends Table
CREATE TABLE IF NOT EXISTS trends (
  id INT PRIMARY KEY AUTO_INCREMENT,
  device_id INT,
  date DATE,
  power DECIMAL(10,2),
  energy DECIMAL(10,2),
  temperature DECIMAL(5,2),
  load DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_device_id (device_id),
  INDEX idx_date (date),
  INDEX idx_created_at (created_at)
);

-- Load Profiles Table
CREATE TABLE IF NOT EXISTS load_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  device_id INT,
  hour INT,
  load DECIMAL(10,2),
  peak DECIMAL(10,2),
  average DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_device_id (device_id),
  INDEX idx_hour (hour)
);

-- Master Data Table
CREATE TABLE IF NOT EXISTS master_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50),
  name VARCHAR(255),
  value VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  report_type VARCHAR(50),
  start_date DATE,
  end_date DATE,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_report_type (report_type),
  INDEX idx_created_at (created_at)
);

-- Verification Table
CREATE TABLE IF NOT EXISTS verification (
  id INT PRIMARY KEY AUTO_INCREMENT,
  device_id INT,
  accuracy_score DECIMAL(5,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_device_id (device_id)
);
