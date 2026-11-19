import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/common/button";
import { Container } from "@/components/common/container";
import { EventList } from "@/components/event/event-list";
import { siteConfig } from "@/config/site";
import { toCinemaEvent } from "@/lib/public-content";
import { findEventBySlug, listPublishedEvents } from "@/server/services/events";

interface EventDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: EventDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = await findEventBySlug(slug);

  if (!record) {
    return { title: "Event Not Found" };
  }

  const event = toCinemaEvent(record);

  return {
    title: event.title,
    description: event.summary,
    openGraph: {
      title: `${event.title} | ${siteConfig.name}`,
      description: event.summary,
      type: "article",
      ...(event.imageUrl
        ? { images: [{ url: event.imageUrl, alt: event.imageAlt }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} | ${siteConfig.name}`,
      description: event.summary,
      ...(event.imageUrl ? { images: [event.imageUrl] } : {}),
    },
  };
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { slug } = await params;
  const [record, relatedRecords] = await Promise.all([
    findEventBySlug(slug),
    listPublishedEvents(true),
  ]);

  if (!record) {
    notFound();
  }

  const event = toCinemaEvent(record);
  const relatedEvents = relatedRecords
    .filter((item) => item.slug !== event.slug)
    .slice(0, 3)
    .map((item) => toCinemaEvent(item));
  const formattedDate = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${event.date}T00:00:00.000Z`));

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--v3-text-muted)]">
          <ol className="m-0 flex flex-wrap items-center gap-2 p-0">
            <li>
              <Link className="hover:text-[var(--v3-accent-primary)]" href="/">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                className="hover:text-[var(--v3-accent-primary)]"
                href="/event"
              >
                Events
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="truncate text-[var(--v3-text-secondary)]">
              {event.title}
            </li>
          </ol>
        </nav>
      </Container>

      {event.imageUrl ? (
        <section aria-label="Event image" className="pt-6 sm:pt-8">
          <Container>
            <div className="event-detail-image relative aspect-[16/9] overflow-hidden rounded-[var(--v3-radius-feature)] bg-[var(--v3-surface-elevated)] shadow-[var(--v3-shadow-large)]">
              <Image
                alt={event.imageAlt}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 767px) 100vw, 1280px"
                src={event.imageUrl}
              />
            </div>
          </Container>
        </section>
      ) : null}

      <section aria-labelledby="event-title" className="py-8 sm:py-12">
        <Container>
          <article className="event-detail-copy mx-auto max-w-4xl">
            <p className="mb-3 mt-0 text-sm font-medium text-[var(--v3-text-secondary)]">
              <time dateTime={event.date}>{formattedDate}</time>
              <span aria-hidden="true"> · </span>
              <span>
                {event.time} {event.timeZone}
              </span>
            </p>
            <p className="mb-3 mt-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--v3-accent-primary)]">
              {event.category}
            </p>
            <h1
              className="m-0 max-w-4xl font-[var(--font-heading)] text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
              id="event-title"
            >
              {event.title}
            </h1>
            <p className="mb-0 mt-5 max-w-3xl text-lg leading-7 text-[var(--v3-text-secondary)]">
              {event.summary}
            </p>

            <dl className="mt-8 border-y border-[var(--v3-border)] py-5">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--v3-text-muted)]">
                  Location
                </dt>
                <dd className="mb-0 mt-2 text-[var(--v3-text-primary)]">
                  {event.location}
                </dd>
              </div>
            </dl>

            <div className="mt-8 max-w-3xl space-y-5 text-base leading-8 text-[var(--v3-text-secondary)]">
              <p className="m-0">{event.description}</p>
            </div>

            <Button asChild className="mt-8">
              <Link href={`/contact?event=${encodeURIComponent(event.slug)}`}>
                Enquire About This Event
              </Link>
            </Button>
          </article>
        </Container>
      </section>

      {relatedEvents.length > 0 ? (
        <EventList
          className="border-t border-[var(--v3-border)] bg-[var(--v3-surface)]"
          events={relatedEvents}
          subtitle="Other published upcoming events."
          title="More events"
        />
      ) : null}
    </main>
  );
}
