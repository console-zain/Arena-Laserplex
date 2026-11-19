import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clapperboard,
  FileText,
  Plus,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import type { DataTableColumn } from "@/components/admin/data-table";
import { StatsCard } from "@/components/admin/stats-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { db } from "@/lib/db";

interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  date: Date;
  Icon: LucideIcon;
  tone: string;
}

function formatDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(date)
    : "Not set";
}

export default async function AdminDashboardPage() {
  const [
    totalMovies,
    totalEvents,
    totalNews,
    totalPromotions,
    totalShowtimes,
    totalBookings,
    totalCustomers,
    latestMovies,
    recentBookings,
    recentEvents,
    recentNews,
  ] = await Promise.all([
    db.movie.count(),
    db.event.count(),
    db.news.count(),
    db.promotion.count(),
    db.showtime.count(),
    db.booking.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.movie.findMany({
      take: 3,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        releaseDate: true,
        status: true,
      },
    }),
    db.booking.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        bookingReference: true,
        createdAt: true,
        showtime: { select: { movie: { select: { title: true } } } },
      },
    }),
    db.event.findMany({
      take: 3,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, updatedAt: true, status: true },
    }),
    db.news.findMany({
      take: 3,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, updatedAt: true, status: true },
    }),
  ]);

  const movieColumns: readonly DataTableColumn<(typeof latestMovies)[number]>[] =
    [
      {
        key: "title",
        header: "Movie",
        render: (movie) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {movie.title}
          </span>
        ),
      },
      {
        key: "releaseDate",
        header: "Release date",
        render: (movie) => formatDate(movie.releaseDate),
      },
      {
        key: "status",
        header: "Status",
        render: (movie) => (
          <StatusBadge
            status={
              movie.status === "PUBLISHED"
                ? "Published"
                : movie.status === "ARCHIVED"
                  ? "Archived"
                  : "Draft"
            }
          />
        ),
      },
    ];

  const activity: ActivityItem[] = [
    ...recentBookings.map((booking) => ({
      id: `booking-${booking.id}`,
      title: "Booking received",
      detail: `${booking.bookingReference} · ${booking.showtime.movie.title}`,
      date: booking.createdAt,
      Icon: Ticket,
      tone: "text-sky-600 dark:text-sky-300",
    })),
    ...recentEvents.map((event) => ({
      id: `event-${event.id}`,
      title: `Event ${event.status === "PUBLISHED" ? "published" : "updated"}`,
      detail: event.title,
      date: event.updatedAt,
      Icon: CalendarDays,
      tone: "text-emerald-600 dark:text-emerald-300",
    })),
    ...recentNews.map((article) => ({
      id: `news-${article.id}`,
      title: `News ${article.status === "PUBLISHED" ? "published" : "updated"}`,
      detail: article.title,
      date: article.updatedAt,
      Icon: FileText,
      tone: "text-amber-600 dark:text-amber-300",
    })),
  ]
    .sort((left, right) => right.date.getTime() - left.date.getTime())
    .slice(0, 5);

  const quickActions = [
    { label: "Add a movie", href: "/admin/movies/create", Icon: Clapperboard },
    { label: "Review bookings", href: "/admin/bookings", Icon: Ticket },
    { label: "Manage events", href: "/admin/events", Icon: CalendarDays },
  ] as const;
  const stats = [
    { label: "Total movies", value: totalMovies, Icon: Clapperboard, tone: "indigo" as const },
    { label: "Total events", value: totalEvents, Icon: CalendarDays, tone: "emerald" as const },
    { label: "Total news", value: totalNews, Icon: FileText, tone: "amber" as const },
    { label: "Total promotions", value: totalPromotions, Icon: Ticket, tone: "sky" as const },
    { label: "Total showtimes", value: totalShowtimes, Icon: CalendarDays, tone: "indigo" as const },
    { label: "Total bookings", value: totalBookings, Icon: Ticket, tone: "emerald" as const },
    { label: "Total customers", value: totalCustomers, Icon: Users, tone: "amber" as const },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
            Overview of your cinema operations
          </p>
          <h2 className="mb-0 mt-1 text-xl font-semibold tracking-tight">
            Dashboard overview
          </h2>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Live database counts
        </span>
      </div>

      <section
        aria-label="Key metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map(({ label, value, Icon, tone }) => (
          <StatsCard
            detail="Current database count"
            Icon={Icon}
            key={label}
            label={label}
            tone={tone}
            value={value.toLocaleString("en")}
          />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <section aria-labelledby="latest-movies-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2
                className="m-0 text-base font-semibold"
                id="latest-movies-heading"
              >
                Latest movies
              </h2>
              <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
                Recently updated titles
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
              href="/admin/movies"
            >
              View all
              <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          </div>
          <DataTable
            columns={movieColumns}
            getRowId={(movie) => movie.id}
            rows={latestMovies}
            emptyMessage="No movies have been added."
          />
        </section>

        <section aria-labelledby="quick-actions-heading">
          <h2
            className="mb-4 mt-0 text-base font-semibold"
            id="quick-actions-heading"
          >
            Quick actions
          </h2>
          <div className="grid gap-3">
            {quickActions.map(({ label, href, Icon }) => (
              <Link
                className="group flex min-h-14 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5"
                href={href}
                key={href}
              >
                <span className="flex items-center gap-3 text-sm font-medium">
                  <Icon
                    aria-hidden="true"
                    className="text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-300"
                    size={18}
                  />
                  {label}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="text-slate-400"
                  size={16}
                />
              </Link>
            ))}
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              href="/admin/movies/create"
            >
              <Plus aria-hidden="true" size={16} />
              Create movie
            </Link>
          </div>
        </section>
      </div>

      <section aria-labelledby="recent-activity-heading">
        <div className="mb-4">
          <h2
            className="m-0 text-base font-semibold"
            id="recent-activity-heading"
          >
            Recent activity
          </h2>
          <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
            Latest database updates
          </p>
        </div>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/70">
          {activity.length ? (
            activity.map(({ id, title, detail, date, Icon, tone }) => (
              <article
                className="flex items-start gap-3 px-4 py-4 sm:items-center"
                key={id}
              >
                <span className={`mt-0.5 sm:mt-0 ${tone}`}>
                  <Icon aria-hidden="true" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-sm font-medium">{title}</p>
                  <p className="mb-0 mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {detail}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "UTC",
                  }).format(date)}
                </time>
              </article>
            ))
          ) : (
            <p className="m-0 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No recent activity is available.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
