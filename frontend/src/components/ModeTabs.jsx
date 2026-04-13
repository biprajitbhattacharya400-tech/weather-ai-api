function ModeTabs({ activeTab, onChange }) {
  const tabs = [
    { id: 'single', label: 'Single City' },
    { id: 'compare', label: 'Compare' },
    { id: 'dashboard', label: 'Dashboard' },
  ];

  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTab));

  return (
    <div
      className="tabs-shell glass-lite relative grid rounded-full p-1 shadow-ambient"
      style={{ '--tab-count': tabs.length, '--tab-index': activeIndex }}
    >
      <span
        aria-hidden="true"
        className="tabs-slide-indicator"
      />
      {tabs.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`soft-button tab-pill relative z-10 rounded-full px-4 py-2 text-sm transition-colors ${
              selected
                ? 'font-semibold text-slate-700'
                : 'font-medium text-white/74 hover:text-white'
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
