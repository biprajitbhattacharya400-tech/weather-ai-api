const resolveLayerMode = (condition = '') => {
  const c = String(condition).toLowerCase();
  if (c.includes('night')) return 'night';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('storm') || c.includes('thunder')) return 'rain';
  if (c.includes('cloud') || c.includes('mist') || c.includes('fog') || c.includes('overcast')) return 'cloudy';
  return 'sunny';
};

const resolveAqiMeta = (aqi) => {
  const safeAqi = Math.max(0, Math.round(Number(aqi) || 0));
  if (safeAqi <= 60) {
    return {
      label: 'Good',
      toneClass: 'aqi-good',
      pulse: false,
    };
  }

  if (safeAqi <= 120) {
    return {
      label: 'Moderate',
      toneClass: 'aqi-moderate',
      pulse: false,
    };
  }

  return {
    label: 'Poor',
    toneClass: 'aqi-poor',
    pulse: true,
  };
};

function ImmersiveConditionsBlock({ condition, windSpeed, rainChance, aqi }) {
  const layerMode = resolveLayerMode(condition);
  const normalizedRain = Math.max(0, Math.min(100, Math.round(Number(rainChance) || 0)));
  const normalizedWind = Math.max(0, Number(windSpeed) || 0);

  // Faster wind produces shorter loop duration to increase flow speed perception.
  const flowDuration = `${Math.max(4.2, 11.2 - normalizedWind * 0.52).toFixed(2)}s`;
  const flowAngle = `${Math.max(-12, Math.min(12, normalizedWind * 1.1 - 7)).toFixed(2)}deg`;
  const aqiMeta = resolveAqiMeta(aqi);

  return (
    <section
      className="conditions-shell scroll-reveal lg:hidden"
      style={{
        '--flow-duration': flowDuration,
        '--flow-angle': flowAngle,
      }}
      aria-label="Live weather conditions"
    >
      <div className={`conditions-bg layer-${layerMode}`} aria-hidden="true">
        <div className="conditions-gradient" />
        {layerMode === 'sunny' ? <div className="sun-bloom" /> : null}
        {layerMode === 'cloudy' ? (
          <>
            <div className="cloud-blob cloud-blob-a" />
            <div className="cloud-blob cloud-blob-b" />
          </>
        ) : null}
        {layerMode === 'rain' ? <div className="rain-lines" /> : null}
        {layerMode === 'night' ? <div className="night-points" /> : null}
      </div>

      <div className="conditions-foreground">
        <div className="conditions-header-row">
          <div className="conditions-live-label">
            <span className="conditions-live-dot" />
            <span>Live Conditions</span>
          </div>
          <div className={`aqi-chip ${aqiMeta.toneClass} ${aqiMeta.pulse ? 'aqi-chip-pulse' : ''}`}>
            <span className="aqi-chip-dot" />
            <span>{aqiMeta.label}</span>
            <span className="aqi-chip-value">AQI {Math.max(0, Math.round(Number(aqi) || 0))}</span>
          </div>
        </div>

        <div className="airflow-wrap" aria-hidden="true">
          <svg className="airflow-svg" viewBox="0 0 300 56" preserveAspectRatio="none">
            <path className="airflow-path path-one" d="M-10,15 C38,5 66,33 115,24 C170,14 205,36 260,26 C286,22 303,26 322,30" />
            <path className="airflow-path path-two" d="M-18,33 C32,22 70,48 123,37 C176,27 214,46 264,36 C288,32 304,36 326,42" />
            <path className="airflow-path path-three" d="M-26,50 C18,38 63,59 118,49 C171,39 214,55 270,46 C291,43 309,47 330,52" />
          </svg>
        </div>

        <div className="conditions-meta-row">
          <span className="wind-metric">Wind {Math.round(normalizedWind)} m/s</span>
          <span className="rain-metric">Rain chance {normalizedRain}%</span>
        </div>

        <div className="rain-progress-shell" role="meter" aria-valuenow={normalizedRain} aria-valuemin={0} aria-valuemax={100} aria-label="Rain probability">
          <div className={`rain-progress-fill ${normalizedRain > 50 ? 'rain-progress-high' : ''}`} style={{ width: `${normalizedRain}%` }} />
        </div>
      </div>
    </section>
  );
}

export default ImmersiveConditionsBlock;
