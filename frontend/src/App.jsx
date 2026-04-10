import { useEffect, useMemo, useState } from 'react';
import AppShell from './components/AppShell';
import WeatherHero from './components/WeatherHero';
import ForecastPanel from './components/ForecastPanel';
import UnifiedInfoSurface from './components/UnifiedInfoSurface';
import ModeTabs from './components/ModeTabs';
import CompareView from './components/CompareView';
import DashboardView from './components/DashboardView';

const API_BASE = import.meta.env.VITE_API_URL || 'https://weather-ai-api-lxdy.onrender.com';

const EMPTY_WEATHER = {
  city: 'Weather',
  temperature: 24,
  temp_min: 20,
  temp_max: 28,
  humidity: 68,
  wind_speed: 4,
  pressure: 1012,
  feels_like: 25,
  condition: 'Clear',
  forecast: [],
  daily: [],
};

const formatHour = (value) => new Date(value).toLocaleTimeString([], { hour: 'numeric' });

function App() {
  const [activeTab, setActiveTab] = useState('single');

  const [query, setQuery] = useState('Tokyo');
  const [weather, setWeather] = useState(EMPTY_WEATHER);
  const [loadingSingle, setLoadingSingle] = useState(false);
  const [singleError, setSingleError] = useState('');

  const [compareLeft, setCompareLeft] = useState('Tokyo');
  const [compareRight, setCompareRight] = useState('London');
  const [compareCities, setCompareCities] = useState([]);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [compareError, setCompareError] = useState('');

  const [historyData, setHistoryData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const fetchWeather = async (city) => {
    if (!city.trim()) return;

    setLoadingSingle(true);
    setSingleError('');

    try {
      const response = await fetch(`${API_BASE}/weather/${encodeURIComponent(city.trim())}`);
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error('City not found. Try another location.');
      }

      setWeather({ ...EMPTY_WEATHER, ...data });
    } catch (requestError) {
      setSingleError(requestError.message || 'Unable to load weather right now.');
    } finally {
      setLoadingSingle(false);
    }
  };

  const fetchCompare = async () => {
    if (!compareLeft.trim() || !compareRight.trim()) return;

    setLoadingCompare(true);
    setCompareError('');

    try {
      const response = await fetch(
        `${API_BASE}/weather/compare?cities=${encodeURIComponent(`${compareLeft.trim()},${compareRight.trim()}`)}`,
      );
      const data = await response.json();

      if (!response.ok || !data) {
        throw new Error('Unable to compare cities.');
      }

      const values = Object.values(data).slice(0, 2);
      setCompareCities(values);
    } catch (requestError) {
      setCompareError(requestError.message || 'Unable to compare cities right now.');
      setCompareCities([]);
    } finally {
      setLoadingCompare(false);
    }
  };

  const fetchDashboard = async () => {
    setLoadingDashboard(true);

    try {
      const [historyRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/history`),
        fetch(`${API_BASE}/analytics`),
      ]);

      const history = await historyRes.json();
      const analytics = await analyticsRes.json();

      setHistoryData(Array.isArray(history) ? history : []);
      setAnalyticsData(analytics || null);
    } catch {
      setHistoryData([]);
      setAnalyticsData(null);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchWeather('Tokyo');
  }, []);

  useEffect(() => {
    if (activeTab === 'compare' && compareCities.length === 0) {
      fetchCompare();
    }
    if (activeTab === 'dashboard' && historyData.length === 0 && !loadingDashboard) {
      fetchDashboard();
    }
  }, [activeTab]);

  const onSubmitSingle = (event) => {
    event.preventDefault();
    fetchWeather(query);
  };

  const onSubmitCompare = (event) => {
    event.preventDefault();
    fetchCompare();
  };

  const hourly = useMemo(() => {
    const source = weather.forecast?.slice(0, 8) || [];

    if (source.length > 0) {
      return source;
    }

    return Array.from({ length: 8 }).map((_, index) => ({
      time: new Date(Date.now() + index * 60 * 60 * 1000).toISOString(),
      temperature: weather.temperature - 2 + index * 0.5,
      condition: weather.condition,
    }));
  }, [weather]);

  const graphPoints = useMemo(
    () =>
      hourly.map((entry) => ({
        hour: formatHour(entry.time),
        temperature: entry.temperature,
      })),
    [hourly],
  );

  const daily = useMemo(() => {
    const source = weather.daily?.slice(0, 5) || [];

    if (source.length > 0) {
      return source;
    }

    return Array.from({ length: 5 }).map((_, index) => ({
      date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString(),
      temp_min: weather.temp_min - index,
      temp_max: weather.temp_max - index * 0.5,
      condition: weather.condition,
    }));
  }, [weather]);

  const metrics = [
    { label: 'Feels Like', value: `${Math.round(weather.feels_like)} deg` },
    { label: 'Humidity', value: `${Math.round(weather.humidity)}%` },
    { label: 'Wind', value: `${Math.round(weather.wind_speed)} m/s` },
    { label: 'Pressure', value: `${Math.round(weather.pressure)} hPa` },
  ];

  const recentSearches = historyData.slice(-6).reverse();
  const trackedLocation = analyticsData?.most_searched_city || recentSearches[0]?.city || '';
  const totalSearches = recentSearches.length > 0 ? historyData.length : 0;
  const uniqueCities = Object.keys(analyticsData?.request_count || {}).length;

  const conditionFromDashboard = recentSearches[0]?.condition || 'Clear';
  const conditionFromCompare = compareCities[0]?.condition || weather.condition;
  const currentCondition =
    activeTab === 'single'
      ? weather.condition
      : activeTab === 'compare'
        ? conditionFromCompare
        : conditionFromDashboard;

  const topBar = (
    <div className="flex w-full flex-col items-center gap-4 lg:items-start">
      <ModeTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'single' ? (
        <form onSubmit={onSubmitSingle} className="glass-lite flex w-full max-w-md items-center gap-3 rounded-full px-3 py-2 shadow-ambient">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city"
            className="w-full bg-transparent px-3 text-sm font-medium text-inkPrimary placeholder:text-inkTertiary focus:outline-none"
            aria-label="Search city"
          />
          <button
            type="submit"
            className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-inkSecondary transition hover:bg-white"
          >
            {loadingSingle ? 'Loading' : 'Search'}
          </button>
        </form>
      ) : null}

      {activeTab === 'compare' ? (
        <form onSubmit={onSubmitCompare} className="glass-lite flex w-full max-w-2xl flex-col gap-3 rounded-[26px] p-3 shadow-ambient md:flex-row">
          <input
            value={compareLeft}
            onChange={(event) => setCompareLeft(event.target.value)}
            placeholder="First city"
            className="w-full rounded-xl bg-white/30 px-3 py-2 text-sm font-medium text-inkPrimary placeholder:text-inkTertiary focus:outline-none"
            aria-label="First city"
          />
          <input
            value={compareRight}
            onChange={(event) => setCompareRight(event.target.value)}
            placeholder="Second city"
            className="w-full rounded-xl bg-white/30 px-3 py-2 text-sm font-medium text-inkPrimary placeholder:text-inkTertiary focus:outline-none"
            aria-label="Second city"
          />
          <button
            type="submit"
            className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-inkSecondary transition hover:bg-white"
          >
            {loadingCompare ? 'Loading' : 'Compare'}
          </button>
        </form>
      ) : null}
    </div>
  );

  const singleHero = singleError ? (
    <div className="glass-lite fade-soft mx-auto w-full max-w-md rounded-3xl px-6 py-5 text-center text-sm font-medium text-inkSecondary lg:mx-0">
      {singleError}
    </div>
  ) : (
    <WeatherHero
      city={weather.city}
      temperature={weather.temperature}
      condition={weather.condition}
      tempMin={weather.temp_min}
      tempMax={weather.temp_max}
    />
  );

  const compareHero = (
    <div className="fade-soft w-full">
      <CompareView
        cities={compareCities.length > 0 ? compareCities : [null, null]}
        loading={loadingCompare}
        error={compareError}
      />
    </div>
  );

  const dashboardHero = loadingDashboard ? (
    <p className="fade-soft text-sm text-inkSecondary">Loading dashboard...</p>
  ) : (
    <div className="fade-soft w-full">
      <DashboardView
        primaryLocation={trackedLocation}
        totalSearches={totalSearches}
        recentSearches={recentSearches}
        uniqueCities={uniqueCities}
      />
    </div>
  );

  const hero = activeTab === 'single' ? singleHero : activeTab === 'compare' ? compareHero : dashboardHero;
  const desktopPanel = activeTab === 'single' ? <UnifiedInfoSurface graphPoints={graphPoints} metrics={metrics} daily={daily} /> : null;
  const mobilePanel = activeTab === 'single' ? <ForecastPanel hourly={hourly} /> : null;

  return (
    <AppShell
      condition={currentCondition}
      topBar={topBar}
      hero={hero}
      desktopPanel={desktopPanel}
      mobilePanel={mobilePanel}
    />
  );
}

export default App;
