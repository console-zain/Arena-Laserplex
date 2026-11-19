import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  detail: string;
  Icon: LucideIcon;
  tone?: "indigo" | "emerald" | "amber" | "sky";
}

const toneClasses = {
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
} as const;

export function StatsCard({
  label,
  value,
  detail,
  Icon,
  tone = "indigo",
}: StatsCardProps) {
  return (
    <article className="admin-stat-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="m-0 text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mb-0 mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
        <span
          className={`grid size-10 place-items-center rounded-lg ${toneClasses[tone]}`}
        >
          <Icon aria-hidden="true" size={19} />
        </span>
      </div>
      <p className="mb-0 mt-4 text-xs text-slate-500 dark:text-slate-400">
        {detail}
      </p>
    </article>
  );
}
