import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search movies and TV shows...',
  autoFocus = false,
  className = '',
}) {
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(value);
      }}
      className={`relative flex items-center ${className}`}
    >
      <Search className="pointer-events-none absolute left-4 h-5 w-5 text-white/50" aria-hidden="true" />
      <input
        type="text"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search movies and TV shows"
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck="false"
        className="w-full rounded-full border border-white/15 bg-white/10 py-3 pl-12 pr-12 text-base text-white placeholder-white/40 outline-none backdrop-blur transition focus:border-brand focus:bg-white/15 focus:ring-2 focus:ring-brand/40"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
