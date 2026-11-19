import Link from "next/link";
import { notFound } from "next/navigation";
import { ShowtimeForm } from "@/components/admin/showtime-form";
import { db } from "@/lib/db";
import { listMoviesAvailableForShowtimes } from "@/server/services/movies";

interface EditShowtimePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditShowtimePage({
  params,
}: EditShowtimePageProps) {
  const { id } = await params;
  const showtime = await db.showtime.findUnique({
    where: { id },
    include: {
      movie: {
        select: {
          title: true,
          runtimeMinutes: true,
          originalLanguage: true,
        },
      },
    },
  });

  if (!showtime) {
    notFound();
  }

  const [movies, screens, scheduledShowtimes] = await Promise.all([
    listMoviesAvailableForShowtimes(),
    db.screen.findMany({
      where: {
        OR: [{ isActive: true }, { id: showtime.screenId }],
      },
      orderBy: { code: "asc" },
      select: { id: true, name: true, capacity: true },
    }),
    db.showtime.findMany({
      where: {
        status: "SCHEDULED",
        endsAt: { gt: new Date() },
      },
      orderBy: { startsAt: "asc" },
      include: { movie: { select: { title: true } } },
    }),
  ]);

  const movieIsSchedulable = movies.some(
    (movie) => movie.id === showtime.movieId,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          className="text-sm font-medium text-indigo-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-300"
          href="/admin/showtimes"
        >
          Back to showtimes
        </Link>
        <h2 className="mb-0 mt-3 text-xl font-semibold">
          Edit {showtime.movie.title}
        </h2>
        <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
          End time is recalculated from the selected movie runtime. Screen
          inventory is refreshed only if the screen changes and no seats have
          been held or booked.
        </p>
      </div>
      {movieIsSchedulable ? (
        <ShowtimeForm
          initialValues={{
            showtimeId: showtime.id,
            movieId: showtime.movieId,
            screenId: showtime.screenId,
            date: showtime.startsAt.toISOString().slice(0, 10),
            startTime: showtime.startsAt.toISOString().slice(11, 16),
            language:
              showtime.language === showtime.movie.originalLanguage
                ? ""
                : showtime.language,
            price: (showtime.basePriceMinor / 100).toFixed(2),
          }}
          existingShowtimes={scheduledShowtimes.map((scheduledShowtime) => ({
            id: scheduledShowtime.id,
            movieTitle: scheduledShowtime.movie.title,
            screenId: scheduledShowtime.screenId,
            startsAt: scheduledShowtime.startsAt.toISOString(),
            endsAt: scheduledShowtime.endsAt.toISOString(),
          }))}
          mode="edit"
          movies={movies.map((movie) => ({
            id: movie.id,
            name: movie.title,
            runtimeMinutes: movie.runtimeMinutes,
            originalLanguage: movie.originalLanguage,
          }))}
          screens={screens.map((screen) => ({
            id: screen.id,
            name: screen.name,
            detail: `${screen.capacity} seats`,
          }))}
        />
      ) : (
        <p
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
          role="status"
        >
          This showtime’s movie is not eligible for scheduling. Only published,
          released movies are available here. Return to the showtime schedule to
          cancel it if necessary.
        </p>
      )}
    </div>
  );
}
