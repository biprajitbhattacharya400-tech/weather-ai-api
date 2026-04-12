import TemperatureGraph from './TemperatureGraph';
import MetricsStrip from './MetricsStrip';
import Forecast5DayList from './Forecast5DayList';

function UnifiedInfoSurface({ graphPoints, metrics, daily, showMetrics = true, className = '' }) {
  return (
    <section className={`glass-soft relative h-full w-full rounded-[34px] p-7 shadow-ambient ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-[34px] bg-[linear-gradient(160deg,rgba(198,220,255,0.12),transparent_46%)]" />
      <div className="relative space-y-13">
        <TemperatureGraph points={graphPoints} />
        {showMetrics ? <MetricsStrip metrics={metrics} /> : null}
        <Forecast5DayList daily={daily} />
      </div>
    </section>
  );
}

export default UnifiedInfoSurface;
