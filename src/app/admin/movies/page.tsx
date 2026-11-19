import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import type { DataTableColumn } from "@/components/admin/data-table";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { deleteMovieAction } from "@/app/admin/movies/actions";
import { listAdminMovies } from "@/server/services/movies";

export const dynamic = "force-dynamic";

type MovieRow = Awaited<ReturnType<typeof listAdminMovies>>[number];

function formatDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(date)
    : "Not set";
}

const actionClassName =
  "text-xs font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-indigo-300";

export default async function AdminMoviesPage() {
  const movies = await listAdminMovies();
  const columns: readonly DataTableColumn<MovieRow>[] = [
    {
      key: "title",
      header: "Movie",
      render: (movie) => (
        <div>
          <p className="m-0 font-medium text-slate-900 dark:text-slate-100">
            {movie.title}
          </p>
          <p className="mb-0 mt-1 text-xs text-slate-500 dark:text-slate-400">
            {movie.tmdbId ? `TMDB ID ${movie.tmdbId}` : "No TMDB ID"}
          </p>
        </div>
      ),
    },
    {
      key: "releaseDate",
      header: "Release date",
      render: (movie) => formatDate(movie.releaseDate),
    },
    {
      key: "genres",
      header: "Genres",
      render: (movie) => movie.genres.join(", ") || "Not set",
    },
    {
      key: "actions",
      header: "Actions",
      render: (movie) => (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link className={actionClassName} href={`/admin/movies/${movie.id}`}>
            View
          </Link>
          <Link
            className={actionClassName}
            href={`/admin/movies/edit?id=${encodeURIComponent(movie.id)}`}
          >
            Edit
          </Link>
          <ConfirmDeleteButton
            action={deleteMovieAction.bind(null, movie.id)}
            confirmMessage={`Delete "${movie.title}" and any screenings without bookings? This cannot be undone.`}
            itemName={movie.title}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="m-0 text-xl font-semibold">Movie library</h2>
          <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
            Released movies only. Add unreleased films in the Upcoming library.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          href="/admin/movies/create"
        >
          <Plus aria-hidden="true" size={16} />
          Add movie
        </Link>
      </div>
      <DataTable
        columns={columns}
        getRowId={(movie) => movie.id}
        rows={movies}
        emptyMessage="No movies have been added to the database."
      />
    </div>
  );
}
