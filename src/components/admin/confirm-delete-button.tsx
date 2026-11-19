"use client";

import { useActionState, type FormEvent } from "react";
import type { AdminActionState } from "@/lib/admin-action-state";

interface ConfirmDeleteButtonProps {
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  itemName: string;
  confirmMessage?: string;
}

export function ConfirmDeleteButton({
  action,
  itemName,
  confirmMessage,
}: ConfirmDeleteButtonProps) {
  const [state, formAction, isPending] = useActionState(action, {});

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (
      !window.confirm(
        confirmMessage ?? `Permanently delete "${itemName}"? This cannot be undone.`,
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <div className="text-right">
      <form action={formAction} onSubmit={confirmDelete}>
        <button
          className="text-xs font-medium text-rose-600 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-400"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Deleting..." : "Delete"}
        </button>
      </form>
      {state.error ? (
        <p
          aria-live="polite"
          className="mb-0 mt-2 max-w-56 text-xs text-rose-600 dark:text-rose-400"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
