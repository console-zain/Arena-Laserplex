import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { updatePromotionAction } from "@/app/admin/promotions/actions";
import { getStoredImageUrl } from "@/lib/public-content";
import { findPromotionByIdForAdmin } from "@/server/services/promotions";

interface EditPromotionPageProps {
  searchParams: Promise<{ id?: string }>;
}

function toUtcInput(date: Date) {
  return date.toISOString().slice(0, 16);
}

export default async function EditPromotionPage({
  searchParams,
}: EditPromotionPageProps) {
  const { id } = await searchParams;
  const promotion = id ? await findPromotionByIdForAdmin(id) : null;

  if (!promotion) {
    notFound();
  }

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
        action={updatePromotionAction.bind(null, promotion.id)}
        description={`Current status: ${promotion.status}. All times are in UTC.`}
        fields={[
          { name: "name", label: "Name", type: "text", value: promotion.name, required: true },
          { name: "code", label: "Code", type: "text", value: promotion.code ?? "" },
          { name: "description", label: "Description", type: "textarea", value: promotion.description, required: true },
          {
            name: "imageKey",
            label: "Promotion image",
            type: "image",
            category: "promotion",
            value: promotion.imageKey ?? "",
            previewUrl: getStoredImageUrl(promotion.imageKey),
          },
          { name: "discountType", label: "Discount type", type: "select", value: promotion.discountType, options: ["PERCENT", "FIXED"] },
          { name: "discountValue", label: "Discount value", type: "number", value: String(promotion.discountValue), required: true },
          { name: "startsAt", label: "Starts at (UTC)", type: "datetime-local", value: toUtcInput(promotion.startsAt), required: true },
          { name: "endsAt", label: "Ends at (UTC)", type: "datetime-local", value: toUtcInput(promotion.endsAt), required: true },
          { name: "totalRedemptionLimit", label: "Total redemption limit", type: "number", value: promotion.totalRedemptionLimit?.toString() ?? "" },
          { name: "perUserLimit", label: "Per-customer limit", type: "number", value: promotion.perUserLimit?.toString() ?? "" },
          { name: "minimumSpendMinor", label: "Minimum spend (minor units)", type: "number", value: promotion.minimumSpendMinor?.toString() ?? "" },
        ]}
        submitLabel="Save promotion"
        title="Edit promotion"
      />
    </div>
  );
}
