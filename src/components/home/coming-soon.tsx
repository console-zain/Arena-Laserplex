import Link from "next/link";
import { MovieCard } from "@/components/movie/movie-card";
import type { PublicMovie } from "@/types/public-movie";

interface ComingSoonProps {
  movies: PublicMovie[];
}

export function ComingSoon({ movies }: ComingSoonProps) {
  return (
    <section
      aria-labelledby="coming-soon-title"
      className="home-section home-section-coming"
    >
      <div className="home-content">
        <div className="home-section-heading">
          <div>
            <h2 id="coming-soon-title">Coming Soon</h2>
            <p>Confirmed for Arena Laserplex</p>
          </div>
          <Link className="home-text-link" href="/movies-coming-soon">
            All upcoming films
          </Link>
        </div>
        {movies.length > 0 ? (
          <div className="home-now-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} variant="coming-soon" />
            ))}
          </div>
        ) : (
          <p className="home-empty">Upcoming releases will be listed here.</p>
        )}
      </div>
    </section>
  );
}
