ALTER TABLE "Movie"
ADD COLUMN "genres" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Showtime"
ADD COLUMN "language" VARCHAR(10);

UPDATE "Showtime" AS showtime
SET "language" = COALESCE(NULLIF(movie."originalLanguage", ''), 'en')
FROM "Movie" AS movie
WHERE showtime."movieId" = movie."id";

ALTER TABLE "Showtime"
ALTER COLUMN "language" SET NOT NULL;
