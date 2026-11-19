"use client";

import { Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface SearchFormProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchForm({
  onSearch,
  initialValue = "",
  debounceMs = 300,
  className,
}: SearchFormProps) {
  const [query, setQuery] = useState(initialValue);
  const inputId = useId();
  const debounceDelay =
    Number.isFinite(debounceMs) && debounceMs >= 0 ? debounceMs : 300;

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => onSearch(query.trim()),
      debounceDelay,
    );

    return () => window.clearTimeout(timeoutId);
  }, [debounceDelay, onSearch, query]);

  return (
    <form
      className={`relative flex min-h-12 items-center gap-3 rounded-sm border border-cinema-gold/60 bg-[var(--surface)] text-[var(--foreground)] shadow-sm transition-shadow focus-within:border-cinema-gold focus-within:shadow-[0_0_0_2px_rgb(212_175_55/16%)] ${className ?? ""}`}
      onSubmit={(event) => event.preventDefault()}
      role="search"
    >
      <label className="sr-only" htmlFor={inputId}>
        Search movies by title
      </label>
      <Search
        aria-hidden="true"
        className="ml-4 shrink-0 text-gold"
        size={20}
      />
      <input
        autoComplete="off"
        className="min-h-12 w-full min-w-0 border-0 bg-transparent font-sans text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus-visible:outline-none"
        id={inputId}
        name="query"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search movies by title"
        type="search"
        value={query}
      />
      {query ? (
        <button
          aria-label="Clear movie search"
          className="mr-1 inline-grid size-10 shrink-0 place-items-center rounded-full text-[var(--muted)] transition-colors hover:bg-cinema-gold/10 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-gold"
          onClick={() => setQuery("")}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>
      ) : null}
    </form>
  );
}
