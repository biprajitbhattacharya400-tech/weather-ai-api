import { Cloud, CloudRain, CloudSnow, Sun } from 'lucide-react';

const iconByCondition = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return CloudRain;
  if (c.includes('snow')) return CloudSnow;
  if (c.includes('cloud') || c.includes('mist') || c.includes('fog')) return Cloud;
  return Sun;
};

function WeatherHero({ city, temperature, condition, tempMin, tempMax }) {
  const Icon = iconByCondition(condition);
  const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <section className="relative flex w-full max-w-xl flex-col items-center lg:items-start">
      <p className="text-sm font-medium tracking-wide text-inkSecondary/90">{city} · {now}</p>

      <div className="relative mt-6">
        <div className="absolute inset-0 -z-10 rounded-full bg-white/55 blur-3xl" />
        <h1 className="text-[94px] font-semibold leading-[0.92] tracking-[-0.04em] text-inkPrimary sm:text-[110px] md:text-[124px] lg:text-[132px]">
          {Math.round(temperature)}°
        </h1>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xl font-medium text-inkSecondary">
        <Icon size={20} strokeWidth={2} />
        <span>{condition || 'Clear'}</span>
      </div>

      <p className="mt-4 text-sm font-medium text-inkTertiary">
        H {Math.round(tempMax)}° · L {Math.round(tempMin)}°
      </p>
    </section>
  );
}

export default WeatherHero;
