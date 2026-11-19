import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import type { DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import {
  deleteEventAction,
  publishEventAction,
} from "@/app/admin/events/actions";
import { listAdminEvents } from "@/server/services/events";

type EventRow = Awaited<ReturnType<typeof listAdminEvents>>[number];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

function displayStatus(status: EventRow["status"]) {
  switch (status) {
    case "PUBLISHED":
      return "Published";
    case "ARCHIVED":
      return "Archived";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Draft";
  }
}

export default async function AdminEventsPage() {
  const events = await listAdminEvents();
  const columns: readonly DataTableColumn<EventRow>[] = [
    {
      key: "title",
      header: "Event",
      render: (event) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <CalendarDays aria-hidden="true" size={17} />
          </span>
          <div>
            <p className="m-0 font-medium text-slate-900 dark:text-slate-100">
              {event.title}
            </p>
            <p className="mb-0 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {event.category}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "startsAt",
      header: "Starts (UTC)",
      render: (event) => formatDate(event.startsAt),
    },
    {
      key: "status",
      header: "Status",
      render: (event) => <StatusBadge status={displayStatus(event.status)} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (event) => (
        <div className="flex items-center justify-end gap-3">
          <Link
            className="text-xs font-medium text-indigo-600 dark:text-indigo-300"
            href={`/admin/events/edit?id=${encodeURIComponent(event.id)}`}
          >
            Edit
          </Link>
          {event.status !== "PUBLISHED" && event.status !== "CANCELLED" ? (
            <form action={publishEventAction.bind(null, event.id)}>
              <button
                className="text-xs font-medium text-indigo-600 dark:text-indigo-300"
                type="submit"
              >
                Publish
              </button>
            </form>
          ) : null}
          <ConfirmDeleteButton
            action={deleteEventAction.bind(null, event.id)}
            itemName={event.title}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="m-0 text-xl font-semibold">Events</h2>
          <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create and publish special theater events.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          href="/admin/events/create"
        >
          <Plus aria-hidden="true" size={16} />
          Add event
        </Link>
      </div>
      <DataTable
        columns={columns}
        getRowId={(event) => event.id}
        rows={events}
        emptyMessage="No events have been added to the database."
      />
    </div>
  );
}
