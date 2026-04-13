import { Cloud, CloudRain, CloudSnow, LineChart, Sun } from 'lucide-react';
import { Area, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart as RechartLineChart } from 'recharts';

const iconByCondition = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return CloudRain;
  if (c.includes('snow')) return CloudSnow;
  if (c.includes('cloud') || c.includes('mist') || c.includes('fog')) return Cloud;
  return Sun;
};

const formatHour = (value) => new Date(value).toLocaleTimeString([], { hour: 'numeric' });

function buildInsight(cityA, cityB) {
  if (!cityA || !cityB || cityA.error || cityB.error) return 'Select two valid cities to compare conditions.';

  const warmer = cityA.temperature >= cityB.temperature ? cityA : cityB;
  const humid = cityA.humidity >= cityB.humidity ? cityA : cityB;
  const windier = cityA.wind_speed >= cityB.wind_speed ? cityA : cityB;

  return `${warmer.city} is warmer, ${humid.city} has higher humidity, and winds are stronger in ${windier.city}.`;
}

function buildHourly(cityA, cityB) {
  if (!cityA?.forecast || !cityB?.forecast) return [];

  const len = Math.min(cityA.forecast.length, cityB.forecast.length, 8);
  return Array.from({ length: len }).map((_, index) => ({
    hour: formatHour(cityA.forecast[index].time),
    leftTemp: cityA.forecast[index].temperature,
    rightTemp: cityB.forecast[index].temperature,
  }));
}

function DifferenceBar({ label, leftValue, rightValue, leftUnit, rightUnit }) {
  const total = Math.max(leftValue + rightValue, 1);
  const leftWidth = (leftValue / total) * 100;
  const rightWidth = (rightValue / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <p className="text-inkSecondary">{label}</p>
        <p className="text-inkTertiary">{leftValue}{leftUnit} vs {rightValue}{rightUnit}</p>
      </div>
      <div className="compare-diff-track h-2 overflow-hidden rounded-full">
        <div className="compare-diff-fill-left h-full rounded-full" style={{ width: `${leftWidth}%` }} />
        <div className="compare-diff-fill-right -mt-2 h-full rounded-full" style={{ width: `${rightWidth}%` }} />
      </div>
    </div>
  );
}

function CitySnapshot({ city }) {
  if (!city || city.error) {
    return (
      <article className="glass-lite soft-hover-lift rounded-[30px] p-6">
        <p className="text-base font-medium text-inkSecondary">Unavailable</p>
      </article>
    );
  }

  const Icon = iconByCondition(city.condition);

  return (
    <article className="glass-lite soft-hover-lift rounded-[30px] p-6">
      <p className="text-sm font-medium text-inkSecondary">{city.city}</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-6xl font-semibold leading-[0.9] tracking-[-0.04em] text-inkPrimary">{Math.round(city.temperature)}°</p>
          <p className="mt-2 text-sm text-inkTertiary">Feels like {Math.round(city.feels_like)}°</p>
        </div>
        <div className="compare-icon-chip icon-float rounded-2xl p-3 text-inkSecondary">
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
        <p className="text-inkTertiary">Min / Max</p>
        <p className="text-right font-medium text-inkSecondary">{Math.round(city.temp_min)}° / {Math.round(city.temp_max)}°</p>
        <p className="text-inkTertiary">Humidity</p>
        <p className="text-right font-medium text-inkSecondary">{Math.round(city.humidity)}%</p>
        <p className="text-inkTertiary">Wind</p>
        <p className="text-right font-medium text-inkSecondary">{Math.round(city.wind_speed)} m/s</p>
      </div>
    </article>
  );
}

function CompareView({ cities, loading, error }) {
  const [cityA, cityB] = cities;
  const insight = buildInsight(cityA, cityB);
  const hourly = buildHourly(cityA, cityB);

  return (
    <section className="glass-strong fade-soft weather-refresh w-full max-w-6xl rounded-[34px] p-6 shadow-ambient md:p-8">
      <div className="space-y-8">
        <div className="compare-insight-card insight-enter rounded-2xl border-l-2 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-inkTertiary">Insight</p>
          <p className="mt-2 text-sm text-inkSecondary">{insight}</p>
        </div>

        {error ? <p className="text-sm text-inkSecondary">{error}</p> : null}
        {loading ? <p className="text-sm text-inkSecondary">Loading comparison...</p> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <CitySnapshot city={cityA} />
          <CitySnapshot city={cityB} />
        </div>

        <div className="glass-lite soft-hover-lift rounded-[30px] p-5 md:p-6">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-inkTertiary">
            <LineChart size={14} />
            <span>Hourly Comparison</span>
          </div>
          <div className="compare-chart-panel h-48 w-full rounded-2xl p-2">
            <ResponsiveContainer>
              <RechartLineChart data={hourly} margin={{ top: 12, right: 10, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id="compareFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(95, 125, 178, 0.24)" />
                    <stop offset="100%" stopColor="rgba(95, 125, 178, 0.02)" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fill: '#69778f', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    background: 'var(--cmp-tooltip-bg)',
                    border: '1px solid var(--cmp-tooltip-border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--cmp-tooltip-shadow)',
                    color: 'var(--cmp-tooltip-text)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="leftTemp"
                  stroke="none"
                  fill="url(#compareFill)"
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                />
                <Line type="monotone" dataKey="leftTemp" stroke="#4f5f7d" strokeWidth={2.4} dot={false} isAnimationActive animationDuration={1050} animationEasing="ease-out" />
                <Line type="monotone" dataKey="rightTemp" stroke="#7f8ea8" strokeWidth={2.2} dot={false} isAnimationActive animationDuration={1150} animationEasing="ease-out" />
              </RechartLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-lite soft-hover-lift space-y-4 rounded-[30px] p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-inkTertiary">Difference Overview</p>
          <DifferenceBar
            label="Humidity"
            leftValue={Math.round(cityA?.humidity || 0)}
            rightValue={Math.round(cityB?.humidity || 0)}
            leftUnit="%"
            rightUnit="%"
          />
          <DifferenceBar
            label="Wind"
            leftValue={Math.round(cityA?.wind_speed || 0)}
            rightValue={Math.round(cityB?.wind_speed || 0)}
            leftUnit=" m/s"
            rightUnit=" m/s"
          />
          <DifferenceBar
            label="Feels Like"
            leftValue={Math.round(cityA?.feels_like || 0)}
            rightValue={Math.round(cityB?.feels_like || 0)}
            leftUnit=" deg"
            rightUnit=" deg"
          />
        </div>
      </div>
    </section>
  );
}

export default CompareView;
