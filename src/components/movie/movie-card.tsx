import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Film } from "lucide-react";
import { Button } from "@/components/common/button";
import { movieLanguageSummary } from "@/lib/movie-language";

export type MovieCardVariant = "catalog" | "now-showing" | "coming-soon";

export interface MovieCardMovie {
  id: string;
  slug: string;
  title: string;
  genres: readonly string[];
  posterUrl: string | null;
  rating?: number | null;
  releaseDate?: Date | null;
  runtimeMinutes?: number | null;
  originalLanguage?: string | null;
  screeningLanguages?: readonly string[];
}

interface MovieCardProps {
  movie: MovieCardMovie;
  variant?: MovieCardVariant;
}

function formatReleaseDate(releaseDate: Date | null | undefined) {
  if (!releaseDate) {
    return "Release date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(releaseDate);
}

function formatRuntime(runtime: number | null | undefined) {
  if (
    runtime === null ||
    runtime === undefined ||
    !Number.isFinite(runtime) ||
    runtime <= 0
  ) {
    return null;
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function MovieCard({ movie, variant = "catalog" }: MovieCardProps) {
  const movieHref = `/movies/${movie.slug}`;
  const isUnreleased =
    movie.releaseDate !== null &&
    movie.releaseDate !== undefined &&
    movie.releaseDate > new Date();
  const actionHref = isUnreleased ? movieHref : `${movieHref}#movie-showtimes`;
  const runtime = formatRuntime(movie.runtimeMinutes);
  const languageSummary = movieLanguageSummary(
    movie.screeningLanguages ?? [],
    movie.originalLanguage ?? null,
  );
  const releaseDate = formatReleaseDate(movie.releaseDate);
  const releaseYear = movie.releaseDate?.getUTCFullYear();

  return (
    <article className="movie-card group min-w-0 w-full">
      <div className="movie-card-poster poster-frame relative aspect-[2/3] overflow-hidden rounded-[var(--v3-radius-card)] border border-[var(--v3-border)] bg-[var(--v3-surface)]">
        {movie.posterUrl ? (
          <Image
            alt=""
            className="movie-card-image object-cover transition-transform duration-[242ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-focus-within:scale-[1.04] motion-reduce:transition-none"
            fill
            sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, (max-width: 1279px) 23vw, 18vw"
            src={movie.posterUrl}
          />
        ) : (
          <div
            aria-label={`${movie.title} poster artwork`}
            className="movie-card-artwork"
            role="img"
          >
            <Film aria-hidden="true" size={38} />
            <span>{movie.title}</span>
          </div>
        )}

        <Link
          aria-label={`View details for ${movie.title}`}
          className="movie-card-poster-link absolute inset-0 z-[1]"
          href={movieHref}
        />

        <div className="movie-card-overlay">
          <div className="movie-card-overlay-copy">
            <h3 className="movie-card-heading">{movie.title}</h3>
            {movie.genres.length > 0 ? (
              <p className="movie-card-metadata movie-card-overlay-genres">
                {releaseYear && variant !== "coming-soon"
                  ? `${releaseYear} · `
                  : ""}
                {movie.genres.slice(0, 2).join(" · ")}
              </p>
            ) : null}
            {movie.genres.length === 0 &&
            releaseYear &&
            variant !== "coming-soon" ? (
              <p className="movie-card-metadata movie-card-overlay-year">
                {releaseYear}
              </p>
            ) : null}
            {variant === "now-showing" && movie.rating != null ? (
              <p className="movie-card-overlay-rating">{movie.rating.toFixed(1)}</p>
            ) : null}
            {variant === "now-showing" ? (
              <Button
                asChild
                className="movie-card-action pointer-events-auto mt-2 w-full justify-between px-3 sm:px-4"
                variant="primary"
              >
                <Link href={actionHref}>
                  <span>Book Tickets</span>
                  <ArrowUpRight aria-hidden="true" size={16} />
                </Link>
              </Button>
            ) : null}
            {variant === "coming-soon" ? (
              <time
                className="movie-card-metadata movie-card-overlay-date"
                dateTime={movie.releaseDate?.toISOString().slice(0, 10)}
              >
                {releaseDate}
              </time>
            ) : null}
            {variant === "catalog" ? (
              <>
                <p className="movie-card-metadata">
                  {releaseDate}
                  {runtime ? ` · ${runtime}` : ""}
                </p>
                {languageSummary ? (
                  <p className="movie-card-metadata">{languageSummary}</p>
                ) : null}
                <Button
                  asChild
                  className="movie-card-action pointer-events-auto mt-2 w-full justify-between px-3 sm:px-4"
                  variant="primary"
                >
                  <Link href={actionHref}>
                    <span>
                      {isUnreleased ? "Coming Soon" : "Book Tickets"}
                    </span>
                    <ArrowUpRight aria-hidden="true" size={16} />
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
