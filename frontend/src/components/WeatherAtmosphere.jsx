import { useEffect, useMemo, useRef, useState } from 'react';

const SKY_BY_PHASE = {
  morning: 'linear-gradient(160deg, #d6e3f4 0%, #cdddf2 44%, #e8d8c9 100%)',
  noon: 'linear-gradient(170deg, #d7e5f6 0%, #cedff4 46%, #dde7f7 100%)',
  sunset: 'linear-gradient(170deg, #e9c6b2 0%, #d9bfd6 50%, #a6b4d6 100%)',
  night: 'linear-gradient(170deg, #1b2342 0%, #26315d 48%, #4c4f89 100%)',
};

const OVERLAY_BY_WEATHER = {
  clear: 'radial-gradient(circle at 12% 8%, rgba(255, 237, 180, 0.24), transparent 42%)',
  clouds: 'radial-gradient(circle at 14% 10%, rgba(232, 240, 252, 0.2), transparent 45%)',
  rain: 'radial-gradient(circle at 18% 12%, rgba(183, 193, 224, 0.18), transparent 48%)',
  thunderstorm: 'radial-gradient(circle at 18% 12%, rgba(169, 178, 215, 0.16), transparent 48%)',
  snow: 'radial-gradient(circle at 14% 9%, rgba(247, 250, 255, 0.22), transparent 46%)',
  night: 'radial-gradient(circle at 18% 10%, rgba(129, 120, 210, 0.18), transparent 48%)',
  default: 'radial-gradient(circle at 14% 10%, rgba(233, 241, 253, 0.18), transparent 45%)',
};

const HOME_IDLE_BACKGROUND = 'linear-gradient(135deg, #0F172A, #1E293B, #334155)';
const HOME_IDLE_LIGHT = 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05), transparent 60%)';

const BLOOM_STYLES = {
  clear: 'bg-[radial-gradient(circle_at_52%_12%,rgba(255,248,223,0.26),transparent_48%)]',
  clouds: 'bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.2),transparent_45%)]',
  rain: 'bg-[radial-gradient(circle_at_50%_9%,rgba(207,219,240,0.16),transparent_44%)]',
  thunderstorm: 'bg-[radial-gradient(circle_at_50%_9%,rgba(199,212,238,0.14),transparent_46%)]',
  snow: 'bg-[radial-gradient(circle_at_50%_9%,rgba(255,255,255,0.26),transparent_48%)]',
  night: 'bg-[radial-gradient(circle_at_50%_8%,rgba(178,191,236,0.12),transparent_48%)]',
  default: 'bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.18),transparent_47%)]',
};

const resolveCondition = (condition = '') => {
  const normalized = condition.toLowerCase();
  if (normalized.includes('thunder')) return 'thunderstorm';
  if (normalized.includes('rain') || normalized.includes('drizzle')) return 'rain';
  if (normalized.includes('snow')) return 'snow';
  if (normalized.includes('cloud') || normalized.includes('mist') || normalized.includes('fog')) return 'clouds';
  if (normalized.includes('clear') || normalized.includes('sun')) return 'clear';
  return 'default';
};

const resolvePhase = (hour, weatherKey) => {
  if (weatherKey === 'night') return 'night';
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 16) return 'noon';
  if (hour >= 16 && hour < 19) return 'sunset';
  return 'night';
};

