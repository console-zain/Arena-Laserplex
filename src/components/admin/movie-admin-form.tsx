"use client";

import { useActionState, useState, useTransition } from "react";
import type { AdminActionState } from "@/lib/admin-action-state";
import { fetchTmdbMovieAction } from "@/app/admin/movies/actions";
import { MediaImageField } from "@/components/admin/media-image-field";
import { getMovieImageUrl } from "@/lib/movie-images";

type MovieAction = (
  state: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

interface MovieAdminFormProps {
  action: MovieAction;
  initialValues?: Partial<MovieFormValues>;
  initialPreviewUrls?: {
    poster: string | null;
    backdrop: string | null;
  };
  submitLabel?: string;
}

interface MovieFormValues {
  tmdbId: string;
  title: string;
  overview: string;
  genres: string[];
  releaseDate: string;
  posterPath: string;
  backdropPath: string;
  runtimeMinutes: string;
  originalLanguage: string;
}

const initialFormValues: MovieFormValues = {
  tmdbId: "",
  title: "",
  overview: "",
  genres: [],
  releaseDate: "",
  posterPath: "",
  backdropPath: "",
  runtimeMinutes: "",
  originalLanguage: "",
};

const inputClassName =
  "mt-1.5 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";

export function MovieAdminForm({
  action,
  initialValues,
  initialPreviewUrls,
  submitLabel = "Save movie",
}: MovieAdminFormProps) {
  const [values, setValues] = useState({
    ...initialFormValues,
    ...Object.fromEntries(
      Object.entries(initialValues ?? {}).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
    genres: initialValues?.genres ?? [],
  });
  const [state, formAction, isSaving] = useActionState<AdminActionState, FormData>(
    action,
    {},
  );
  const [imagePreviews, setImagePreviews] = useState({
    poster:
      initialPreviewUrls?.poster ??
      getMovieImageUrl(initialValues?.posterPath ?? null),
    backdrop:
      initialPreviewUrls?.backdrop ??
      getMovieImageUrl(initialValues?.backdropPath ?? null, "original"),
  });
  const [genreOptions, setGenreOptions] = useState(initialValues?.genres ?? []);
  const [uploadingFields, setUploadingFields] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [isFetching, startFetching] = useTransition();

  function updateValue(name: keyof MovieFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function updateUploadingField(name: string, uploading: boolean) {
    setUploadingFields((current) =>
      uploading
        ? current.includes(name)
          ? current
          : [...current, name]
        : current.filter((fieldName) => fieldName !== name),
    );
  }

  function renderFieldError(name: keyof MovieFormValues) {
    const message = state.fieldErrors?.[name];
    return message ? (
      <p
        className="mb-0 mt-1.5 text-sm text-rose-600 dark:text-rose-400"
        id={`movie-${name}-error`}
      >
        {message}
      </p>
    ) : null;
  }

  function fetchFromTmdb() {
    setFetchError("");
    const formData = new FormData();
    formData.set("tmdbId", values.tmdbId);

    startFetching(async () => {
      const result = await fetchTmdbMovieAction(formData);
      if ("error" in result) {
        setFetchError(result.error);
        return;
      }

      setValues({
        tmdbId: String(result.movie.tmdbId),
        title: result.movie.title,
        overview: result.movie.overview,
        genres: result.movie.genres,
        releaseDate: result.movie.releaseDate,
        posterPath: result.movie.posterPath,
        backdropPath: result.movie.backdropPath,
        runtimeMinutes: result.movie.runtimeMinutes,
        originalLanguage: result.movie.originalLanguage,
      });
      setGenreOptions(result.movie.genres);
      setImagePreviews({
        poster: getMovieImageUrl(result.movie.posterPath),
        backdrop: getMovieImageUrl(result.movie.backdropPath, "original"),
      });
    });
  }

  return (
    <form
      action={formAction}
      className="admin-form-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 text-base font-semibold text-slate-900 dark:text-slate-100">
            Movie details
          </h2>
          <p className="mb-0 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Import movie details from TMDB, then review and save them locally.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <input
          name="genres"
          type="hidden"
          value={JSON.stringify(values.genres)}
        />
        <div>
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="movie-tmdb-id"
          >
            TMDB ID
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              aria-describedby={
                state.fieldErrors?.tmdbId ? "movie-tmdbId-error" : undefined
              }
              aria-invalid={Boolean(state.fieldErrors?.tmdbId)}
              className={`${inputClassName} mt-0`}
              id="movie-tmdb-id"
              inputMode="numeric"
              name="tmdbId"
              onChange={(event) => updateValue("tmdbId", event.target.value)}
              placeholder="e.g. 550"
              value={values.tmdbId}
            />
            <button
              className="shrink-0 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              disabled={isFetching || values.tmdbId.length === 0}
              onClick={fetchFromTmdb}
              type="button"
            >
              {isFetching ? "Fetching..." : "Fetch TMDB"}
            </button>
          </div>
          {renderFieldError("tmdbId")}
          {fetchError ? (
            <p className="mb-0 mt-2 text-sm text-rose-600" role="alert">
              {fetchError}
            </p>
          ) : null}
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="movie-title"
          >
            Title
          </label>
          <input
            aria-describedby={
              state.fieldErrors?.title ? "movie-title-error" : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.title)}
            className={inputClassName}
            id="movie-title"
            maxLength={200}
            name="title"
            onChange={(event) => updateValue("title", event.target.value)}
            required
            value={values.title}
          />
          {renderFieldError("title")}
        </div>

        <div className="sm:col-span-2">
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="movie-overview"
          >
            Overview
          </label>
          <textarea
            aria-describedby={
              state.fieldErrors?.overview ? "movie-overview-error" : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.overview)}
            className={`${inputClassName} min-h-32 resize-y`}
            id="movie-overview"
            maxLength={10000}
            name="overview"
            onChange={(event) => updateValue("overview", event.target.value)}
            required
            rows={5}
            value={values.overview}
          />
          {renderFieldError("overview")}
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Genres from TMDB
          </legend>
          {genreOptions.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {genreOptions.map((genre) => (
                <label
                  className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  key={genre}
                >
                  <input
                    checked={values.genres.includes(genre)}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        genres: event.target.checked
                          ? [...current.genres, genre]
                          : current.genres.filter(
                              (selectedGenre) => selectedGenre !== genre,
                            ),
                      }))
                    }
                    type="checkbox"
                    value={genre}
                  />
                  {genre}
                </label>
              ))}
            </div>
          ) : (
            <p className="mb-0 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Fetch a movie by TMDB ID to import its genres.
            </p>
          )}
          {renderFieldError("genres")}
        </fieldset>

        <div>
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="movie-release-date"
          >
            Release date
          </label>
          <input
            aria-describedby={
              state.fieldErrors?.releaseDate
                ? "movie-releaseDate-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.releaseDate)}
            className={inputClassName}
            id="movie-release-date"
            name="releaseDate"
            onChange={(event) => updateValue("releaseDate", event.target.value)}
            type="date"
            value={values.releaseDate}
          />
          {renderFieldError("releaseDate")}
        </div>
        <div>
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="movie-runtime"
          >
            Runtime (minutes)
          </label>
          <input
            aria-describedby={
              state.fieldErrors?.runtimeMinutes
                ? "movie-runtimeMinutes-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.runtimeMinutes)}
            className={inputClassName}
            id="movie-runtime"
            min="1"
            name="runtimeMinutes"
            onChange={(event) => updateValue("runtimeMinutes", event.target.value)}
            type="number"
            value={values.runtimeMinutes}
          />
          {renderFieldError("runtimeMinutes")}
        </div>
        <div>
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="movie-language"
          >
            Original language
          </label>
          <input
            aria-describedby={
              state.fieldErrors?.originalLanguage
                ? "movie-originalLanguage-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.originalLanguage)}
            className={inputClassName}
            id="movie-language"
            maxLength={10}
            name="originalLanguage"
            onChange={(event) =>
              updateValue("originalLanguage", event.target.value)
            }
            placeholder="e.g. en"
            value={values.originalLanguage}
          />
          {renderFieldError("originalLanguage")}
        </div>
        <MediaImageField
          category="movie-poster"
          label="Poster image"
          name="posterPath"
          onUploadingChange={updateUploadingField}
          onValueChange={(key, previewUrl) => {
            updateValue("posterPath", key);
            setImagePreviews((current) => ({ ...current, poster: previewUrl }));
          }}
          previewUrl={imagePreviews.poster}
          value={values.posterPath}
        />
        {renderFieldError("posterPath")}
        <MediaImageField
          category="movie-backdrop"
          label="Backdrop image"
          name="backdropPath"
          onUploadingChange={updateUploadingField}
          onValueChange={(key, previewUrl) => {
            updateValue("backdropPath", key);
            setImagePreviews((current) => ({ ...current, backdrop: previewUrl }));
          }}
          previewUrl={imagePreviews.backdrop}
          value={values.backdropPath}
        />
        {renderFieldError("backdropPath")}
      </div>

      {state.error ? (
        <p
          aria-live="polite"
          className="mb-0 mt-4 text-sm text-rose-600 dark:text-rose-400"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <div className="mt-5">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving || uploadingFields.length > 0}
          type="submit"
        >
          {isSaving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
