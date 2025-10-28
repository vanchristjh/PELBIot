// Generate realistic demo data for real-time updates

export const generatePanelData = () => {
  return {
    id: Math.floor(Math.random() * 6) + 1,
    panel_number: Math.floor(Math.random() * 3) + 1,
    voltage: 380 + (Math.random() - 0.5) * 10,
    ampere: 40 + Math.random() * 20,
    power: 15000 + Math.random() * 6000,
    power_factor: 0.95 + Math.random() * 0.05,
    frequency: 50 + (Math.random() - 0.5) * 0.5,
    timestamp: new Date()
  };
};

export const generateTransformerData = () => {
  return {
    id: Math.floor(Math.random() * 2) + 1,
    name: `Trafo ${Math.floor(Math.random() * 2) + 1}`,
    primary_voltage: 20000 + (Math.random() - 0.5) * 100,
    secondary_voltage: 380 + (Math.random() - 0.5) * 10,
    efficiency: 95 + Math.random() * 3.5,
    temperature: 40 + Math.random() * 20,
    status: Math.random() > 0.95 ? 'error' : 'online',
    timestamp: new Date()
  };
};

export const generateWeatherData = () => {
  return {
    id: 1,
    temperature: 25 + Math.random() * 10,
    humidity: 40 + Math.random() * 50,
    pressure: 1010 + (Math.random() - 0.5) * 10,
    wind_speed: Math.random() * 10,
    condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
    timestamp: new Date()
  };
};

export const generateAlertData = () => {
  const severities = ['info', 'warning', 'critical'];
  const messages = [
    'High voltage detected',
    'Low voltage detected',
    'High temperature warning',
    'Equipment maintenance due',
    'System status normal',
    'Connection unstable',
    'High current flow'
  ];

  return {
    id: Math.floor(Math.random() * 1000),
    device_id: Math.floor(Math.random() * 6) + 1,
    severity: severities[Math.floor(Math.random() * severities.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    status: 'open',
    timestamp: new Date()
  };
};

export const generateSystemHealth = () => {
  return {
    total_devices: 6,
    online_devices: Math.floor(5 + Math.random()),
    overall_efficiency: 90 + Math.random() * 8,
    uptime_percentage: 99 + Math.random() * 0.8,
    active_alerts: Math.floor(Math.random() * 5),
    system_status: Math.random() > 0.05 ? 'healthy' : 'warning',
    timestamp: new Date()
  };
};

export const generateEnergyData = () => {
  return {
    total_energy: 10000 + Math.random() * 5000,
    today_energy: 400 + Math.random() * 200,
    this_month_energy: 8000 + Math.random() * 4000,
    estimated_cost: 2000 + Math.random() * 1000,
    peak_power: 60000 + Math.random() * 10000,
    average_power: 50000 + Math.random() * 8000,
    power_factor: 0.95 + Math.random() * 0.05,
    timestamp: new Date()
  };
};

export const generateLoadProfileData = () => {
  const hour = new Date().getHours();
  const baseLoad = 30000 + Math.sin(hour / 12) * 20000;
  return {
    hour: hour,
    load: baseLoad + (Math.random() - 0.5) * 2000,
    peak: 60000 + Math.random() * 5000,
    average: 50000 + Math.random() * 5000,
    load_factor: (50000 / 60000) * 100,
    timestamp: new Date()
  };
};

export const generateTrendData = (type = 'power') => {
  const today = new Date();
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    let value;
    switch (type) {
      case 'power':
        value = 50000 + Math.random() * 10000;
        break;
      case 'energy':
        value = 1200 + Math.random() * 400;
        break;
      case 'temperature':
        value = 30 + Math.random() * 10;
        break;
      case 'load':
        value = 60 + Math.random() * 20;
        break;
      default:
        value = 50000 + Math.random() * 10000;
    }
    data.push({
      date: date.toISOString().split('T')[0],
      value: value
    });
  }
  return data;
};

export const generateDeviceStatus = () => {
  const devices = [
    { id: 1, name: 'Meter Utama', status: 'online' },
    { id: 2, name: 'Panel Distribusi 1', status: Math.random() > 0.1 ? 'online' : 'offline' },
    { id: 3, name: 'Panel Distribusi 2', status: Math.random() > 0.1 ? 'online' : 'offline' },
    { id: 4, name: 'Trafo 1', status: Math.random() > 0.05 ? 'online' : 'error' },
    { id: 5, name: 'Trafo 2', status: Math.random() > 0.05 ? 'online' : 'error' },
    { id: 6, name: 'Weather Station', status: 'online' }
  ];
  return devices;
};
