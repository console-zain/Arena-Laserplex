export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading page"
      className="mx-auto w-full max-w-6xl animate-pulse space-y-8 px-5 py-12"
    >
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-10 w-2/3 max-w-xl rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-full max-w-2xl rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="aspect-[4/3] rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            key={index}
          />
        ))}
      </div>
    </main>
  );
}
