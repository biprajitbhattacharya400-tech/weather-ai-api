function DashboardView({ primaryLocation, totalSearches, recentSearches, uniqueCities }) {
  return (
    <section className="glass-lite w-full max-w-5xl rounded-[34px] p-6 shadow-ambient md:p-8">
      <div className="space-y-10">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-inkTertiary">Primary Tracked Location</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-inkPrimary md:text-4xl">{primaryLocation || 'No tracked location yet'}</h2>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-inkTertiary">Search Insights</p>
          <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3">
            <article>
              <p className="text-xs text-inkTertiary">Total Searches</p>
              <p className="mt-1 text-2xl font-medium text-inkPrimary">{totalSearches}</p>
            </article>
            <article>
              <p className="text-xs text-inkTertiary">Unique Cities</p>
              <p className="mt-1 text-2xl font-medium text-inkPrimary">{uniqueCities}</p>
            </article>
            <article className="col-span-2 md:col-span-1">
              <p className="text-xs text-inkTertiary">Recent Activity</p>
              <p className="mt-1 text-base font-medium text-inkSecondary">{recentSearches.length > 0 ? 'Active' : 'Waiting'}</p>
            </article>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-inkTertiary">Recent Searches</p>
          <div className="mt-4 space-y-2">
            {recentSearches.length === 0 ? (
              <p className="text-sm text-inkSecondary">No recent searches.</p>
            ) : (
              recentSearches.map((item, idx) => (
                <article key={`${item.city}-${idx}`} className="rounded-2xl bg-white/33 px-4 py-3">
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
