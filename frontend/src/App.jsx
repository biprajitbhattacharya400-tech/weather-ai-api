import { useState } from 'react';
import { Search, MapPin, CloudRain, CloudLightning, CloudSnow, Cloud, Sun, Sparkles, AlertCircle } from 'lucide-react';
import './index.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgClass, setBgClass] = useState('Default');

  const fetchWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    // Clear previous data to replay animations for a fresh feel
    setWeatherData(null);
    setBgClass('Default');

    try {
      const response = await fetch(`/api/weather/${encodeURIComponent(city.trim())}`);
      
      if (!response.ok) {
        throw new Error('City not found or API error.');
      }
      
      const data = await response.json();
      setWeatherData(data);
      updateBackground(data.condition);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data. Please try again.');
      setBgClass('Default');
    } finally {
      setLoading(false);
    }
  };

  const updateBackground = (condition) => {
    if (!condition) {
      setBgClass('Default');
      return;
    }
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
      setBgClass('Rain');
    } else if (cond.includes('thunder') || cond.includes('storm')) {
      setBgClass('Thunderstorm');
    } else if (cond.includes('snow') || cond.includes('ice')) {
      setBgClass('Snow');
    } else if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('fog') || cond.includes('mist')) {
      setBgClass('Clouds');
    } else if (cond.includes('clear') || cond.includes('sun')) {
      setBgClass('Clear');
    } else {
      setBgClass('Default');
    }
  };

  const getWeatherIcon = (condition, size = 24) => {
    if (!condition) return <Sun size={size} />;
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) return <CloudRain size={size} />;
    if (cond.includes('thunder') || cond.includes('storm')) return <CloudLightning size={size} />;
    if (cond.includes('snow') || cond.includes('ice')) return <CloudSnow size={size} />;
    if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('fog') || cond.includes('mist')) return <Cloud size={size} />;
    if (cond.includes('clear') || cond.includes('sun')) return <Sun size={size} />;
    return <Sun size={size} />;
  };

  const formatDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className={`app-wrapper ${bgClass}`}>
      <div className="main-container">
        
        <div className="header">
          <h1>Weather AI</h1>
          <p>Premium Insights & Real-time Forecast</p>
        </div>

        <form onSubmit={fetchWeather} className="search-form">
          <div className="input-group">
            <MapPin className="input-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search city (e.g., Kolkata)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" className="search-button" disabled={loading || !city.trim()}>
            {loading ? (
              <>
                <div className="spinner"></div> Searching...
              </>
            ) : (
              <>
                <Search size={18} /> Get Weather
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <AlertCircle size={24} />
            <span style={{fontWeight: 500, fontSize: '1.05rem'}}>{error}</span>
          </div>
        )}

        {weatherData && (
          <div className="weather-card">
            
            <div className="main-weather-info">
              <div className="city-info">
                <h2>{weatherData.city}</h2>
                <div className="date-info">{formatDate()}</div>
              </div>
              <div className="condition-badge">
                {getWeatherIcon(weatherData.condition, 20)}
                <span>{weatherData.condition}</span>
              </div>
            </div>

            <div className="weather-middle">
               <div className="weather-icon-large">
                 {getWeatherIcon(weatherData.condition, 140)}
               </div>
               <div className="temperature">
                 {Math.round(weatherData.temperature)}°
               </div>
            </div>

            <div className="insight-card">
              <div className="insight-header">
                <Sparkles size={18} />
                <span>AI Assistant Insight</span>
              </div>
              <p className="insight-text">{weatherData.insight}</p>
            </div>

            {weatherData.forecast && weatherData.forecast.length > 0 && (
              <div className="forecast-section">
                <h3 className="forecast-title">Hourly Forecast</h3>
                <div className="forecast-scroll">
                  {weatherData.forecast.map((item, index) => {
                    const dateObj = new Date(item.time.replace(' ', 'T'));
                    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={index} className="forecast-item">
                        <div className="forecast-time">{timeStr}</div>
                        <div>{getWeatherIcon(item.condition, 24)}</div>
                        <div className="forecast-temp">{Math.round(item.temperature)}°</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
          </div>
        )}

        <div className="footer-text">
          Made with <span>❤</span> by Biprajit
        </div>
      </div>
    </div>
  );
}

export default App;
