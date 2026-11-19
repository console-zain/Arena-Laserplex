import { Film } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";

interface MovieTrailerProps {
  youtubeKey: string | null;
  movieTitle: string;
}

export function MovieTrailer({ youtubeKey, movieTitle }: MovieTrailerProps) {
  return (
    <section aria-labelledby="movie-trailer-title" className="py-12 sm:py-16">
      <Container>
        <SectionTitle
          className="mb-6"
          eyebrow="A closer look"
          title="Official Trailer"
          titleId="movie-trailer-title"
        />
        {youtubeKey ? (
          <div className="movie-trailer-frame">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 size-full"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeKey)}`}
              title={`${movieTitle} official trailer`}
            />
          </div>
        ) : (
          <div className="movie-trailer-fallback" role="status">
            <Film aria-hidden="true" size={26} />
            <p>No official trailer is available for this film yet.</p>
          </div>
        )}
      </Container>
    </section>
  );
}
