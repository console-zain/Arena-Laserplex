"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Accessibility,
  Armchair,
  Ban,
  Check,
  LockKeyhole,
  Ticket,
  X,
} from "lucide-react";
import {
  createSeatHoldAction,
  type BookingActionState,
} from "@/app/booking/actions";
import { Button } from "@/components/common/button";
import type { ShowtimeSeatStatus, SeatType } from "@prisma/client";

export interface BookingSeatOption {
  id: string;
  rowLabel: string;
  seatNumber: number;
  type: SeatType;
  status: ShowtimeSeatStatus;
  holdExpiresAt: string | null;
}

interface SeatMapProps {
  showtimeId: string;
  seats: readonly BookingSeatOption[];
  priceMinor: number;
  currency: string;
  isAuthenticated: boolean;
  resumeIntent?: string;
}

type VisibleSeatStatus = ShowtimeSeatStatus;
type SeatMarkerStatus = VisibleSeatStatus | "SELECTED";

const initialActionState: BookingActionState = {};

const seatClasses: Record<VisibleSeatStatus, string> = {
  AVAILABLE:
    "border-[var(--seat-available-border)] bg-[var(--seat-available)] text-[var(--seat-available-ink)] hover:border-[var(--v3-accent-primary)] hover:bg-[var(--seat-available-hover)]",
  HELD:
    "cursor-not-allowed border-dashed border-[var(--v3-accent-secondary)] bg-[var(--seat-held)] text-[var(--v3-accent-secondary)]",
  BOOKED:
    "cursor-not-allowed border-double border-[var(--seat-booked)] bg-[var(--seat-booked)] text-white",
  BLOCKED:
    "cursor-not-allowed border-dotted border-[var(--v3-border)] bg-[var(--seat-blocked)] text-[var(--v3-text-muted)]",
};

const statusLabels: Record<VisibleSeatStatus, string> = {
  AVAILABLE: "Available",
  HELD: "Held",
  BOOKED: "Booked",
  BLOCKED: "Blocked",
};

const legendItems: readonly {
  status: SeatMarkerStatus;
  label: string;
}[] = [
  { status: "AVAILABLE", label: "Available" },
  { status: "SELECTED", label: "Selected" },
  { status: "HELD", label: "Held" },
  { status: "BOOKED", label: "Booked" },
  { status: "BLOCKED", label: "Blocked" },
];

function SeatMarker({
  status,
  seatNumber,
}: {
  status: SeatMarkerStatus;
  seatNumber?: number;
}) {
  const iconClassName = "shrink-0";

  switch (status) {
    case "AVAILABLE":
      return <span aria-hidden="true">{seatNumber ?? "01"}</span>;
    case "SELECTED":
      return <Check aria-hidden="true" className={iconClassName} size={16} />;
    case "HELD":
      return (
        <LockKeyhole
          aria-hidden="true"
          className={iconClassName}
          size={15}
        />
      );
    case "BOOKED":
      return <X aria-hidden="true" className={iconClassName} size={16} />;
    case "BLOCKED":
      return <Ban aria-hidden="true" className={iconClassName} size={15} />;
  }
}

function formatPrice(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.trim(),
  }).format(amountMinor / 100);
}

