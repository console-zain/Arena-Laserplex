import type { Prisma } from "@prisma/client";
import { isManagedMediaObjectKey } from "@/lib/media-keys";
import { getMovieImageUrl } from "@/lib/movie-images";
import { getImageUrl } from "@/server/services/media";
import type { CinemaEvent } from "@/types/event";
import type { NewsArticle } from "@/types/news";
import type { PublicMovie } from "@/types/public-movie";

type EventWithScreen = Prisma.EventGetPayload<{
  include: { screen: { select: { name: true } } };
}>;

export function getStoredImageUrl(key: string | null): string {
  if (!key) {
    return "";
  }
  if (isManagedMediaObjectKey(key)) {
    return getImageUrl(key) ?? "";
  }
  if (key.startsWith("/") && !key.startsWith("//")) {
    return key;
  }

  throw new Error("The stored content image key is invalid.");
}

export function toPublicMovie(
  movie: Prisma.MovieGetPayload<object>,
  screeningLanguages: string[] = [],
): PublicMovie {
  return {
    ...movie,
    posterUrl: isManagedMediaObjectKey(movie.posterPath ?? "")
      ? getImageUrl(movie.posterPath)
      : getMovieImageUrl(movie.posterPath),
    backdropUrl: isManagedMediaObjectKey(movie.backdropPath ?? "")
      ? getImageUrl(movie.backdropPath)
      : getMovieImageUrl(movie.backdropPath, "original"),
    screeningLanguages,
  };
}

export function toCinemaEvent(
  event: EventWithScreen,
  featured = false,
): CinemaEvent {
  return {
    slug: event.slug,
    title: event.title,
    category: event.category,
    summary: event.summary,
    description: event.body,
    date: event.startsAt.toISOString().slice(0, 10),
    time: new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(event.startsAt),
    timeZone: "UTC",
    location: event.screen?.name
      ? `${event.screen.name} · Arena Laserplex`
      : "Arena Laserplex",
    imageUrl: getStoredImageUrl(event.imageKey),
    imageAlt: event.title,
    featured,
  };
}

export function toNewsArticle(
  article: Prisma.NewsGetPayload<object>,
): NewsArticle {
  return {
    slug: article.slug,
    title: article.title,
    category: article.category,
    excerpt: article.excerpt,
    content: article.body.split(/\n{2,}/).filter(Boolean),
    publishedAt:
      article.publishedAt?.toISOString().slice(0, 10) ??
      article.createdAt.toISOString().slice(0, 10),
    imageUrl: getStoredImageUrl(article.imageKey),
    imageAlt: article.title,
    featured: article.featured,
  };
}
