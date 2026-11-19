import Link from "next/link";
import { MovieCard, type MovieCardMovie } from "@/components/movie/movie-card";

interface NowShowingProps {
  movies: readonly MovieCardMovie[];
}

export function NowShowing({ movies }: NowShowingProps) {
  return (
    <section
      aria-labelledby="now-showing-title"
      className="home-section home-section-now"
    >
      <div className="home-content">
        <div className="home-section-heading">
          <div>
            <p className="home-section-kicker">On the programme</p>
            <h2 id="now-showing-title">Now Showing</h2>
            <p className="home-section-intro">
              Films currently playing at Arena Laserplex.
            </p>
          </div>
          <Link className="home-text-link" href="/movies-now-playing">
            All films
          </Link>
        </div>
        {movies.length > 0 ? (
          <div className="home-now-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} variant="now-showing" />
            ))}
          </div>
        ) : (
          <p className="home-empty">
            No films are showing at the moment. Check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
