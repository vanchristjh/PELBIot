-- PELBIOT Database Schema
-- Run this script to setup the database

CREATE DATABASE IF NOT EXISTS pelbiot;
USE pelbiot;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'super_admin', 'operator') DEFAULT 'user',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
);

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

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255),
  resource_type VARCHAR(50),
  resource_id INT,
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  status VARCHAR(20) DEFAULT 'success',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type VARCHAR(20) DEFAULT 'string',
  description VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  activity_type VARCHAR(50),
  description TEXT,
  metadata JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_created_at (created_at)
);

-- Alert Rules Table
CREATE TABLE IF NOT EXISTS alert_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  device_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
  is_enabled BOOLEAN DEFAULT TRUE,
  trigger_type ENUM('threshold', 'change', 'pattern') DEFAULT 'threshold',
  condition_logic VARCHAR(500),
  threshold_value DECIMAL(10,2),
  comparison_operator ENUM('<', '>', '<=', '>=', '=', '!=') DEFAULT '>',
  metric VARCHAR(50),
  duration_seconds INT DEFAULT 300,
  cooldown_seconds INT DEFAULT 600,
  notification_enabled BOOLEAN DEFAULT TRUE,
  email_recipients VARCHAR(500),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_triggered_at TIMESTAMP NULL,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_device_id (device_id),
  INDEX idx_is_enabled (is_enabled),
  INDEX idx_severity (severity),
  INDEX idx_created_at (created_at)
);

-- Alert Rule Conditions Table
CREATE TABLE IF NOT EXISTS alert_rule_conditions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_id INT NOT NULL,
  condition_type VARCHAR(50),
  metric VARCHAR(50),
  operator VARCHAR(10),
  value DECIMAL(10,2),
  unit VARCHAR(20),
  logical_operator ENUM('AND', 'OR') DEFAULT 'AND',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES alert_rules(id) ON DELETE CASCADE,
  INDEX idx_rule_id (rule_id)
);

-- Alert Rule Triggers Log (history)
CREATE TABLE IF NOT EXISTS alert_rule_triggers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_id INT NOT NULL,
  trigger_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metric_value DECIMAL(10,2),
  alert_message TEXT,
  notification_sent BOOLEAN DEFAULT FALSE,
  ack_status ENUM('open', 'acknowledged', 'resolved') DEFAULT 'open',
  ack_time TIMESTAMP NULL,
  ack_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES alert_rules(id) ON DELETE CASCADE,
  FOREIGN KEY (ack_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_rule_id (rule_id),
  INDEX idx_trigger_time (trigger_time),
  INDEX idx_ack_status (ack_status)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  alert_id INT,
  report_id INT,
  notification_type ENUM('email', 'report', 'alert', 'system', 'welcome', 'password_reset') DEFAULT 'email',
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  recipient_email VARCHAR(100),
  subject VARCHAR(255),
  message_preview VARCHAR(500),
  sent_at TIMESTAMP NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE SET NULL,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_notification_type (notification_type),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),
  INDEX idx_sent_at (sent_at)
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  alert_emails BOOLEAN DEFAULT TRUE,
  report_emails BOOLEAN DEFAULT TRUE,
  daily_summary BOOLEAN DEFAULT TRUE,
  weekly_summary BOOLEAN DEFAULT FALSE,
  critical_only BOOLEAN DEFAULT FALSE,
  notification_frequency ENUM('immediate', 'daily', 'weekly') DEFAULT 'immediate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
