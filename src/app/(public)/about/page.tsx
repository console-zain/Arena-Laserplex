import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/common/button";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Explore the L Screen and XL Screen at Arena Laserplex and plan your visit.",
  openGraph: {
    title: `About | ${siteConfig.name}`,
    description: siteConfig.description,
    type: "website",
  },
};

const screens = [
  {
    code: "XL",
    name: "XL Screen",
    image: "/images/screens/xl-screen.jpg",
    alt: "Reference photograph of the Lichtburg auditorium in Essen; this is not an Arena Laserplex room.",
    photographer: "Tuxyso",
    source:
      "https://commons.wikimedia.org/wiki/File:Lichtburg-Essen-Kinosaal-2025.jpg",
  },
  {
    code: "L",
    name: "L Screen",
    image: "/images/screens/l-screen.jpg",
    alt: "Reference photograph of the Maxim cinema auditorium in Helsinki; this is not an Arena Laserplex room.",
    photographer: "JIP",
    source:
      "https://commons.wikimedia.org/wiki/File:Auditorium_at_Maxim_in_May_2024.jpg",
  },
] as const;

const licenseUrl = "https://creativecommons.org/licenses/by-sa/4.0/";

export default function AboutPage() {
  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <section aria-label="Screen reference photography" className="pt-6 sm:pt-8">
        <Container>
          <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
            {screens.map((screen) => (
              <figure className="about-screen-figure m-0" key={screen.code}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--v3-radius-feature)] bg-[var(--v3-surface-elevated)] shadow-[var(--v3-shadow-large)]">
                  <Image
                    alt={screen.alt}
                    className="object-cover"
                    fill
                    priority={screen.code === "XL"}
                    sizes={
                      screen.code === "XL"
                        ? "(max-width: 767px) 100vw, 60vw"
                        : "(max-width: 767px) 100vw, 35vw"
                    }
                    src={screen.image}
                  />
                  <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-black/70 px-4 py-2 text-sm font-medium text-white">
                    {screen.name}
                  </span>
                </div>
                <figcaption className="mt-3 text-xs leading-5 text-[var(--v3-text-muted)]">
                  Reference image—not an Arena Laserplex room. Photo by{" "}
                  <a
                    className="underline underline-offset-4 hover:text-[var(--v3-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v3-focus-ring)]"
                    href={screen.source}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {screen.photographer} / Wikimedia Commons
                  </a>
                  {" · "}
                  <a
                    className="underline underline-offset-4 hover:text-[var(--v3-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v3-focus-ring)]"
                    href={licenseUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    CC BY-SA 4.0
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <PageHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
          description="Arena Laserplex lists two auditoriums: L Screen and XL Screen. Browse films, view showtimes, and select available seats online."
          title="Two screens. One cinema."
        />
      </Container>

      <section
        aria-labelledby="screens-title"
        className="border-y border-[var(--v3-border)] bg-[var(--v3-surface)] py-12 sm:py-16"
      >
        <Container>
          <SectionTitle
            className="mb-8"
            eyebrow="The venue"
            subtitle="These are the screen names currently published for Arena Laserplex."
            title="Choose your screen"
            titleId="screens-title"
          />
          <dl className="about-screen-specs m-0 grid gap-4 sm:grid-cols-2">
            {screens.map((screen, index) => (
              <div className="about-screen-spec" key={screen.code}>
                <dt className="text-sm text-[var(--v3-text-muted)]">
                  Screen {String(index + 1).padStart(2, "0")}
                </dt>
                <dd className="mb-0 mt-2 font-[var(--font-heading)] text-3xl font-semibold tracking-tight text-[var(--v3-text-primary)] sm:text-4xl">
                  {screen.name}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mb-0 mt-5 text-sm leading-6 text-[var(--v3-text-muted)]">
            Venue capacity, seating, and equipment specifications will be
            added after verification.
          </p>
        </Container>
      </section>

      <section aria-labelledby="plan-visit-title" className="py-12 sm:py-16">
        <Container>
          <div className="about-plan-panel grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-end">
            <SectionTitle
              eyebrow="Plan ahead"
              title="A simpler way to choose"
              titleId="plan-visit-title"
            />
            <div className="md:justify-self-end md:max-w-2xl">
              <p className="mt-0 text-base leading-7 text-[var(--v3-text-secondary)]">
                Check current films and showtimes, then choose from available
                seats as you book. Your screen, showtime, and seat selection
                stay together through checkout.
              </p>
              <Button asChild className="mt-3">
                <Link href="/movies">
                  Browse Movies
                  <ArrowUpRight aria-hidden="true" size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
