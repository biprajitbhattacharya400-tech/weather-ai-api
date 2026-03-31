import { useState } from 'react';
import { Search, MapPin, CloudRain, CloudLightning, CloudSnow, Cloud, Sun, Sparkles, AlertCircle, LayoutDashboard } from 'lucide-react';
import './index.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://weather-ai-api-lxdy.onrender.com';

function App() {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'compare', 'dashboard'
  const [bgClass, setBgClass] = useState('Default');

  // Single Search State
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  
  // Compare State
  const [compareCities, setCompareCities] = useState('');
  const [compareData, setCompareData] = useState(null);

  // Dashboard State (History + Analytics)
  const [historyData, setHistoryData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // General Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parallax Effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    // Subtle shift based on mouse relative to center of screen
    const x = (e.clientX / window.innerWidth - 0.5) * 40; 
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    setMousePos({ x, y });
  };

  const fetchSingleWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true); setError(''); setWeatherData(null); setBgClass('Default');

    try {
      const response = await fetch(`${API_BASE}/weather/${encodeURIComponent(city.trim())}`);
      if (!response.ok) throw new Error('City not found or API error.');
      const data = await response.json();
      setWeatherData(data);
      updateBackground(data.condition);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data.');
      setBgClass('Default');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompare = async (e) => {
    e.preventDefault();
    if (!compareCities.trim()) return;

    setLoading(true); setError(''); setCompareData(null); setBgClass('Default');

    try {
      const response = await fetch(`${API_BASE}/weather/compare?cities=${encodeURIComponent(compareCities.trim())}`);
      if (!response.ok) throw new Error('API error during comparison.');
      const data = await response.json();
      setCompareData(data);
    } catch (err) {
      setError(err.message || 'Failed to compare cities.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true); setError(''); setBgClass('Default');
    try {
      const [historyRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/history`),
        fetch(`${API_BASE}/analytics`)
      ]);
      
      if (!historyRes.ok || !analyticsRes.ok) throw new Error('Failed to fetch dashboard data.');
      
      const histData = await historyRes.json();
      const analData = await analyticsRes.json();
      
      setHistoryData(histData);
      setAnalyticsData(analData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tab Switch Handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab !== 'search') setBgClass('Default');
    if (tab === 'search' && weatherData) updateBackground(weatherData.condition);
    if (tab === 'dashboard') fetchDashboard();
  };

  const updateBackground = (condition) => {
    if (!condition) {
      setBgClass('Default'); return;
    }
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) setBgClass('Rain');
    else if (cond.includes('thunder') || cond.includes('storm')) setBgClass('Thunderstorm');
    else if (cond.includes('snow') || cond.includes('ice')) setBgClass('Snow');
    else if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('fog') || cond.includes('mist')) setBgClass('Clouds');
    else if (cond.includes('clear') || cond.includes('sun')) setBgClass('Clear');
    else setBgClass('Default');
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

  const renderError = () => {
    if (!error) return null;
    return (
      <div className="error-message">
        <AlertCircle size={24} />
        <span style={{fontWeight: 500, fontSize: '1.05rem'}}>{error}</span>
      </div>
    );
  };

  return (
    <div className={`app-wrapper ${bgClass}`} onMouseMove={handleMouseMove}>
      
      {/* Dynamic Background Parallax Blobs */}
      <div className="bg-blobs-container">
        <div className="parallax-layer" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
          <div className="bg-blob b1"></div>
        </div>
        <div className="parallax-layer" style={{ transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)` }}>
          <div className="bg-blob b2"></div>
        </div>
        <div className="parallax-layer" style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}>
          <div className="bg-blob b3"></div>
        </div>
      </div>

      <div className="main-container" style={{
        maxWidth: activeTab !== 'search' ? '750px' : '500px', 
        transition: 'max-width 0.4s ease, transform 0.15s ease-out',
        transform: `translate(${mousePos.x * -0.2}px, ${mousePos.y * -0.2}px)`
      }}>
        
        <div className="header">
          <h1>Weather AI</h1>
          <p>Premium Insights & Real-time Forecast</p>
        </div>

        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`} onClick={() => handleTabChange('search')}>
            <Search size={16} style={{display:'inline', marginRight:'4px'}} /> Single City
          </button>
          <button className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => handleTabChange('compare')}>
            <MapPin size={16} style={{display:'inline', marginRight:'4px'}} /> Compare
          </button>
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabChange('dashboard')}>
            <LayoutDashboard size={16} style={{display:'inline', marginRight:'4px'}} /> Dashboard
          </button>
        </div>

        {/* --- SEARCH TAB --- */}
        {activeTab === 'search' && (
          <>
            <div className="search-container" style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              <form onSubmit={fetchSingleWeather} className="search-form" style={{marginBottom: 0}}>
                <div className="input-group">
                  <MapPin className="input-icon" size={20} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search city (e.g., Kolkata)"
                    value={city}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCity(val.charAt(0).toUpperCase() + val.slice(1));
                    }}
                    disabled={loading}
                  />
                </div>
                <button type="submit" className="search-button" disabled={loading || !city.trim()}>
                  {loading ? <><div className="spinner"></div></> : <><Search size={18} /> Get Weather</>}
                </button>
              </form>
              <div style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingLeft: '1rem'}}>
                ✨ Tip: Please make sure the first letter of your city name is capitalized.
              </div>
            </div>

            {renderError()}

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
          </>
        )}

        {/* --- COMPARE TAB --- */}
        {activeTab === 'compare' && (
          <>
            <div className="search-container" style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              <form onSubmit={fetchCompare} className="search-form" style={{marginBottom: 0}}>
                <div className="input-group">
                  <MapPin className="input-icon" size={20} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="e.g., London, Tokyo, Paris"
                    value={compareCities}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCompareCities(val.charAt(0).toUpperCase() + val.slice(1));
                    }}
                    disabled={loading}
                  />
                </div>
                <button type="submit" className="search-button" disabled={loading || !compareCities.trim()}>
                  {loading ? <><div className="spinner"></div></> : <><MapPin size={18} /> Compare</>}
                </button>
              </form>
              <div style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingLeft: '1rem'}}>
                ✨ Tip: Make sure the first letter of each city name is capitalized for the best results.
              </div>
            </div>

            {renderError()}

            {compareData && (
              <div className="compare-grid">
                {Object.entries(compareData).map(([cityName, data], i) => (
                  <div key={i} className="compare-card">
                    {data.error ? (
                      <div>
                        <h3 className="compare-city">{cityName}</h3>
                        <p style={{color: '#fca5a5', marginTop: '1rem', fontSize: '0.9rem'}}>Error: {data.error}</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="compare-city">{cityName}</h3>
                        <div>{getWeatherIcon(data.condition, 48)}</div>
                        <div className="compare-temp" style={{fontSize: '2.5rem'}}>{Math.round(data.temperature)}°</div>
                        <div className="condition-badge" style={{marginBottom: 0, padding: '0.5rem 1rem'}}>
                          {data.condition}
                        </div>
                        {data.insight && (
                          <div className="compare-insight">
                            <Sparkles size={14} style={{display:'inline', marginRight:'4px', color:'#fbbf24'}}/>
                            {data.insight}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-container">
            {loading && !historyData && (
               <div style={{display:'flex',justifyContent:'center',padding:'2rem'}}><div className="spinner" style={{width:'40px',height:'40px'}}></div></div>
            )}
            
            {renderError()}

            {!loading && analyticsData && !analyticsData.message && (
              <div className="analytics-cards">
                <div className="stat-card">
                  <div className="stat-label">Most Searched City</div>
                  <div className="stat-value">{analyticsData.most_searched_city || 'N/A'}</div>
                </div>
                <div className="stat-card" style={{background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.05))', borderColor: 'rgba(236, 72, 153, 0.3)'}}>
                  <div className="stat-label">Total Searches</div>
                  <div className="stat-value">
                     {Object.values(analyticsData.request_count || {}).reduce((a,b)=>a+b, 0)}
                  </div>
                </div>
              </div>
            )}

            {!loading && historyData && historyData.length > 0 && (
              <div className="history-list">
                {historyData.slice().reverse().map((item, i) => (
                  <div key={i} className="history-item">
                    <div className="history-city">{item.city}</div>
                    <div className="history-details">
                      <div style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem'}}>{item.condition}</div>
                      <div className="history-temp">{Math.round(item.temperature)}°C</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && historyData && historyData.length === 0 && (
              <div style={{textAlign: 'center', opacity: 0.5}}>No search history available yet.</div>
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
