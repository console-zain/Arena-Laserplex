import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Languages,
  Monitor,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { Container } from "@/components/common/container";
import { getCustomerBooking } from "@/server/services/bookings";
import { movieLanguageLabel } from "@/lib/movie-language";
import { requireCustomer } from "@/server/auth/guards";
import { createBookingConfirmationReturnPath } from "@/server/auth/booking-return-to";
import { bookingLookupSchema } from "@/server/validation/booking";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  description: "Your Arena Laserplex booking confirmation.",
  robots: { index: false, follow: false },
};

interface BookingConfirmationPageProps {
  params: Promise<{ bookingId: string }>;
}

function formatUtcDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeZone: "UTC",
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

export default async function BookingConfirmationPage({
  params,
}: BookingConfirmationPageProps) {
  const { bookingId } = await params;
  const validBookingId =
    bookingLookupSchema.shape.bookingId.safeParse(bookingId);
  if (!validBookingId.success) {
    notFound();
  }

  const { user } = await requireCustomer(
    createBookingConfirmationReturnPath(validBookingId.data),
  );
  const validIds = bookingLookupSchema.safeParse({
    userId: user.id,
    bookingId: validBookingId.data,
  });

  if (!validIds.success) {
    notFound();
  }

  const booking = await getCustomerBooking(validIds.data);

  if (!booking || booking.status !== "CONFIRMED") {
    notFound();
  }

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="max-w-3xl pb-16 pt-8 sm:pb-20 sm:pt-12">
        <header className="mb-7">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--v3-accent-primary)]">
            <CheckCircle2 aria-hidden="true" size={15} />
            Booking confirmed · Step 3 of 3
          </p>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--v3-text-muted)]">
            Booking reference
          </p>
          <h1 className="m-0 break-all font-mono text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
            {booking.bookingReference}
          </h1>
          <p className="mb-0 mt-3 text-sm text-[var(--v3-text-secondary)]">
            Keep this reference for your visit.
          </p>
        </header>

        <section
          aria-label="Confirmed booking details"
          className="rounded-2xl border border-[var(--v3-border)] bg-[var(--v3-surface)] p-5 sm:p-7"
        >
          <section aria-labelledby="confirmation-movie-title">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--v3-text-muted)]">
              Movie
            </p>
            <h2
              className="mb-0 mt-0 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
              id="confirmation-movie-title"
            >
              {booking.showtime.movie.title}
            </h2>
          </section>

          <dl className="mt-6 grid gap-5 border-t border-[var(--v3-border)] pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--v3-text-muted)]">
                Screening language
              </dt>
              <dd className="mb-0 mt-1 flex items-center gap-2 text-sm font-medium">
                <Languages
                  aria-hidden="true"
                  className="shrink-0 text-[var(--v3-accent-primary)]"
                  size={16}
                />
                {movieLanguageLabel(booking.showtime.language)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--v3-text-muted)]">Screen</dt>
              <dd className="mb-0 mt-1 flex items-center gap-2 text-sm font-medium">
                <Monitor
                  aria-hidden="true"
                  className="shrink-0 text-[var(--v3-accent-primary)]"
                  size={16}
                />
                {booking.showtime.screen.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--v3-text-muted)]">Date</dt>
              <dd className="mb-0 mt-1 flex items-start gap-2 text-sm font-medium">
                <CalendarDays
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[var(--v3-accent-primary)]"
                  size={16}
                />
                <time dateTime={booking.showtime.startsAt.toISOString()}>
                  {formatUtcDate(booking.showtime.startsAt)}
                </time>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--v3-text-muted)]">
                Time · UTC
              </dt>
              <dd className="mb-0 mt-1 flex items-center gap-2 text-sm font-medium">
                <Clock3
                  aria-hidden="true"
                  className="shrink-0 text-[var(--v3-accent-primary)]"
                  size={16}
                />
                <time dateTime={booking.showtime.startsAt.toISOString()}>
                  {formatUtcTime(booking.showtime.startsAt)}
                </time>
              </dd>
            </div>
          </dl>

          <section
            aria-labelledby="confirmation-seats-title"
            className="mt-6 border-t border-[var(--v3-border)] pt-5"
          >
            <div className="flex items-center justify-between gap-4">
              <h3
                className="mb-0 mt-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--v3-text-muted)]"
                id="confirmation-seats-title"
              >
                Seats
              </h3>
              <span className="text-xs text-[var(--v3-text-secondary)]">
                {booking.seats.length}{" "}
                {booking.seats.length === 1 ? "ticket" : "tickets"}
              </span>
            </div>
            <ul className="m-0 mt-3 flex flex-wrap gap-2 p-0">
              {booking.seats.map((seat) => (
                <li
                  className="flex min-h-11 list-none items-center gap-2 rounded-lg border border-[var(--v3-border)] bg-[var(--v3-surface-elevated)] px-3 text-sm font-medium"
                  key={seat.id}
                >
                  <Ticket
                    aria-hidden="true"
                    className="text-[var(--v3-accent-primary)]"
                    size={15}
                  />
                  {seat.seatLabel}
                </li>
              ))}
            </ul>
          </section>
        </section>

        <Button
          asChild
          className="mt-6 min-h-12 w-full sm:w-auto"
          variant="primary"
        >
          <Link href="/my-account-2">View booking history</Link>
        </Button>
      </Container>
    </main>
  );
}
