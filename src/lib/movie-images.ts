export function getMovieImageUrl(
  path: string | null,
  size: "w500" | "w1280" | "original" = "w500",
) {
  if (!path) {
    return null;
  }

  if (path.startsWith("/images/")) {
    return path;
  }

  return `https://image.tmdb.org/t/p/${size}${path}`;
}
