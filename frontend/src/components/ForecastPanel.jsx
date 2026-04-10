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
      <div className="smooth-scroll-x flex gap-2 overflow-x-auto px-1 pb-1">
        {hourly.map((item, index) => {
          const Icon = iconByCondition(item.condition);
          const popValue = Number(item.pop ?? 0);
          const rainPercent = Math.max(0, Math.min(100, Math.round(popValue <= 1 ? popValue * 100 : popValue)));

          return (
            <article
              key={item.time}
              className="soft-hover-lift stagger-fade min-w-[92px] rounded-2xl bg-white/26 px-3 py-2.5 text-center"
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <p className="text-xs font-medium text-inkTertiary">{formatHour(item.time)}</p>
              <Icon className="mx-auto mt-1.5 text-inkSecondary" size={16} />
              <p className="mt-1.5 text-sm font-semibold text-inkPrimary">{Math.round(item.temperature)}°</p>
              <p className="shimmer-pill mt-1 inline-flex items-center rounded-full bg-sky-100/80 px-2 py-0.5 text-[11px] font-semibold text-sky-700">🌧 {rainPercent}%</p>
              <div className="hourly-preci-bar mt-1.5">
                <div className="hourly-preci-fill" style={{ width: `${rainPercent}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ForecastPanel;
