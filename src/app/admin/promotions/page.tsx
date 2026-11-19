import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import type { DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import {
  activatePromotionAction,
  deletePromotionAction,
  disablePromotionAction,
} from "@/app/admin/promotions/actions";
import { listAdminPromotions } from "@/server/services/promotions";

type PromotionRow = Awaited<ReturnType<typeof listAdminPromotions>>[number];

function displayStatus(promotion: PromotionRow) {
  if (promotion.status === "ACTIVE" && promotion.endsAt <= new Date()) {
    return "Expired";
  }

  const { status } = promotion;
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "DISABLED":
      return "Inactive";
    case "EXPIRED":
      return "Expired";
    default:
      return "Draft";
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

export default async function AdminPromotionsPage() {
  const promotions = await listAdminPromotions();
  const columns: readonly DataTableColumn<PromotionRow>[] = [
    {
      key: "name",
      header: "Promotion",
      render: (promotion) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Tag aria-hidden="true" size={17} />
          </span>
          <div>
            <p className="m-0 font-medium text-slate-900 dark:text-slate-100">
              {promotion.name}
            </p>
            <p className="mb-0 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {promotion.code ?? "No code"} ·{" "}
              {promotion.discountType === "PERCENT"
                ? `${promotion.discountValue}%`
                : `${promotion.discountValue} minor units`}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "endsAt",
      header: "Ends",
      render: (promotion) => formatDate(promotion.endsAt),
    },
    {
      key: "status",
      header: "Status",
      render: (promotion) => (
        <StatusBadge status={displayStatus(promotion)} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (promotion) => (
        <div className="flex items-center justify-end gap-3">
          <Link
            className="text-xs font-medium text-indigo-600 dark:text-indigo-300"
            href={`/admin/promotions/edit?id=${encodeURIComponent(promotion.id)}`}
          >
            Edit
          </Link>
          {promotion.status === "ACTIVE" ? (
            <form action={disablePromotionAction.bind(null, promotion.id)}>
              <button className="text-xs font-medium text-rose-600" type="submit">
                Disable
              </button>
            </form>
          ) : promotion.status === "EXPIRED" ? null : (
            <form action={activatePromotionAction.bind(null, promotion.id)}>
              <button
                className="text-xs font-medium text-indigo-600 dark:text-indigo-300"
                type="submit"
              >
                Activate
              </button>
            </form>
          )}
          <ConfirmDeleteButton
            action={deletePromotionAction.bind(null, promotion.id)}
            itemName={promotion.name}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="m-0 text-xl font-semibold">Promotions</h2>
          <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure discount rules and activation windows.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          href="/admin/promotions/create"
        >
          <Plus aria-hidden="true" size={16} />
          Add promotion
        </Link>
      </div>
      <DataTable
        columns={columns}
        getRowId={(promotion) => promotion.id}
        rows={promotions}
        emptyMessage="No promotions have been added to the database."
      />
    </div>
  );
}
