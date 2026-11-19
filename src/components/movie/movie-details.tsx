import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Languages,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { MovieTrailer } from "@/components/movie/movie-trailer";
import { movieLanguageLabel } from "@/lib/movie-language";
import {
  ShowtimeCard,
  type PublicShowtime,
} from "@/components/movie/showtime-card";
import type { PublicMovie } from "@/types/public-movie";

interface MovieDetailsProps {
  movie: PublicMovie;
  showtimes: PublicShowtime[];
  youtubeKey: string | null;
}

interface ShowtimeDay {
  dateKey: string;
  date: Date;
  showtimes: PublicShowtime[];
}

function formatRuntime(runtime: number | null) {
  if (runtime === null || !Number.isFinite(runtime) || runtime <= 0) {
    return null;
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatReleaseDate(releaseDate: Date | null) {
  if (!releaseDate) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(releaseDate);
}

function groupShowtimesByUtcDate(showtimes: PublicShowtime[]): ShowtimeDay[] {
  const days = new Map<string, ShowtimeDay>();

  for (const showtime of showtimes) {
    const dateKey = showtime.startsAt.toISOString().slice(0, 10);
    const day = days.get(dateKey);

    if (day) {
      day.showtimes.push(showtime);
    } else {
      days.set(dateKey, {
        dateKey,
        date: new Date(`${dateKey}T00:00:00.000Z`),
        showtimes: [showtime],
      });
    }
  }

  return [...days.values()];
}

function formatShowtimeDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function MovieDetails({
  movie,
  showtimes,
  youtubeKey,
}: MovieDetailsProps) {
  const runtime = formatRuntime(movie.runtimeMinutes);
  const releaseDate = formatReleaseDate(movie.releaseDate);
  const showtimeDays = groupShowtimesByUtcDate(showtimes);
  const heroImage = movie.backdropUrl ?? movie.posterUrl;

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <section
        aria-labelledby="movie-title"
        className="movie-details-hero relative isolate flex min-h-[min(900px,100svh)] flex-col overflow-hidden bg-[var(--v3-canvas)]"
      >
        {heroImage ? (
          <Image
            alt=""
            className="object-cover object-center"
            fill
            priority
            sizes="100vw"
            src={heroImage}
          />
        ) : null}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, color-mix(in srgb, var(--v3-canvas) 98%, transparent) 0%, color-mix(in srgb, var(--v3-canvas) 86%, transparent) 52%, color-mix(in srgb, var(--v3-canvas) 18%, transparent) 100%), linear-gradient(0deg, var(--v3-canvas) 0%, transparent 62%)",
          }}
        />

        <Container className="relative z-10 flex flex-1 items-end pb-12 pt-32 sm:pb-16 lg:pb-20">
          <div className="movie-details-copy max-w-4xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--v3-accent-secondary)]">
              Arena Laserplex · The big screen
            </p>
            <h1
              className="text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[var(--v3-text-primary)] sm:text-6xl lg:text-7xl"
              id="movie-title"
            >
              {movie.title}
            </h1>

            <div
              aria-label="Movie details"
              className="movie-details-facts mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--v3-text-secondary)]"
            >
              {runtime ? (
                <span className="inline-flex items-center gap-2">
                  <Clock3 aria-hidden="true" size={16} />
                  {runtime}
                </span>
              ) : null}
              {releaseDate ? (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays aria-hidden="true" size={16} />
                  {releaseDate}
                </span>
              ) : null}
              {movie.originalLanguage ? (
                <span className="inline-flex items-center gap-2">
                  <Languages aria-hidden="true" size={16} />
                  {movieLanguageLabel(movie.originalLanguage)}
                </span>
              ) : null}
              {movie.genres.length > 0 ? (
                <span>{movie.genres.join(" · ")}</span>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="min-h-12 px-6" variant="primary">
                <Link href="#movie-showtimes">
                  Choose a Showtime <ArrowDown aria-hidden="true" size={16} />
                </Link>
              </Button>
              {youtubeKey ? (
                <Button asChild className="min-h-12 px-6" variant="outline">
                  <Link href="#movie-trailer">
                    Watch Trailer <ArrowUpRight aria-hidden="true" size={16} />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="movie-showtimes-title"
        className="py-12 sm:py-16"
        id="movie-showtimes"
      >
        <Container>
          <SectionTitle
            className="mb-7"
            eyebrow="Find your screening"
            subtitle="All screening times are shown in UTC."
            title="Choose a Showtime"
            titleId="movie-showtimes-title"
          />

          {showtimeDays.length > 0 ? (
            <div className="space-y-10">
              {showtimeDays.map((day) => (
                <section
                  aria-labelledby={`showtimes-${day.dateKey}`}
                  className="space-y-4"
                  key={day.dateKey}
                >
                  <h3
                    className="text-lg font-semibold tracking-[-0.02em] text-[var(--v3-text-primary)] sm:text-xl"
                    id={`showtimes-${day.dateKey}`}
                  >
                    {formatShowtimeDate(day.date)}
                  </h3>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {day.showtimes.map((showtime) => (
                      <ShowtimeCard key={showtime.id} showtime={showtime} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <Card className="p-6 sm:p-8">
              <p className="text-base font-medium text-[var(--v3-text-primary)]">
                There are no upcoming showtimes for this film.
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--v3-text-secondary)]">
                Check back soon or browse other movies currently on screen.
              </p>
              <Button asChild className="mt-5" variant="outline">
                <Link href="/movies">
                  Browse Movies <ArrowUpRight aria-hidden="true" size={16} />
                </Link>
              </Button>
            </Card>
          )}
        </Container>
      </section>

      <section
        aria-labelledby="movie-story-title"
        className="movie-details-story border-y border-[var(--v3-border)] bg-[var(--v3-surface)] py-12 sm:py-16"
      >
        <Container>
          <div className="grid items-start gap-8 md:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)] md:gap-12 lg:gap-16">
            {movie.posterUrl ? (
              <div className="movie-details-poster relative mx-auto aspect-[2/3] w-full max-w-[20rem] overflow-hidden rounded-[var(--v3-radius-feature)] border border-[var(--v3-border)] shadow-[var(--v3-shadow-medium)]">
                <Image
                  alt={`${movie.title} poster`}
                  className="object-cover"
                  fill
                  sizes="(max-width: 767px) 80vw, 320px"
                  src={movie.posterUrl}
                />
              </div>
            ) : null}
            <div className="max-w-3xl">
              <SectionTitle
                className="mb-5"
                eyebrow="The film"
                title="The Story"
                titleId="movie-story-title"
              />
              <p className="text-base leading-8 text-[var(--v3-text-secondary)]">
                {movie.overview || "More details about this film are coming soon."}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <div id="movie-trailer">
        <MovieTrailer youtubeKey={youtubeKey} movieTitle={movie.title} />
      </div>
    </main>
  );
}
