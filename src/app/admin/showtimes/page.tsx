import Link from "next/link";
import { CalendarClock, Plus } from "lucide-react";
import { CancelShowtimeButton } from "@/components/admin/cancel-showtime-button";
import { ShowtimeForm } from "@/components/admin/showtime-form";
import { db } from "@/lib/db";
import { movieLanguageLabel } from "@/lib/movie-language";
import { listMoviesAvailableForShowtimes } from "@/server/services/movies";

export const dynamic = "force-dynamic";

function formatUtcDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function formatUtcTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function formatPrice(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.trim(),
  }).format(amountMinor / 100);
}

export default async function AdminShowtimesPage() {
  const now = new Date();
  const [movies, screens, showtimes] = await Promise.all([
    listMoviesAvailableForShowtimes(),
    db.screen.findMany({
      where: {
        isActive: true,
        seats: { some: { isActive: true } },
      },
      orderBy: { code: "asc" },
      select: { id: true, name: true, capacity: true },
    }),
    db.showtime.findMany({
      where: {
        status: "SCHEDULED",
        endsAt: { gt: now },
      },
      orderBy: { startsAt: "asc" },
      include: {
        movie: { select: { title: true, runtimeMinutes: true } },
        screen: { select: { name: true } },
      },
    }),
  ]);

  const movieOptions = movies.map((movie) => ({
    id: movie.id,
    name: movie.title,
    runtimeMinutes: movie.runtimeMinutes,
    originalLanguage: movie.originalLanguage,
  }));
  const screenOptions = screens.map((screen) => ({
    id: screen.id,
    name: screen.name,
    detail: `${screen.capacity} seats`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="m-0 text-xl font-semibold">Showtime schedule</h2>
          <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
            Schedule a movie, screen, and start time. End times use the movie
            runtime; all new ticket prices use LKR.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          href="/admin/screens"
        >
          <CalendarClock aria-hidden="true" size={16} />
          Screen inventory
        </Link>
      </div>

      {movies.length === 0 ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          No released movies are available for scheduling. Upcoming movies
          become available after their release date.
        </div>
      ) : screens.length === 0 ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          No active screen has seat inventory configured. Seed or activate a
          screen before scheduling.
        </div>
      ) : (
        <ShowtimeForm
          existingShowtimes={showtimes.map((showtime) => ({
            id: showtime.id,
            movieTitle: showtime.movie.title,
            screenId: showtime.screenId,
            startsAt: showtime.startsAt.toISOString(),
            endsAt: showtime.endsAt.toISOString(),
          }))}
          mode="create"
          movies={movieOptions}
          screens={screenOptions}
        />
      )}

      <section
        aria-labelledby="showtimes-list-title"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h3 className="m-0 text-base font-semibold" id="showtimes-list-title">
              All showtimes
            </h3>
            <p className="mb-0 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Upcoming scheduled shows · Times shown in UTC. Past shows remain
              in booking history and are hidden here.
            </p>
          </div>
          {movies.length > 0 && screens.length > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Plus aria-hidden="true" size={14} />
              New showtimes create seat inventory automatically
            </span>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5" scope="col">Movie</th>
                <th className="px-4 py-3.5" scope="col">Screen</th>
                <th className="px-4 py-3.5" scope="col">Language</th>
                <th className="px-4 py-3.5" scope="col">Date and time (UTC)</th>
                <th className="px-4 py-3.5" scope="col">Price</th>
                <th className="px-4 py-3.5 text-right" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {showtimes.length > 0 ? (
                showtimes.map((showtime) => (
                  <tr key={showtime.id}>
                    <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">
                      {showtime.movie.title}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {showtime.screen.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {movieLanguageLabel(showtime.language)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      <time dateTime={showtime.startsAt.toISOString()}>
                        {formatUtcDate(showtime.startsAt)}
                      </time>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {formatUtcTime(showtime.startsAt)} –{" "}
                        {formatUtcTime(showtime.endsAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatPrice(showtime.basePriceMinor, showtime.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          className="inline-flex min-h-9 items-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          href={`/admin/showtimes/${showtime.id}/edit`}
                        >
                          Edit
                        </Link>
                        {showtime.status === "SCHEDULED" ? (
                          <CancelShowtimeButton showtimeId={showtime.id} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    colSpan={6}
                  >
                    No showtimes have been scheduled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
