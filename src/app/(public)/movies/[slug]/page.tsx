import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MovieDetails } from "@/components/movie/movie-details";
import { siteConfig } from "@/config/site";
import { db } from "@/lib/db";
import { findPublishedMovieBySlug } from "@/server/services/movies";
import { getMovieVideos } from "@/services/movie-service";

interface MoviePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { slug } = await params;
  const movie = await findPublishedMovieBySlug(slug);

  if (!movie) {
    return { title: "Movie Not Found" };
  }

  const backdropUrl = movie.backdropUrl;

  return {
    title: movie.title,
    description:
      movie.overview ||
      `Discover ${movie.title} showtimes and details at ${siteConfig.name}.`,
    openGraph: {
      title: `${movie.title} | ${siteConfig.name}`,
      description: movie.overview || siteConfig.description,
      type: "website",
      ...(backdropUrl ? { images: [backdropUrl] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${movie.title} | ${siteConfig.name}`,
      description: movie.overview || siteConfig.description,
      ...(backdropUrl ? { images: [backdropUrl] } : {}),
    },
  };
}

export default async function MovieDetailsPage({ params }: MoviePageProps) {
  const { slug } = await params;
  const movie = await findPublishedMovieBySlug(slug);

  if (!movie) {
    notFound();
  }

  const [videosResult, scheduledShowtimes] = await Promise.all([
    movie.tmdbId
      ? Promise.allSettled([getMovieVideos(movie.tmdbId)]).then(
          (results) => results[0],
        )
      : Promise.resolve(null),
    db.showtime.findMany({
        where: {
          movieId: movie.id,
          status: "SCHEDULED",
          startsAt: { gt: new Date() },
          screen: { is: { isActive: true } },
        },
        orderBy: { startsAt: "asc" },
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          basePriceMinor: true,
          currency: true,
          language: true,
          screen: { select: { name: true } },
        },
    }),
  ]);

  let youtubeKey: string | null = null;
  if (videosResult?.status === "fulfilled") {
    const youtubeVideos = videosResult.value.results.filter(
      (video) => video.site === "YouTube" && video.key.length > 0,
    );
    const trailer =
      youtubeVideos.find((video) => video.official && video.type === "Trailer") ??
      youtubeVideos.find((video) => video.type === "Trailer") ??
      youtubeVideos.find((video) => video.official && video.type === "Teaser") ??
      youtubeVideos.find((video) => video.type === "Teaser");
    youtubeKey = trailer?.key ?? null;
  } else if (videosResult?.status === "rejected") {
    console.error("Unable to load movie videos from TMDB.", videosResult.reason);
  }

  return (
    <MovieDetails
      movie={movie}
      showtimes={scheduledShowtimes.map((showtime) => ({
        id: showtime.id,
        startsAt: showtime.startsAt,
        endsAt: showtime.endsAt,
        screenName: showtime.screen.name,
        priceMinor: showtime.basePriceMinor,
        currency: showtime.currency,
        language: showtime.language,
      }))}
      youtubeKey={youtubeKey}
    />
  );
}
