function MetricsStrip({ metrics }) {
  return (
    <section>
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-inkTertiary">Now</p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        {metrics.map((metric) => (
          <article key={metric.label} className="min-w-0">
            <p className="text-xs font-medium text-inkTertiary">{metric.label}</p>
            <p className="mt-1 text-xl font-medium text-inkPrimary">{metric.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MetricsStrip;
