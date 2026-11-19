import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clapperboard, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "@/components/common/container";

interface AuthExperienceProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthExperience({
  title,
  description,
  children,
}: AuthExperienceProps) {
  return (
    <main className="auth-page !m-0 !w-full !max-w-none !p-0">
      <Container className="py-6 sm:py-10">
        <div className="auth-experience">
          <section aria-label="Arena Laserplex experience" className="auth-visual">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="(max-width: 899px) 100vw, 55vw"
              src="/images/screens/xl-screen.jpg"
            />
            <div aria-hidden="true" className="auth-visual-shade" />
            <Link aria-label="Arena Laserplex home" className="auth-visual-brand" href="/">
              <span aria-hidden="true" className="brand-emblem">
                <Clapperboard size={20} />
              </span>
              <span className="brand-wordmark">Arena Laserplex</span>
            </Link>
            <div className="auth-visual-copy">
              <p className="auth-visual-kicker">
                <Sparkles aria-hidden="true" size={15} />
                THE SHOW STARTS HERE
              </p>
              <h2>Make tonight a premiere.</h2>
              <p>
                Discover the films, find your seats, and make the big screen
                part of your next story.
              </p>
              <Link className="auth-visual-link" href="/movies">
                Explore movies
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </div>
            <p className="auth-visual-credit">
              Reference auditorium photo by{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Lichtburg-Essen-Kinosaal-2025.jpg"
                rel="noreferrer"
                target="_blank"
              >
                Tuxyso / Wikimedia Commons
              </a>
              {" · "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                rel="noreferrer"
                target="_blank"
              >
                CC BY-SA 4.0
              </a>
              {" · Reference image, not an Arena Laserplex room."}
            </p>
          </section>

          <section
            aria-labelledby="auth-panel-title"
            className="auth-panel v4-glass-panel"
          >
            <p className="auth-panel-kicker">ARENA MEMBERS</p>
            <h1 id="auth-panel-title">{title}</h1>
            <p className="auth-panel-description">{description}</p>
            {children}
          </section>
        </div>
      </Container>
    </main>
  );
}
