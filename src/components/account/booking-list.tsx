import Link from "next/link";
import type { BookingStatus } from "@prisma/client";
import { Button } from "@/components/common/button";
import { Card, CardContent } from "@/components/common/card";

export interface AccountBooking {
  id: string;
  status: BookingStatus;
  bookingReference: string;
  totalMinor: number;
  currency: string;
  holdExpiresAt: Date | null;
  showtimeId: string;
  showtime: {
    startsAt: Date;
    movie: { title: string };
    screen: { name: string };
  };
  seats: readonly { id: string; seatLabel: string }[];
}

interface BookingListProps {
  bookings: readonly AccountBooking[];
  emptyMessage: string;
  now: Date;
}

const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Seat hold",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
};

function formatUtcDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

export function partitionAccountBookings(
  bookings: readonly AccountBooking[],
  now: Date,
) {
  const upcoming: AccountBooking[] = [];
  const history: AccountBooking[] = [];

  for (const booking of bookings) {
    const activeHold =
      booking.status === "PENDING_PAYMENT" &&
      booking.holdExpiresAt !== null &&
      booking.holdExpiresAt > now;
    const isUpcoming =
      booking.showtime.startsAt >= now &&
      (booking.status === "CONFIRMED" || activeHold);

    if (isUpcoming) {
      upcoming.push(booking);
    } else {
      history.push(booking);
    }
  }

  upcoming.sort(
    (first, second) =>
      first.showtime.startsAt.getTime() - second.showtime.startsAt.getTime(),
  );

  return { upcoming, history };
}

export function BookingList({
  bookings,
  emptyMessage,
  now,
}: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <p className="m-0 rounded-[var(--v3-radius-card)] border border-[var(--v3-border)] bg-[var(--v3-surface)] p-5 text-sm leading-6 text-[var(--v3-text-secondary)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="m-0 grid list-none gap-4 p-0">
      {bookings.map((booking) => {
        const isActiveHold =
          booking.status === "PENDING_PAYMENT" &&
          booking.holdExpiresAt !== null &&
          booking.holdExpiresAt > now;
        const bookingHref =
          booking.status === "CONFIRMED"
            ? `/booking/confirmation/${booking.id}`
            : isActiveHold
              ? `/booking/${booking.showtimeId}/summary?bookingId=${encodeURIComponent(booking.id)}`
              : null;

        return (
          <li key={booking.id}>
            <Card className="booking-list-card">
              <CardContent className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="m-0 font-[var(--font-heading)] text-xl font-semibold">
                      {booking.showtime.movie.title}
                    </h3>
                    <span className="rounded-full border border-[var(--v3-border)] bg-[var(--v3-highlight)] px-3 py-1 text-xs font-semibold text-[var(--v3-text-secondary)]">
                      {bookingStatusLabels[booking.status]}
                    </span>
                  </div>

                  <dl className="mb-0 mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div className="min-w-0">
                      <dt className="text-xs text-[var(--v3-text-muted)]">
                        Showtime
                      </dt>
                      <dd className="mb-0 mt-1">
                        <time dateTime={booking.showtime.startsAt.toISOString()}>
                          {formatUtcDateTime(booking.showtime.startsAt)}
                        </time>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--v3-text-muted)]">
                        Screen
                      </dt>
                      <dd className="mb-0 mt-1">{booking.showtime.screen.name}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-[var(--v3-text-muted)]">
                        Seats
                      </dt>
                      <dd className="mb-0 mt-1 break-words">
                        {booking.seats.map((seat) => seat.seatLabel).join(", ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--v3-text-muted)]">
                        Total
                      </dt>
                      <dd className="mb-0 mt-1">
                        {formatPrice(booking.totalMinor, booking.currency)}
                      </dd>
                    </div>
                  </dl>

                  <p className="mb-0 mt-3 font-mono text-xs text-[var(--v3-text-muted)]">
                    Ref. {booking.bookingReference}
                  </p>
                  {isActiveHold && booking.holdExpiresAt ? (
                    <p className="mb-0 mt-2 text-xs text-[var(--v3-text-secondary)]">
                      Hold expires{" "}
                      <time dateTime={booking.holdExpiresAt.toISOString()}>
                        {formatUtcDateTime(booking.holdExpiresAt)}
                      </time>
                    </p>
                  ) : null}
                </div>

                {bookingHref ? (
                  <Button asChild variant="outline">
                    <Link href={bookingHref}>
                      {booking.status === "CONFIRMED"
                        ? "View confirmation"
                        : "Continue booking"}
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
