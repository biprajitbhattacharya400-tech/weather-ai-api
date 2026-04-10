import { Cloud, CloudRain, CloudSnow, Sun } from 'lucide-react';

const iconByCondition = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return CloudRain;
  if (c.includes('snow')) return CloudSnow;
  if (c.includes('cloud') || c.includes('mist') || c.includes('fog')) return Cloud;
  return Sun;
};

function CompareCityCard({ city }) {
  if (!city || city.error) {
    return (
      <article className="glass-lite rounded-[30px] p-6 shadow-ambient">
        <p className="text-base font-medium text-inkSecondary">Unavailable</p>
        <p className="mt-2 text-sm text-inkTertiary">Try a different city name.</p>
      </article>
    );
  }

  const Icon = iconByCondition(city.condition);

  return (
    <article className="glass-lite rounded-[30px] p-6 shadow-ambient">
      <p className="text-sm font-medium text-inkSecondary">{city.city}</p>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-6xl font-semibold leading-[0.9] tracking-[-0.04em] text-inkPrimary">{Math.round(city.temperature)}°</p>
          <p className="mt-2 text-sm text-inkTertiary">Feels like {Math.round(city.feels_like)}°</p>
        </div>
        <div className="rounded-2xl bg-white/40 p-3 text-inkSecondary">
          <Icon size={22} />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-inkSecondary">{city.condition}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <p className="text-inkTertiary">Humidity <span className="ml-1 text-inkSecondary">{Math.round(city.humidity)}%</span></p>
        <p className="text-inkTertiary">Wind <span className="ml-1 text-inkSecondary">{Math.round(city.wind_speed)} m/s</span></p>
      </div>
    </article>
  );
}

function CompareView({ cities, loading, error }) {
  return (
    <section className="w-full max-w-5xl">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.16em] text-inkTertiary">Compare Conditions</p>
      </div>
      {error ? <p className="text-sm text-inkSecondary">{error}</p> : null}
      {loading ? <p className="text-sm text-inkSecondary">Loading comparison...</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {cities.map((city, idx) => (
          <CompareCityCard key={city?.city || idx} city={city} />
        ))}
      </div>
    </section>
  );
}

export default CompareView;
