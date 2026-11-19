import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { Container } from "@/components/common/container";
import { MovieCategoryNav } from "@/components/movie/movie-catalog-page";
import { MovieFilters } from "@/components/movie/movie-filters";
import { siteConfig } from "@/config/site";
import { listPublishedMovies } from "@/server/services/movies";

export const metadata: Metadata = {
  title: "Movies",
  description:
    "Browse published movies currently showing and coming soon at Arena Laserplex. Search and filter by language or release date.",
  openGraph: {
    title: `Movies | ${siteConfig.name}`,
    description:
      "Explore now-playing movies and upcoming releases at Arena Laserplex.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const movies = await listPublishedMovies();

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="pt-8 sm:pt-12">
        <PageHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Movies" }]}
          className="page-header-compact"
          description="Explore current releases and upcoming premieres."
          title="Movies"
        />
        <MovieCategoryNav active="all" />
      </Container>
      <MovieFilters movies={movies} />
    </main>
  );
}
