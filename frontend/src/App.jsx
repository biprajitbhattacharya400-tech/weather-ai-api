import { useState, useEffect } from 'react';
import { Search, MapPin, CloudRain, CloudLightning, CloudSnow, Cloud, Sun, Sparkles, AlertCircle, LayoutDashboard, Droplets, Wind, Thermometer, Eye, Activity, Sunrise, Sunset, CalendarDays, ActivitySquare, ArrowDown, ArrowUp } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import './index.css';
import './weather-fx.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://weather-ai-api-lxdy.onrender.com';

function App() {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'compare', 'dashboard'
  const [bgClass, setBgClass] = useState('Default');

  // Single Search State
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Compare State
  const [compareCities, setCompareCities] = useState('');
  const [compareData, setCompareData] = useState(null);
  const [activeCompareTab, setActiveCompareTab] = useState('overview'); // 'overview', 'hourly', 'weekly', 'insights'

  // Dashboard State (History + Analytics)
  const [historyData, setHistoryData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // General Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parallax Effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Tagline Cycler
  const messages = [
    "Your one-time weather app",
    "Real-time insights",
    "Smart forecasts"
  ];
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    if (window.innerWidth <= 768) return; // Disable expensive parallax state updates on mobile
    // Subtle shift based on mouse relative to center of screen
    const x = (e.clientX / window.innerWidth - 0.5) * 40; 
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    setMousePos({ x, y });
  };

  const fetchDataForCoords = async (lat, lon, cityName) => {
    setLoading(true); setError(''); setWeatherData(null); setBgClass('Default'); setShowSuggestions(false);
    if(cityName) setCity(cityName);
    try {
      const response = await fetch(`${API_BASE}/weather/${encodeURIComponent(cityName || 'Unknown')}?lat=${lat}&lon=${lon}`);
      if (!response.ok) throw new Error('NotFound');
      const data = await response.json();
      
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

  const fetchDataForCity = async (targetCity) => {
    if (!targetCity.trim()) return;
    setLoading(true); setError(''); setWeatherData(null); setBgClass('Default'); setShowSuggestions(false);

    try {
      // 1. Precise geocoding attempt
      const geoRes = await fetch(`${API_BASE}/weather/search/coords?q=${encodeURIComponent(targetCity.trim())}`);
      const geoData = await geoRes.json();
      
      // 2. Exact fallback execution
      if (geoData && geoData.length === 1) {
         await fetchDataForCoords(geoData[0].lat, geoData[0].lon, geoData[0].name);
         return;
      } else if (geoData && geoData.length > 1) {
         setSuggestions(geoData);
         setShowSuggestions(true);
         setLoading(false);
         return;
      }

      // 3. Fallback (Failed Geo, try direct legacy search)
      const response = await fetch(`${API_BASE}/weather/${encodeURIComponent(targetCity.trim())}`);
      if (!response.ok) throw new Error('NotFound');
      const data = await response.json();
      
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

  const fetchSingleWeather = async (e) => {
    e.preventDefault();
    await fetchDataForCity(city);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true); setError(''); setWeatherData(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchDataForCoords(latitude, longitude, "My Location");
      },
      () => {
        setError("Unable to retrieve your location. Please check browser permissions.");
        setLoading(false);
      }
    );
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
    const hour = new Date().getHours();
    const isNightHour = hour >= 19 || hour < 6;
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) setBgClass('Rain');
    else if (cond.includes('thunder') || cond.includes('storm')) setBgClass('Thunderstorm');
    else if (cond.includes('snow') || cond.includes('ice')) setBgClass('Snow');
    else if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('fog') || cond.includes('mist')) setBgClass('Clouds');
    else if (cond.includes('clear') || cond.includes('sun')) setBgClass(isNightHour ? 'Night' : 'Clear');
    else if (isNightHour) setBgClass('Night');
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
      case 'Night':
        return (
          <div className="weather-fx" style={{animation: 'slideUpFade 1s ease'}}>
             <div className="night-stars"></div>
             <div className="night-moon-glow"></div>
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

        <div className="tabs-wrapper">
          <div className="segmented-tabs-container">
            {['search', 'compare', 'dashboard'].map((tab) => {
               const title = tab === 'search' ? 'Single City' : tab === 'compare' ? 'Compare' : 'Dashboard';
               const Icon = tab === 'search' ? Search : tab === 'compare' ? MapPin : LayoutDashboard;
               const isActive = activeTab === tab;
               return (
                 <button
                   key={tab}
                   className={`segmented-tab ${isActive ? 'active' : ''}`}
                   onClick={() => handleTabChange(tab)}
                 >
                   {isActive && (
                     <motion.div
                       layoutId="active-tab"
                       className="segmented-tab-active-bg"
                       initial={false}
                       transition={{ type: "spring", stiffness: 400, damping: 30 }}
                     />
                   )}
                   <span className="segmented-tab-content">
                     <Icon size={16} /> {title}
                   </span>
                 </button>
               );
            })}
          </div>
        </div>

        {/* --- SEARCH TAB --- */}
        {activeTab === 'search' && (
          <>
            <div className="search-container" style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative'}}>
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

               {/* SUGGESTIONS DROPDOWN */}
               {showSuggestions && suggestions.length > 0 && (
                 <div className="suggestions-dropdown tesla-glass" style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, 
                    display: 'flex', flexDirection: 'column', padding: '0.5rem', borderRadius: '1rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)', marginTop: '0.5rem', maxHeight: '300px', overflowY: 'auto'
                 }}>
                    <div style={{fontSize: '0.8rem', padding: '0.5rem 1rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Multiple locations found:</div>
                    {suggestions.map((loc, i) => (
                       <button key={i} className="suggestion-item" onClick={() => fetchDataForCoords(loc.lat, loc.lon, loc.name)}
                               style={{
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  padding: '1rem', background: 'transparent', border: 'none', color: '#fff',
                                  textAlign: 'left', cursor: 'pointer', borderBottom: i !== suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                  transition: 'background 0.2s'
                               }}>
                           <div style={{display: 'flex', flexDirection: 'column'}}>
                              <span style={{fontWeight: '600', fontSize: '1.05rem'}}>{loc.name}</span>
                              <span style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)'}}>{loc.state ? `${loc.state}, ` : ''}{loc.country}</span>
                           </div>
                           <div style={{fontSize: '0.8rem', opacity: 0.5}}>📍 {loc.lat.toFixed(2)}, {loc.lon.toFixed(2)}</div>
                       </button>
                    ))}
                 </div>
               )}

              <div className="quick-cities-bar" style={{marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap'}}>
                 <button onClick={handleUseMyLocation} className="quick-city-pill" style={{background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', borderColor: 'rgba(139, 92, 246, 0.3)'}}>
                    <MapPin size={14} style={{display: 'inline', marginRight: '4px', verticalAlign: 'text-top'}}/> Use My Location
                 </button>
                 <div style={{width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)'}}></div>
                 <button onClick={() => { setCity("Kolkata"); fetchDataForCity("Kolkata"); }} className="quick-city-pill">Kolkata</button>
                 <button onClick={() => { setCity("Delhi"); fetchDataForCity("Delhi"); }} className="quick-city-pill">Delhi</button>
                 <button onClick={() => { setCity("Mumbai"); fetchDataForCity("Mumbai"); }} className="quick-city-pill">Mumbai</button>
                 <button onClick={() => { setCity("London"); fetchDataForCity("London"); }} className="quick-city-pill">London</button>
                 <button onClick={() => { setCity("Tokyo"); fetchDataForCity("Tokyo"); }} className="quick-city-pill">Tokyo</button>
              </div>
            </div>

            {renderError()}

            {loading && !weatherData && !error && (
              <div className="weather-skeleton" aria-hidden="true">
                <div className="weather-skeleton-card">
                  <div className="skeleton-line skeleton-line-sm"></div>
                  <div className="skeleton-line skeleton-line-lg"></div>
                  <div className="skeleton-line skeleton-line-md"></div>
                </div>
                <div className="weather-skeleton-grid">
                  <div className="weather-skeleton-tile"></div>
                  <div className="weather-skeleton-tile"></div>
                  <div className="weather-skeleton-tile"></div>
                  <div className="weather-skeleton-tile"></div>
                </div>
              </div>
            )}

            {/* FEATURE 1: SMART ALERTS */}
            {weatherData && (
               <div className="smart-alerts-container">
                 {weatherData.temperature > 35 && (
                   <div className="smart-alert alert-heat">
                     <AlertCircle size={18} /> <strong>Heatwave Alert:</strong> Dangerous thermal levels detected. Best to stay indoors.
                   </div>
                 )}
                 {weatherData.forecast && weatherData.forecast.length > 0 && weatherData.forecast[0].pop > 60 && (
                   <div className="smart-alert alert-rain">
                     <CloudRain size={18} /> <strong>Rain Expected:</strong> High probability of precipitation soon. Carry an umbrella.
                   </div>
                 )}
                 {weatherData.wind_speed > 20 && (
                   <div className="smart-alert alert-wind">
                     <Wind size={18} /> <strong>Wind Advisory:</strong> Strong gusts detected.
                   </div>
                 )}
                 {weatherData.aqi > 150 && (
                   <div className="smart-alert alert-aqi">
                     <Activity size={18} /> <strong>Poor Air Quality:</strong> AQI levels are unsafe. Wear a mask outdoors.
                   </div>
                 )}
               </div>
            )}

            {weatherData && (
              <div className="weather-experience" style={{animation: 'slideUpFade 0.65s ease both'}}>
                <section className="mobile-weather-card">
                  <div className="mobile-weather-hero">
                    <div className="temp-halo" aria-hidden="true"></div>
                    <div className="mobile-weather-top">
                      <div>
                        <p className="mobile-location-label"><MapPin size={14} /> {weatherData.city}</p>
                        <p className="mobile-date-label">{formatDate()}</p>
                      </div>
                    </div>

                    <div className="mobile-temp-wrap">
                      <div className="mobile-temp-value">{Math.round(weatherData.temperature)}°</div>
                    </div>

                    <div className="mobile-main-conditionline">
                      {getWeatherIcon(weatherData.condition, 20)}
                      <span>{weatherData.condition}</span>
                    </div>

                    <div className="mobile-support-line">
                      <span><Thermometer size={14} /> Feels {weatherData.feels_like ? Math.round(weatherData.feels_like) : '--'}°</span>
                      <span><ArrowUp size={13} /> {Math.round(weatherData.temp_max || weatherData.temperature)}°</span>
                      <span><ArrowDown size={13} /> {Math.round(weatherData.temp_min || weatherData.temperature)}°</span>
                    </div>

                    <p className="mobile-ai-line">{weatherData.insight}</p>
                  </div>

                  <div className="mobile-bottom-sheet">
                    {weatherData.forecast && weatherData.forecast.length > 0 && (
                      <>
                        <div className="mobile-hourly-title">Weather Today</div>
                        <div className="mobile-hourly-scroll">
                          {weatherData.forecast.slice(0, 8).map((item, index) => {
                            const dateObj = new Date(item.time.replace(' ', 'T'));
                            return (
                              <div key={index} className="mobile-hourly-item">
                                <span>{dateObj.toLocaleTimeString([], { hour: '2-digit' })}</span>
                                {getWeatherIcon(item.condition, 20)}
                                <strong>{Math.round(item.temperature)}°</strong>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    <div className="mobile-metric-strip">
                      <span><Droplets size={14} /> {weatherData.humidity ?? '--'}%</span>
                      <span><Wind size={14} /> {weatherData.wind_speed ? Math.round(weatherData.wind_speed * 3.6) : '--'} km/h</span>
                      <span><Activity size={14} /> AQI {weatherData.aqi || '--'}</span>
                      <span><Sun size={14} /> UV {weatherData.uv_index ?? '--'}</span>
                    </div>
                  </div>
                </section>

                <section className="desktop-weather-grid">
                  <div className="desktop-main-card">
                    <div className="temp-halo" aria-hidden="true"></div>
                    <div className="desktop-main-top">
                      <div>
                        <p className="desktop-location"><MapPin size={14} /> {weatherData.city}</p>
                        <p className="desktop-date">{formatDate()}</p>
                      </div>
                    </div>
                    <div className="desktop-main-middle">
                      <div className="desktop-main-temp">{Math.round(weatherData.temperature)}°</div>
                      <div className="desktop-main-conditionline">
                        {getWeatherIcon(weatherData.condition, 22)}
                        <span>{weatherData.condition}</span>
                      </div>
                      <div className="desktop-support-line">
                        <span><Thermometer size={14} /> Feels {weatherData.feels_like ? Math.round(weatherData.feels_like) : '--'}°</span>
                        <span><ArrowUp size={13} /> {Math.round(weatherData.temp_max || weatherData.temperature)}°</span>
                        <span><ArrowDown size={13} /> {Math.round(weatherData.temp_min || weatherData.temperature)}°</span>
                      </div>
                    </div>
                    <p className="desktop-main-insight">{weatherData.insight}</p>
                  </div>

                  <div className="desktop-info-panel">
                    <div className="desktop-section-title"><ActivitySquare size={16} /> Atmosphere Snapshot</div>
                    <div className="desktop-metrics-list">
                      <div className="desktop-metric-row"><span><Droplets size={16} /> Humidity</span><strong>{weatherData.humidity ?? '--'}%</strong></div>
                      <div className="desktop-metric-row"><span><Wind size={16} /> Wind</span><strong>{weatherData.wind_speed ? Math.round(weatherData.wind_speed * 3.6) : '--'} km/h</strong></div>
                      <div className="desktop-metric-row"><span><Activity size={16} /> Air Quality</span><strong>{weatherData.aqi || '--'}</strong></div>
                      <div className="desktop-metric-row"><span><Sun size={16} /> UV Index</span><strong>{weatherData.uv_index ?? '--'}</strong></div>
                      <div className="desktop-metric-row"><span><Thermometer size={16} /> Feels Like</span><strong>{weatherData.feels_like ? Math.round(weatherData.feels_like) : '--'}°</strong></div>
                      <div className="desktop-metric-row"><span><Eye size={16} /> Visibility</span><strong>{weatherData.visibility ? (weatherData.visibility / 1000).toFixed(1) : '--'} km</strong></div>
                    </div>

                    {weatherData.forecast && weatherData.forecast.length > 0 && (
                      <div className="desktop-chart-wrap">
                        <div className="desktop-section-title"><ActivitySquare size={16} /> 24-Hour Temperature Trend</div>
                        <div style={{ width: '100%', height: 230 }}>
                          <ResponsiveContainer>
                            <LineChart data={weatherData.forecast.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="desktopTempGlow" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#b6ccff" stopOpacity={0.9} />
                                  <stop offset="100%" stopColor="#8cb6ff" stopOpacity={0.85} />
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="time"
                                tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 11 }}
                                tickFormatter={(value) => new Date(value.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit' })}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis tick={{ fill: 'rgba(255,255,255,0.48)', fontSize: 11 }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ background: 'rgba(9, 15, 30, 0.86)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px' }} />
                              <Line type="monotone" dataKey="temperature" stroke="url(#desktopTempGlow)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {weatherData.daily && weatherData.daily.length > 0 && (
                      <div className="desktop-week-wrap">
                        <div className="desktop-section-title"><CalendarDays size={16} /> 5-Day Forecast</div>
                        <div className="desktop-week-list">
                          {weatherData.daily.slice(0, 5).map((item, idx) => {
                            const dt = new Date(item.date.replace(' ', 'T'));
                            return (
                              <div key={idx} className="desktop-week-row">
                                <span>{dt.toLocaleDateString([], { weekday: 'short' })}</span>
                                <div className="desktop-week-icon">{getWeatherIcon(item.condition, 18)}</div>
                                <span className="desktop-week-pop"><CloudRain size={12} /> {item.pop ?? 0}%</span>
                                <strong>{Math.round(item.temp_min)}° / {Math.round(item.temp_max)}°</strong>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
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
                  {loading ? <><div className="spinner"></div></> : <><Search size={18} /> Compare</>}
                </button>
              </form>
              <div style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingLeft: '1rem'}}>
                ✨ Tip: Separate 2 exact cities with a comma.
              </div>
            </div>

            {renderError()}

            {compareData && Object.keys(compareData).length >= 2 && (
              <div className="compare-dashboard">
                 {/* Internal Compare Tabs */}
                 <div className="tabs-wrapper" style={{marginTop: '1rem'}}>
                   <div className="segmented-tabs-container">
                     {['overview', 'hourly', 'weekly', 'insights'].map((tab) => {
                        const title = tab.charAt(0).toUpperCase() + tab.slice(1);
                        const isActive = activeCompareTab === tab;
                        return (
                          <button
                            key={tab}
                            className={`segmented-tab ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveCompareTab(tab)}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="compare-active-tab"
                                className="segmented-tab-active-bg"
                                initial={false}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                            <span className="segmented-tab-content">{title}</span>
                          </button>
                        );
                     })}
                   </div>
                 </div>

                 {/* TAB: OVERVIEW */}
                 {activeCompareTab === 'overview' && (
                    <div className="compare-overview-table tesla-glass" style={{padding: '2rem'}}>
                      {(() => {
                         const cityAName = Object.keys(compareData)[0];
                         const cityBName = Object.keys(compareData)[1];
                         const cityA = compareData[cityAName];
                         const cityB = compareData[cityBName];
                         
                         const tempA = cityA?.temperature ?? 0;
                         const tempB = cityB?.temperature ?? 0;
                         const aqiA = cityA?.aqi ?? 50;
                         const aqiB = cityB?.aqi ?? 50;
                         const windA = cityA?.wind_speed ?? 0;
                         const windB = cityB?.wind_speed ?? 0;

                         let summaryStr = "";
                         if (tempA > tempB + 1) summaryStr += `${cityAName} is warmer, `;
                         else if (tempB > tempA + 1) summaryStr += `${cityBName} is warmer, `;
                         else summaryStr += `Both cities have similar temperatures, `;

                         if (aqiA < aqiB) summaryStr += `but ${cityAName} has cleaner air `;
                         else if (aqiB < aqiA) summaryStr += `but ${cityBName} has cleaner air `;
                         else summaryStr += `with identical air quality `;

                         if (windA > windB + 2) summaryStr += `and higher winds. `;
                         else if (windB > windA + 2) summaryStr += `while ${cityBName} is windier. `;
                         else summaryStr += `and calm winds overall. `;

                         // FEATURE 2: Algorithmic City Score
                         const scoreA = Math.max(0, 10 - (Math.abs(tempA - 22) * 0.2) - (aqiA * 0.02) - (windA * 0.1));
                         const scoreB = Math.max(0, 10 - (Math.abs(tempB - 22) * 0.2) - (aqiB * 0.02) - (windB * 0.1));
                         
                         if (scoreA > scoreB + 0.5) summaryStr += `${cityAName} is significantly better for outdoor activities today.`;
                         else if (scoreB > scoreA + 0.5) summaryStr += `${cityBName} is significantly better for outdoor activities today.`;

                         return (
                           <>
                             <div className="compare-summary-block">
                               <Sparkles size={18} color="#facc15" />
                               <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                 <p style={{margin: 0}}>{summaryStr}</p>
                                 <div className="city-scores">
                                    <span className="city-score-pill">{cityAName}: ⭐ {scoreA.toFixed(1)} / 10</span>
                                    <span className="city-score-pill">{cityBName}: ⭐ {scoreB.toFixed(1)} / 10</span>
                                 </div>
                               </div>
                             </div>

                             <div className="ctable-wrapper">
                               <div className="ctable-header">
                                  <div className="ctable-cell-label"></div>
                                  <div className="ctable-cell-city">{cityAName}</div>
                                  <div className="ctable-cell-city">{cityBName}</div>
                               </div>

                               {/* Group: Current Weather */}
                               <div className="ctable-group-title">🌤 Current Weather</div>
                               
                               <div className="ctable-row">
                                  <div className="ctable-cell-label">Temperature</div>
                                  <div data-city={cityAName} className={`ctable-cell ${tempA > tempB ? 'ctable-highlight' : ''}`}>{Math.round(tempA)}°</div>
                                  <div data-city={cityBName} className={`ctable-cell ${tempB > tempA ? 'ctable-highlight' : ''}`}>{Math.round(tempB)}°</div>
                               </div>
                               <div className="ctable-row">
                                  <div className="ctable-cell-label">Condition</div>
                                  <div data-city={cityAName} className="ctable-cell">{cityA?.condition}</div>
                                  <div data-city={cityBName} className="ctable-cell">{cityB?.condition}</div>
                               </div>
                               <div className="ctable-row">
                                  <div className="ctable-cell-label">Feels Like</div>
                                  <div data-city={cityAName} className="ctable-cell">{Math.round(cityA?.feels_like ?? 0)}°</div>
                                  <div data-city={cityBName} className="ctable-cell">{Math.round(cityB?.feels_like ?? 0)}°</div>
                               </div>

                               {/* Group: Air & Wind */}
                               <div className="ctable-group-title">🌬 Air & Wind</div>

                               <div className="ctable-row">
                                  <div className="ctable-cell-label">Air Quality (AQI)</div>
                                  <div data-city={cityAName} className={`ctable-cell ${aqiA < aqiB ? 'ctable-highlight-good' : ''}`}>{aqiA}</div>
                                  <div data-city={cityBName} className={`ctable-cell ${aqiB < aqiA ? 'ctable-highlight-good' : ''}`}>{aqiB}</div>
                               </div>
                               <div className="ctable-row">
                                  <div className="ctable-cell-label">Wind Speed</div>
                                  <div data-city={cityAName} className="ctable-cell">{Math.round(windA * 3.6)} km/h</div>
                                  <div data-city={cityBName} className="ctable-cell">{Math.round(windB * 3.6)} km/h</div>
                               </div>
                               <div className="ctable-row">
                                  <div className="ctable-cell-label">Visibility</div>
                                  <div data-city={cityAName} className="ctable-cell">{((cityA?.visibility??10000) / 1000).toFixed(1)} km</div>
                                  <div data-city={cityBName} className="ctable-cell">{((cityB?.visibility??10000) / 1000).toFixed(1)} km</div>
                               </div>

                               {/* Group: Rain & Humidity */}
                               <div className="ctable-group-title">🌧 Rain & Humidity</div>

                               <div className="ctable-row">
                                  <div className="ctable-cell-label">Humidity</div>
                                  <div data-city={cityAName} className="ctable-cell">{cityA?.humidity ?? 0}%</div>
                                  <div data-city={cityBName} className="ctable-cell">{cityB?.humidity ?? 0}%</div>
                               </div>
                               <div className="ctable-row">
                                  <div className="ctable-cell-label">UV Index</div>
                                  <div data-city={cityAName} className={`ctable-cell ${cityA?.uv_index < cityB?.uv_index ? 'ctable-highlight-good' : ''}`}>{cityA?.uv_index ?? 0}</div>
                                  <div data-city={cityBName} className={`ctable-cell ${cityB?.uv_index < cityA?.uv_index ? 'ctable-highlight-good' : ''}`}>{cityB?.uv_index ?? 0}</div>
                               </div>
                               <div className="ctable-row">
                                  <div className="ctable-cell-label">Dew Point</div>
                                  <div data-city={cityAName} className="ctable-cell">{cityA?.dew_point ?? 0}°</div>
                                  <div data-city={cityBName} className="ctable-cell">{cityB?.dew_point ?? 0}°</div>
                               </div>
                             </div>
                           </>
                         )
                      })()}
                    </div>
                 )}

                 {/* TAB: HOURLY (Overlay Graph) */}
                 {activeCompareTab === 'hourly' && (() => {
                      const keys = Object.keys(compareData || {});
                      if (keys.length < 2) return null;
                      const cityA = compareData[keys[0]];
                      const cityB = compareData[keys[1]];
                      if (cityA?.error || cityB?.error || !cityA?.forecast || !cityB?.forecast) {
                         return <div className="error-message">Unable to render graph. Hourly data missing.</div>;
                      }
                      
                      return (
                        <div className="compare-chart tesla-glass" style={{padding: '1.5rem'}}>
                          <h3 className="chart-title"><ActivitySquare size={16} /> 12-Hour Temp Comparison</h3>
                          <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                              <AreaChart 
                                 margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                                 data={cityA.forecast.map((f, i) => {
                                   return {
                                     time: f.time,
                                     [keys[0]]: Math.round(f.temperature),
                                     [keys[1]]: Math.round(cityB.forecast[i]?.temperature ?? 0)
                                   };
                                 })}
                              >
                                 <defs>
                                   <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                                     <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                   </linearGradient>
                                   <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5}/>
                                     <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                   </linearGradient>
                                 </defs>
                                 <XAxis dataKey="time" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} tickFormatter={(v) => new Date(v.replace(' ', 'T')).toLocaleTimeString([], {hour: '2-digit'})} axisLine={false} tickLine={false} />
                                 <YAxis tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} axisLine={false} tickLine={false} />
                                 <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                                 <Area type="monotone" dataKey={keys[0]} stroke="#8b5cf6" fill="url(#colorA)" strokeWidth={3} />
                                 <Area type="monotone" dataKey={keys[1]} stroke="#ec4899" fill="url(#colorB)" strokeWidth={3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="chart-legend">
                             <span style={{color: '#8b5cf6', fontWeight: 600}}>— {keys[0]}</span>
                             <span style={{color: '#ec4899', fontWeight: 600}}>— {keys[1]}</span>
                          </div>
                        </div>
                      );
                 })()}

                 {/* TAB: WEEKLY (Table) */}
                 {activeCompareTab === 'weekly' && (() => {
                      const keys = Object.keys(compareData || {});
                      if (keys.length < 2) return null;
                      const cityA = compareData[keys[0]];
                      const cityB = compareData[keys[1]];
                      if (cityA?.error || cityB?.error || !cityA?.daily || !cityB?.daily) {
                         return <div className="error-message">Unable to render table. Weekly data missing.</div>;
                      }
                      
                      return (
                        <div className="compare-weekly tesla-glass">
                          <h3 className="chart-title"><CalendarDays size={16} /> 5-Day Comparison</h3>
                          <div className="compare-table">
                             <div className="compare-table-header">
                               <span>Day</span>
                               <span style={{textAlign: 'center', color: '#8b5cf6'}}>{keys[0]}</span>
                               <span style={{textAlign: 'center', color: '#ec4899'}}>{keys[1]}</span>
                             </div>
                             {cityA.daily.map((d, i) => {
                                const dt = new Date(d.date.replace(' ', 'T'));
                                const dayName = dt.toLocaleDateString([], { weekday: 'long' });
                                return (
                                  <div key={i} className="compare-table-row">
                                     <span className="compare-day-name">{dayName}</span>
                                     <div className="compare-day-temps">
                                       <span style={{color: '#8b5cf6'}}>{Math.round(d.temp_min)}° - {Math.round(d.temp_max)}°</span>
                                       <div className="mini-icon">{getWeatherIcon(d.condition, 16)}</div>
                                     </div>
                                     <div className="compare-day-temps">
                                       <span style={{color: '#ec4899'}}>{Math.round(cityB.daily[i]?.temp_min ?? 0)}° - {Math.round(cityB.daily[i]?.temp_max ?? 0)}°</span>
                                       <div className="mini-icon">{getWeatherIcon(cityB.daily[i]?.condition, 16)}</div>
                                     </div>
                                  </div>
                                )
                             })}
                          </div>
                        </div>
                      );
                 })()}

                 {/* TAB: INSIGHTS */}
                 {activeCompareTab === 'insights' && (() => {
                      const keys = Object.keys(compareData || {});
                      if (keys.length < 2) return null;
                      const cityA = compareData[keys[0]];
                      const cityB = compareData[keys[1]];
                      
                      return (
                        <div className="compare-insights">
                           <div key="insight-A" className="insight-card">
                             <div className="insight-header"><Sparkles size={18} /> {keys[0]} Insight</div>
                             <p className="insight-text">{cityA?.insight ?? "No insights available."}</p>
                           </div>
                           <div key="insight-B" className="insight-card" style={{marginTop: '1.5rem'}}>
                             <div className="insight-header" style={{color: '#ec4899'}}><Sparkles size={18} /> {keys[1]} Insight</div>
                             <p className="insight-text">{cityB?.insight ?? "No insights available."}</p>
                           </div>
                        </div>
                      );
                 })()}

                 {/* COMPARED BARS (ALWAYS VISIBLE IN OVERVIEW) */}
                 {activeCompareTab === 'overview' && (() => {
                      const keys = Object.keys(compareData || {});
                      if (keys.length < 2) return null;
                      
                      const cityA = compareData[keys[0]];
                      const cityB = compareData[keys[1]];
                      
                      const tempA = cityA?.temperature ?? 0;
                      const tempB = cityB?.temperature ?? 0;
                      const humA = cityA?.humidity ?? 0;
                      const humB = cityB?.humidity ?? 0;
                      const windA = cityA?.wind_speed ?? 0;
                      const windB = cityB?.wind_speed ?? 0;

                      return (
                       <div className="compare-bars-section tesla-glass" style={{marginTop: '1.5rem', padding: '1.5rem'}}>
                          <h3 className="chart-title"><Activity size={16} /> Direct Metrics</h3>
                          
                          <div className="compare-bar-container">
                            <div className="compare-bar-label">
                              <span>Temperature</span>
                              <span style={{color: 'rgba(255,255,255,0.5)'}}>{Math.round(tempA)}° vs {Math.round(tempB)}°</span>
                            </div>
                            <div className="compare-bar-track">
                              <div className="multi-bar-wrapper"><div className="multi-bar-fill-a" style={{width: `${Math.min(100, Math.max(0, (tempA + 20) * 2))}%`}}></div></div>
                              <div className="multi-bar-wrapper"><div className="multi-bar-fill-b" style={{width: `${Math.min(100, Math.max(0, (tempB + 20) * 2))}%`}}></div></div>
                            </div>
                          </div>

                          <div className="compare-bar-container">
                            <div className="compare-bar-label">
                              <span>Humidity</span>
                              <span style={{color: 'rgba(255,255,255,0.5)'}}>{Math.round(humA)}% vs {Math.round(humB)}%</span>
                            </div>
                            <div className="compare-bar-track">
                              <div className="multi-bar-wrapper"><div className="multi-bar-fill-a" style={{width: `${humA}%`}}></div></div>
                              <div className="multi-bar-wrapper"><div className="multi-bar-fill-b" style={{width: `${humB}%`}}></div></div>
                            </div>
                          </div>
                          
                          <div className="compare-bar-container">
                            <div className="compare-bar-label">
                              <span>Wind Speed</span>
                              <span style={{color: 'rgba(255,255,255,0.5)'}}>{Math.round(windA)} <small>m/s</small> vs {Math.round(windB)} <small>m/s</small></span>
                            </div>
                            <div className="compare-bar-track">
                              <div className="multi-bar-wrapper"><div className="multi-bar-fill-a" style={{width: `${Math.min(100, windA * 5)}%`}}></div></div>
                              <div className="multi-bar-wrapper"><div className="multi-bar-fill-b" style={{width: `${Math.min(100, windB * 5)}%`}}></div></div>
                            </div>
                          </div>
                       </div>
                      );
                 })()}

              </div>
            )}
            
            {compareData && Object.keys(compareData).length < 2 && !loading && (
              <div className="error-message" style={{justifyContent: 'center', marginTop: '1.5rem'}}>
                 <AlertCircle size={20} /> Please search for exactly two cities separated by a comma (e.g., "Tokyo, London").
              </div>
            )}
          </>
        )}

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-container" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            {loading && !historyData && (
               <div style={{display:'flex',justifyContent:'center',padding:'2rem'}}><div className="spinner" style={{width:'40px',height:'40px'}}></div></div>
            )}
            
            {renderError()}

            {!loading && historyData && (
              <>
                {(() => {
                   const total = historyData.length;
                   if (total === 0) return <div style={{textAlign: 'center', opacity: 0.5}}>No search history available yet.</div>;
                   
                   const avgTemp = Math.round(historyData.reduce((a, b) => a + b.temperature, 0) / total);
                   const avgHum = Math.round(historyData.reduce((a, b) => a + (b.humidity || 50), 0) / total);
                   const isHot = avgTemp > 25;
                   
                   // Group History
                   const uniqueMap = {};
                   historyData.forEach(h => {
                      if (!uniqueMap[h.city]) uniqueMap[h.city] = { count: 0, temp: h.temperature, cond: h.condition, hum: h.humidity, wind: h.wind_speed };
                      uniqueMap[h.city].count += 1;
                   });
                   const groupedSorted = Object.entries(uniqueMap).sort((a,b) => b[1].count - a[1].count);
                   
                   // Priority City Logic
                   const activeCity = city || '';
                   const lastHistoryCity = historyData.length > 0 ? historyData[historyData.length - 1].city : null;
                   const mostSearchedCity = groupedSorted[0]?.[0];
                   
                   const targetCityStr = activeCity || lastHistoryCity || mostSearchedCity || 'None';
                   
                   // Find exact cased key or fallback
                   const matchedKey = Object.keys(uniqueMap).find(k => k.toLowerCase() === targetCityStr.toLowerCase()) || lastHistoryCity || mostSearchedCity || 'None';
                   const primaryCityData = uniqueMap[matchedKey] || groupedSorted[0]?.[1] || {};

                   // Time active
                   let morning = 0, afternoon = 0, evening = 0;
                   historyData.forEach(h => {
                      if(h.fetch_time) {
                         let hr = 12; // default
                         try {
                           const d = h.fetch_time.replace(' ', 'T');
                           hr = new Date(d).getHours();
                         } catch (e) {}
                         if (hr >= 5 && hr < 12) morning++;
                         else if (hr >= 12 && hr < 17) afternoon++;
                         else evening++;
                      }
                   });
                   const topTime = Math.max(morning, afternoon, evening) === morning ? "Morning" : Math.max(morning, afternoon, evening) === afternoon ? "Afternoon" : "Evening";

                   // Smart Summary
                   let smartSummary = `You primarily track weather in ${mostSearchedCity}. `;
                   if (isHot) smartSummary += `Your search history indicates a strong interest in warmer climates (Avg ${avgTemp}°C). `;
                   else smartSummary += `You mostly check cooler regions. `;
                   smartSummary += `Your activity peaks usually in the ${topTime.toLowerCase()}.`;

                   return (
                     <>
                       {/* 1. HERO SUMMARY SECTION */}
                       <div className="compare-main-card tesla-glass" style={{flexDirection: 'row', justifyContent: 'space-between', padding: '2rem', textAlign: 'left', flexWrap: 'wrap'}}>
                          <div>
                            <h3 style={{margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Your Primary Location</h3>
                            <h2 style={{margin: 0, fontSize: '2.5rem', fontWeight: 800}}>{matchedKey}</h2>
                            <div style={{color: '#fff', fontSize: '1.1rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                              {getWeatherIcon(primaryCityData.cond, 20)} {primaryCityData.cond}
                            </div>
                          </div>
                          <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                            <div style={{fontSize: '5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.05em', background: 'linear-gradient(180deg, #fff 30%, rgba(255,255,255,0.4) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                               {Math.round(primaryCityData.temp || 0)}°
                            </div>
                          </div>
                       </div>
                       
                       {/* 6. AI DASHBOARD INSIGHT */}
                       <div className="compare-summary-block" style={{marginTop: '-0.5rem'}}>
                          <Sparkles size={20} color="#facc15" style={{flexShrink: 0}} />
                          <p>{smartSummary}</p>
                       </div>

                       {/* 2. QUICK STATS */}
                       <div className="analytics-cards" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem'}}>
                         <div className="stat-card">
                           <div className="stat-label">Searches</div>
                           <div className="stat-value">{total}</div>
                         </div>
                         <div className="stat-card">
                           <div className="stat-label">Avg Temp</div>
                           <div className="stat-value">{avgTemp}°<span style={{fontSize: '1rem'}}>C</span></div>
                         </div>
                         <div className="stat-card">
                           <div className="stat-label">Avg Hum</div>
                           <div className="stat-value">{avgHum}%</div>
                         </div>
                         <div className="stat-card">
                           <div className="stat-label">Active Time</div>
                           <div className="stat-value" style={{fontSize: '1.25rem'}}>{topTime}</div>
                         </div>
                       </div>

                       {/* 3. FREQUENT CITIES (CARDS) */}
                       <h3 style={{fontSize: '1.1rem', margin: '0.5rem 0 0 0'}}>Saved / Frequent Cities</h3>
                       <div className="subtle-scroll" style={{display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem'}}>
                         {groupedSorted.map(([cName, cData], idx) => (
                           <div key={idx} className="tesla-glass" style={{minWidth: '180px', padding: '1.25rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                 <strong style={{fontSize: '1.1rem'}}>{cName}</strong>
                                 <span style={{color: '#8b5cf6'}}>{getWeatherIcon(cData.cond, 20)}</span>
                              </div>
                              <div style={{fontSize: '2rem', fontWeight: 700}}>{Math.round(cData.temp)}°</div>
                              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)'}}>
                                 <span><Droplets size={12}/> {cData.hum}%</span>
                                 <span style={{background:'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px'}}>{cData.count}x</span>
                              </div>
                           </div>
                         ))}
                       </div>

                       {/* 5. MINI CHARTS (Temperature Trend) */}
                       {historyData.length > 2 && (
                         <div className="tesla-glass" style={{padding: '1.5rem', borderRadius: '1.5rem', width: '100%'}}>
                           <h3 style={{fontSize: '0.9rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', marginBottom: '1rem'}}><ActivitySquare size={16} /> Global Temperature Search Trend</h3>
                           <div style={{width: '100%', height: 160}}>
                             <ResponsiveContainer>
                               <AreaChart data={historyData.slice(-15)} margin={{top:10, right:0, left:-25, bottom:0}}>
                                 <defs>
                                   <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                   </linearGradient>
                                 </defs>
                                 <XAxis dataKey="city" tick={{fill:'rgba(255,255,255,0.5)', fontSize: 10}} axisLine={false} tickLine={false} />
                                 <YAxis tick={{fill:'rgba(255,255,255,0.5)', fontSize: 10}} axisLine={false} tickLine={false} />
                                 <Tooltip contentStyle={{background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}} />
                                 <Area type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHist)" />
                               </AreaChart>
                             </ResponsiveContainer>
                           </div>
                         </div>
                       )}

                       {/* 7. RAW HISTORY (DOWNGRADED & COLLAPSIBLE / COMPACT) */}
                       <details className="tesla-glass" style={{padding: '1rem 1.5rem', borderRadius: '1rem', cursor: 'pointer', transition: 'all 0.3s ease'}}>
                          <summary style={{fontWeight: 600, outline: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', userSelect: 'none', color: 'rgba(255,255,255,0.8)'}}>
                            <LayoutDashboard size={18} /> View Raw Search Log Archive
                          </summary>
                          <div style={{marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            {historyData.slice().reverse().slice(0, 15).map((item, i) => (
                              <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem'}}>
                                <div><strong>{item.city}</strong> <span style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem'}}>— {item.condition}</span></div>
                                <div style={{fontWeight: 600}}>{Math.round(item.temperature)}°</div>
                              </div>
                            ))}
                            {historyData.length > 15 && <div style={{textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.5rem'}}>+ {historyData.length - 15} older entries hidden</div>}
                          </div>
                       </details>
                     </>
                   );
                })()}
              </>
            )}
            
          </div>
        )}

        <div className="cycling-tagline">
          <span key={taglineIndex} className="cycling-tagline-text">
            {messages[taglineIndex]}
          </span>
        </div>

        <div className="footer-text">
          Made with <span>❤</span> by Biprajit
        </div>
      </div>
    </div>
  );
}

export default App;
