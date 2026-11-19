import Link from "next/link";
import { Button } from "@/components/common/button";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { MovieGrid } from "@/components/movie/movie-grid";
import type { PublicMovie } from "@/types/public-movie";

export type MovieCategory = "all" | "now" | "coming";

interface MovieCategoryNavProps {
  active: MovieCategory;
}

const movieCategories: {
  key: MovieCategory;
  label: string;
  href: string;
}[] = [
  { key: "all", label: "All Movies", href: "/movies" },
  { key: "now", label: "Now Showing", href: "/movies-now-playing" },
  { key: "coming", label: "Coming Soon", href: "/movies-coming-soon" },
];

export function MovieCategoryNav({ active }: MovieCategoryNavProps) {
  return (
    <nav
      aria-label="Movie categories"
      className="movie-category-nav mt-6 flex flex-wrap gap-2"
    >
      {movieCategories.map((category) => {
        const isActive = category.key === active;

        return (
          <Button
            asChild
            className="min-h-11 rounded-full px-4"
            key={category.key}
            variant={isActive ? "primary" : "outline"}
          >
            <Link
              aria-current={isActive ? "page" : undefined}
              href={category.href}
            >
              {category.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

interface MovieCatalogPageProps {
  title: string;
  description: string;
  eyebrow: string;
  movies: PublicMovie[];
  activeCategory?: Exclude<MovieCategory, "all">;
}

export function MovieCatalogPage({
  title,
  description,
  eyebrow,
  movies,
  activeCategory = title === "Now Showing" ? "now" : "coming",
}: MovieCatalogPageProps) {
  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="pt-8 sm:pt-12">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--v3-accent-primary)]">
          {eyebrow}
        </p>
        <PageHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
          className="page-header-compact"
          description={description}
          title={title}
        />
        <MovieCategoryNav active={activeCategory} />
      </Container>

      <section aria-label={`${title} films`} className="pb-16 pt-8 sm:pb-24">
        <Container>
          <MovieGrid
            movies={movies}
            variant={
              activeCategory === "now" ? "now-showing" : "coming-soon"
            }
          />
        </Container>
      </section>
    </main>
  );
}
