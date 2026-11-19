"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  createShowtimeAction,
  updateShowtimeAction,
  type ShowtimeActionState,
} from "@/app/admin/showtimes/actions";
import { movieLanguageLabel } from "@/lib/movie-language";

export interface ShowtimeFormOption {
  id: string;
  name: string;
  detail?: string;
  runtimeMinutes?: number | null;
  originalLanguage?: string | null;
}

export interface ShowtimeFormValues {
  showtimeId?: string;
  movieId: string;
  screenId: string;
  date: string;
  startTime: string;
  language?: string;
  price: string;
}

export interface ExistingShowtime {
  id: string;
  movieTitle: string;
  screenId: string;
  startsAt: string;
  endsAt: string;
}

interface ShowtimeFormProps {
  mode: "create" | "edit";
  movies: readonly ShowtimeFormOption[];
  screens: readonly ShowtimeFormOption[];
  existingShowtimes: readonly ExistingShowtime[];
  initialValues?: ShowtimeFormValues;
}

const initialState: ShowtimeActionState = {};

const fieldClassName =
  "mt-1.5 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      className="text-sm font-medium text-slate-700 dark:text-slate-300"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

function formatUtcDateTime(date: Date) {
  return `${new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date)} UTC`;
}

export function ShowtimeForm({
  mode,
  movies,
  screens,
  existingShowtimes,
  initialValues,
}: ShowtimeFormProps) {
  const action = mode === "create" ? createShowtimeAction : updateShowtimeAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [values, setValues] = useState({
    movieId: initialValues?.movieId ?? movies[0]?.id ?? "",
    screenId: initialValues?.screenId ?? screens[0]?.id ?? "",
    date: initialValues?.date ?? "",
    startTime: initialValues?.startTime ?? "",
    language: initialValues?.language ?? "",
    price: initialValues?.price ?? "",
  });
  const [editedFields, setEditedFields] = useState<string[]>([]);
  const selectedMovie = movies.find((movie) => movie.id === values.movieId);
  const runtime = selectedMovie?.runtimeMinutes;
  const startsAt =
    values.date && values.startTime
      ? new Date(`${values.date}T${values.startTime}:00.000Z`)
      : null;
  const endsAt =
    startsAt && runtime && !Number.isNaN(startsAt.getTime())
      ? new Date(startsAt.getTime() + runtime * 60_000)
      : null;
  const overlap =
    startsAt && endsAt
      ? existingShowtimes.find((showtime) => {
          if (
            showtime.id === initialValues?.showtimeId ||
            showtime.screenId !== values.screenId
          ) {
            return false;
          }

          return (
            startsAt < new Date(showtime.endsAt) &&
            endsAt > new Date(showtime.startsAt)
          );
        })
      : undefined;

  function updateValue(name: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setEditedFields((current) =>
      current.includes(name) ? current : [...current, name],
    );
  }

  function fieldError(name: string) {
    return editedFields.includes(name) ? undefined : state.fieldErrors?.[name];
  }

  return (
    <form
      action={formAction}
      className="admin-form-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-6"
    >
      <div>
        <h3 className="m-0 text-base font-semibold">
          {mode === "create" ? "Schedule a showtime" : "Edit showtime"}
        </h3>
        <p className="mb-0 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Choose a movie, screen, date, and start time. End time is calculated
          from the movie runtime. Times are entered in UTC.
        </p>
      </div>
      {mode === "edit" && initialValues?.showtimeId ? (
        <input
          name="showtimeId"
          type="hidden"
          value={initialValues.showtimeId}
        />
      ) : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <FieldLabel htmlFor={`showtime-${mode}-movie`}>Movie</FieldLabel>
          <select
            aria-invalid={Boolean(fieldError("movieId"))}
            className={fieldClassName}
            id={`showtime-${mode}-movie`}
            name="movieId"
            onChange={(event) => updateValue("movieId", event.target.value)}
            required
            value={values.movieId}
          >
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.name}
                {movie.runtimeMinutes
                  ? ` · ${movie.runtimeMinutes} min`
                  : " · Runtime missing"}
              </option>
            ))}
          </select>
          {fieldError("movieId") ? (
            <p className="mb-0 mt-1.5 text-sm text-rose-600" role="alert">
              {fieldError("movieId")}
            </p>
          ) : null}
        </div>
        <div>
          <FieldLabel htmlFor={`showtime-${mode}-screen`}>Screen</FieldLabel>
          <select
            aria-invalid={Boolean(fieldError("screenId"))}
            className={fieldClassName}
            id={`showtime-${mode}-screen`}
            name="screenId"
            onChange={(event) => updateValue("screenId", event.target.value)}
            required
            value={values.screenId}
          >
            {screens.map((screen) => (
              <option key={screen.id} value={screen.id}>
                {screen.name}
                {screen.detail ? ` · ${screen.detail}` : ""}
              </option>
            ))}
          </select>
          {fieldError("screenId") ? (
            <p className="mb-0 mt-1.5 text-sm text-rose-600" role="alert">
              {fieldError("screenId")}
            </p>
          ) : null}
        </div>
        <div>
          <FieldLabel htmlFor={`showtime-${mode}-date`}>Date (UTC)</FieldLabel>
          <input
            aria-invalid={Boolean(fieldError("date"))}
            className={fieldClassName}
            id={`showtime-${mode}-date`}
            name="date"
            onChange={(event) => updateValue("date", event.target.value)}
            required
            type="date"
            value={values.date}
          />
          {fieldError("date") ? (
            <p className="mb-0 mt-1.5 text-sm text-rose-600" role="alert">
              {fieldError("date")}
            </p>
          ) : null}
        </div>
        <div>
          <FieldLabel htmlFor={`showtime-${mode}-start`}>
            Start time (UTC)
          </FieldLabel>
          <input
            aria-invalid={Boolean(fieldError("startTime"))}
            className={fieldClassName}
            id={`showtime-${mode}-start`}
            name="startTime"
            onChange={(event) => updateValue("startTime", event.target.value)}
            required
            type="time"
            value={values.startTime}
          />
          {fieldError("startTime") ? (
            <p className="mb-0 mt-1.5 text-sm text-rose-600" role="alert">
              {fieldError("startTime")}
            </p>
          ) : null}
        </div>
        <div>
          <FieldLabel htmlFor={`showtime-${mode}-language`}>
            Screening language
          </FieldLabel>
          <select
            aria-invalid={Boolean(fieldError("language"))}
            className={fieldClassName}
            id={`showtime-${mode}-language`}
            name="language"
            onChange={(event) => updateValue("language", event.target.value)}
            value={values.language}
          >
            <option value="">
              {`Original (${movieLanguageLabel(selectedMovie?.originalLanguage ?? "en")})`}
            </option>
            <option value="en">English</option>
            <option value="ta">Tamil</option>
            <option value="si">Sinhala</option>
          </select>
          {fieldError("language") ? (
            <p className="mb-0 mt-1.5 text-sm text-rose-600" role="alert">
              {fieldError("language")}
            </p>
          ) : null}
        </div>
        <div>
          <FieldLabel htmlFor={`showtime-${mode}-price`}>
            Ticket price (LKR)
          </FieldLabel>
          <input
            aria-invalid={Boolean(fieldError("price"))}
            className={fieldClassName}
            id={`showtime-${mode}-price`}
            min="0"
            name="price"
            onChange={(event) => updateValue("price", event.target.value)}
            placeholder="e.g. 1500.00"
            required
            step="0.01"
            type="number"
            value={values.price}
          />
          {fieldError("price") ? (
            <p className="mb-0 mt-1.5 text-sm text-rose-600" role="alert">
              {fieldError("price")}
            </p>
          ) : null}
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="m-0 text-xs font-medium text-slate-500 dark:text-slate-400">
            Calculated end time
          </p>
          <p className="mb-0 mt-1.5 text-sm font-semibold">
            {endsAt ? formatUtcDateTime(endsAt) : "Select a movie with a runtime"}
          </p>
          {runtime ? (
            <p className="mb-0 mt-1 text-xs text-slate-500 dark:text-slate-400">
              {runtime} minutes
            </p>
          ) : null}
        </div>
      </div>
      {!runtime && values.movieId ? (
        <p
          aria-live="polite"
          className="mb-0 mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
          role="status"
        >
          Add a runtime to this movie before scheduling a showtime.
        </p>
      ) : null}
      {overlap ? (
        <p
          aria-live="polite"
          className="mb-0 mt-4 rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
          role="alert"
        >
          This time overlaps with “{overlap.movieTitle}” on the selected screen
          ({formatUtcDateTime(new Date(overlap.startsAt))} –{" "}
          {formatUtcDateTime(new Date(overlap.endsAt))}).
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={
            isPending ||
            movies.length === 0 ||
            screens.length === 0 ||
            !runtime ||
            Boolean(overlap)
          }
          type="submit"
        >
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create showtime"
              : "Save changes"}
        </button>
        {state.error ? (
          <p
            aria-live="polite"
            className="m-0 text-sm text-rose-600 dark:text-rose-400"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p
            aria-live="polite"
            className="m-0 text-sm text-emerald-700 dark:text-emerald-400"
            role="status"
          >
            {state.success}
          </p>
        ) : null}
      </div>
    </form>
  );
}
