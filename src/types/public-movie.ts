export interface PublicMovie {
  id: string;
  slug: string;
  tmdbId: number | null;
  title: string;
  overview: string;
  genres: string[];
  posterPath: string | null;
  backdropPath: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  runtimeMinutes: number | null;
  releaseDate: Date | null;
  originalLanguage: string | null;
  screeningLanguages: string[];
}
