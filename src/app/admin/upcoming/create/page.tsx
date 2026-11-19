import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createUpcomingMovieAction } from "@/app/admin/movies/actions";
import { MovieAdminForm } from "@/components/admin/movie-admin-form";

export default function CreateUpcomingMoviePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-400 dark:hover:text-indigo-300"
        href="/admin/upcoming"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to upcoming movies
      </Link>
      <div>
        <h2 className="m-0 text-xl font-semibold">Add upcoming movie</h2>
        <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add unreleased films confirmed for Arena Laserplex. Saving publishes
          the movie to the public Coming Soon page.
        </p>
      </div>
      <MovieAdminForm
        action={createUpcomingMovieAction}
        submitLabel="Add to upcoming"
      />
    </div>
  );
}
