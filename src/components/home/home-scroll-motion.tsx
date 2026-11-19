"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

export function HomeSectionReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!element || reduceMotion || !("IntersectionObserver" in window)) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.88) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.dataset.revealed = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-section-reveal" ref={ref}>
      {children}
    </div>
  );
}
