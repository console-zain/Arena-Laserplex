import { DataTableRow } from "@/components/admin/data-table-row";
import type { ReactNode } from "react";

export interface DataTableColumn<T extends object> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface DataTableActions {
  viewHref?: string;
  editHref?: string;
  allowDelete?: boolean;
}

interface DataTableProps<T extends object> {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  emptyMessage?: string;
  actions?: DataTableActions;
}

function getCellValue<T extends object>(row: T, key: string): ReactNode {
  if (!(key in row)) {
    return null;
  }

  const value = row[key as keyof T];
  return typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
    ? String(value)
    : null;
}

export function DataTable<T extends object>({
  columns,
  rows,
  getRowId,
  emptyMessage = "No records to display.",
  actions,
}: DataTableProps<T>) {
  const hasActions =
    Boolean(actions?.viewHref) ||
    Boolean(actions?.editHref) ||
    Boolean(actions?.allowDelete);

  return (
    <div className="admin-table-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              {columns.map((column) => (
                <th
                  className={`whitespace-nowrap px-4 py-3.5 ${column.className ?? ""}`}
                  key={column.key}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
              {hasActions ? (
                <th className="px-4 py-3.5 text-right" scope="col">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length > 0 ? (
              rows.map((row) => {
                const rowId = getRowId(row);

                return (
                  <DataTableRow
                    allowDelete={Boolean(actions?.allowDelete)}
                    editHref={actions?.editHref}
                    key={rowId}
                    rowId={rowId}
                    viewHref={actions?.viewHref}
                  >
                    {columns.map((column) => (
                      <td
                        className={`px-4 py-3.5 ${column.className ?? ""}`}
                        key={column.key}
                      >
                        {column.render
                          ? column.render(row)
                          : getCellValue(row, column.key)}
                      </td>
                    ))}
                  </DataTableRow>
                );
              })
            ) : (
              <tr>
                <td
                  className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                  colSpan={columns.length + Number(hasActions)}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
