"use client";

import { useCallback, useMemo, useState } from "react";
import { Container } from "@/components/common/container";
import { SearchForm } from "@/components/forms/search-form";
import { MovieGrid } from "@/components/movie/movie-grid";
import { movieLanguageLabel } from "@/lib/movie-language";
import type { PublicMovie } from "@/types/public-movie";

type MovieSort = "release-date-desc" | "release-date-asc" | "title";

interface MovieFiltersProps {
  movies: PublicMovie[];
}

export function MovieFilters({ movies }: MovieFiltersProps) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [sort, setSort] = useState<MovieSort>("release-date-desc");

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const languages = useMemo(() => {
    const codes = new Set(
      movies
        .map((movie) => movie.originalLanguage)
        .filter((code): code is string => Boolean(code)),
    );

    return Array.from(codes)
      .map((code) => ({ code, name: movieLanguageLabel(code) }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [movies]);

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase();

    return movies
      .filter((movie) =>
        movie.title.toLocaleLowerCase().includes(normalizedQuery),
      )
      .filter(
        (movie) =>
          language === "all" || movie.originalLanguage === language,
      )
      .sort((left, right) => {
        if (sort === "title") {
          return left.title.localeCompare(right.title);
        }

        const leftDate = left.releaseDate?.getTime() ?? 0;
        const rightDate = right.releaseDate?.getTime() ?? 0;
        return sort === "release-date-desc"
          ? rightDate - leftDate
          : leftDate - rightDate;
      });
  }, [language, movies, query, sort]);

  const hasActiveFilters = query.length > 0 || language !== "all";

  return (
    <Container className="pb-16 pt-6 sm:pb-24 sm:pt-8">
      <section
        aria-label="Search and filter movies"
        className="movie-catalog-controls"
      >
        <SearchForm
          className="movie-catalog-search"
          onSearch={handleSearch}
        />
        <div
          aria-label="Filter and sort movies"
          className="movie-catalog-filters"
          role="group"
        >
          <div className="movie-catalog-filter">
            <label
              className="text-sm font-medium text-[var(--v3-text-secondary)]"
              htmlFor="movie-language"
            >
              Language
            </label>
            <select
              className="min-h-11 rounded-sm border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-gold"
              id="movie-language"
              onChange={(event) => setLanguage(event.target.value)}
              value={language}
            >
              <option value="all">All languages</option>
              {languages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="movie-catalog-filter">
            <label
              className="text-sm font-medium text-[var(--v3-text-secondary)]"
              htmlFor="movie-sort"
            >
              Sort by
            </label>
            <select
              className="min-h-11 rounded-sm border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinema-gold"
              id="movie-sort"
              onChange={(event) => {
                if (
                  event.target.value === "title" ||
                  event.target.value === "release-date-asc" ||
                  event.target.value === "release-date-desc"
                ) {
                  setSort(event.target.value);
                }
              }}
              value={sort}
            >
              <option value="release-date-desc">Newest release</option>
              <option value="release-date-asc">Oldest release</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </section>

      <div className="movie-catalog-results">
        <p aria-live="polite" className="text-sm text-[var(--muted)]">
          {filteredMovies.length}{" "}
          {filteredMovies.length === 1 ? "movie" : "movies"}
        </p>
        <MovieGrid
          emptyMessage={
            hasActiveFilters
              ? "No published movies match these filters. Try changing your search or language."
              : "No published movies are available right now. Please check back soon."
          }
          movies={filteredMovies}
        />
      </div>
    </Container>
  );
}
