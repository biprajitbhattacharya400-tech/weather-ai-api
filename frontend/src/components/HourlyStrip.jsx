import { Cloud, CloudRain, CloudSnow, Sun } from 'lucide-react';

const iconByCondition = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return CloudRain;
  if (c.includes('snow')) return CloudSnow;
  if (c.includes('cloud') || c.includes('mist') || c.includes('fog')) return Cloud;
  return Sun;
};

const formatHour = (value) => {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: 'numeric' });
};

function HourlyStrip({ hourly }) {
  return (
    <section className="glass-lite fade-soft w-full rounded-[28px] px-4 py-4 shadow-ambient">
      <p className="px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-inkTertiary">Hourly Forecast</p>
      <div className="mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {hourly.map((item) => {
          const Icon = iconByCondition(item.condition);
          return (
            <article
              key={item.time}
              className="min-w-[76px] rounded-full bg-white/30 px-3 py-2.5 text-center"
            >
              <p className="text-[11px] font-medium text-inkTertiary">{formatHour(item.time)}</p>
              <Icon className="mx-auto mt-1.5 text-inkSecondary" size={15} />
              <p className="mt-1 text-sm font-semibold text-inkPrimary">{Math.round(item.temperature)}°</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default HourlyStrip;
