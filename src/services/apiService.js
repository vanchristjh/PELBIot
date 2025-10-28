import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_SERVER = 'http://localhost:5000';

let socketInstance = null;

// Axios instance dengan konfigurasi
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

// Socket.IO Service
export const socketService = {
  connect: () => {
    if (socketInstance?.connected) return socketInstance;

    socketInstance = io(SOCKET_SERVER, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO Connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket.IO Disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket Connection Error:', error);
    });

    return socketInstance;
  },

  disconnect: () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  },

  on: (event, callback) => {
    if (!socketInstance) socketService.connect();
    socketInstance.on(event, callback);
  },

  off: (event, callback) => {
    if (socketInstance) {
      socketInstance.off(event, callback);
    }
  },

  once: (event, callback) => {
    if (!socketInstance) socketService.connect();
    socketInstance.once(event, callback);
  }
};

// API Service - Comprehensive Real-Time Integration
export const apiService = {
  // ==================== DATA ENDPOINTS ====================
  data: {
    getCurrent: () => axiosInstance.get('/data/current'),
    getHistory: (hours = 24) => axiosInstance.get(`/data/history?hours=${hours}`),
    getAlerts: (hours = 24) => axiosInstance.get(`/data/alerts?hours=${hours}`),
    getRange: (startDate, endDate) => axiosInstance.get('/data/range', { params: { startDate, endDate } })
  },

  // ==================== ALERT ENDPOINTS ====================
  alerts: {
    getAll: () => axiosInstance.get('/alerts'),
    getActive: () => axiosInstance.get('/alerts/active'),
    create: (data) => axiosInstance.post('/alerts', data),
    delete: (id) => axiosInstance.delete(`/alerts/${id}`),
    clearAll: () => axiosInstance.delete('/alerts/clear/all'),
    acknowledge: (id) => axiosInstance.put(`/alerts/${id}/acknowledge`)
  },

  // ==================== DEVICE ENDPOINTS ====================
  devices: {
    getAll: () => axiosInstance.get('/devices'),
    getById: (id) => axiosInstance.get(`/devices/${id}`),
    update: (id, data) => axiosInstance.put(`/devices/${id}`, data),
    getStatus: () => axiosInstance.get('/devices/status/all'),
    getByLocation: (location) => axiosInstance.get(`/devices/location/${location}`)
  },

  // ==================== PANEL ENDPOINTS ====================
  panels: {
    getAll: () => axiosInstance.get('/panels'),
    getById: (id) => axiosInstance.get(`/panels/${id}`),
    getHistory: (id, hours = 24) => axiosInstance.get(`/panels/${id}/history?hours=${hours}`),
    getCurrentData: (id) => axiosInstance.get(`/panels/${id}/current`),
    getStats: (id) => axiosInstance.get(`/panels/${id}/stats`),
    update: (id, data) => axiosInstance.put(`/panels/${id}`, data)
  },

  // ==================== TRANSFORMER ENDPOINTS ====================
  transformers: {
    getAll: () => axiosInstance.get('/transformers'),
    getById: (id) => axiosInstance.get(`/transformers/${id}`),
    getCurrent: (id) => axiosInstance.get(`/transformers/${id}/current`),
    getHistory: (id, hours = 24) => axiosInstance.get(`/transformers/${id}/history?hours=${hours}`),
    getStats: (id) => axiosInstance.get(`/transformers/${id}/stats`),
    getLoadProfile: (id) => axiosInstance.get(`/transformers/${id}/load-profile`),
    update: (id, data) => axiosInstance.put(`/transformers/${id}`, data)
  },

  // ==================== WEATHER ENDPOINTS ====================
  weather: {
    getCurrent: () => axiosInstance.get('/weather/current'),
    getHistory: (hours = 24) => axiosInstance.get(`/weather/history?hours=${hours}`),
    getForecast: () => axiosInstance.get('/weather/forecast'),
    getStats: () => axiosInstance.get('/weather/stats'),
    getByLocation: (location) => axiosInstance.get(`/weather/location/${location}`)
  },

  // ==================== REPORT ENDPOINTS ====================
  reports: {
    getAll: () => axiosInstance.get('/reports'),
    getById: (id) => axiosInstance.get(`/reports/${id}`),
    generate: (startDate, endDate, type = 'energy') => axiosInstance.post('/reports/generate', { startDate, endDate, type }),
    export: (id, format = 'pdf') => axiosInstance.get(`/reports/${id}/export?format=${format}`, { responseType: 'blob' }),
    exportData: (startDate, endDate, format = 'csv') => axiosInstance.get('/reports/export', { params: { startDate, endDate, format }, responseType: 'blob' })
  },

  // ==================== TREND ENDPOINTS ====================
  trends: {
    getPowerTrend: (days = 30) => axiosInstance.get(`/trends/power?days=${days}`),
    getEnergyTrend: (days = 30) => axiosInstance.get(`/trends/energy?days=${days}`),
    getTemperatureTrend: (days = 30) => axiosInstance.get(`/trends/temperature?days=${days}`),
    getLoadTrend: (days = 30) => axiosInstance.get(`/trends/load?days=${days}`),
    getComparative: (startDate, endDate) => axiosInstance.get('/trends/comparative', { params: { startDate, endDate } })
  },

  // ==================== LOAD PROFILE ENDPOINTS ====================
  loadProfile: {
    getCurrent: () => axiosInstance.get('/load-profile/current'),
    getHistory: (hours = 24) => axiosInstance.get(`/load-profile/history?hours=${hours}`),
    getPeak: () => axiosInstance.get('/load-profile/peak'),
    getAverage: () => axiosInstance.get('/load-profile/average'),
    getForecast: () => axiosInstance.get('/load-profile/forecast')
  },

  // ==================== MASTER DATA ENDPOINTS ====================
  masterData: {
    getAll: () => axiosInstance.get('/master-data'),
    getDevices: () => axiosInstance.get('/master-data/devices'),
    getSensors: () => axiosInstance.get('/master-data/sensors'),
    getLocations: () => axiosInstance.get('/master-data/locations'),
    getCategories: () => axiosInstance.get('/master-data/categories'),
    create: (data) => axiosInstance.post('/master-data', data),
    update: (id, data) => axiosInstance.put(`/master-data/${id}`, data),
    delete: (id) => axiosInstance.delete(`/master-data/${id}`)
  },

  // ==================== SYSTEM ENDPOINTS ====================
  system: {
    getHealth: () => axiosInstance.get('/system/health'),
    getStats: () => axiosInstance.get('/system/stats'),
    getPerformance: () => axiosInstance.get('/system/performance'),
    getStatus: () => axiosInstance.get('/system/status')
  }
};

const services = {
  socketService,
  apiService
};

export default services;
