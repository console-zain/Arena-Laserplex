import { Card, CardContent } from "@/components/common/card";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { EventCard } from "@/components/event/event-card";
import type { CinemaEvent } from "@/types/event";

interface EventListProps {
  events: readonly CinemaEvent[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function EventList({
  events,
  title = "Upcoming Events",
  subtitle = "Published events and screenings at Arena Laserplex.",
  className,
}: EventListProps) {
  return (
    <section
      aria-labelledby="event-list-title"
      className={`py-12 sm:py-16 ${className ?? ""}`.trim()}
    >
      <Container>
        <SectionTitle
          className="mb-8"
          subtitle={subtitle}
          title={title}
          titleId="event-list-title"
        />
        {events.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard event={event} key={event.slug} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <p className="m-0 text-[var(--v3-text-secondary)]">
                There are no published events to show right now.
              </p>
            </CardContent>
          </Card>
        )}
      </Container>
    </section>
  );
}
