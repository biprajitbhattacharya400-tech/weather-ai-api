import { useEffect, useMemo, useState } from 'react';
import AppShell from './components/AppShell';
import WeatherHero from './components/WeatherHero';
import ForecastPanel from './components/ForecastPanel';
import UnifiedInfoSurface from './components/UnifiedInfoSurface';

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
  const [query, setQuery] = useState('Tokyo');
  const [weather, setWeather] = useState(EMPTY_WEATHER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (city) => {
    if (!city.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/weather/${encodeURIComponent(city.trim())}`);
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error('City not found. Try another location.');
      }

      setWeather({ ...EMPTY_WEATHER, ...data });
    } catch (requestError) {
      setError(requestError.message || 'Unable to load weather right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Tokyo');
  }, []);

  const onSubmit = (event) => {
    event.preventDefault();
    fetchWeather(query);
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

  const topBar = (
    <header className="flex items-center justify-center lg:justify-start">
      <form onSubmit={onSubmit} className="glass-lite flex w-full max-w-md items-center gap-3 rounded-full px-3 py-2 shadow-ambient">
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
          {loading ? 'Loading' : 'Search'}
        </button>
      </form>
    </header>
  );

  const hero = (
    <div className="w-full">
      {error ? (
        <div className="glass-lite mx-auto w-full max-w-md rounded-3xl px-6 py-5 text-center text-sm font-medium text-inkSecondary lg:mx-0">
          {error}
        </div>
      ) : (
        <WeatherHero
          city={weather.city}
          temperature={weather.temperature}
          condition={weather.condition}
          tempMin={weather.temp_min}
          tempMax={weather.temp_max}
        />
      )}
    </div>
  );

  const desktopPanel = (
    <UnifiedInfoSurface graphPoints={graphPoints} metrics={metrics} daily={daily} />
  );

  const mobilePanel = <ForecastPanel hourly={hourly} />;

  return (
    <AppShell
      condition={weather.condition}
      topBar={topBar}
      hero={hero}
      desktopPanel={desktopPanel}
      mobilePanel={mobilePanel}
    />
  );
}

export default App;
