import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { CalendarDays, Clock3, Languages, Monitor } from "lucide-react";
import { SeatMap } from "@/components/booking/seat-map";
import type { BookingSeatOption } from "@/components/booking/seat-map";
import { Button } from "@/components/common/button";
import { Container } from "@/components/common/container";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { movieLanguageLabel } from "@/lib/movie-language";
import { releaseExpiredHolds } from "@/server/services/bookings";
import { bookingLookupSchema } from "@/server/validation/booking";

export const metadata: Metadata = {
  title: "Choose Seats",
  description: "Choose available seats for your Arena Laserplex showtime.",
  robots: { index: false, follow: false },
};

interface BookingPageProps {
  params: Promise<{ showtimeId: string }>;
  searchParams: Promise<{
    bookingError?: string | string[];
    resume?: string | string[];
  }>;
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

export default async function BookingPage({
  params,
  searchParams,
}: BookingPageProps) {
  const [{ showtimeId }, query] = await Promise.all([params, searchParams]);
  const validId = bookingLookupSchema.shape.bookingId.safeParse(showtimeId);

  if (!validId.success) {
    notFound();
  }

  await releaseExpiredHolds();
  const now = new Date();
  const showtime = await db.showtime.findUnique({
    where: { id: validId.data },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      status: true,
      basePriceMinor: true,
      currency: true,
      language: true,
      movie: {
        select: { title: true, status: true, originalLanguage: true },
      },
      screen: { select: { name: true, capacity: true, isActive: true } },
      showtimeSeats: {
        orderBy: [{ seat: { rowLabel: "asc" } }, { seat: { seatNumber: "asc" } }],
        select: {
          status: true,
          holdExpiresAt: true,
          seat: {
            select: {
              id: true,
              rowLabel: true,
              seatNumber: true,
              type: true,
            },
          },
        },
      },
    },
  });

