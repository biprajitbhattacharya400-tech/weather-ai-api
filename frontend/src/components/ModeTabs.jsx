function ModeTabs({ activeTab, onChange }) {
  const tabs = [
    { id: 'single', label: 'Single City' },
    { id: 'compare', label: 'Compare' },
    { id: 'dashboard', label: 'Dashboard' },
  ];

  return (
    <div className="glass-lite inline-flex rounded-full p-1.5 shadow-ambient">
      {tabs.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`soft-button rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selected
                ? 'bg-white/75 text-inkPrimary'
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
