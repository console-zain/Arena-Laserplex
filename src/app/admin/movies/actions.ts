"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminActionError, type AdminActionState } from "@/lib/admin-action-state";
import { requireAdmin } from "@/server/auth/guards";
import {
  createReleasedMovieRecord,
  createUpcomingMovieRecord,
  deleteMovieRecord,
  updateMovieRecord,
} from "@/server/services/movies";
import { getMovieDetails } from "@/services/movie-service";
import {
  movieIdSchema,
  movieRecordSchema,
  releasedMovieSchema,
  tmdbIdSchema,
  upcomingMovieSchema,
} from "@/server/validation/movies";

function refreshMoviePages() {
  revalidatePath("/");
  revalidatePath("/movies");
  revalidatePath("/movies-now-playing");
  revalidatePath("/movies-coming-soon");
  revalidatePath("/movies/[slug]", "page");
  revalidatePath("/admin/movies");
  revalidatePath("/admin/upcoming");
  revalidatePath("/admin/dashboard");
}

export async function createMovieAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();
  try {
    const input = releasedMovieSchema.parse(Object.fromEntries(formData));
    await createReleasedMovieRecord(input, session.user.id);
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshMoviePages();
  redirect("/admin/movies");
}

export async function createUpcomingMovieAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();
  try {
    const input = upcomingMovieSchema.parse(Object.fromEntries(formData));
    await createUpcomingMovieRecord(input, session.user.id);
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshMoviePages();
  redirect("/admin/upcoming");
}

export async function updateMovieAction(
  id: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  try {
    const movieId = movieIdSchema.parse(id);
    const input = movieRecordSchema.parse(Object.fromEntries(formData));
    await updateMovieRecord(movieId, input);
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshMoviePages();
  redirect("/admin/movies");
}

export async function fetchTmdbMovieAction(
  formData: FormData,
): Promise<
  | {
      movie: {
        tmdbId: number;
        title: string;
        overview: string;
        posterPath: string;
        backdropPath: string;
        releaseDate: string;
        runtimeMinutes: string;
        originalLanguage: string;
        genres: string[];
      };
    }
  | { error: string }
> {
  await requireAdmin();

  let tmdbId: number;
  try {
    tmdbId = tmdbIdSchema.parse(formData.get("tmdbId"));
  } catch (error) {
    const result = getAdminActionError(error);
    return { error: result.error ?? "Enter a valid TMDB ID." };
  }

  try {
    const movie = await getMovieDetails(tmdbId);
    return {
      movie: {
        tmdbId: movie.id,
        title: movie.title,
        overview: movie.overview,
        posterPath: movie.poster_path ?? "",
        backdropPath: movie.backdrop_path ?? "",
        releaseDate: movie.release_date ?? "",
        runtimeMinutes: movie.runtime ? String(movie.runtime) : "",
        originalLanguage: movie.original_language ?? "",
        genres: movie.genres.map((genre) => genre.name),
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function deleteMovieAction(
  id: string,
  _previousState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  try {
    await deleteMovieRecord(movieIdSchema.parse(id));
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshMoviePages();
  return {};
}
