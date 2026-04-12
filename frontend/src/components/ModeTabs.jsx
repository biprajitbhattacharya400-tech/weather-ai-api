function ModeTabs({ activeTab, onChange }) {
  const tabs = [
    { id: 'single', label: 'Single City' },
    { id: 'compare', label: 'Compare' },
    { id: 'dashboard', label: 'Dashboard' },
  ];

  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTab));
  const slideWidth = 100 / tabs.length;

  return (
    <div className="tabs-shell glass-lite relative inline-flex rounded-full p-1.5 shadow-ambient">
      <span
        aria-hidden="true"
        className="tabs-slide-indicator"
        style={{ width: `${slideWidth}%`, transform: `translateX(${activeIndex * 100}%)` }}
      />
      {tabs.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`soft-button tab-pill relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selected
                ? 'text-inkPrimary'
                : 'text-inkSecondary hover:bg-white/30 hover:text-inkPrimary'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default ModeTabs;
