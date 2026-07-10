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
    <section className="glass-lite mx-auto w-full rounded-[30px] p-4 shadow-ambient">
      <div className="mb-3 px-1 text-[9px] font-bold uppercase tracking-[0.2em] text-inkTertiary">Hourly</div>
      <div className="smooth-scroll-x flex gap-2.5 overflow-x-auto px-0.5 pb-1">
        {hourly.map((item, index) => {
          const Icon = iconByCondition(item.condition);
          const popValue = Number(item.pop ?? 0);
          const rainPercent = Math.max(0, Math.min(100, Math.round(popValue <= 1 ? popValue * 100 : popValue)));

          return (
            <article
              key={item.time}
              className="hourly-card-hover stagger-fade min-w-[110px] rounded-[18px] bg-white/26 px-3.5 py-3 text-center"
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <p className="text-[10px] font-medium text-inkTertiary">{formatHour(item.time)}</p>
              <Icon className="hourly-icon-float mx-auto mt-2 text-inkSecondary" size={18} />
              <p className="mt-2 text-sm font-bold text-inkPrimary">{Math.round(item.temperature)}°</p>
              <p className="shimmer-pill mt-2 inline-flex items-center rounded-full bg-sky-100/80 px-2 py-0.5 text-[10px] font-semibold text-sky-700">🌧 {rainPercent}%</p>
              <div className="hourly-preci-bar mt-2">
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
