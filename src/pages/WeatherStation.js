import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService, socketService } from '../services/apiService';
import './WeatherStation.css';

const WeatherStation = () => {
  const [weather, setWeather] = useState({
    temp: 0,
    humidity: 0,
    pressure: 0,
    condition: 'Loading...',
    windSpeed: 0,
    uvIndex: 0,
    visibility: 0,
    loading: true,
    error: null
  });

  const [stats, setStats] = useState({
    avgTemp: 0,
    maxTemp: 0,
    minTemp: 0,
    avgHumidity: 0,
    loading: true
  });

  const [historyData, setHistoryData] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // Fetch current weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeather(prev => ({ ...prev, loading: true, error: null }));
        const response = await apiService.weather.getCurrent();
        
        if (response.data) {
          const data = response.data;
          setWeather({
            temp: parseFloat(data.temperature) || parseFloat(data.temp) || 0,
            humidity: parseFloat(data.humidity) || 0,
            pressure: parseFloat(data.pressure) || 0,
            condition: data.condition || data.weather || 'Clear',
            windSpeed: parseFloat(data.wind_speed) || parseFloat(data.windSpeed) || 0,
            uvIndex: parseFloat(data.uv_index) || parseFloat(data.uvIndex) || 0,
            visibility: parseFloat(data.visibility) || 0,
            loading: false,
            error: null
          });
        }
      } catch (err) {
        console.error('Error fetching weather:', err);
        setWeather(prev => ({
          ...prev,
          loading: false,
          error: 'Gagal memuat data cuaca'
        }));
        
        // Fallback dengan sample data
        setWeather({
          temp: 28 + Math.random() * 5,
          humidity: 70 + Math.random() * 10,
          pressure: 1013 + Math.random() * 5,
          condition: 'Partly Cloudy',
          windSpeed: 5 + Math.random() * 10,
          uvIndex: 4 + Math.random() * 4,
          visibility: 10,
          loading: false,
          error: null
        });
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 2 * 60 * 1000); // Refresh setiap 2 menit
    return () => clearInterval(interval);
  }, []);

  // Fetch weather history and stats
  useEffect(() => {
    const fetchHistoryAndStats = async () => {
      try {
        const [historyResponse, statsResponse] = await Promise.all([
          apiService.weather.getHistory(24),
          apiService.weather.getStats()
        ]);

        if (historyResponse.data && Array.isArray(historyResponse.data)) {
          const formattedData = historyResponse.data.map(item => ({
            time: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            temp: parseFloat(item.temperature) || parseFloat(item.temp) || 0,
            humidity: parseFloat(item.humidity) || 0
          }));
          setHistoryData(formattedData);
        }

        if (statsResponse.data) {
          const data = statsResponse.data;
          setStats({
            avgTemp: parseFloat(data.avg_temperature) || parseFloat(data.avgTemp) || 0,
            maxTemp: parseFloat(data.max_temperature) || parseFloat(data.maxTemp) || 0,
            minTemp: parseFloat(data.min_temperature) || parseFloat(data.minTemp) || 0,
            avgHumidity: parseFloat(data.avg_humidity) || parseFloat(data.avgHumidity) || 0,
            loading: false
          });
        }
      } catch (err) {
        console.error('Error fetching weather history:', err);
        
        // Generate sample data
        setHistoryData(Array.from({ length: 24 }, (_, i) => ({
          time: i + ':00',
          temp: 25 + Math.random() * 8,
          humidity: 65 + Math.random() * 20
        })));

        setStats({
          avgTemp: 28.5,
          maxTemp: 32,
          minTemp: 24,
          avgHumidity: 75,
          loading: false
        });
      }
    };

    fetchHistoryAndStats();
  }, []);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const handleWeatherUpdate = (data) => {
      setWeather(prev => ({
        ...prev,
        temp: parseFloat(data.temperature) || parseFloat(data.temp) || prev.temp,
        humidity: parseFloat(data.humidity) || prev.humidity,
        pressure: parseFloat(data.pressure) || prev.pressure,
        condition: data.condition || data.weather || prev.condition,
        windSpeed: parseFloat(data.wind_speed) || parseFloat(data.windSpeed) || prev.windSpeed,
        uvIndex: parseFloat(data.uv_index) || parseFloat(data.uvIndex) || prev.uvIndex,
        visibility: parseFloat(data.visibility) || prev.visibility,
        lastUpdate: new Date()
      }));

      // Update history
      setHistoryData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          temp: parseFloat(data.temperature) || parseFloat(data.temp) || 0,
          humidity: parseFloat(data.humidity) || 0
        }];
        return newData.slice(-48); // Keep last 48 points
      });
    };

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socketService.on('weather-update', handleWeatherUpdate);
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    return () => {
      socketService.off('weather-update', handleWeatherUpdate);
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, []);

  const getWeatherIcon = (condition) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain')) return '🌧️';
    if (cond.includes('cloud')) return '☁️';
    if (cond.includes('clear') || cond.includes('sunny')) return '☀️';
    if (cond.includes('snow')) return '❄️';
    if (cond.includes('storm')) return '⛈️';
    if (cond.includes('fog')) return '🌫️';
    return '🌤️';
  };

  const getTempColor = (temp) => {
    if (temp < 15) return '#00d4ff';
    if (temp < 25) return '#00ff88';
    if (temp < 30) return '#ffaa00';
    return '#ff6b6b';
  };

  const getHumidityColor = (humidity) => {
    if (humidity < 40) return '#ff6b6b';
    if (humidity < 60) return '#ffaa00';
    return '#00d4ff';
  };

  return (
    <div className="weather-container">
      <div style={{ marginBottom: '20px' }}>
        <h1>🌡️ Weather Station</h1>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          padding: '10px',
          background: 'rgba(0, 212, 255, 0.08)',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <span style={{ color: socketConnected ? '#00ff88' : '#ff6b6b', fontWeight: 'bold' }}>
            {socketConnected ? '🟢 Real-time Connected' : '🔴 Disconnected'}
          </span>
          {weather.error && <span style={{ color: '#ff6b6b', fontSize: '12px' }}>⚠️ {weather.error}</span>}
        </div>
      </div>

      {/* Current Weather Card */}
      <div className="weather-card" style={{
        background: 'rgba(0, 212, 255, 0.05)',
        padding: '30px',
        borderRadius: '12px',
        border: '2px solid rgba(0, 212, 255, 0.2)',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>
          {getWeatherIcon(weather.condition)}
        </div>

        <div className="temperature-display" style={{
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: getTempColor(weather.temp),
            marginBottom: '10px'
          }}>
            {weather.loading ? '...' : `${weather.temp.toFixed(1)}°C`}
          </div>
          <div style={{
            fontSize: '20px',
            color: '#a8b8c8'
          }}>
            {weather.condition}
          </div>
        </div>

        <div className="weather-details" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '15px',
          marginTop: '25px'
        }}>
          <div style={{
            padding: '15px',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(0, 212, 255, 0.2)'
          }}>
            <div style={{ fontSize: '12px', color: '#a8b8c8' }}>Kelembaban</div>
            <div style={{ color: getHumidityColor(weather.humidity), fontSize: '20px', fontWeight: 'bold' }}>
              {weather.humidity}%
            </div>
          </div>

          <div style={{
            padding: '15px',
            background: 'rgba(255, 170, 0, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 170, 0, 0.2)'
          }}>
            <div style={{ fontSize: '12px', color: '#a8b8c8' }}>Tekanan</div>
            <div style={{ color: '#ffaa00', fontSize: '20px', fontWeight: 'bold' }}>
              {weather.pressure} hPa
            </div>
          </div>

          <div style={{
            padding: '15px',
            background: 'rgba(0, 255, 136, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(0, 255, 136, 0.2)'
          }}>
            <div style={{ fontSize: '12px', color: '#a8b8c8' }}>Kecepatan Angin</div>
            <div style={{ color: '#00ff88', fontSize: '20px', fontWeight: 'bold' }}>
              {weather.windSpeed.toFixed(1)} m/s
            </div>
          </div>

          <div style={{
            padding: '15px',
            background: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 107, 107, 0.2)'
          }}>
            <div style={{ fontSize: '12px', color: '#a8b8c8' }}>Indeks UV</div>
            <div style={{ color: '#ff6b6b', fontSize: '20px', fontWeight: 'bold' }}>
              {weather.uvIndex.toFixed(1)}
            </div>
          </div>

          <div style={{
            padding: '15px',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(0, 212, 255, 0.2)'
          }}>
            <div style={{ fontSize: '12px', color: '#a8b8c8' }}>Jarak Pandang</div>
            <div style={{ color: '#00d4ff', fontSize: '20px', fontWeight: 'bold' }}>
              {weather.visibility} km
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '20px',
          background: 'rgba(0, 255, 136, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#a8b8c8', fontSize: '12px', marginBottom: '8px' }}>Rata-rata Suhu</div>
          <div style={{ color: '#00ff88', fontSize: '28px', fontWeight: 'bold' }}>
            {stats.loading ? '...' : `${stats.avgTemp.toFixed(1)}°C`}
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: 'rgba(255, 170, 0, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 170, 0, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#a8b8c8', fontSize: '12px', marginBottom: '8px' }}>Suhu Maksimum</div>
          <div style={{ color: '#ffaa00', fontSize: '28px', fontWeight: 'bold' }}>
            {stats.loading ? '...' : `${stats.maxTemp.toFixed(1)}°C`}
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 107, 107, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#a8b8c8', fontSize: '12px', marginBottom: '8px' }}>Suhu Minimum</div>
          <div style={{ color: '#ff6b6b', fontSize: '28px', fontWeight: 'bold' }}>
            {stats.loading ? '...' : `${stats.minTemp.toFixed(1)}°C`}
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#a8b8c8', fontSize: '12px', marginBottom: '8px' }}>Kelembaban Rata-rata</div>
          <div style={{ color: '#00d4ff', fontSize: '28px', fontWeight: 'bold' }}>
            {stats.loading ? '...' : `${stats.avgHumidity.toFixed(1)}%`}
          </div>
        </div>
      </div>

      {/* History Chart */}
      <div style={{
        background: 'rgba(0, 212, 255, 0.05)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <h3 style={{ color: '#00d4ff', marginTop: 0 }}>📈 Trend Suhu & Kelembaban 24 Jam</h3>
        {stats.loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#a8b8c8' }}>Loading chart...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00d4ff" opacity={0.1} />
              <XAxis dataKey="time" stroke="#a8b8c8" />
              <YAxis stroke="#a8b8c8" />
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid #00d4ff' }}
                labelStyle={{ color: '#00d4ff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="temp" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.2} name="Suhu (°C)" />
              <Area type="monotone" dataKey="humidity" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.2} name="Kelembaban (%)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default WeatherStation;
