import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { movieLanguageLabel } from "@/lib/movie-language";

export interface PublicShowtime {
  id: string;
  startsAt: Date;
  endsAt: Date;
  screenName: string;
  priceMinor: number;
  currency: string;
  language: string;
}

interface ShowtimeCardProps {
  showtime: PublicShowtime;
}

function formatUtcDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function formatUtcTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function formatPrice(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.trim(),
  }).format(amountMinor / 100);
}

export function ShowtimeCard({ showtime }: ShowtimeCardProps) {
  return (
    <Card
      aria-label={`${formatUtcDateTime(showtime.startsAt)} on ${showtime.screenName}`}
      className="movie-showtime-card flex flex-col gap-5 border-solid border-[var(--v3-border)] p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      role="group"
    >
      <div className="min-w-0">
        <time
          className="movie-showtime-time block text-2xl font-semibold leading-tight sm:text-3xl"
          dateTime={showtime.startsAt.toISOString()}
        >
          {formatUtcTime(showtime.startsAt)}
        </time>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="movie-showtime-screen text-sm">
            <Ticket aria-hidden="true" size={16} />
            {showtime.screenName}
          </span>
          <span className="text-sm text-[var(--v3-text-secondary)]">
            {movieLanguageLabel(showtime.language)}
          </span>
          <span className="text-sm text-[var(--v3-text-secondary)]">
            {formatPrice(showtime.priceMinor, showtime.currency)}
          </span>
        </div>
      </div>

      <Button
        asChild
        className="movie-showtime-book-button min-h-12 w-full justify-center px-6 sm:w-auto"
        variant="primary"
      >
        <Link href={`/booking/${showtime.id}`}>
          Book Tickets <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </Button>
    </Card>
  );
}
