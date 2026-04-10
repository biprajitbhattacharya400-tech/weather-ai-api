function MetricsStrip({ metrics }) {
  return (
    <section className="space-y-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-inkTertiary">Now</p>
      <div className="grid grid-cols-2 gap-x-10 gap-y-7">
        {metrics.map((metric) => (
          <article key={metric.label} className="min-w-0">
            <p className="text-xs font-medium text-inkTertiary">{metric.label}</p>
            <p className="mt-1 text-[22px] font-medium text-inkPrimary">{metric.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MetricsStrip;
