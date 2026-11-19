import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { createEventAction } from "@/app/admin/events/actions";

export default function CreateEventPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-400 dark:hover:text-indigo-300"
        href="/admin/events"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to events
      </Link>
      <AdminForm
        action={createEventAction}
        description="All event times are entered and displayed in UTC."
        fields={[
          { name: "title", label: "Title", type: "text", required: true },
          {
            name: "category",
            label: "Category",
            type: "text",
            required: true,
          },
          {
            name: "summary",
            label: "Summary",
            type: "textarea",
            required: true,
          },
          {
            name: "body",
            label: "Event details",
            type: "textarea",
            required: true,
          },
          {
            name: "startsAt",
            label: "Starts at (UTC)",
            type: "datetime-local",
            required: true,
          },
          { name: "endsAt", label: "Ends at (UTC)", type: "datetime-local" },
          {
            name: "imageKey",
            label: "Event image",
            type: "image",
            category: "event",
          },
        ]}
        submitLabel="Create event"
        title="Add an event"
      />
    </div>
  );
}
