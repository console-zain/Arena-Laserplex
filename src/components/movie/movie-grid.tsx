import { Film } from "lucide-react";
import {
  MovieCard,
  type MovieCardVariant,
} from "@/components/movie/movie-card";
import type { PublicMovie } from "@/types/public-movie";

interface MovieGridProps {
  movies: PublicMovie[];
  emptyMessage?: string;
  variant?: MovieCardVariant;
}

export function MovieGrid({
  movies,
  emptyMessage = "No movies are available right now. Please check back soon.",
  variant = "catalog",
}: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <p className="movie-grid-empty" role="status">
        <Film aria-hidden="true" size={22} />
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} variant={variant} />
      ))}
    </div>
  );
}
