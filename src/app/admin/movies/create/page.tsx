import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MovieAdminForm } from "@/components/admin/movie-admin-form";
import { createMovieAction } from "@/app/admin/movies/actions";

export default function CreateMoviePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-400 dark:hover:text-indigo-300"
        href="/admin/movies"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to movies
      </Link>
      <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
        This library is for movies released today or earlier. Add unreleased
        films from Upcoming.
      </p>
      <MovieAdminForm action={createMovieAction} submitLabel="Create movie" />
    </div>
  );
}
