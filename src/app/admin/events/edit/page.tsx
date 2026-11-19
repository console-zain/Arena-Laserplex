import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { updateEventAction } from "@/app/admin/events/actions";
import { getStoredImageUrl } from "@/lib/public-content";
import { findEventByIdForAdmin } from "@/server/services/events";

interface EditEventPageProps {
  searchParams: Promise<{ id?: string }>;
}

function toUtcInput(date: Date | null) {
  return date ? date.toISOString().slice(0, 16) : "";
}

export default async function EditEventPage({
  searchParams,
}: EditEventPageProps) {
  const { id } = await searchParams;
  const event = id ? await findEventByIdForAdmin(id) : null;

  if (!event) {
    notFound();
  }

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
        action={updateEventAction.bind(null, event.id)}
        description={`Current status: ${event.status}. All event times are in UTC.`}
        fields={[
          { name: "title", label: "Title", type: "text", value: event.title, required: true },
          { name: "category", label: "Category", type: "text", value: event.category, required: true },
          { name: "summary", label: "Summary", type: "textarea", value: event.summary, required: true },
          { name: "body", label: "Event details", type: "textarea", value: event.body, required: true },
          { name: "startsAt", label: "Starts at (UTC)", type: "datetime-local", value: toUtcInput(event.startsAt), required: true },
          { name: "endsAt", label: "Ends at (UTC)", type: "datetime-local", value: toUtcInput(event.endsAt) },
          {
            name: "imageKey",
            label: "Event image",
            type: "image",
            category: "event",
            value: event.imageKey ?? "",
            previewUrl: getStoredImageUrl(event.imageKey),
          },
        ]}
        submitLabel="Save event"
        title="Edit event"
      />
    </div>
  );
}
