"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root application error.", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-5 py-16 text-center text-white">
          <h1 className="font-heading text-3xl font-bold">
            Arena Laserplex is temporarily unavailable
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
            Please try again. If the problem continues, come back in a moment.
          </p>
          <button
            className="mt-6 min-h-10 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
