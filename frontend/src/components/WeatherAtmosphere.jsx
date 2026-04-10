const CONDITION_STYLES = {
  clear: 'from-[#c7dbf5] via-[#b8c5e8] to-[#a5a7ce]',
  clouds: 'from-[#c4d0e3] via-[#b4bed5] to-[#9ea7c0]',
  rain: 'from-[#a0b5d4] via-[#8e9fc1] to-[#7e88aa]',
  thunderstorm: 'from-[#97a1c4] via-[#848db0] to-[#70779b]',
  snow: 'from-[#d5deee] via-[#c4cfdf] to-[#aeb8cb]',
  night: 'from-[#7d87ad] via-[#6b7598] to-[#565e84]',
  default: 'from-[#c5d8f2] via-[#b4c2e2] to-[#a2abce]',
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

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient} transition-colors duration-700`} />
      <div className="absolute -left-16 top-10 h-64 w-64 animate-drift rounded-full bg-white/30 blur-3xl" />
      <div className="absolute -right-24 bottom-4 h-72 w-72 animate-drift rounded-full bg-[#f7fbff]/35 blur-3xl" />
      <div className="absolute inset-0 animate-breathe bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.33),transparent_48%)]" />
    </div>
  );
}

export default WeatherAtmosphere;
