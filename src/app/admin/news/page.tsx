import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import type { DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import {
  deleteNewsAction,
  publishNewsAction,
} from "@/app/admin/news/actions";
import { listAdminNews } from "@/server/services/news";

type NewsRow = Awaited<ReturnType<typeof listAdminNews>>[number];

function displayStatus(status: NewsRow["status"]) {
  return status === "PUBLISHED"
    ? "Published"
    : status === "ARCHIVED"
      ? "Archived"
      : "Draft";
}

export default async function AdminNewsPage() {
  const articles = await listAdminNews();
  const columns: readonly DataTableColumn<NewsRow>[] = [
    {
      key: "title",
      header: "Article",
      render: (article) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
            <FileText aria-hidden="true" size={17} />
          </span>
          <div>
            <p className="m-0 font-medium text-slate-900 dark:text-slate-100">
              {article.title}
            </p>
            <p className="mb-0 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {article.category}
              {article.featured ? " · Featured" : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      render: (article) =>
        new Intl.DateTimeFormat("en", {
          dateStyle: "medium",
          timeZone: "UTC",
        }).format(article.updatedAt),
    },
    {
      key: "status",
      header: "Status",
      render: (article) => (
        <StatusBadge status={displayStatus(article.status)} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (article) => (
        <div className="flex items-center justify-end gap-3">
          <Link
            className="text-xs font-medium text-indigo-600 dark:text-indigo-300"
            href={`/admin/news/edit?id=${encodeURIComponent(article.id)}`}
          >
            Edit
          </Link>
          {article.status !== "PUBLISHED" ? (
            <form action={publishNewsAction.bind(null, article.id)}>
              <button
                className="text-xs font-medium text-indigo-600 dark:text-indigo-300"
                type="submit"
              >
                Publish
              </button>
            </form>
          ) : null}
          <ConfirmDeleteButton
            action={deleteNewsAction.bind(null, article.id)}
            itemName={article.title}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="m-0 text-xl font-semibold">News</h2>
          <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
            Write and publish theater news and announcements.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          href="/admin/news/create"
        >
          <Plus aria-hidden="true" size={16} />
          Add article
        </Link>
      </div>
      <DataTable
        columns={columns}
        getRowId={(article) => article.id}
        rows={articles}
        emptyMessage="No articles have been added to the database."
      />
    </div>
  );
}
