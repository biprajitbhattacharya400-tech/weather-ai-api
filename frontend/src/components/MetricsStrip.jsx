function MetricsStrip({ metrics }) {
  return (
    <section className="space-y-2.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-inkTertiary">Now</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="min-w-0">
            <p className="text-[9px] font-bold text-inkTertiary">{metric.label}</p>
            <p className="mt-1 text-base font-bold text-inkPrimary">{metric.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MetricsStrip;
