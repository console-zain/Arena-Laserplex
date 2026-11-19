import type { Metadata } from "next";
import { ComingSoon } from "@/components/home/coming-soon";
import { Events } from "@/components/home/events";
import { FeaturedScreens } from "@/components/home/featured-screens";
import { Hero, type HomeHeroSlide } from "@/components/home/hero";
import { HomeSectionReveal } from "@/components/home/home-scroll-motion";
import { NowShowing } from "@/components/home/now-showing";
import { siteConfig } from "@/config/site";
import { db } from "@/lib/db";
import { toCinemaEvent } from "@/lib/public-content";
import {
  listPublishedComingSoonMovies,
  listPublishedNowShowingMovies,
} from "@/server/services/movies";
import { listPublishedEvents } from "@/server/services/events";
import { getMovieDetails, getMovieVideos } from "@/services/movie-service";

export const metadata: Metadata = {
  title: "Movies & Showtimes",
  description:
    "Find films currently showing, upcoming releases, and events at Arena Laserplex.",
  openGraph: {
    title: siteConfig.name,
    description:
      "Find films currently showing, upcoming releases, and events at Arena Laserplex.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function findTrailerUrl(videos: Awaited<ReturnType<typeof getMovieVideos>> | null) {
  if (!videos) {
    return null;
  }

  const youtubeVideos = videos.results.filter(
    (video) => video.site === "YouTube" && video.key.length > 0,
  );
  const trailer =
    youtubeVideos.find((video) => video.official && video.type === "Trailer") ??
    youtubeVideos.find((video) => video.type === "Trailer") ??
    youtubeVideos.find((video) => video.official && video.type === "Teaser") ??
    youtubeVideos.find((video) => video.type === "Teaser");

  return trailer
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}`
    : null;
}

export default async function HomePage() {
  const [nowPlaying, upcoming, eventRecords, screens] = await Promise.all([
    listPublishedNowShowingMovies(),
    listPublishedComingSoonMovies(4),
    listPublishedEvents(true),
    db.screen.findMany({
      where: { isActive: true },
      select: { code: true, name: true, capacity: true },
      orderBy: { code: "asc" },
    }),
  ]);
  const slides: HomeHeroSlide[] = await Promise.all(
    nowPlaying.map(async (movie) => {
      let rating: number | null = null;
      let genres = movie.genres;
      let trailerUrl: string | null = null;

      if (movie.tmdbId) {
        const [detailsResult, videosResult] = await Promise.allSettled([
          getMovieDetails(movie.tmdbId),
          getMovieVideos(movie.tmdbId),
        ]);

        if (detailsResult.status === "fulfilled") {
          rating = detailsResult.value.vote_average;
          if (genres.length === 0) {
            genres = detailsResult.value.genres.map((genre) => genre.name);
          }
        } else {
          console.error(
            `Unable to load rating for ${movie.title} from TMDB.`,
            detailsResult.reason,
          );
        }

        if (videosResult.status === "fulfilled") {
          trailerUrl = findTrailerUrl(videosResult.value);
        } else {
          console.error(
            `Unable to load trailer for ${movie.title} from TMDB.`,
            videosResult.reason,
          );
        }
      }

      return {
        id: movie.id,
        slug: movie.slug,
        title: movie.title,
        overview: movie.overview,
        backdropUrl: movie.backdropUrl,
        posterUrl: movie.posterUrl,
        runtimeMinutes: movie.runtimeMinutes,
        genres,
        rating,
        trailerUrl,
      };
    }),
  );

  const events = eventRecords.slice(0, 3).map((event) => toCinemaEvent(event));

  return (
    <main className="home-page">
      <Hero slides={slides} />
      <HomeSectionReveal>
        <NowShowing movies={slides} />
      </HomeSectionReveal>
      <HomeSectionReveal>
        <ComingSoon movies={upcoming} />
      </HomeSectionReveal>
      <FeaturedScreens screens={screens} />
      <HomeSectionReveal>
        <Events events={events} />
      </HomeSectionReveal>
    </main>
  );
}
