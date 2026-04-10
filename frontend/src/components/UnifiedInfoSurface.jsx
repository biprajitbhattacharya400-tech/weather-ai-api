import TemperatureGraph from './TemperatureGraph';
import MetricsStrip from './MetricsStrip';
import Forecast5DayList from './Forecast5DayList';

function UnifiedInfoSurface({ graphPoints, metrics, daily }) {
  return (
    <section className="glass-lite relative h-full w-full rounded-[34px] p-8 shadow-ambient">
      <div className="pointer-events-none absolute inset-0 rounded-[34px] bg-[linear-gradient(160deg,rgba(255,255,255,0.25),transparent_46%)]" />
      <div className="relative space-y-11">
        <TemperatureGraph points={graphPoints} />
        <MetricsStrip metrics={metrics} />
        <Forecast5DayList daily={daily} />
      </div>
    </section>
  );
}

export default UnifiedInfoSurface;
