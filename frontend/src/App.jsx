import { useState } from 'react';
import { Search, MapPin, CloudRain, CloudLightning, CloudSnow, Cloud, Sun, Sparkles, AlertCircle, LayoutDashboard, Droplets, Wind, Thermometer, Eye, Activity, Sunrise, Sunset, CalendarDays, ActivitySquare, ArrowDown, ArrowUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './index.css';
import './weather-fx.css';

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
    if (window.innerWidth <= 768) return; // Disable expensive parallax state updates on mobile
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
      if (!response.ok) throw new Error('NotFound');
      const data = await response.json();
      
      // Strict Validation to catch unhandled external API failures (e.g. returning NaN)
      if (data.error || data.temperature === undefined || isNaN(data.temperature) || data.temperature === null) {
        throw new Error('NotFound');
      }

      setWeatherData(data);
      updateBackground(data.condition);
    } catch (err) {
      if (err.message === 'NotFound' || err.message.includes('not found')) {
        setError(`unsupported_city`);
      } else {
        setError('Failed to fetch weather data. Please check your connection.');
      }
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

  const renderWeatherFX = () => {
    switch(bgClass) {
      case 'Rain':
      case 'Thunderstorm':
        return (
          <div className="weather-fx" style={{animation: 'slideUpFade 1s ease'}}>
             <div className="ambient-fog"></div>
             <div className="rain-layer"></div>
             <div className="rain-layer rain-2"></div>
             {bgClass === 'Thunderstorm' && <div className="lightning-flash intense"></div>}
          </div>
        );
      case 'Snow':
        return (
          <div className="weather-fx" style={{animation: 'slideUpFade 1s ease'}}>
             <div className="snow-layer"></div>
             <div className="snow-layer snow-2"></div>
          </div>
        );
      case 'Clear':
        return (
          <div className="weather-fx" style={{animation: 'slideUpFade 1s ease'}}>
             <div className="sun-ray"></div>
             <div className="floating-dust"></div>
          </div>
        );
      case 'Clouds':
        return (
          <div className="weather-fx" style={{animation: 'slideUpFade 1s ease'}}>
             <div className="cloud-layer"></div>
             <div className="cloud-layer cloud-2"></div>
          </div>
        );
      default: return null;
    }
  };

  const renderError = () => {
    if (!error) return null;

    if (error === 'unsupported_city') {
      return (
        <div className="weather-card" style={{
          animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(0, 0, 0, 0.4))',
          borderColor: 'rgba(239, 68, 68, 0.25)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(239, 68, 68, 0.15)'
        }}>
          <div style={{color: '#fca5a5', marginBottom: '1rem'}}>
            <AlertCircle size={56} style={{margin: '0 auto'}} />
          </div>
          <h2 style={{fontSize: '1.75rem', marginBottom: '1rem', fontWeight: 600}}>Location Not Found</h2>
          <p style={{color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '2rem'}}>
            We couldn't retrieve atmospheric data for <strong>"{activeTab === 'search' ? city : compareCities}"</strong>. This location might be too small, misspelled, or unsupported by satellite models.
          </p>
          <div style={{
            background: 'rgba(0,0,0,0.35)', padding: '1.5rem', borderRadius: '1.5rem', 
            border: '1px solid rgba(255,255,255,0.05)', display: 'inline-block'
          }}>
            <span style={{color: '#facc15', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
              <Sparkles size={16} /> Try a nearby major city:
            </span>
            <strong style={{color: '#fff', fontSize: '1.25rem', letterSpacing: '0.5px'}}>e.g., Agartala, Kolkata, Delhi</strong>
          </div>
        </div>
      );
    }

    // Generic fallback error
    return (
      <div className="error-message" style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem 1.5rem', borderRadius: '1rem', color: '#fca5a5', marginTop: '1rem'
      }}>
        <AlertCircle size={24} />
        <span style={{fontWeight: 500, fontSize: '1.05rem'}}>{error}</span>
      </div>
    );
  };

  return (
    <div className={`app-wrapper ${bgClass}`} onMouseMove={handleMouseMove}>
      
      {/* Immersive Weather Ambient Effects */}
      {renderWeatherFX()}

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

      <div className="main-container dashboard-wrapper" style={{
        maxWidth: '1800px', 
        width: '100%',
        transition: 'max-width 0.4s ease, transform 0.15s ease-out',
        willChange: 'max-width, opacity'
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
              <div className="dashboard-grid">
                
                {/* --- LEFT COLUMN: Main Weather & AI Insight --- */}
                <div className="dashboard-col">
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

                    <div className="weather-middle tesla-dashboard-header">
                       <div className="weather-icon-large">
                         {getWeatherIcon(weatherData.condition, 140)}
                       </div>
                       <div className="temperature-group">
                         <div className="temperature">
                           {Math.round(weatherData.temperature)}°
                         </div>
                         <div className="high-low">
                           <span><ArrowUp size={14}/> {Math.round(weatherData.temp_max || weatherData.temperature)}°</span>
                           <span><ArrowDown size={14}/> {Math.round(weatherData.temp_min || weatherData.temperature)}°</span>
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-header">
                      <Sparkles size={18} />
                      <span>AI Assistant Insight</span>
                    </div>
                    <p className="insight-text">{weatherData.insight}</p>
                  </div>
                </div>

                {/* --- CENTER COLUMN: Charts & Hourly Forecast --- */}
                <div className="dashboard-col">
                  {weatherData.forecast && weatherData.forecast.length > 0 && (
                    <div className="chart-container tesla-glass">
                      <h3 className="chart-title"><ActivitySquare size={16} /> 24-Hour Timeline</h3>
                      <div style={{ width: '100%', height: 180 }}>
                        <ResponsiveContainer>
                          <AreaChart data={weatherData.forecast.slice(0, 8)} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="time" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} tickFormatter={(val) => new Date(val.replace(' ', 'T')).toLocaleTimeString([], {hour: '2-digit'})} axisLine={false} tickLine={false} />
                            <YAxis tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="temperature" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {weatherData.forecast && weatherData.forecast.length > 0 && (
                    <div className="forecast-section tesla-glass">
                      <h3 className="forecast-title"><CalendarDays size={16} /> Hourly Forecast</h3>
                      <div className="forecast-scroll subtle-scroll">
                        {weatherData.forecast.map((item, index) => {
                          const dateObj = new Date(item.time.replace(' ', 'T'));
                          const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          return (
                            <div key={index} className="forecast-item">
                              <div className="forecast-time">{timeStr}</div>
                              <div>{getWeatherIcon(item.condition, 24)}</div>
                              <div className="forecast-temp">{Math.round(item.temperature)}°</div>
                              {item.pop > 0 && <div className="pop-chance"><CloudRain size={12}/> {item.pop}%</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* --- RIGHT COLUMN: Metrics Grid & 7-Day Forecast --- */}
                <div className="dashboard-col">
                  <div className="weather-details-grid">
                    <div className="detail-item tesla-glass">
                      <Droplets className="detail-icon" size={22} />
                      <div className="detail-info">
                        <span className="detail-label">Humidity</span>
                        <span className="detail-value">{weatherData.humidity !== undefined ? weatherData.humidity : '--'}%</span>
                      </div>
                    </div>
                    <div className="detail-item tesla-glass">
                      <Wind className="detail-icon" size={22} />
                      <div className="detail-info">
                        <span className="detail-label">Wind</span>
                        <span className="detail-value">{weatherData.wind_speed ? Math.round(weatherData.wind_speed * 3.6) : '--'} <span style={{fontSize: '0.75rem', fontWeight: '500', color: 'rgba(255,255,255,0.7)'}}>km/h</span></span>
                      </div>
                    </div>
                    <div className="detail-item tesla-glass">
                      <Thermometer className="detail-icon" size={22} />
                      <div className="detail-info">
                        <span className="detail-label">Feels Like</span>
                        <span className="detail-value">{weatherData.feels_like ? Math.round(weatherData.feels_like) : '--'}°</span>
                      </div>
                    </div>
                    <div className="detail-item tesla-glass">
                      <Sun className="detail-icon" size={22} color="#facc15" />
                      <div className="detail-info">
                        <span className="detail-label">UV Index</span>
                        <span className="detail-value">{weatherData.uv_index !== undefined ? weatherData.uv_index : '--'}</span>
                      </div>
                    </div>
                    <div className="detail-item tesla-glass">
                      <Activity className="detail-icon" size={22} color="#10b981" />
                      <div className="detail-info">
                        <span className="detail-label">AQI</span>
                        <span className="detail-value">{weatherData.aqi || '--'}</span>
                      </div>
                    </div>
                    <div className="detail-item tesla-glass">
                      <Eye className="detail-icon" size={22} />
                      <div className="detail-info">
                        <span className="detail-label">Visibility</span>
                        <span className="detail-value">{weatherData.visibility ? (weatherData.visibility / 1000).toFixed(1) : '--'} <span style={{fontSize: '0.75rem', fontWeight: '500', color: 'rgba(255,255,255,0.7)'}}>km</span></span>
                      </div>
                    </div>
                  </div>

                  {weatherData.daily && weatherData.daily.length > 0 && (
                    <div className="daily-forecast-panel tesla-glass">
                      <h3 className="chart-title"><CalendarDays size={16} /> 5-Day Forecast</h3>
                      <div className="daily-forecast">
                        {weatherData.daily.map((item, idx) => {
                          const dt = new Date(item.date.replace(' ', 'T'));
                          const dayName = dt.toLocaleDateString([], { weekday: 'long' });
                          return (
                            <div key={idx} className="daily-row">
                              <span className="daily-day">{dayName}</span>
                              <div className="daily-icon">{getWeatherIcon(item.condition, 20)}</div>
                              <div className="daily-bar">
                                <span className="daily-min">{Math.round(item.temp_min)}°</span>
                                <div className="temp-bar-bg"><div className="temp-bar-fill"></div></div>
                                <span className="daily-max">{Math.round(item.temp_max)}°</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

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
