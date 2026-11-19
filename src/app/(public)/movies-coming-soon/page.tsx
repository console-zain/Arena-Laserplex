import type { Metadata } from "next";
import { MovieCatalogPage } from "@/components/movie/movie-catalog-page";
import { siteConfig } from "@/config/site";
import { listPublishedComingSoonMovies } from "@/server/services/movies";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: `Explore unreleased films confirmed for ${siteConfig.name}.`,
  openGraph: {
    title: `Coming Soon | ${siteConfig.name}`,
    description: "Upcoming releases confirmed for Arena Laserplex.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function MoviesComingSoonPage() {
  const movies = await listPublishedComingSoonMovies();

  return (
    <MovieCatalogPage
      description="Unreleased films confirmed for the Arena Laserplex big screen."
      eyebrow="Confirmed for our screens"
      movies={movies}
      title="Coming Soon"
    />
  );
}
