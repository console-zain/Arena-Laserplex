import { z } from "zod";
import { isValidMediaObjectKey } from "@/lib/media-keys";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length > 0 ? value : null));

const optionalInteger = z.preprocess(
  (value) => {
    if (typeof value !== "string" || value.trim() === "") {
      return null;
    }

    return Number(value);
  },
  z.number().int().positive().max(2_147_483_647).nullable(),
);

const optionalReleaseDate = z.preprocess(
  (value) => {
    if (typeof value !== "string" || value.trim() === "") {
      return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      return value;
    }

    return date;
  },
  z.date().nullable(),
);

function isTmdbImagePath(value: string) {
  return (
    /^\/[a-z0-9_-]+(?:\/[a-z0-9._-]+)*\.(?:jpe?g|png|webp)$/i.test(value) &&
    !value.startsWith("/images/")
  );
}

const imagePath = (category: "movie-poster" | "movie-backdrop") =>
  optionalText(500).refine(
    (value) =>
      value === null ||
      isValidMediaObjectKey(value, category) ||
      isTmdbImagePath(value),
    "Upload an image or use a TMDB image path.",
  );

const genres = z.preprocess(
  (value) => {
    if (typeof value !== "string" || value.trim() === "") {
      return [];
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  z.array(z.string().trim().min(1).max(80)).max(30),
);

export const movieFormSchema = z.object({
  title: z.string().trim().min(1, "Enter a movie title.").max(200),
  tmdbId: optionalInteger,
  overview: z.string().trim().min(1, "Enter a movie overview.").max(10_000),
  genres,
  releaseDate: optionalReleaseDate,
  posterPath: imagePath("movie-poster"),
  backdropPath: imagePath("movie-backdrop"),
  runtimeMinutes: optionalInteger,
  originalLanguage: optionalText(10),
});

export const movieIdSchema = z.string().uuid("Choose a valid movie.");
export const tmdbIdSchema = z.coerce
  .number()
  .int()
  .positive("Enter a valid TMDB ID.")
  .max(2_147_483_647);

export const movieRecordSchema = movieFormSchema.superRefine(
  (movie, context) => {
    if (!movie.releaseDate) {
      context.addIssue({
        code: "custom",
        message: "Enter a release date.",
        path: ["releaseDate"],
      });
    }
  },
);

export const releasedMovieSchema = movieRecordSchema.superRefine(
  (movie, context) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (movie.releaseDate && movie.releaseDate > today) {
      context.addIssue({
        code: "custom",
        message:
          "Released movies need a release date of today or earlier. Add future releases under Upcoming.",
        path: ["releaseDate"],
      });
    }
  },
);

export const upcomingMovieSchema = movieRecordSchema.superRefine(
  (movie, context) => {
    if (movie.releaseDate && movie.releaseDate <= new Date()) {
      context.addIssue({
        code: "custom",
        message: "Upcoming movies must have a future release date.",
        path: ["releaseDate"],
      });
    }
  },
);

export type MovieFormInput = z.infer<typeof movieFormSchema>;
