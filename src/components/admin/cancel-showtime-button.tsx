"use client";

import { useActionState } from "react";
import {
  cancelShowtimeAction,
  type ShowtimeActionState,
} from "@/app/admin/showtimes/actions";

interface CancelShowtimeButtonProps {
  showtimeId: string;
}

const initialState: ShowtimeActionState = {};

export function CancelShowtimeButton({
  showtimeId,
}: CancelShowtimeButtonProps) {
  const [state, formAction, isPending] = useActionState(
    cancelShowtimeAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input name="showtimeId" type="hidden" value={showtimeId} />
      <button
        className="inline-flex min-h-9 items-center justify-center rounded-md border border-rose-300 px-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Cancelling..." : "Cancel"}
      </button>
      {state.error ? (
        <span className="max-w-40 text-right text-xs text-rose-600 dark:text-rose-400">
          {state.error}
        </span>
      ) : null}
      {state.success ? (
        <span className="text-right text-xs text-emerald-700 dark:text-emerald-400">
          {state.success}
        </span>
      ) : null}
    </form>
  );
}
