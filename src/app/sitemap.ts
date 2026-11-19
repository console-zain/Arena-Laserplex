import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const publicPaths = [
  "/",
  "/movies",
  "/movies-now-playing",
  "/movies-coming-soon",
  "/event",
  "/news",
  "/about",
  "/contact",
  "/help-center",
  "/privacy-policy",
  "/terms-of-service",
  "/cookie-policy",
  "/refund-policy",
  "/cancellation-policy",
  "/disclaimer",
  "/accessibility-statement",
  "/security-policy",
  "/responsible-disclosure",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [movies, events, articles] = await Promise.all([
    db.movie.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
    }),
    db.event.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
    }),
    db.news.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const siteUrl = siteConfig.url.replace(/\/+$/, "");

  return [
    ...publicPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: path === "/" ? "daily" as const : "weekly" as const,
    })),
    ...movies.map((movie) => ({
      url: `${siteUrl}/movies/${encodeURIComponent(movie.slug)}`,
      lastModified: movie.updatedAt,
      changeFrequency: "weekly" as const,
    })),
    ...events.map((event) => ({
      url: `${siteUrl}/event/${encodeURIComponent(event.slug)}`,
      lastModified: event.updatedAt,
      changeFrequency: "weekly" as const,
    })),
    ...articles.map((article) => ({
      url: `${siteUrl}/news/${encodeURIComponent(article.slug)}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
    })),
  ];
}
