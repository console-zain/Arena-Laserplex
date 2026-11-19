import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { createPromotionAction } from "@/app/admin/promotions/actions";

export default function CreatePromotionPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-400 dark:hover:text-indigo-300"
        href="/admin/promotions"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to promotions
      </Link>
      <AdminForm
        action={createPromotionAction}
        description="Enter the active window in UTC. Fixed discounts and minimum spend use minor currency units."
        fields={[
          { name: "name", label: "Name", type: "text", required: true },
          {
            name: "code",
            label: "Code",
            type: "text",
            placeholder: "e.g. MATINEE10",
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true,
          },
          {
            name: "imageKey",
            label: "Promotion image",
            type: "image",
            category: "promotion",
          },
          {
            name: "discountType",
            label: "Discount type",
            type: "select",
            value: "PERCENT",
            options: ["PERCENT", "FIXED"],
          },
          {
            name: "discountValue",
            label: "Discount value",
            type: "number",
            required: true,
          },
          {
            name: "startsAt",
            label: "Starts at (UTC)",
            type: "datetime-local",
            required: true,
          },
          {
            name: "endsAt",
            label: "Ends at (UTC)",
            type: "datetime-local",
            required: true,
          },
          {
            name: "totalRedemptionLimit",
            label: "Total redemption limit",
            type: "number",
          },
          {
            name: "perUserLimit",
            label: "Per-customer limit",
            type: "number",
          },
          {
            name: "minimumSpendMinor",
            label: "Minimum spend (minor units)",
            type: "number",
          },
        ]}
        submitLabel="Create draft"
        title="Add a promotion"
      />
    </div>
  );
}
