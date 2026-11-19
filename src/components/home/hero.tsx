"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/button";

export interface HomeHeroSlide {
  id: string;
  slug: string;
  title: string;
  overview: string;
  backdropUrl: string | null;
  posterUrl: string | null;
  runtimeMinutes: number | null;
  genres: readonly string[];
  rating: number | null;
  trailerUrl: string | null;
}

interface HeroProps {
  slides: readonly HomeHeroSlide[];
}

function formatRuntime(runtime: number | null) {
  return runtime && runtime > 0
    ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
    : "Runtime not listed";
}

export function Hero({ slides }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const slide = slides[activeIndex];
  const artworkUrl = slide?.backdropUrl ?? slide?.posterUrl ?? null;

  useEffect(() => {
    if (
      slides.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, slides.length]);

  return (
    <section
      aria-label="Now showing films"
      aria-roledescription="carousel"
      className={`home-feature${slide && artworkUrl ? "" : " home-feature-empty"}`}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        const end = event.changedTouches[0];
        touchStart.current = null;

        if (!start || !end || slides.length < 2) {
          return;
        }

        const deltaX = end.clientX - start.x;
        const deltaY = end.clientY - start.y;
        if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) {
          return;
        }

        setActiveIndex(
          (index) =>
            (index + (deltaX < 0 ? 1 : -1) + slides.length) % slides.length,
        );
      }}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStart.current = touch
          ? { x: touch.clientX, y: touch.clientY }
          : null;
      }}
    >
      {slide && artworkUrl ? (
        <div className="home-feature-art">
          <Image
            alt=""
            className="home-feature-image"
            fill
            priority={activeIndex === 0}
            sizes="100vw"
            src={artworkUrl}
          />
        </div>
      ) : null}
      <div aria-hidden="true" className="home-feature-overlay" />
      {slide ? (
        <>
          <div className="home-content home-feature-content">
            <div
              aria-label={`Slide ${activeIndex + 1} of ${slides.length}: ${slide.title}`}
              aria-roledescription="slide"
              className="home-feature-copy"
              role="group"
            >
              <p className="home-kicker">Now showing at Arena Laserplex</p>
              <h1 className="home-feature-title" id="featured-film-title">
                {slide.title}
              </h1>
              <p className="home-feature-facts">
                <span>{formatRuntime(slide.runtimeMinutes)}</span>
                {slide.genres.length > 0 ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{slide.genres.slice(0, 2).join(" · ")}</span>
                  </>
                ) : null}
                <span aria-hidden="true">·</span>
                <span className="home-feature-rating">
                  <Star aria-hidden="true" fill="currentColor" size={15} />
                  {slide.rating !== null
                    ? slide.rating.toFixed(1)
                    : "Rating unavailable"}
                </span>
              </p>
              {slide.overview ? (
                <p className="home-feature-synopsis">{slide.overview}</p>
              ) : null}
              <div className="home-feature-actions">
                <Button asChild className="home-primary-link">
                  <Link href={`/movies/${slide.slug}#movie-showtimes`}>
                    Book Tickets
                  </Link>
                </Button>
                {slide.trailerUrl ? (
                  <Button asChild className="home-trailer-link" variant="outline">
                    <a href={slide.trailerUrl} rel="noreferrer" target="_blank">
                      Watch Trailer
                    </a>
                  </Button>
                ) : (
                  <Button
                    className="home-trailer-link"
                    disabled
                    title="A trailer is not available for this movie."
                    variant="outline"
                  >
                    Watch Trailer
                  </Button>
                )}
              </div>
            </div>
          </div>
          {slides.length > 1 ? (
            <div
              aria-label="Choose a featured movie"
              className="home-hero-controls"
              role="group"
            >
              <div className="home-hero-dots">
                {slides.map((item, index) => (
                  <button
                    aria-current={index === activeIndex ? "true" : undefined}
                    aria-label={`Show ${item.title}`}
                    className="home-hero-dot"
                    key={item.id}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="home-content home-feature-content">
          <div className="home-feature-copy">
            <p className="home-kicker">Arena Laserplex</p>
            <h1 className="home-feature-title" id="featured-film-title">
              No featured film
            </h1>
            <p className="home-feature-synopsis">
              Movie listings will appear here when available.
            </p>
            <Button asChild className="home-primary-link">
              <Link href="/movies">Browse Movies</Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
