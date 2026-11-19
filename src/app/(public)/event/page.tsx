import type { Metadata } from "next";
import { Card, CardContent } from "@/components/common/card";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { EventCard } from "@/components/event/event-card";
import { EventList } from "@/components/event/event-list";
import { siteConfig } from "@/config/site";
import { toCinemaEvent } from "@/lib/public-content";
import { listPublishedEvents } from "@/server/services/events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Browse published events and screenings at Arena Laserplex.",
  openGraph: {
    title: `Events | ${siteConfig.name}`,
    description: "Published events and screenings at Arena Laserplex.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const records = await listPublishedEvents(true);
  const events = records.map((event, index) => toCinemaEvent(event, index === 0));
  const featuredEvent = events[0];
  const otherEvents = events.slice(1);

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="pt-8 sm:pt-12">
        <PageHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Events" }]}
          description="Published events and screenings at Arena Laserplex."
          title="Events"
        />
      </Container>

      {featuredEvent ? (
        <section aria-label="Featured event" className="py-8 sm:py-12">
          <Container>
            <EventCard event={featuredEvent} featured />
          </Container>
        </section>
      ) : (
        <section aria-label="Events" className="py-8 sm:py-12">
          <Container>
            <Card>
              <CardContent>
                <p className="m-0 text-[var(--v3-text-secondary)]">
                  There are no published events to show right now.
                </p>
              </CardContent>
            </Card>
          </Container>
        </section>
      )}

      {otherEvents.length > 0 ? (
        <EventList
          className="border-t border-[var(--v3-border)] bg-[var(--v3-surface)]"
          events={otherEvents}
          subtitle="Browse the remaining upcoming events by date."
          title="More events"
        />
      ) : null}
    </main>
  );
}
