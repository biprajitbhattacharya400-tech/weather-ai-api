import { useEffect, useMemo, useState } from 'react';
import AppShell from './components/AppShell';
import WeatherHero from './components/WeatherHero';
import ForecastPanel from './components/ForecastPanel';
import HourlyStrip from './components/HourlyStrip';
import UnifiedInfoSurface from './components/UnifiedInfoSurface';
import ModeTabs from './components/ModeTabs';
import CompareView from './components/CompareView';
import DashboardView from './components/DashboardView';
import CitySearchBox from './components/CitySearchBox';

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
  pop: 0,
  sunrise: 0,
  sunset: 0,
  aqi: 42,
  insight: 'Search for a city to unlock a tailored weather insight.',
  forecast: [],
  daily: [],
};

const formatHour = (value) => new Date(value).toLocaleTimeString([], { hour: 'numeric' });

const buildAiTip = (weatherData) => {
  const condition = String(weatherData?.condition || '').toLowerCase();
  const humidity = Number(weatherData?.humidity || 0);
  const wind = Number(weatherData?.wind_speed || 0);
  const temp = Number(weatherData?.temperature || 0);

  if (condition.includes('rain')) return 'Carry compact rain protection and favor routes with sheltered segments.';
  if (condition.includes('snow')) return 'Layer up and budget extra travel time for slower road and foot traffic.';
  if (condition.includes('clear') && temp >= 30) return 'Plan outdoor time earlier or later in the day and hydrate consistently.';
  if (humidity >= 80) return 'Humidity is elevated, so comfort can feel warmer than the reported temperature.';
  if (wind >= 25) return 'Gusts are strong enough to reduce comfort; secure loose items before heading out.';

  return 'Conditions are relatively stable and favorable for routine outdoor plans.';
};

