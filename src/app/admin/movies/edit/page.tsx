import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MovieAdminForm } from "@/components/admin/movie-admin-form";
import { updateMovieAction } from "@/app/admin/movies/actions";
import { toPublicMovie } from "@/lib/public-content";
import { findMovieByIdForAdmin } from "@/server/services/movies";

interface EditMoviePageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function EditMoviePage({
  searchParams,
}: EditMoviePageProps) {
  const { id } = await searchParams;
  const movie = id ? await findMovieByIdForAdmin(id) : null;

  if (!movie) {
    notFound();
  }

  const publicMovie = toPublicMovie(movie);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-400 dark:hover:text-indigo-300"
        href="/admin/movies"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to movies
      </Link>
      <MovieAdminForm
        action={updateMovieAction.bind(null, movie.id)}
        initialValues={{
          tmdbId: movie.tmdbId?.toString() ?? "",
          title: movie.title,
          overview: movie.overview,
          genres: movie.genres,
          releaseDate: movie.releaseDate?.toISOString().slice(0, 10) ?? "",
          posterPath: movie.posterPath ?? "",
          backdropPath: movie.backdropPath ?? "",
          runtimeMinutes: movie.runtimeMinutes?.toString() ?? "",
          originalLanguage: movie.originalLanguage ?? "",
        }}
        initialPreviewUrls={{
          poster: publicMovie.posterUrl,
          backdrop: publicMovie.backdropUrl,
        }}
        submitLabel="Save movie"
      />
    </div>
  );
}
