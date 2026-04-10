function highlightMatch(text, query) {
  if (!query) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index < 0) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <span className="font-semibold text-inkPrimary">{match}</span>
      {after}
    </>
  );
}

function CitySearchBox({
  value,
  onChange,
  onSubmit,
  onSuggestionPick,
  onKeyDown,
  suggestions,
  showSuggestions,
  loading,
  placeholder,
  large = false,
}) {
  return (
    <div className="relative w-full">
      <form onSubmit={onSubmit} className={`glass-lite flex w-full items-center gap-3 rounded-full shadow-ambient ${large ? 'px-4 py-3.5' : 'px-3 py-2'}`}>
        <input
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`w-full bg-transparent text-inkPrimary placeholder:text-inkTertiary focus:outline-none ${large ? 'px-2 text-lg font-medium' : 'px-2 text-sm font-medium'}`}
          aria-label="City search"
        />
        <button
          type="submit"
          className={`rounded-full bg-white/72 font-semibold text-inkSecondary transition hover:bg-white ${large ? 'px-6 py-2.5 text-sm' : 'px-4 py-2 text-sm'}`}
        >
          {loading ? 'Loading' : 'Search'}
        </button>
      </form>

      {showSuggestions ? (
        <div className="autocomplete-pop glass-lite absolute left-0 right-0 top-[calc(100%+12px)] z-30 overflow-hidden rounded-3xl py-2 shadow-ambient">
          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <button
                key={`${item.name}-${item.country}-${item.lat}-${item.lon}`}
                type="button"
                onClick={() => onSuggestionPick(item)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/28"
              >
                <span className="text-sm text-inkSecondary">
                  {highlightMatch(item.name, value)}
                </span>
                <span className="text-xs uppercase tracking-[0.12em] text-inkTertiary">
                  {item.country || '--'}
                </span>
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-inkTertiary">No matches found</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default CitySearchBox;
