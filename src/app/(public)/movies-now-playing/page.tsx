import type { Metadata } from "next";
import { MovieCatalogPage } from "@/components/movie/movie-catalog-page";
import { siteConfig } from "@/config/site";
import { listPublishedNowShowingMovies } from "@/server/services/movies";

export const metadata: Metadata = {
  title: "Now Showing",
  description: `Browse movies currently showing at ${siteConfig.name}. Explore film details and plan your next theater visit.`,
  openGraph: {
    title: `Now Showing | ${siteConfig.name}`,
    description: "Explore current releases at Arena Laserplex.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function MoviesNowPlayingPage() {
  const movies = await listPublishedNowShowingMovies();

  return (
    <MovieCatalogPage
      description="Discover the stories currently playing on the big screen."
      eyebrow="On the big screen"
      movies={movies}
      title="Now Showing"
    />
  );
}
