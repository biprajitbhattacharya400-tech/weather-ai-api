import { useEffect, useRef, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sparkles, Sun } from 'lucide-react';
import ImmersiveConditionsBlock from './ImmersiveConditionsBlock';

const iconByCondition = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return CloudRain;
  if (c.includes('snow')) return CloudSnow;
  if (c.includes('cloud') || c.includes('mist') || c.includes('fog')) return Cloud;
  return Sun;
};

const buildMoodText = (condition, temperature) => {
  const hour = new Date().getHours();
  const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const c = String(condition || '').toLowerCase();

  if (c.includes('rain') || c.includes('drizzle')) {
    return `Gentle ${period} rain with a calm atmosphere`;
  }

  if (c.includes('cloud') || c.includes('mist') || c.includes('fog')) {
    return `Calm ${period} with light clouds`;
  }

  if ((temperature ?? 0) >= 30) {
    return `Warm ${period} with clear skies`;
  }

  return `Soft ${period} weather with clear skies`;
};

function WeatherHero({ city, temperature, condition, tempMin, tempMax, feelsLike, humidity, windSpeed, aqi, rainChance, insight, tip }) {
  const Icon = iconByCondition(condition);
  const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const [displayTemp, setDisplayTemp] = useState(Math.round(temperature || 0));
  const [displayHumidity, setDisplayHumidity] = useState(Math.round(humidity || 0));
  const [displayAqi, setDisplayAqi] = useState(Math.round(aqi || 42));
  const frameRef = useRef(0);
  const moodText = buildMoodText(condition, temperature);

  const aqiTone = displayAqi <= 60 ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30' : displayAqi <= 120 ? 'bg-amber-400/20 text-amber-100 border border-amber-300/30' : 'bg-rose-400/20 text-rose-100 border border-rose-300/30';

  useEffect(() => {
    const target = Math.round(temperature || 0);
    const start = displayTemp;
    const delta = target - start;

    if (delta === 0) return undefined;

    const duration = 640;
    const startedAt = performance.now();

    const tick = (nowMs) => {
      const progress = Math.min(1, (nowMs - startedAt) / duration);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplayTemp(Math.round(start + delta * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, [temperature]);

  useEffect(() => {
    const target = Math.round(humidity || 0);
    const start = displayHumidity;
    const delta = target - start;
    if (delta === 0) return undefined;

    const duration = 560;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (nowMs) => {
      const progress = Math.min(1, (nowMs - startedAt) / duration);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplayHumidity(Math.round(start + delta * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [humidity]);

  useEffect(() => {
    const target = Math.round(aqi || 42);
    const start = displayAqi;
    const delta = target - start;
    if (delta === 0) return undefined;

    const duration = 600;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (nowMs) => {
      const progress = Math.min(1, (nowMs - startedAt) / duration);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplayAqi(Math.round(start + delta * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [aqi]);

  return (
    <section className="fade-soft weather-refresh relative flex w-full max-w-2xl flex-col items-center lg:items-start">
      <p className="text-sm font-medium tracking-wide text-inkSecondary/85">{city} · {now}</p>

      <div className="glass-strong insight-card insight-enter mt-6 w-full max-w-xl rounded-2xl border-l-2 border-sky-300/45 bg-[linear-gradient(120deg,rgba(56,189,248,0.12),rgba(18,28,47,0.45)_24%,rgba(18,28,47,0.24))] px-4 py-3 shadow-[0_12px_28px_rgba(6,14,28,0.24)]">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-inkTertiary">
          <Sparkles size={13} />
          <span>AI Insight</span>
        </div>
        <p className="mt-2 text-base font-medium text-inkSecondary">{insight || 'No AI insight available yet for this location.'}</p>
        <p className="mt-1.5 text-sm text-inkTertiary">{tip || 'Use compare mode to evaluate conditions between two cities.'}</p>
      </div>

      <div className="relative mt-11">
        <div className="absolute inset-0 -z-10 rounded-full bg-slate-200/8 blur-[70px]" />
        <h1 className="temp-breathe text-[108px] font-semibold leading-[0.88] tracking-[-0.045em] text-inkPrimary sm:text-[126px] md:text-[142px] lg:text-[160px]">
          {displayTemp}°
        </h1>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[22px] font-medium text-inkSecondary/92">
        <Icon size={20} strokeWidth={2} className="icon-float" style={{ color: 'var(--wx-accent)' }} />
        <span>{condition || 'Clear'}</span>
      </div>

      <p className="mt-6 text-sm font-medium tracking-wide text-inkTertiary">
        H {Math.round(tempMax)}° · L {Math.round(tempMin)}°
      </p>

      <p className="mt-5 mb-3 text-sm font-medium text-inkSecondary/82">
        Humidity {displayHumidity}% <span className="px-1.5 text-inkTertiary">•</span> Wind {Math.round(windSpeed ?? 0)} m/s <span className="px-1.5 text-inkTertiary">•</span> <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${aqiTone}`}><span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />AQI {displayAqi}</span> <span className="px-1.5 text-inkTertiary">•</span> <span className="shimmer-pill inline-flex items-center rounded-full border border-sky-200/20 px-2 py-0.5 text-[11px] font-semibold" style={{ color: 'var(--wx-accent)', background: 'color-mix(in srgb, var(--wx-accent) 14%, rgba(17,28,48,0.64))' }}>🌧 {Math.round(rainChance ?? 0)}%</span>
      </p>

      <div className="glass-soft live-strip-enter w-full max-w-xl rounded-2xl px-4 py-3 shadow-ambient">
        <div className="flex items-center justify-between gap-3">
          <div className="text-slide-up flex items-center gap-2.5 text-sm font-medium text-inkSecondary">
            <Icon size={14} className="icon-float" style={{ color: 'var(--wx-accent)' }} />
            <span>{moodText}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-inkSecondary/80">
            <span className="live-dot-pulse h-2 w-2 rounded-full bg-emerald-500/85" />
            <span>Live</span>
          </div>
        </div>
        <div className="mt-2">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-slate-900/45 px-2.5 py-1 text-xs font-semibold text-inkSecondary">
            Feels like {Math.round(feelsLike ?? temperature ?? 0)}°
          </span>
        </div>
      </div>

      <ImmersiveConditionsBlock
        condition={condition}
        windSpeed={windSpeed}
        rainChance={rainChance}
        aqi={displayAqi}
      />
    </section>
  );
}

export default WeatherHero;
