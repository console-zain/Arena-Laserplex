"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application route error.", error);
  }, [error]);

  return (
    <main className="flex min-h-[65vh] flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
        A brief interruption
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold text-slate-950 dark:text-white">
        We couldn&apos;t load this page
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">
        Something went wrong while preparing this page. Please try again.
      </p>
      <button
        className="mt-6 min-h-10 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
