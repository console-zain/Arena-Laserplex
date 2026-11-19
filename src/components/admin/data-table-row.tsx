"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

interface DataTableRowProps {
  rowId: string;
  children: ReactNode;
  viewHref?: string;
  editHref?: string;
  allowDelete: boolean;
}

export function DataTableRow({
  rowId,
  children,
  viewHref,
  editHref,
  allowDelete,
}: DataTableRowProps) {
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) {
    return null;
  }

  const hasActions = Boolean(viewHref || editHref || allowDelete);

  return (
    <tr className="text-slate-700 hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40">
      {children}
      {hasActions ? (
        <td className="px-4 py-3.5">
          <div className="flex items-center justify-end gap-3">
            {viewHref ? (
              <Link
                className="text-xs font-medium text-slate-500 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-400 dark:hover:text-indigo-300"
                href={`${viewHref}${encodeURIComponent(rowId)}`}
              >
                View
              </Link>
            ) : null}
            {editHref ? (
              <Link
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                href={`${editHref}${encodeURIComponent(rowId)}`}
              >
                Edit
              </Link>
            ) : null}
            {allowDelete ? (
              <button
                className="text-xs font-medium text-rose-600 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
                onClick={() => {
                  if (window.confirm("Remove this item from the current demo table?")) {
                    setIsDeleted(true);
                  }
                }}
                type="button"
              >
                Delete
              </button>
            ) : null}
          </div>
        </td>
      ) : null}
    </tr>
  );
}
