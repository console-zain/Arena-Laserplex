export default function AdminLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading admin page"
      className="animate-pulse space-y-6"
    >
      <div className="space-y-3">
        <div className="h-7 w-48 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-28 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            key={index}
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="h-14 border-b border-slate-200 bg-slate-50 last:border-b-0 dark:border-slate-800 dark:bg-slate-900"
            key={index}
          >
            <div className="mx-4 mt-5 h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </section>
  );
}
