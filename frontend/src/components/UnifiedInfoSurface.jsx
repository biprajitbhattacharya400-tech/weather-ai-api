import TemperatureGraph from './TemperatureGraph';
import MetricsStrip from './MetricsStrip';
import Forecast5DayList from './Forecast5DayList';

function UnifiedInfoSurface({ graphPoints, metrics, daily }) {
  return (
    <section className="glass-lite h-full w-full rounded-[28px] p-7 shadow-ambient">
      <div className="space-y-9">
        <TemperatureGraph points={graphPoints} />
        <MetricsStrip metrics={metrics} />
        <Forecast5DayList daily={daily} />
      </div>
    </section>
  );
}

export default UnifiedInfoSurface;