function App() {
  const [activeTab, setActiveTab] = useState('single');

  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(EMPTY_WEATHER);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingSingle, setLoadingSingle] = useState(false);
  const [singleError, setSingleError] = useState('');

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(0);

  const [compareLeft, setCompareLeft] = useState('Dharmanagar');
  const [compareRight, setCompareRight] = useState('Barasat');
  const [compareCities, setCompareCities] = useState([]);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [compareError, setCompareError] = useState('');

  const [historyData, setHistoryData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const canShowSuggestions = !hasSearched && activeTab === 'single' && showSuggestions;

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
      setHasSearched(true);
      setShowSuggestions(false);
      setSuggestions([]);
    } catch (requestError) {
      setSingleError(requestError.message || 'Unable to load weather right now.');
    } finally {
      setLoadingSingle(false);
    }
  };

  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2 || activeTab !== 'single' || hasSearched) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/weather/search/coords?q=${encodeURIComponent(searchTerm.trim())}`);
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setSuggestions(data.slice(0, 6));
      setShowSuggestions(true);
      setHighlightedSuggestion(0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'single' || hasSearched) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(() => {
      fetchSuggestions(query);
    }, 220);

    return () => clearTimeout(timeout);
  }, [query, activeTab, hasSearched]);

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
    if (activeTab === 'compare' && compareCities.length === 0) {
      fetchCompare();
    }
    if (activeTab === 'dashboard' && historyData.length === 0 && !loadingDashboard) {
      fetchDashboard();
    }
  }, [activeTab]);

  const onPickSuggestion = (item) => {
    setQuery(item.name);
    setShowSuggestions(false);
    setSuggestions([]);
    fetchWeather(item.name);
  };

  const onSubmitSingle = (event) => {
    event.preventDefault();

    if (showSuggestions && suggestions.length > 0) {
      const picked = suggestions[Math.max(0, Math.min(highlightedSuggestion, suggestions.length - 1))];
      if (picked) {
        onPickSuggestion(picked);
        return;
      }
    }

    setShowSuggestions(false);
    setSuggestions([]);
    fetchWeather(query);
  };

  const onSubmitCompare = (event) => {
    event.preventDefault();
    fetchCompare();
  };

  const onSingleKeyDown = (event) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedSuggestion((prev) => (prev + 1) % suggestions.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    }

    if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const hourly = useMemo(() => {
    const source = weather.forecast?.slice(0, 8) || [];

    if (source.length > 0) {
      return source.map((entry) => {
        const rawPop = Number(entry.pop ?? 0);
        const pop = rawPop <= 1 ? Math.round(rawPop * 100) : Math.round(rawPop);

        return {
          ...entry,
          pop: Math.max(0, Math.min(100, pop)),
        };
      });
    }

    return Array.from({ length: 8 }).map((_, index) => ({
      time: new Date(Date.now() + index * 60 * 60 * 1000).toISOString(),
      temperature: weather.temperature - 2 + index * 0.5,
      condition: weather.condition,
      pop: 0,
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
  const nowUnix = Math.floor(Date.now() / 1000);
  const isNightNow = Boolean(weather.sunrise && weather.sunset && (nowUnix < weather.sunrise || nowUnix > weather.sunset));
  const singleCondition = hasSearched ? (isNightNow ? 'night' : weather.condition) : 'default';
  const currentCondition =
    activeTab === 'single'
      ? singleCondition
      : activeTab === 'compare'
        ? conditionFromCompare
        : conditionFromDashboard;

  const topBar = (
    <div className="flex w-full flex-col items-center gap-4 lg:items-start">
      <ModeTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'single' && hasSearched ? (
        <div className="w-full max-w-xl">
          <CitySearchBox
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSuggestions(false);
              setSuggestions([]);
            }}
            onSubmit={onSubmitSingle}
            onSuggestionPick={onPickSuggestion}
            onKeyDown={onSingleKeyDown}
            suggestions={[]}
            showSuggestions={false}
            loading={loadingSingle}
            placeholder="Search for a city..."
            large={false}
          />
        </div>
      ) : null}

      {activeTab === 'compare' ? (
        <form onSubmit={onSubmitCompare} className="glass-lite flex w-full max-w-2xl flex-col gap-3 rounded-[26px] p-3 shadow-ambient md:flex-row">
          <input
            value={compareLeft}
            onChange={(event) => setCompareLeft(event.target.value)}
            placeholder="First city"
            className="focus-glow w-full rounded-xl bg-white/30 px-3 py-2 text-sm font-medium text-inkPrimary placeholder:text-inkTertiary focus:outline-none"
            aria-label="First city"
          />
          <input
            value={compareRight}
            onChange={(event) => setCompareRight(event.target.value)}
            placeholder="Second city"
            className="focus-glow w-full rounded-xl bg-white/30 px-3 py-2 text-sm font-medium text-inkPrimary placeholder:text-inkTertiary focus:outline-none"
            aria-label="Second city"
          />
          <button
            type="submit"
            className="soft-button rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-inkSecondary hover:bg-white"
          >
            {loadingCompare ? 'Loading' : 'Compare'}
          </button>
        </form>
      ) : null}
    </div>
  );

  const homeHero = (
    <div className="fade-soft mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center lg:mx-0 lg:items-start lg:text-left">
      <h1 className="text-4xl font-semibold tracking-[-0.03em] text-inkPrimary sm:text-5xl md:text-6xl">
        Where weather meets experience
      </h1>
      <p className="max-w-2xl text-sm text-inkSecondary/90 sm:text-base">
        Search any city to begin a calm, immersive weather experience.
      </p>
      <div className="w-full max-w-2xl">
        <CitySearchBox
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHasSearched(false);
            setShowSuggestions(true);
          }}
          onSubmit={onSubmitSingle}
          onSuggestionPick={onPickSuggestion}
          onKeyDown={onSingleKeyDown}
          suggestions={suggestions}
          showSuggestions={canShowSuggestions}
          loading={loadingSingle}
          placeholder="Search for a city..."
          large
        />
      </div>
    </div>
  );

  const singleHero = singleError ? (
    <div className="glass-lite fade-soft mx-auto w-full max-w-md rounded-3xl px-6 py-5 text-center text-sm font-medium text-inkSecondary lg:mx-0">
      {singleError}
    </div>
  ) : (
    <WeatherHero
      key={`${weather.city}-${Math.round(weather.temperature)}`}
      city={weather.city}
      temperature={weather.temperature}
      condition={weather.condition}
      tempMin={weather.temp_min}
      tempMax={weather.temp_max}
      humidity={weather.humidity}
      windSpeed={weather.wind_speed}
      aqi={weather.aqi}
      rainChance={weather.pop}
      insight={weather.insight}
      tip={buildAiTip(weather)}
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

  const hero =
    activeTab === 'single'
      ? hasSearched
        ? singleHero
        : homeHero
      : activeTab === 'compare'
        ? compareHero
        : dashboardHero;

  const desktopPanel = activeTab === 'single' && hasSearched ? (
    <UnifiedInfoSurface graphPoints={graphPoints} metrics={metrics} daily={daily} />
  ) : null;

  const centerPanel = activeTab === 'single' && hasSearched ? <HourlyStrip hourly={hourly} /> : null;

  const mobilePanel = activeTab === 'single' && hasSearched ? (
    <div className="space-y-4">
      <ForecastPanel hourly={hourly} />
      <UnifiedInfoSurface
        graphPoints={graphPoints}
        metrics={metrics}
        daily={daily}
        showMetrics={false}
        className="rounded-[30px] p-5"
      />
    </div>
  ) : null;

  const footer = (
    <p className="text-xs tracking-wide text-inkSecondary/78">
      Made with <span aria-hidden="true">&#10084;</span> by Biprajit
    </p>
  );

  return (
    <AppShell
      condition={currentCondition}
      topBar={topBar}
      hero={hero}
      centerPanel={centerPanel}
      desktopPanel={desktopPanel}
      mobilePanel={mobilePanel}
      footer={footer}
    />
  );
}

export default App;
