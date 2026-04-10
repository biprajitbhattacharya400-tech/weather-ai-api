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

function ForecastPanel({ hourly }) {
  return (
    <section className="glass-lite mx-auto w-full max-w-2xl rounded-[30px] p-4 pb-5 shadow-ambient">
      <div className="mb-3 px-2 text-xs font-medium uppercase tracking-[0.16em] text-inkTertiary">Hourly</div>
      <div className="flex gap-2 overflow-x-auto px-1 pb-1">
        {hourly.map((item) => {
          const Icon = iconByCondition(item.condition);
          const popValue = Number(item.pop ?? 0);
          const rainPercent = Math.max(0, Math.min(100, Math.round(popValue <= 1 ? popValue * 100 : popValue)));

          return (
            <article key={item.time} className="min-w-[74px] rounded-2xl bg-white/26 px-3 py-2.5 text-center">
              <p className="text-xs font-medium text-inkTertiary">{formatHour(item.time)}</p>
              <Icon className="mx-auto mt-1.5 text-inkSecondary" size={16} />
              <p className="mt-1.5 text-sm font-semibold text-inkPrimary">{Math.round(item.temperature)}°</p>
              <p className="mx-auto mt-1.5 inline-flex items-center gap-1 rounded-full bg-sky-100/75 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                <CloudRain size={11} strokeWidth={2.1} />
                {rainPercent}%
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ForecastPanel;
