import type { Prisma } from "@prisma/client";
import { slugify } from "@/lib/slug";
import { toPublicMovie } from "@/lib/public-content";
import {
  createMovie,
  deleteMovieWithUnusedShowtimes,
  findMovieById,
  listMovies,
  updateMovie,
} from "@/server/repositories/movies";
import {
  ContentServiceError,
  rethrowContentMutationError,
} from "@/server/services/content-errors";
import type { MovieFormInput } from "@/server/validation/movies";

export function listAdminMovies() {
  const now = new Date();
  return listMovies({
    where: {
      status: "PUBLISHED",
      releaseDate: { lte: now },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function listAdminUpcomingMovies() {
  return listMovies({
    where: {
      releaseDate: { gt: new Date() },
      status: "PUBLISHED",
    },
    orderBy: [{ releaseDate: "asc" }, { title: "asc" }],
  });
}

export function listMoviesAvailableForShowtimes() {
  const now = new Date();
  return listMovies({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: now },
      releaseDate: { lte: now },
    },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      runtimeMinutes: true,
      originalLanguage: true,
    },
  });
}

function publicMovieShowtimes(now: Date) {
  return {
    where: {
      status: "SCHEDULED" as const,
      startsAt: { gt: now },
      screen: { is: { isActive: true } },
    },
    select: { language: true },
  };
}

function mapMoviesWithScreeningLanguages(
  movies: Array<
    Prisma.MovieGetPayload<object> & {
      showtimes: Array<{ language: string }>;
    }
  >,
) {
  return movies.map(({ showtimes, ...movie }) =>
    toPublicMovie(
      movie,
      [...new Set(showtimes.map((showtime) => showtime.language))],
    ),
  );
}

export function listPublishedMovies() {
  const now = new Date();
  return listMovies({
    where: { status: "PUBLISHED", publishedAt: { lte: now } },
    include: { showtimes: publicMovieShowtimes(now) },
    orderBy: [{ releaseDate: "desc" }, { title: "asc" }],
  }).then(mapMoviesWithScreeningLanguages);
}

export function findPublishedMovieBySlug(slug: string) {
  return listMovies({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    take: 1,
  }).then((movies) => (movies[0] ? toPublicMovie(movies[0]) : null));
}

export function listPublishedNowShowingMovies(take?: number) {
  const now = new Date();
  return listMovies({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: now },
      releaseDate: { lte: now },
    },
    include: { showtimes: publicMovieShowtimes(now) },
    orderBy: { releaseDate: "desc" },
    ...(take ? { take } : {}),
  }).then(mapMoviesWithScreeningLanguages);
}

export function listPublishedComingSoonMovies(take?: number) {
  const now = new Date();
  return listMovies({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: now },
      releaseDate: { gt: now },
    },
    include: { showtimes: publicMovieShowtimes(now) },
    orderBy: { releaseDate: "asc" },
    ...(take ? { take } : {}),
  }).then(mapMoviesWithScreeningLanguages);
}

export function findMovieByIdForAdmin(id: string) {
  return findMovieById(id);
}

function movieSlug(title: string, tmdbId: number | null) {
  const base = slugify(title);
  return tmdbId ? `${base}-${tmdbId}` : base;
}

async function insertMovieRecord(
  input: MovieFormInput,
  adminId: string,
  publish = false,
) {
  try {
    return await createMovie({
      slug: movieSlug(input.title, input.tmdbId),
      title: input.title,
      tmdbId: input.tmdbId,
      overview: input.overview,
      genres: input.genres,
      releaseDate: input.releaseDate,
      posterPath: input.posterPath,
      backdropPath: input.backdropPath,
      runtimeMinutes: input.runtimeMinutes,
      originalLanguage: input.originalLanguage,
      tmdbSyncedAt: input.tmdbId ? new Date() : null,
      ...(publish
        ? { status: "PUBLISHED" as const, publishedAt: new Date() }
        : {}),
      createdBy: { connect: { id: adminId } },
    });
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function createReleasedMovieRecord(
  input: MovieFormInput,
  adminId: string,
) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (!input.releaseDate || input.releaseDate > today) {
    throw new ContentServiceError(
      "Released movies need a release date of today or earlier. Add future releases under Upcoming.",
    );
  }

  return insertMovieRecord(input, adminId, true);
}

export async function createUpcomingMovieRecord(
  input: MovieFormInput,
  adminId: string,
) {
  if (!input.releaseDate || input.releaseDate <= new Date()) {
    throw new ContentServiceError(
      "Upcoming movies must have a future release date.",
    );
  }

  return insertMovieRecord(input, adminId, true);
}

export async function updateMovieRecord(
  id: string,
  input: MovieFormInput,
) {
  if (!input.releaseDate) {
    throw new ContentServiceError("Enter a release date.");
  }

  try {
    return await updateMovie(
      { id },
      {
        slug: movieSlug(input.title, input.tmdbId),
        title: input.title,
        tmdbId: input.tmdbId,
        overview: input.overview,
        genres: input.genres,
        releaseDate: input.releaseDate,
        posterPath: input.posterPath,
        backdropPath: input.backdropPath,
        runtimeMinutes: input.runtimeMinutes,
        originalLanguage: input.originalLanguage,
        tmdbSyncedAt: input.tmdbId ? new Date() : null,
      },
    );
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function deleteMovieRecord(id: string) {
  const result = await deleteMovieWithUnusedShowtimes(id);
  if (result === "not-found") {
    throw new ContentServiceError("Movie not found.");
  }
  if (result === "has-bookings") {
    throw new ContentServiceError(
      "This movie has bookings and cannot be deleted without removing booking history.",
    );
  }
}
