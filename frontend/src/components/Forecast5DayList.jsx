import { Cloud, CloudRain, CloudSnow, Sun } from 'lucide-react';

const iconByCondition = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return CloudRain;
  if (c.includes('snow')) return CloudSnow;
  if (c.includes('cloud') || c.includes('mist') || c.includes('fog')) return Cloud;
  return Sun;
};

const formatDay = (value) => {
  const date = new Date(value);
  return date.toLocaleDateString([], { weekday: 'short' });
};

function Forecast5DayList({ daily }) {
  return (
    <section className="space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-inkTertiary">5 Day</p>
      <div className="space-y-1.5">
        {daily.map((day) => {
          const Icon = iconByCondition(day.condition);
          return (
            <article key={day.date} className="flex items-center justify-between rounded-2xl bg-white/24 px-3 py-2">
              <div className="flex items-center gap-2">
                <Icon size={15} className="text-inkSecondary" />
                <p className="text-sm font-medium text-inkSecondary">{formatDay(day.date)}</p>
              </div>
              <p className="text-sm font-semibold text-inkPrimary">
                {Math.round(day.temp_max)}° <span className="text-inkTertiary">{Math.round(day.temp_min)}°</span>
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Forecast5DayList;
