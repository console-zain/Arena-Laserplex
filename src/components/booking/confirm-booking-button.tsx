"use client";

import { useActionState } from "react";
import {
  createBookingAction,
  type BookingActionState,
} from "@/app/booking/actions";
import { Button } from "@/components/common/button";

const initialActionState: BookingActionState = {};

interface ConfirmBookingButtonProps {
  bookingId: string;
  returnTo: string;
  className?: string;
}

export function ConfirmBookingButton({
  bookingId,
  returnTo,
  className,
}: ConfirmBookingButtonProps) {
  const [state, formAction, isPending] = useActionState(
    createBookingAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input name="bookingId" type="hidden" value={bookingId} />
      <input name="returnTo" type="hidden" value={returnTo} />
      {isPending ? (
        <p aria-live="polite" className="sr-only">
          Confirming your booking.
        </p>
      ) : null}
      {state.error ? (
        <p
          aria-live="polite"
          className="m-0 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <Button
        className={className ?? "w-full sm:w-auto"}
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Confirming..." : "Confirm booking"}
      </Button>
    </form>
  );
}
