import { Cloud, CloudRain, CloudSnow, Sparkles, Sun } from 'lucide-react';

const iconByCondition = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return CloudRain;
  if (c.includes('snow')) return CloudSnow;
  if (c.includes('cloud') || c.includes('mist') || c.includes('fog')) return Cloud;
  return Sun;
};

function WeatherHero({ city, temperature, condition, tempMin, tempMax, humidity, windSpeed, aqi, insight, tip }) {
  const Icon = iconByCondition(condition);
  const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <section className="relative flex w-full max-w-2xl flex-col items-center lg:items-start">
      <p className="text-sm font-medium tracking-wide text-inkSecondary/85">{city} · {now}</p>

      <div className="fade-soft mt-6 w-full max-w-xl rounded-2xl border-l-2 border-sky-300/60 bg-white/18 px-4 py-3 shadow-[0_10px_30px_rgba(56,189,248,0.12)]">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-inkTertiary">
          <Sparkles size={13} />
          <span>AI Insight</span>
        </div>
        <p className="mt-2 text-base font-medium text-inkSecondary">{insight || 'No AI insight available yet for this location.'}</p>
        <p className="mt-1.5 text-sm text-inkTertiary">{tip || 'Use compare mode to evaluate conditions between two cities.'}</p>
      </div>

      <div className="relative mt-11">
        <div className="absolute inset-0 -z-10 rounded-full bg-white/62 blur-[74px]" />
        <h1 className="text-[108px] font-semibold leading-[0.88] tracking-[-0.045em] text-inkPrimary sm:text-[126px] md:text-[142px] lg:text-[160px]">
          {Math.round(temperature)}°
        </h1>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[22px] font-medium text-inkSecondary/92">
        <Icon size={20} strokeWidth={2} />
        <span>{condition || 'Clear'}</span>
      </div>

      <p className="mt-6 text-sm font-medium tracking-wide text-inkTertiary">
        H {Math.round(tempMax)}° · L {Math.round(tempMin)}°
      </p>

      <p className="mt-5 mb-3 text-sm font-medium text-inkSecondary/82">
        Humidity {Math.round(humidity ?? 0)}% <span className="px-1.5 text-inkTertiary">•</span> Wind {Math.round(windSpeed ?? 0)} m/s <span className="px-1.5 text-inkTertiary">•</span> AQI {Math.round(aqi ?? 42)}
      </p>
    </section>
  );
}

export default WeatherHero;
