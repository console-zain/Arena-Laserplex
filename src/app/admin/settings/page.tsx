import { AdminForm } from "@/components/admin/admin-form";
import { saveCinemaSettingsAction } from "@/app/admin/settings/actions";
import { getCinemaSettingsState } from "@/server/services/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { settings, databaseReady } = await getCinemaSettingsState();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="m-0 text-xl font-semibold">Cinema settings</h2>
        <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
          Update venue information and the contact links shown to customers.
        </p>
      </div>
      {databaseReady ? (
        <AdminForm
          action={saveCinemaSettingsAction}
          description="These details appear on the public contact page."
          fields={[
          {
            name: "cinemaName",
            label: "Cinema name",
            type: "text",
            value: settings.cinemaName,
            required: true,
          },
          {
            name: "description",
            label: "Short description",
            type: "textarea",
            value: settings.description,
          },
          {
            name: "address",
            label: "Venue address",
            type: "textarea",
            value: settings.address,
          },
          {
            name: "timezone",
            label: "Cinema timezone",
            type: "text",
            value: settings.timezone,
            required: true,
          },
          {
            name: "contactEmail",
            label: "Contact email",
            type: "email",
            value: settings.contactEmail ?? "",
            placeholder: "hello@example.com",
          },
          {
            name: "contactPhone",
            label: "Phone number",
            type: "text",
            value: settings.contactPhone ?? "",
            placeholder: "+94 11 234 5678",
          },
          {
            name: "websiteUrl",
            label: "Website",
            type: "url",
            value: settings.websiteUrl ?? "",
            placeholder: "https://example.com",
          },
          {
            name: "instagramUrl",
            label: "Instagram",
            type: "url",
            value: settings.instagramUrl ?? "",
            placeholder: "https://instagram.com/...",
          },
          {
            name: "xUrl",
            label: "X",
            type: "url",
            value: settings.xUrl ?? "",
            placeholder: "https://x.com/...",
          },
          {
            name: "whatsappUrl",
            label: "WhatsApp link",
            type: "url",
            value: settings.whatsappUrl ?? "",
            placeholder: "https://wa.me/...",
          },
          {
            name: "facebookUrl",
            label: "Facebook",
            type: "url",
            value: settings.facebookUrl ?? "",
            placeholder: "https://facebook.com/...",
          },
          ]}
          submitLabel="Save cinema information"
          title="Cinema and contact information"
        />
      ) : (
        <p
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
          role="status"
        >
          Settings storage needs its database migration before settings can be
          edited. After confirming the project is on the intended development
          database branch, run <code>npm run db:migrate</code>.
        </p>
      )}
    </div>
  );
}
