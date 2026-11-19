import { Armchair, MonitorPlay, Rows3 } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { db } from "@/lib/db";

export default async function AdminScreensPage() {
  const screens = await db.screen.findMany({
    orderBy: { code: "asc" },
    include: {
      seats: {
        where: { isActive: true },
        select: { rowLabel: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="m-0 text-xl font-semibold">Screens</h2>
        <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
          Seat capacity and active inventory for each auditorium.
        </p>
      </div>
      {screens.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No cinema screens have been configured.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {screens.map((screen) => {
            const seatsPerRow = new Map<string, number>();

            for (const seat of screen.seats) {
              seatsPerRow.set(
                seat.rowLabel,
                (seatsPerRow.get(seat.rowLabel) ?? 0) + 1,
              );
            }

            const rowSummary = [...seatsPerRow.entries()]
              .sort(([left], [right]) => left.localeCompare(right))
              .map(([row, count]) => `${row} (${count})`)
              .join(" · ");

            return (
              <article
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-6"
                key={screen.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                      <MonitorPlay aria-hidden="true" size={20} />
                    </span>
                    <div>
                      <h3 className="m-0 text-base font-semibold">
                        {screen.name}
                      </h3>
                      <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {screen.code} auditorium
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={screen.isActive ? "Active" : "Inactive"} />
                </div>
                <div className="mt-7 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                    <p className="m-0 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <MonitorPlay aria-hidden="true" size={15} />
                      Capacity
                    </p>
                    <p className="mb-0 mt-2 text-2xl font-semibold">
                      {screen.capacity}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                    <p className="m-0 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <Armchair aria-hidden="true" size={15} />
                      Total seats
                    </p>
                    <p className="mb-0 mt-2 text-2xl font-semibold">
                      {screen.seats.length}
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="m-0 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Rows3 aria-hidden="true" size={15} />
                    Active seat layout
                  </p>
                  <p className="mb-0 mt-2 break-words text-sm text-slate-700 dark:text-slate-300">
                    {rowSummary || "No active seat rows"}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
