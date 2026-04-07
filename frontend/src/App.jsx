import { useState } from 'react';
import { Search, MapPin, CloudRain, CloudLightning, CloudSnow, Cloud, Sun, Sparkles, AlertCircle, LayoutDashboard, Droplets, Wind, Thermometer, Eye, Activity, Sunrise, Sunset, CalendarDays, ActivitySquare, ArrowDown, ArrowUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
                
                {/* --- ROW 1 --- */}
                <div className="weather-card span-2">
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

                <div className="weather-details-grid span-1">
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

                {/* --- ROW 2 --- */}
                {weatherData.forecast && weatherData.forecast.length > 0 && (
                  <div className="chart-container tesla-glass span-2">
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

                <div className="insight-card span-1">
                  <div className="insight-header">
                    <Sparkles size={18} />
                    <span>AI Assistant Insight</span>
                  </div>
                  <p className="insight-text">{weatherData.insight}</p>
                </div>

                {/* --- ROW 3 --- */}
                {weatherData.forecast && weatherData.forecast.length > 0 && (
                  <div className="forecast-section tesla-glass span-2">
                    <h3 className="forecast-title"><CalendarDays size={16} /> Hourly Forecast</h3>
                    <div className="forecast-scroll subtle-scroll">
                      {weatherData.forecast.map((item, index) => {
                        const dateObj = new Date(item.time.replace(' ', 'T'));
                        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const [hourPart, meridiemPart] = timeStr.split(' ');
                        return (
                          <div key={index} className="forecast-item">
                            <div className="forecast-time-stack">
                              <span className="time-hour">{hourPart}</span>
                              <span className="time-meridiem">{meridiemPart || ''}</span>
                            </div>
                            <div>{getWeatherIcon(item.condition, 24)}</div>
                            <div className="forecast-temp">{Math.round(item.temperature)}°</div>
                            <div className="pop-chance"><CloudRain size={12}/> {item.pop ?? 0}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {weatherData.daily && weatherData.daily.length > 0 && (
                  <div className="daily-forecast-panel tesla-glass span-1">
                    <h3 className="chart-title"><CalendarDays size={16} /> 5-Day Forecast</h3>
                    <div className="daily-forecast">
                      <div className="temp-range-label">Temp Range</div>
                      {weatherData.daily.map((item, idx) => {
                        const dt = new Date(item.date.replace(' ', 'T'));
                        const dayName = dt.toLocaleDateString([], { weekday: 'long' });
                        const popVal = item.pop ?? 0;
                        return (
                          <div key={idx} className="daily-row">
                            <span className="daily-day">{dayName}</span>
                            <div className="daily-icon">{getWeatherIcon(item.condition, 20)}</div>
                            <div className="daily-pop">
                              <CloudRain size={14} /> 
                              <span>{popVal}%</span>
                            </div>
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

                         if (windA > windB + 2) summaryStr += `and higher winds.`;
                         else if (windB > windA + 2) summaryStr += `while ${cityBName} is windier.`;
                         else summaryStr += `and calm winds overall.`;

                         return (
                           <>
                             <div className="compare-summary-block">
                               <Sparkles size={18} color="#facc15" />
                               <p>{summaryStr}</p>
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
                 {activeCompareTab === 'hourly' && (
                    <div className="compare-chart tesla-glass" style={{padding: '1.5rem'}}>
                      <h3 className="chart-title"><ActivitySquare size={16} /> 12-Hour Temp Comparison</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <AreaChart 
                             margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                             /* We need to format the data to interleave both cities */
                             data={compareData[Object.keys(compareData)[0]].forecast.map((f, i) => {
                               const cityA = Object.keys(compareData)[0];
                               const cityB = Object.keys(compareData)[1];
                               return {
                                 time: f.time,
                                 [cityA]: Math.round(f.temperature),
                                 [cityB]: Math.round(compareData[cityB].forecast[i]?.temperature)
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
                             <Area type="monotone" dataKey={Object.keys(compareData)[0]} stroke="#8b5cf6" fill="url(#colorA)" strokeWidth={3} />
                             <Area type="monotone" dataKey={Object.keys(compareData)[1]} stroke="#ec4899" fill="url(#colorB)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="chart-legend">
                         <span style={{color: '#8b5cf6', fontWeight: 600}}>— {Object.keys(compareData)[0]}</span>
                         <span style={{color: '#ec4899', fontWeight: 600}}>— {Object.keys(compareData)[1]}</span>
                      </div>
                    </div>
                 )}

                 {/* TAB: WEEKLY (Table) */}
                 {activeCompareTab === 'weekly' && (
                    <div className="compare-weekly tesla-glass">
                      <h3 className="chart-title"><CalendarDays size={16} /> 5-Day Comparison</h3>
                      <div className="compare-table">
                         <div className="compare-table-header">
                           <span>Day</span>
                           <span style={{textAlign: 'center', color: '#8b5cf6'}}>{Object.keys(compareData)[0]}</span>
                           <span style={{textAlign: 'center', color: '#ec4899'}}>{Object.keys(compareData)[1]}</span>
                         </div>
                         {compareData[Object.keys(compareData)[0]].daily.map((d, i) => {
                            const cityA = Object.keys(compareData)[0];
                            const cityB = Object.keys(compareData)[1];
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
                                   <span style={{color: '#ec4899'}}>{Math.round(compareData[cityB].daily[i]?.temp_min)}° - {Math.round(compareData[cityB].daily[i]?.temp_max)}°</span>
                                   <div className="mini-icon">{getWeatherIcon(compareData[cityB].daily[i]?.condition, 16)}</div>
                                 </div>
                              </div>
                            )
                         })}
                      </div>
                    </div>
                 )}

                 {/* TAB: INSIGHTS */}
                 {activeCompareTab === 'insights' && (
                    <div className="compare-insights">
                       <div key="insight-A" className="insight-card">
                         <div className="insight-header"><Sparkles size={18} /> {Object.keys(compareData)[0]} Insight</div>
                         <p className="insight-text">{compareData[Object.keys(compareData)[0]].insight}</p>
                       </div>
                       <div key="insight-B" className="insight-card" style={{marginTop: '1.5rem'}}>
                         <div className="insight-header" style={{color: '#ec4899'}}><Sparkles size={18} /> {Object.keys(compareData)[1]} Insight</div>
                         <p className="insight-text">{compareData[Object.keys(compareData)[1]].insight}</p>
                       </div>
                    </div>
                 )}

                 {/* COMPARED BARS (ALWAYS VISIBLE IN OVERVIEW) */}
                 {activeCompareTab === 'overview' && (
                   <div className="compare-bars-section tesla-glass" style={{marginTop: '1.5rem', padding: '1.5rem'}}>
                      <h3 className="chart-title"><Activity size={16} /> Direct Metrics</h3>
                      
                      <div className="compare-bar-container">
                        <div className="compare-bar-label">
                          <span>Temperature</span>
                          <span style={{color: 'rgba(255,255,255,0.5)'}}>{Math.round(compareData[Object.keys(compareData)[0]].temperature)}° vs {Math.round(compareData[Object.keys(compareData)[1]].temperature)}°</span>
                        </div>
                        <div className="compare-bar-track">
                          <div className="multi-bar-wrapper"><div className="multi-bar-fill-a" style={{width: `${Math.min(100, Math.max(0, (compareData[Object.keys(compareData)[0]].temperature + 20) * 2))}%`}}></div></div>
                          <div className="multi-bar-wrapper"><div className="multi-bar-fill-b" style={{width: `${Math.min(100, Math.max(0, (compareData[Object.keys(compareData)[1]].temperature + 20) * 2))}%`}}></div></div>
                        </div>
                      </div>

                      <div className="compare-bar-container">
                        <div className="compare-bar-label">
                          <span>Humidity</span>
                          <span style={{color: 'rgba(255,255,255,0.5)'}}>{compareData[Object.keys(compareData)[0]].humidity}% vs {compareData[Object.keys(compareData)[1]].humidity}%</span>
                        </div>
                        <div className="compare-bar-track">
                          <div className="multi-bar-wrapper"><div className="multi-bar-fill-a" style={{width: `${compareData[Object.keys(compareData)[0]].humidity}%`}}></div></div>
                          <div className="multi-bar-wrapper"><div className="multi-bar-fill-b" style={{width: `${compareData[Object.keys(compareData)[1]].humidity}%`}}></div></div>
                        </div>
                      </div>
                      
                      <div className="compare-bar-container">
                        <div className="compare-bar-label">
                          <span>Wind Speed</span>
                          <span style={{color: 'rgba(255,255,255,0.5)'}}>{Math.round(compareData[Object.keys(compareData)[0]].wind_speed)} <small>m/s</small> vs {Math.round(compareData[Object.keys(compareData)[1]].wind_speed)} <small>m/s</small></span>
                        </div>
                        <div className="compare-bar-track">
                          <div className="multi-bar-wrapper"><div className="multi-bar-fill-a" style={{width: `${Math.min(100, compareData[Object.keys(compareData)[0]].wind_speed * 5)}%`}}></div></div>
                          <div className="multi-bar-wrapper"><div className="multi-bar-fill-b" style={{width: `${Math.min(100, compareData[Object.keys(compareData)[1]].wind_speed * 5)}%`}}></div></div>
                        </div>
                      </div>
                   </div>
                 )}

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
