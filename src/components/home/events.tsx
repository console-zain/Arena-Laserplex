import Link from "next/link";
import Image from "next/image";
import type { CinemaEvent } from "@/types/event";

interface EventsProps {
  events: readonly CinemaEvent[];
}

export function Events({ events }: EventsProps) {
  const visibleEvents = events.slice(0, 3);
  const textOnly = visibleEvents.every((event) => !event.imageUrl);

  return (
    <section
      aria-labelledby="events-title"
      className="home-section home-section-events"
    >
      <div className="home-content">
        <div className="home-section-heading">
          <div>
            <p className="home-section-kicker">At the cinema</p>
            <h2 id="events-title">Upcoming Events</h2>
            <p className="home-section-intro">
              Dates and details from the event programme.
            </p>
          </div>
          <Link className="home-text-link" href="/event">
            All events
          </Link>
        </div>
        {events.length > 0 ? (
          <div
            className={`home-event-grid${textOnly ? " home-event-grid-text-only" : ""}`}
          >
            {visibleEvents.map((event, index) => (
              <article
                className={`home-event-card${index === 0 && visibleEvents.length > 1 ? " home-event-card-lead" : ""}${event.imageUrl ? "" : " home-event-card-no-image"}`}
                key={event.slug}
              >
                {event.imageUrl ? (
                  <Link
                    aria-label={`View ${event.title}`}
                    className="home-event-art"
                    href={`/event/${event.slug}`}
                  >
                    <Image
                      alt=""
                      className="home-event-image"
                      fill
                      sizes={
                        index === 0
                          ? "(max-width: 767px) 100vw, 58vw"
                          : "(max-width: 767px) 100vw, 34vw"
                      }
                      src={event.imageUrl}
                    />
                  </Link>
                ) : null}
                <div
                  className={`home-event-copy${event.imageUrl ? "" : " home-event-copy-text-only"}`}
                >
                  <p className="home-event-meta">
                    <span>{event.category}</span>
                    <time dateTime={event.date}>
                      {new Intl.DateTimeFormat("en", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "UTC",
                      }).format(new Date(`${event.date}T00:00:00.000Z`))}
                    </time>
                  </p>
                  <h3>
                    <Link href={`/event/${event.slug}`}>{event.title}</Link>
                  </h3>
                  <p className="home-event-summary">{event.summary}</p>
                  <p className="home-event-venue">
                    {event.time} · {event.location}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="home-empty home-empty-events">
            The events programme is being updated. New dates will appear here.
          </p>
        )}
      </div>
    </section>
  );
}
