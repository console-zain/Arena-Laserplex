export const mediaCategories = [
  "movie-poster",
  "movie-backdrop",
  "event",
  "news",
  "promotion",
] as const;

export type MediaCategory = (typeof mediaCategories)[number];

const mediaPrefixes: Record<MediaCategory, string> = {
  "movie-poster": "movies/posters",
  "movie-backdrop": "movies/backdrops",
  event: "events",
  news: "news",
  promotion: "promotions",
};

export function isValidMediaObjectKey(
  key: string,
  category?: MediaCategory,
): boolean {
  return mediaCategories.some((candidate) => {
    if (category && candidate !== category) {
      return false;
    }

    return new RegExp(
      `^${mediaPrefixes[candidate]}/[0-9a-f-]{36}\\.(jpg|png|webp)$`,
    ).test(key);
  });
}

export function isManagedMediaObjectKey(key: string): boolean {
  return isValidMediaObjectKey(key);
}
