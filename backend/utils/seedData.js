import { query } from './database.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await query('DELETE FROM alerts');
    await query('DELETE FROM load_profiles');
    await query('DELETE FROM trends');
    await query('DELETE FROM weather');
    await query('DELETE FROM transformers');
    await query('DELETE FROM panels');
    await query('DELETE FROM devices');

    // Insert Devices
    console.log('📱 Adding devices...');
    const devices = [
      ['Meter Utama', 'power-meter', 'online', 'Ruang Listrik', '192.168.1.10'],
      ['Panel Distribusi 1', 'panel', 'online', 'Gedung A', '192.168.1.11'],
      ['Panel Distribusi 2', 'panel', 'online', 'Gedung B', '192.168.1.12'],
      ['Trafo 1', 'transformer', 'online', 'Ruang Transformator', '192.168.1.20'],
      ['Trafo 2', 'transformer', 'online', 'Ruang Transformator', '192.168.1.21'],
      ['Weather Station', 'weather', 'online', 'Atap Gedung', '192.168.1.30']
    ];

    const deviceIds = [];
    for (const device of devices) {
      const result = await query('INSERT INTO devices (name, type, status, location, ip_address) VALUES (?, ?, ?, ?, ?)', device);
      deviceIds.push(result.insertId);
    }
    console.log(`✅ Added ${devices.length} devices`);

    // Insert Panels
    console.log('🔌 Adding panels...');
    const panels = [
      [deviceIds[1], 1, 380, 50, 19000, 'online'],
      [deviceIds[1], 2, 380, 48, 18240, 'online'],
      [deviceIds[1], 3, 380, 52, 19760, 'online'],
      [deviceIds[2], 1, 380, 45, 17100, 'online'],
      [deviceIds[2], 2, 380, 46, 17480, 'online'],
      [deviceIds[2], 3, 380, 44, 16720, 'online']
    ];

    for (const panel of panels) {
      await query('INSERT INTO panels (device_id, panel_number, voltage, ampere, power, status) VALUES (?, ?, ?, ?, ?, ?)', panel);
    }
    console.log(`✅ Added ${panels.length} panels`);

    // Insert Transformers
    console.log('⚡ Adding transformers...');
    const transformers = [
      [deviceIds[3], 'Trafo 1', 20000, 380, 98.5, 45.2, 'online'],
      [deviceIds[4], 'Trafo 2', 20000, 380, 97.8, 48.5, 'online']
    ];

    for (const trafo of transformers) {
      await query('INSERT INTO transformers (device_id, name, primary_voltage, secondary_voltage, efficiency, temperature, status) VALUES (?, ?, ?, ?, ?, ?, ?)', trafo);
    }
    console.log(`✅ Added ${transformers.length} transformers`);

    // Insert Weather Data
    console.log('🌤️ Adding weather data...');
    const weather = [
      [deviceIds[5], 28.5, 65, 1013, 2.5, 'Sunny'],
      [deviceIds[5], 29.0, 62, 1013, 3.0, 'Partly Cloudy']
    ];

    for (const w of weather) {
      await query('INSERT INTO weather (device_id, temperature, humidity, pressure, wind_speed, condition) VALUES (?, ?, ?, ?, ?, ?)', w);
    }
    console.log(`✅ Added weather data`);

    // Insert Alerts
    console.log('🚨 Adding alerts...');
    const alerts = [
      [deviceIds[0], 'warning', 'High current detected on phase A: 52A', 'open'],
      [deviceIds[1], 'info', 'Panel maintenance scheduled', 'open'],
      [deviceIds[3], 'critical', 'Transformer temperature high: 55°C', 'acknowledged']
    ];

    for (const alert of alerts) {
      await query('INSERT INTO alerts (device_id, severity, message, status) VALUES (?, ?, ?, ?)', alert);
    }
    console.log(`✅ Added ${alerts.length} alerts`);

    // Insert Trends
    console.log('📊 Adding trend data...');
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const power = 50000 + Math.random() * 10000;
      const energy = power * 24;
      await query('INSERT INTO trends (device_id, date, power, energy, temperature, load) VALUES (?, ?, ?, ?, ?, ?)', [deviceIds[0], date, power, energy, 25 + Math.random() * 10, 60 + Math.random() * 20]);
    }
    console.log(`✅ Added 30 days of trend data`);

    // Insert Load Profiles
    console.log('📈 Adding load profile data...');
    for (let h = 0; h < 24; h++) {
      const load = 30000 + Math.sin(h / 12) * 20000;
      await query('INSERT INTO load_profiles (device_id, hour, load, peak, average) VALUES (?, ?, ?, ?, ?)', [deviceIds[0], h, load, 60000, 50000]);
    }
    console.log(`✅ Added 24-hour load profile`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
