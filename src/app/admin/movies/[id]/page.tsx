import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { movieLanguageLabel } from "@/lib/movie-language";
import { toPublicMovie } from "@/lib/public-content";
import { movieIdSchema } from "@/server/validation/movies";
import { findMovieByIdForAdmin } from "@/server/services/movies";

interface AdminMovieDetailsPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(date)
    : "Not set";
}

export default async function AdminMovieDetailsPage({
  params,
}: AdminMovieDetailsPageProps) {
  const { id } = await params;
  const parsedId = movieIdSchema.safeParse(id);
  if (!parsedId.success) {
    notFound();
  }

  const movie = await findMovieByIdForAdmin(parsedId.data);
  if (!movie) {
    notFound();
  }

  const publicMovie = toPublicMovie(movie);
  const artworkUrl = publicMovie.backdropUrl ?? publicMovie.posterUrl;

  return (
    <article className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-slate-400 dark:hover:text-indigo-300"
          href="/admin/movies"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to movies
        </Link>
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          href={`/admin/movies/edit?id=${encodeURIComponent(movie.id)}`}
        >
          <Pencil aria-hidden="true" size={15} />
          Edit movie
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        {artworkUrl ? (
          <div className="relative aspect-[2/1] bg-slate-100 dark:bg-slate-950">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 960px"
              src={artworkUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9">
              <h2 className="mb-0 text-3xl font-semibold sm:text-5xl">
                {movie.title}
              </h2>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-9">
            <h2 className="m-0 text-3xl font-semibold">{movie.title}</h2>
          </div>
        )}

        <div className="grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_15rem] sm:p-9">
          <div>
            <h3 className="m-0 text-base font-semibold">Overview</h3>
            <p className="mb-0 mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
              {movie.overview || "No overview added."}
            </p>
          </div>
          <dl className="m-0 grid content-start gap-4 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-950/60">
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Release date
              </dt>
              <dd className="mb-0 mt-1 font-medium">{formatDate(movie.releaseDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Runtime
              </dt>
              <dd className="mb-0 mt-1 font-medium">
                {movie.runtimeMinutes
                  ? `${movie.runtimeMinutes} minutes`
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Genres
              </dt>
              <dd className="mb-0 mt-1 font-medium">
                {movie.genres.join(", ") || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Original language
              </dt>
              <dd className="mb-0 mt-1 font-medium">
                {movieLanguageLabel(movie.originalLanguage)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">TMDB ID</dt>
              <dd className="mb-0 mt-1 font-medium">{movie.tmdbId ?? "Not set"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Created
              </dt>
              <dd className="mb-0 mt-1 font-medium">{formatDate(movie.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </article>
  );
}
