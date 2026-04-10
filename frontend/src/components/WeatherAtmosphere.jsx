const CONDITION_STYLES = {
  clear: 'from-[#d5e6fb] via-[#c3d6ee] to-[#b4c3e0]',
  clouds: 'from-[#c7d1df] via-[#b5bece] to-[#9da8ba]',
  rain: 'from-[#8ea4c1] via-[#7d92b1] to-[#647695]',
  thunderstorm: 'from-[#7f8cad] via-[#6d799a] to-[#576284]',
  snow: 'from-[#dbe4f0] via-[#cdd8e7] to-[#b7c2d5]',
  night: 'from-[#2f3b67] via-[#283359] to-[#1f2748]',
  default: 'from-[#cddcf0] via-[#bccce5] to-[#aab8d5]',
};

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

function WeatherAtmosphere({ condition }) {
  const key = resolveCondition(condition);
  const gradient = CONDITION_STYLES[key] || CONDITION_STYLES.default;
  const bloom = BLOOM_STYLES[key] || BLOOM_STYLES.default;
  const isRainy = key === 'rain' || key === 'thunderstorm';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient} transition-all duration-[1800ms] ease-out`} />

      <div className="absolute inset-0 opacity-45 transition-opacity duration-[1500ms] bg-[radial-gradient(circle_at_14%_12%,rgba(255,255,255,0.2),transparent_44%)]" />
      <div className="atmo-blob absolute -left-24 -top-10 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_68%)]" />
      <div className="atmo-blob-slow absolute -right-28 bottom-[-4.5rem] h-[23rem] w-[23rem] rounded-full bg-[radial-gradient(circle,rgba(201,219,248,0.18),transparent_70%)]" />
      <div className="atmo-blob absolute right-[24%] top-[36%] h-[13rem] w-[13rem] rounded-full bg-[radial-gradient(circle,rgba(247,251,255,0.12),transparent_72%)]" />

      <div className={`absolute inset-0 animate-breathe ${bloom}`} />
      {isRainy ? <div className="rain-streaks absolute inset-0 opacity-30" /> : null}
    </div>
  );
}

export default WeatherAtmosphere;
