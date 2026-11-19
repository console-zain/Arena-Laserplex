import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Languages,
  Monitor,
  Ticket,
} from "lucide-react";
import { ConfirmBookingButton } from "@/components/booking/confirm-booking-button";
import { Button } from "@/components/common/button";
import { Container } from "@/components/common/container";
import { getCustomerBooking } from "@/server/services/bookings";
import { movieLanguageLabel } from "@/lib/movie-language";
import { requireCustomer } from "@/server/auth/guards";
import { createBookingSummaryReturnPath } from "@/server/auth/booking-return-to";
import { bookingLookupSchema } from "@/server/validation/booking";

export const metadata: Metadata = {
  title: "Booking Summary",
  description: "Review your Arena Laserplex booking before confirming.",
  robots: { index: false, follow: false },
};

interface BookingSummaryPageProps {
  params: Promise<{ showtimeId: string }>;
  searchParams: Promise<{ bookingId?: string | string[] }>;
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

function formatUtcDateTime(date: Date) {
  return `${formatUtcDate(date)} · ${formatUtcTime(date)}`;
}

function formatPrice(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.trim(),
  }).format(amountMinor / 100);
}

export default async function BookingSummaryPage({
  params,
  searchParams,
}: BookingSummaryPageProps) {
  const [{ showtimeId }, query] = await Promise.all([params, searchParams]);
  const bookingId =
    typeof query.bookingId === "string" ? query.bookingId : undefined;
  const validBookingId =
    bookingLookupSchema.shape.bookingId.safeParse(bookingId);
  const { user } = await requireCustomer(
    validBookingId.success
      ? createBookingSummaryReturnPath(showtimeId, validBookingId.data)
      : undefined,
  );
  const validIds = bookingLookupSchema.safeParse({
    userId: user.id,
    bookingId,
  });

  if (!validIds.success) {
    notFound();
  }

  const booking = await getCustomerBooking(validIds.data);

  if (!booking || booking.showtimeId !== showtimeId) {
    notFound();
  }

  if (booking.status === "CONFIRMED") {
    redirect(`/booking/confirmation/${booking.id}`);
  }

  if (
    booking.status === "PENDING_PAYMENT" &&
    booking.holdExpiresAt &&
    booking.holdExpiresAt <= new Date()
  ) {
    redirect(`/booking/${booking.showtimeId}`);
  }

  const isPending = booking.status === "PENDING_PAYMENT";
  const currency = booking.currency.trim();

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="max-w-5xl pb-16 pt-8 sm:pb-20 sm:pt-12">
        <header className="mb-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--v3-accent-primary)]">
            Step 2 of 3
          </p>
          <h1 className="mb-1 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Review your booking
          </h1>
          <p className="m-0 text-sm text-[var(--v3-text-secondary)]">
            Confirm your seats before the hold expires.
          </p>
        </header>

        {isPending ? (
          <section
            aria-label="Seat hold expiry"
            className="mb-6 rounded-2xl border border-[var(--v3-border)] bg-[var(--v3-surface-elevated)] p-4 sm:p-5"
            role="status"
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--v3-text-muted)]">
              Hold expiry · UTC
            </p>
            <p className="m-0 text-sm font-medium">
              {booking.holdExpiresAt ? (
                <time dateTime={booking.holdExpiresAt.toISOString()}>
                  {formatUtcDateTime(booking.holdExpiresAt)}
                </time>
              ) : (
                "The hold expiry is unavailable."
              )}
            </p>
            <p className="mb-0 mt-1 text-xs text-[var(--v3-text-secondary)]">
              Confirm before this time to keep your seats.
            </p>
          </section>
        ) : (
          <section
            aria-label="Booking status"
            className="mb-6 rounded-2xl border border-[var(--v3-border)] bg-[var(--v3-surface-elevated)] p-4 sm:p-5"
            role="alert"
          >
            <p className="mb-1 font-semibold">
              This booking is {booking.status.toLowerCase()}.
            </p>
            <p className="m-0 text-sm text-[var(--v3-text-secondary)]">
              The held seats are no longer available. Start again to choose
              seats.
            </p>
          </section>
        )}

        <section
          aria-label="Booking details and price"
          className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6"
        >
          <div className="rounded-2xl border border-[var(--v3-border)] bg-[var(--v3-surface)] p-5 sm:p-7">
            <section aria-labelledby="summary-movie-title">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--v3-text-muted)]">
                Movie
              </p>
              <h2
                className="mb-0 mt-0 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
                id="summary-movie-title"
              >
                {booking.showtime.movie.title}
              </h2>
            </section>

            <section
              aria-labelledby="summary-showtime-title"
              className="mt-7 border-t border-[var(--v3-border)] pt-5"
            >
              <h3
                className="mb-4 mt-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--v3-text-muted)]"
                id="summary-showtime-title"
              >
                Showtime
              </h3>
              <dl className="grid gap-4 sm:grid-cols-2">
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
                  <dt className="text-xs text-[var(--v3-text-muted)]">
                    Screen
                  </dt>
                  <dd className="mb-0 mt-1 flex items-center gap-2 text-sm font-medium">
                    <Monitor
                      aria-hidden="true"
                      className="shrink-0 text-[var(--v3-accent-primary)]"
                      size={16}
                    />
                    {booking.showtime.screen.name}
                  </dd>
                </div>
              </dl>
            </section>

            <section
              aria-labelledby="summary-seats-title"
              className="mt-7 border-t border-[var(--v3-border)] pt-5"
            >
              <div className="flex items-center justify-between gap-4">
                <h3
                  className="mb-0 mt-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--v3-text-muted)]"
                  id="summary-seats-title"
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
          </div>

          <aside className="rounded-2xl border border-[var(--v3-border)] bg-[var(--v3-surface)] p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="m-0 text-lg font-semibold">Price summary</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--v3-text-secondary)]">
                  Price per seat
                </dt>
                <dd className="m-0 text-right">
                  {formatPrice(booking.seats[0]?.priceMinor ?? 0, currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--v3-text-secondary)]">
                  Seats ({booking.seats.length})
                </dt>
                <dd className="m-0 text-right">
                  {formatPrice(booking.subtotalMinor, currency)}
                </dd>
              </div>
              {booking.discountMinor > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--v3-text-secondary)]">
                    Discount
                  </dt>
                  <dd className="m-0 text-right">
                    -{formatPrice(booking.discountMinor, currency)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 border-t border-[var(--v3-border)] pt-4 text-base font-semibold">
                <dt>Total</dt>
                <dd className="m-0 text-right">
                  {formatPrice(booking.totalMinor, currency)}
                </dd>
              </div>
            </dl>
            <p className="mb-0 mt-4 text-xs leading-5 text-[var(--v3-text-muted)]">
              No payment is collected to confirm this booking.
            </p>
            {isPending ? (
              <ConfirmBookingButton
                bookingId={booking.id}
                className="mt-5 min-h-12 w-full"
                returnTo={createBookingSummaryReturnPath(
                  booking.showtimeId,
                  booking.id,
                )}
              />
            ) : (
              <Button
                asChild
                className="mt-5 min-h-12 w-full"
                variant="outline"
              >
                <Link href={`/booking/${booking.showtimeId}`}>
                  Choose seats again
                </Link>
              </Button>
            )}
          </aside>
        </section>

        <p className="mb-0 mt-5">
          <Button asChild className="min-h-11 px-2" variant="ghost">
            <Link href={`/booking/${booking.showtimeId}`}>
              <ArrowLeft aria-hidden="true" size={16} />
              Change seats
            </Link>
          </Button>
        </p>
      </Container>
    </main>
  );
}
