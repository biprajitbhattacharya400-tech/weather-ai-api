import { useEffect, useState } from 'react';

function CountUp({ value, duration = 620 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Math.max(0, Number(value || 0));
    const start = display;
    const delta = target - start;
    if (delta === 0) return undefined;

    const startedAt = performance.now();
    let frame = 0;

    const tick = (nowMs) => {
      const progress = Math.min(1, (nowMs - startedAt) / duration);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(start + delta * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
}

function DashboardView({ primaryLocation, totalSearches, recentSearches, uniqueCities }) {
  return (
    <section className="dashboard-view-root glass-strong fade-soft weather-refresh w-full max-w-5xl rounded-[34px] p-6 shadow-ambient md:p-8">
      <div className="space-y-10">
        <div className="section-enter">
          <p className="text-xs uppercase tracking-[0.16em] text-inkTertiary">Primary Tracked Location</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-inkPrimary md:text-4xl">{primaryLocation || 'No tracked location yet'}</h2>
        </div>

        <div className="section-enter" style={{ animationDelay: '90ms' }}>
          <p className="text-xs uppercase tracking-[0.16em] text-inkTertiary">Search Insights</p>
          <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3">
            <article className="dashboard-tile soft-hover-lift rounded-2xl px-4 py-3">
              <p className="text-xs text-inkTertiary">Total Searches</p>
              <p className="mt-1 text-2xl font-medium text-inkPrimary"><CountUp value={totalSearches} /></p>
            </article>
            <article className="dashboard-tile soft-hover-lift rounded-2xl px-4 py-3">
              <p className="text-xs text-inkTertiary">Unique Cities</p>
              <p className="mt-1 text-2xl font-medium text-inkPrimary"><CountUp value={uniqueCities} /></p>
            </article>
            <article className="dashboard-tile soft-hover-lift col-span-2 rounded-2xl px-4 py-3 md:col-span-1">
              <p className="text-xs text-inkTertiary">Recent Activity</p>
              <p className="mt-1 text-base font-medium text-inkSecondary">{recentSearches.length > 0 ? 'Active' : 'Waiting'}</p>
            </article>
          </div>
        </div>

        <div className="section-enter" style={{ animationDelay: '150ms' }}>
          <p className="text-xs uppercase tracking-[0.16em] text-inkTertiary">Recent Searches</p>
          <div className="mt-4 space-y-2">
            {recentSearches.length === 0 ? (
              <p className="text-sm text-inkSecondary">No recent searches.</p>
            ) : (
              recentSearches.map((item, idx) => (
                <article key={`${item.city}-${idx}`} className="dashboard-tile soft-hover-lift rounded-2xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-inkSecondary">{item.city}</p>
                    <p className="text-sm font-semibold text-inkPrimary">{Math.round(item.temperature)}°</p>
                  </div>
                  <p className="mt-1 text-xs text-inkTertiary">{item.condition}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardView;