  if (
    !showtime ||
    showtime.status !== "SCHEDULED" ||
    showtime.startsAt <= now ||
    showtime.movie.status !== "PUBLISHED" ||
    !showtime.screen.isActive
  ) {
    notFound();
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const activeHold =
    session?.user.status === "ACTIVE" && session.user.role === "CUSTOMER"
      ? await db.booking.findFirst({
          where: {
            userId: session.user.id,
            showtimeId: showtime.id,
            status: "PENDING_PAYMENT",
            holdExpiresAt: { gt: now },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, holdExpiresAt: true },
        })
      : null;
  const isCustomer =
    session?.user.status === "ACTIVE" && session.user.role === "CUSTOMER";
  const resumeValue =
    typeof query.resume === "string" ? query.resume : undefined;
  const validResumeIntent =
    bookingLookupSchema.shape.bookingId.safeParse(resumeValue);
  const resumeIntent =
    isCustomer && validResumeIntent.success
      ? validResumeIntent.data
      : undefined;

  const seats: BookingSeatOption[] = showtime.showtimeSeats.map(
    ({ seat, status, holdExpiresAt }) => ({
      id: seat.id,
      rowLabel: seat.rowLabel,
      seatNumber: seat.seatNumber,
      type: seat.type,
      status,
      holdExpiresAt: holdExpiresAt?.toISOString() ?? null,
    }),
  );
  const bookingError =
    query.bookingError === "seats-unavailable"
      ? "One or more selected seats are no longer available. Please choose again."
      : query.bookingError === "resume-expired"
        ? "Your seat selection could not be resumed. Please choose your seats again."
        : query.resume && !resumeIntent
          ? "Your saved seat selection could not be found. Please choose your seats again."
        : null;

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="pb-16 pt-8 sm:pb-20 sm:pt-12">
        <header className="mb-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--v3-accent-primary)]">
            Step 1 of 3
          </p>
          <h1 className="mb-1 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {showtime.movie.title}
          </h1>
          <p className="m-0 text-sm text-[var(--v3-text-secondary)]">
            Choose your seats
          </p>
        </header>

        <section
          aria-label="Showtime details"
          className="mb-6 grid overflow-hidden rounded-2xl border border-[var(--v3-border)] bg-[var(--v3-border)] sm:grid-cols-2 sm:gap-px xl:grid-cols-5"
        >
          <div className="bg-[var(--v3-surface)] p-4 sm:p-5">
            <p className="mb-1 text-xs text-[var(--v3-text-muted)]">Movie</p>
            <p className="m-0 font-medium">{showtime.movie.title}</p>
          </div>
          <div className="bg-[var(--v3-surface)] p-4 sm:p-5">
            <p className="mb-1 text-xs text-[var(--v3-text-muted)]">Date</p>
            <p className="m-0 flex items-center gap-2 text-sm font-medium">
              <CalendarDays
                aria-hidden="true"
                className="shrink-0 text-[var(--v3-accent-primary)]"
                size={16}
              />
              <time dateTime={showtime.startsAt.toISOString()}>
                {formatUtcDate(showtime.startsAt)}
              </time>
            </p>
          </div>
          <div className="bg-[var(--v3-surface)] p-4 sm:p-5">
            <p className="mb-1 text-xs text-[var(--v3-text-muted)]">
              Time · UTC
            </p>
            <p className="m-0 flex items-center gap-2 text-sm font-medium">
              <Clock3
                aria-hidden="true"
                className="shrink-0 text-[var(--v3-accent-primary)]"
                size={16}
              />
              <time dateTime={showtime.startsAt.toISOString()}>
                {formatUtcTime(showtime.startsAt)}
              </time>
            </p>
          </div>
          <div className="bg-[var(--v3-surface)] p-4 sm:p-5">
            <p className="mb-1 text-xs text-[var(--v3-text-muted)]">Screen</p>
            <p className="m-0 flex items-center gap-2 text-sm font-medium">
              <Monitor
                aria-hidden="true"
                className="shrink-0 text-[var(--v3-accent-primary)]"
                size={16}
              />
              {showtime.screen.name}
            </p>
          </div>
          <div className="bg-[var(--v3-surface)] p-4 sm:p-5">
            <p className="mb-1 text-xs text-[var(--v3-text-muted)]">
              Screening language
            </p>
            <p className="m-0 flex items-center gap-2 text-sm font-medium">
              <Languages
                aria-hidden="true"
                className="shrink-0 text-[var(--v3-accent-primary)]"
                size={16}
              />
              {movieLanguageLabel(
                showtime.language || showtime.movie.originalLanguage,
              )}
            </p>
          </div>
        </section>

        {bookingError ? (
          <p
            aria-live="polite"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
            role="alert"
          >
            {bookingError}
          </p>
        ) : null}

        {activeHold ? (
          <section
            aria-labelledby="active-hold-title"
            className="rounded-2xl border border-[var(--v3-border)] bg-[var(--v3-surface)] p-5 sm:p-7"
            role="status"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--v3-accent-primary)]">
              Step 2 of 3
            </p>
            <h2
              className="mb-0 mt-0 text-xl font-semibold tracking-[-0.03em] sm:text-2xl"
              id="active-hold-title"
            >
              Your seats are reserved
            </h2>
            <p className="mb-0 mt-2 text-sm text-[var(--v3-text-secondary)]">
              Review and confirm your booking before the hold expires.
            </p>
            <dl className="mt-5 border-t border-[var(--v3-border)] pt-4">
              <dt className="text-xs text-[var(--v3-text-muted)]">
                Hold expiry
              </dt>
              <dd className="mb-0 mt-1 font-medium">
                {activeHold.holdExpiresAt ? (
                  <time dateTime={activeHold.holdExpiresAt.toISOString()}>
                    {formatUtcDateTime(activeHold.holdExpiresAt)}
                  </time>
                ) : (
                  "The hold expiry is unavailable."
                )}
              </dd>
            </dl>
            <Button asChild className="mt-5 min-h-12" variant="primary">
              <Link
                href={`/booking/${showtime.id}/summary?bookingId=${encodeURIComponent(activeHold.id)}`}
              >
                Review booking
              </Link>
            </Button>
          </section>
        ) : seats.length > 0 ? (
          <SeatMap
            currency={showtime.currency}
            isAuthenticated={Boolean(isCustomer)}
            priceMinor={showtime.basePriceMinor}
            resumeIntent={resumeIntent}
            seats={seats}
            showtimeId={showtime.id}
          />
        ) : (
          <section
            aria-label="Seat availability"
            className="rounded-2xl border border-[var(--v3-border)] bg-[var(--v3-surface)] p-5 text-sm text-[var(--v3-text-secondary)]"
            role="status"
          >
            Seat inventory is not available for this showtime. Please choose
            another showtime.
          </section>
        )}
      </Container>
    </main>
  );
}
