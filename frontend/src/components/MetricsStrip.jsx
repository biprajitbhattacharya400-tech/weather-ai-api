function MetricsStrip({ metrics }) {
  return (
    <section className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-inkTertiary">Now</p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        {metrics.map((metric) => (
          <article key={metric.label} className="min-w-0">
            <p className="text-[10px] font-semibold text-inkTertiary">{metric.label}</p>
            <p className="mt-1.5 text-lg font-bold text-inkPrimary">{metric.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MetricsStrip;
