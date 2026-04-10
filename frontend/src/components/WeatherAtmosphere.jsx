const CONDITION_STYLES = {
  clear: 'from-[#c9dbf2] via-[#b9c9e5] to-[#aab2d1]',
  clouds: 'from-[#c6d2e2] via-[#b5bfd1] to-[#9da7bd]',
  rain: 'from-[#9db2cf] via-[#899dbf] to-[#7384a7]',
  thunderstorm: 'from-[#939ec2] via-[#808ab0] to-[#68739a]',
  snow: 'from-[#d5dfed] via-[#c4cfde] to-[#acb7ca]',
  night: 'from-[#7581ab] via-[#626d95] to-[#4f5a83]',
  default: 'from-[#c7d8ef] via-[#b6c4e1] to-[#a2adcf]',
};

const BLOOM_STYLES = {
  clear: 'bg-[radial-gradient(circle_at_48%_12%,rgba(255,255,255,0.52),transparent_45%)]',
  clouds: 'bg-[radial-gradient(circle_at_50%_9%,rgba(255,255,255,0.34),transparent_42%)]',
  rain: 'bg-[radial-gradient(circle_at_50%_8%,rgba(215,226,247,0.24),transparent_42%)]',
  thunderstorm: 'bg-[radial-gradient(circle_at_50%_8%,rgba(209,220,246,0.2),transparent_44%)]',
  snow: 'bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.48),transparent_47%)]',
  night: 'bg-[radial-gradient(circle_at_50%_8%,rgba(205,214,242,0.22),transparent_44%)]',
  default: 'bg-[radial-gradient(circle_at_50%_9%,rgba(255,255,255,0.3),transparent_46%)]',
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

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient} transition-colors duration-[1600ms]`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_84%,rgba(255,255,255,0.22),transparent_42%)]" />
      <div className="absolute -left-24 top-4 h-72 w-72 animate-drift rounded-full bg-white/28 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 animate-drift rounded-full bg-[#f8fbff]/34 blur-3xl" />
      <div className={`absolute inset-0 animate-breathe ${bloom}`} />
    </div>
  );
}

export default WeatherAtmosphere;
