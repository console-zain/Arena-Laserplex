import type {
  MovieDetails,
  MovieVideoResponse,
} from "@/types/movie";

export class TMDBRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "TMDBRequestError";
  }
}

function getApiBaseUrl() {
  const baseUrl = process.env.TMDB_BASE_URL?.replace(/\/+$/, "");
  const apiKey = process.env.TMDB_API_KEY;

  if (!baseUrl) {
    throw new Error("TMDB_BASE_URL is not configured.");
  }

  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured.");
  }

  try {
    const parsedBaseUrl = new URL(baseUrl);
    if (parsedBaseUrl.protocol !== "https:" && parsedBaseUrl.protocol !== "http:") {
      throw new Error();
    }
  } catch {
    throw new Error("TMDB_BASE_URL must be a valid HTTP or HTTPS URL.");
  }

  return { apiKey, baseUrl };
}

function validateMovieId(movieId: number | string): string {
  const id = String(movieId);

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    throw new Error("A valid positive TMDB movie ID is required.");
  }

  return id;
}

async function fetchTMDB<T>(path: string): Promise<T> {
  const { apiKey, baseUrl } = getApiBaseUrl();
  const url = new URL(`${baseUrl}/${path}`);
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new TMDBRequestError(
      `TMDB request failed (${response.status} ${response.statusText}) for ${path}.`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function getMovieDetails(
  movieId: number | string,
): Promise<MovieDetails> {
  const id = validateMovieId(movieId);
  return fetchTMDB<MovieDetails>(`movie/${id}`);
}

export function getMovieVideos(
  movieId: number | string,
): Promise<MovieVideoResponse> {
  const id = validateMovieId(movieId);
  return fetchTMDB<MovieVideoResponse>(`movie/${id}/videos`);
}