export function SeatMap({
  showtimeId,
  seats,
  priceMinor,
  currency,
  isAuthenticated,
  resumeIntent,
}: SeatMapProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const resumeAttemptedRef = useRef(false);
  const [actionState, formAction, isPending] = useActionState(
    createSeatHoldAction,
    initialActionState,
  );
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [clientError, setClientError] = useState("");
  const [resumeSubmissionPending, setResumeSubmissionPending] =
    useState(false);

  useEffect(() => {
    if (!resumeIntent) {
      setIdempotencyKey(window.crypto.randomUUID());
    }
  }, [resumeIntent]);

  useEffect(() => {
    resumeAttemptedRef.current = false;
  }, [resumeIntent]);

  useEffect(() => {
    if (!resumeIntent || !isAuthenticated || resumeAttemptedRef.current) {
      return;
    }

    resumeAttemptedRef.current = true;
    const failResume = (message: string) => {
      setClientError(message);
      setIdempotencyKey(window.crypto.randomUUID());
    };

    try {
      const savedSelection = window.sessionStorage.getItem(
        `arena-booking-intent-${resumeIntent}`,
      );
      if (!savedSelection) {
        failResume(
          "Your seat selection could not be restored. Please choose your seats again.",
        );
        return;
      }

      const parsed: unknown = JSON.parse(savedSelection);
      if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 240) {
        failResume(
          "Your seat selection could not be restored. Please choose your seats again.",
        );
        return;
      }

      const selectedIds = parsed.filter(
        (seatId): seatId is string => typeof seatId === "string",
      );
      if (
        selectedIds.length !== parsed.length ||
        new Set(selectedIds).size !== selectedIds.length
      ) {
        failResume(
          "Your seat selection could not be restored. Please choose your seats again.",
        );
        return;
      }

      const selectedSeats = seats.filter((seat) =>
        selectedIds.includes(seat.id),
      );
      if (
        selectedSeats.length !== selectedIds.length ||
        selectedSeats.some((seat) => seat.status !== "AVAILABLE")
      ) {
        failResume(
          "One or more selected seats are no longer available. Please choose again.",
        );
        return;
      }

      setClientError("");
      setSelectedSeatIds(new Set(selectedIds));
      setIdempotencyKey(resumeIntent);
      setResumeSubmissionPending(true);
    } catch {
      failResume(
        "Your seat selection could not be restored. Please choose your seats again.",
      );
    }
  }, [isAuthenticated, resumeIntent, seats]);

  useEffect(() => {
    if (
      !resumeSubmissionPending ||
      idempotencyKey !== resumeIntent ||
      selectedSeatIds.size === 0
    ) {
      return;
    }

    setResumeSubmissionPending(false);
    formRef.current?.requestSubmit();
  }, [
    idempotencyKey,
    resumeIntent,
    resumeSubmissionPending,
    selectedSeatIds,
  ]);

  useEffect(() => {
    if (!actionState.error) {
      return;
    }

    setSelectedSeatIds(new Set());
    router.refresh();
  }, [actionState, router]);

  useEffect(() => {
    const now = currentTime || Date.now();
    const nextExpiry = seats
      .filter(
        (seat) =>
          seat.status === "HELD" &&
          seat.holdExpiresAt !== null &&
          Date.parse(seat.holdExpiresAt) > now,
      )
      .reduce<number | null>((nearest, seat) => {
        const expiry = seat.holdExpiresAt
          ? Date.parse(seat.holdExpiresAt)
          : Number.POSITIVE_INFINITY;
        return nearest === null || expiry < nearest ? expiry : nearest;
      }, null);

    if (nextExpiry === null) {
      return;
    }

    const timeout = window.setTimeout(
      () => setCurrentTime(Date.now()),
      Math.max(0, nextExpiry - Date.now() + 25),
    );

    return () => window.clearTimeout(timeout);
  }, [currentTime, seats]);

  const rows = new Map<string, BookingSeatOption[]>();
  for (const seat of seats) {
    const row = rows.get(seat.rowLabel) ?? [];
    row.push(seat);
    rows.set(seat.rowLabel, row);
  }

  const selectedSeats = seats
    .filter((seat) => selectedSeatIds.has(seat.id))
    .map((seat) => `${seat.rowLabel}${seat.seatNumber}`);
  const totalMinor = selectedSeats.length * priceMinor;

  function getVisibleStatus(seat: BookingSeatOption): VisibleSeatStatus {
    if (
      seat.status === "HELD" &&
      seat.holdExpiresAt &&
      currentTime > 0 &&
      Date.parse(seat.holdExpiresAt) <= currentTime
    ) {
      return "AVAILABLE";
    }

    return seat.status;
  }

  function toggleSeat(seatId: string) {
    setClientError("");
    setSelectedSeatIds((current) => {
      const updated = new Set(current);
      if (updated.has(seatId)) {
        updated.delete(seatId);
      } else {
        updated.add(seatId);
      }
      return updated;
    });
  }

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    setClientError("");
    if (isAuthenticated) {
      return;
    }

    try {
      window.sessionStorage.setItem(
        `arena-booking-intent-${idempotencyKey}`,
        JSON.stringify([...selectedSeatIds]),
      );
    } catch {
      event.preventDefault();
      setClientError(
        "Your browser could not save the selected seats. Allow session storage and try again.",
      );
    }
  }

  return (
    <div className="seat-map-layout grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_21rem] xl:gap-6">
      <aside className="seat-map-summary v4-glass-panel sticky top-20 z-20 order-1 rounded-2xl border border-[var(--v3-border)] bg-[var(--v3-surface)] p-5 shadow-[var(--v3-shadow-medium)] xl:order-2 xl:top-24">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--v3-text-muted)]">
              Your selection
            </p>
            <h2 className="mb-0 mt-1 text-xl font-semibold tracking-[-0.03em]">
              Booking total
            </h2>
          </div>
          <Ticket
            aria-hidden="true"
            className="mt-1 text-[var(--v3-accent-primary)]"
            size={20}
          />
        </div>

        <p
          aria-atomic="true"
          aria-live="polite"
          className="mb-0 mt-4 text-sm font-medium"
        >
          {selectedSeats.length}{" "}
          {selectedSeats.length === 1 ? "seat" : "seats"} selected
        </p>
        <dl className="mt-4 space-y-3 border-t border-[var(--v3-border)] pt-4 text-sm">
          <div>
            <dt className="text-[var(--v3-text-muted)]">Seats</dt>
            <dd className="mb-0 mt-1 break-words font-medium">
              {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Choose seats"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--v3-text-muted)]">Price per seat</dt>
            <dd className="m-0 font-medium">
              {formatPrice(priceMinor, currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-[var(--v3-border)] pt-3">
            <dt className="font-semibold">Total</dt>
            <dd className="m-0 text-lg font-semibold">
              {formatPrice(totalMinor, currency)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--v3-text-muted)]">Hold expiry</dt>
            <dd className="mb-0 mt-1 text-xs leading-5 text-[var(--v3-text-secondary)]">
              10 minutes after you reserve.
            </dd>
          </div>
        </dl>

        <form
          action={formAction}
          className="mt-5 space-y-3"
          onSubmit={handleContinue}
          ref={formRef}
        >
          <input name="showtimeId" type="hidden" value={showtimeId} />
          <input
            name="seatIds"
            type="hidden"
            value={JSON.stringify([...selectedSeatIds])}
          />
          <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
          {actionState.error ? (
            <p
              aria-live="polite"
              className="m-0 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {actionState.error}
            </p>
          ) : null}
          {clientError ? (
            <p
              aria-live="polite"
              className="m-0 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {clientError}
            </p>
          ) : null}
          <Button
            className="min-h-12 w-full"
            disabled={
              isPending ||
              resumeSubmissionPending ||
              selectedSeatIds.size === 0 ||
              idempotencyKey.length === 0
            }
            type="submit"
          >
            {isPending ? "Reserving seats..." : "Continue"}
          </Button>
          <p className="m-0 text-center text-xs text-[var(--v3-text-muted)]">
            No payment is due to reserve seats.
          </p>
        </form>
      </aside>

      <section
        aria-labelledby="seat-map-title"
        className="seat-map-panel v4-glass-panel order-2 min-w-0 rounded-2xl border border-[var(--v3-border)] bg-[var(--v3-surface)] p-4 sm:p-6 lg:p-8 xl:order-1"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--v3-accent-primary)]">
              Step 1 of 3
            </p>
            <h2
              className="mb-0 mt-1 text-xl font-semibold tracking-[-0.03em] sm:text-2xl"
              id="seat-map-title"
            >
              Choose your seats
            </h2>
          </div>
          <p className="m-0 text-xs text-[var(--v3-text-muted)]">
            Select available seats to continue.
          </p>
        </div>

        <div
          aria-describedby="seat-map-help"
          aria-label="Seat map"
          className="overflow-x-auto overscroll-x-contain pb-3"
          role="group"
          tabIndex={0}
        >
          <div className="seat-map-canvas mx-auto min-w-[44rem] rounded-2xl bg-[var(--v3-canvas)] px-4 py-8 sm:px-6 sm:py-10">
            <div className="space-y-3">
              {[...rows.entries()].map(([rowLabel, rowSeats]) => (
                <div
                  aria-label={`Row ${rowLabel}`}
                  className="seat-map-row flex items-center justify-center gap-1 sm:gap-1.5"
                  key={rowLabel}
                  role="group"
                >
                  <span
                    aria-hidden="true"
                    className="w-7 shrink-0 text-center text-xs font-semibold text-[var(--v3-text-muted)]"
                  >
                    {rowLabel}
                  </span>
                  {rowSeats.map((seat, seatIndex) => {
                    const status = getVisibleStatus(seat);
                    const selected = selectedSeatIds.has(seat.id);
                    const seatType =
                      seat.type === "ACCESSIBLE" ? "accessible" : "standard";
                    const markerStatus = selected ? "SELECTED" : status;
                    const aisleIndex =
                      rowSeats.length > 1 &&
                      seatIndex === Math.floor(rowSeats.length / 2);

                    return (
                      <button
                        aria-label={`Row ${seat.rowLabel}, seat ${seat.seatNumber}, ${seatType}, ${selected ? "selected" : statusLabels[status]}`}
                        aria-pressed={selected}
                        className={`seat-map-seat relative grid size-9 shrink-0 place-items-center rounded-lg border-2 text-xs font-semibold shadow-sm transition-[background-color,border-color,transform] duration-[180ms] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--v3-focus-ring)] disabled:cursor-not-allowed motion-reduce:transition-none sm:size-10 sm:text-sm ${
                          aisleIndex ? "ml-5 sm:ml-8" : ""
                        } ${
                          selected
                            ? "border-[var(--v3-accent-primary)] bg-[var(--v3-accent-primary)] text-[#171717]"
                            : seatClasses[status]
                        }`}
                        disabled={status !== "AVAILABLE" || isPending}
                        key={seat.id}
                        onClick={() => toggleSeat(seat.id)}
                        title={`Row ${seat.rowLabel}, seat ${seat.seatNumber} · ${seatType} · ${selected ? "Selected" : statusLabels[status]}`}
                        type="button"
                      >
                        {seat.type === "ACCESSIBLE" ? (
                          <Accessibility
                            aria-hidden="true"
                            className="absolute right-0.5 top-0.5"
                            size={11}
                          />
                        ) : null}
                        <SeatMarker
                          seatNumber={seat.seatNumber}
                          status={markerStatus}
                        />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div
              aria-label="Cinema screen, in front of the seating rows"
              className="seat-map-screen-wrap"
              role="img"
            >
              <span aria-hidden="true" className="seat-map-screen-surface" />
              <span className="seat-map-screen-label">SCREEN</span>
              <span className="seat-map-screen-caption">Front of theatre</span>
            </div>
          </div>
        </div>
        <p
          className="mb-0 mt-2 text-xs text-[var(--v3-text-muted)]"
          id="seat-map-help"
        >
          On smaller screens, scroll horizontally to view the full seating map.
        </p>

        <div className="mt-6 grid gap-5 border-t border-[var(--v3-border)] pt-5 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 mt-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--v3-text-muted)]">
              Seat status
            </h3>
            <ul className="m-0 flex flex-wrap gap-x-4 gap-y-3 p-0 text-xs">
              {legendItems.map(({ status, label }) => (
                <li className="flex list-none items-center gap-2" key={status}>
                  <span
                    aria-hidden="true"
                    className={`grid size-8 place-items-center rounded-lg border-2 text-[10px] font-semibold ${
                      status === "SELECTED"
                        ? "border-[var(--v3-accent-primary)] bg-[var(--v3-accent-primary)] text-[#171717]"
                        : seatClasses[status]
                    }`}
                  >
                    <SeatMarker status={status} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 mt-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--v3-text-muted)]">
              Seat type
            </h3>
            <ul className="m-0 flex flex-wrap gap-x-4 gap-y-3 p-0 text-xs text-[var(--v3-text-secondary)]">
              <li className="flex list-none items-center gap-2">
                <Armchair aria-hidden="true" size={16} />
                Standard
              </li>
              <li className="flex list-none items-center gap-2">
                <Accessibility aria-hidden="true" size={16} />
                Accessible
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