function WeatherAtmosphere({ condition, parallaxOffset = 0, suppressLineEffects = false }) {
  const canvasRef = useRef(null);
  const [now, setNow] = useState(() => new Date());
  const [performanceMode, setPerformanceMode] = useState('full');
  const key = resolveCondition(condition);
  const isHomeIdle = key === 'default';
  const phase = resolvePhase(now.getHours(), key);
  const skyGradient = SKY_BY_PHASE[phase] || SKY_BY_PHASE.noon;
  const weatherOverlay = OVERLAY_BY_WEATHER[key] || OVERLAY_BY_WEATHER.default;
  const bloom = BLOOM_STYLES[key] || BLOOM_STYLES.default;
  const isRainy = key === 'rain' || key === 'thunderstorm';
  const isNight = key === 'night';
  const isClear = key === 'clear';
  const isCloudy = key === 'clouds';
  const isSnow = key === 'snow';
  const shift = Math.min(parallaxOffset * 0.05, 20);

  useEffect(() => {
    const updateMode = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = window.innerWidth < 900;
      const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
      setPerformanceMode(reducedMotion || isMobile || lowCpu ? 'lite' : 'full');
    };

    updateMode();
    window.addEventListener('resize', updateMode);
    return () => window.removeEventListener('resize', updateMode);
  }, []);

  const enableCanvasRain = isRainy && performanceMode === 'full' && !suppressLineEffects;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const skyStyle = useMemo(
    () => ({
      backgroundImage: isHomeIdle
        ? `${HOME_IDLE_LIGHT}, ${HOME_IDLE_BACKGROUND}`
        : `${skyGradient}, ${weatherOverlay}`,
    }),
    [isHomeIdle, skyGradient, weatherOverlay],
  );

  useEffect(() => {
    if (!enableCanvasRain) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let frame = 0;
    let drops = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drops = Array.from({ length: Math.max(28, Math.floor(canvas.width / 28)) }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: 8 + Math.random() * 12,
        speed: 2.2 + Math.random() * 2.8,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(212, 227, 255, 0.18)';
      ctx.lineWidth = 1;

      for (const d of drops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1.5, d.y + d.len);
        ctx.stroke();

        d.y += d.speed;
        d.x -= 0.3;

        if (d.y > canvas.height + 12 || d.x < -12) {
          d.x = Math.random() * canvas.width + 8;
          d.y = -Math.random() * 40;
        }
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [enableCanvasRain]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="sky-drift absolute inset-0 transition-all duration-[1800ms] ease-out" style={skyStyle} />
      <div className="ambient-radial-light absolute inset-0" />

      {!isHomeIdle ? <div className="atmo-overlay absolute inset-0 opacity-45 transition-opacity duration-[1500ms]" /> : null}
      {!isHomeIdle ? <div className="atmo-blob absolute -left-24 -top-10 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_68%)]" style={{ transform: `translateY(${shift * 0.55}px)` }} /> : null}
      {!isHomeIdle ? <div className="atmo-blob-slow absolute -right-28 bottom-[-4.5rem] h-[23rem] w-[23rem] rounded-full bg-[radial-gradient(circle,rgba(201,219,248,0.18),transparent_70%)]" style={{ transform: `translateY(${-shift * 0.4}px)` }} /> : null}
      {!isHomeIdle && performanceMode === 'full' ? <div className="atmo-blob absolute right-[24%] top-[36%] h-[13rem] w-[13rem] rounded-full bg-[radial-gradient(circle,rgba(247,251,255,0.12),transparent_72%)]" style={{ transform: `translateY(${shift * 0.22}px)` }} /> : null}

      {!isHomeIdle ? <div className={`absolute inset-0 animate-breathe ${bloom}`} /> : null}
      {isClear && performanceMode === 'full' && !isHomeIdle ? <div className="sunny-particles absolute inset-0 opacity-30" /> : null}
      {isCloudy && !isHomeIdle ? <div className="cloud-layers absolute inset-0 opacity-56" /> : null}
      {isSnow && !isHomeIdle ? <div className="snow-particles absolute inset-0 opacity-40" /> : null}
      {!isHomeIdle ? <div className="grain-overlay absolute inset-0" /> : null}
      {isNight && performanceMode === 'full' && !isHomeIdle ? <div className="night-stars absolute inset-0 opacity-60" /> : null}
      {isRainy && !isHomeIdle && !suppressLineEffects ? <div className="rain-streaks absolute inset-0 opacity-30" /> : null}
      {enableCanvasRain && !isHomeIdle ? <canvas ref={canvasRef} className="absolute inset-0 opacity-40" /> : null}
    </div>
  );
}

export default WeatherAtmosphere;
