import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { createNewsAction } from "@/app/admin/news/actions";

export default function CreateNewsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-400 dark:hover:text-indigo-300"
        href="/admin/news"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to news
      </Link>
      <AdminForm
        action={createNewsAction}
        description="New articles are saved as drafts and remain private until published."
        fields={[
          { name: "title", label: "Title", type: "text", required: true },
          {
            name: "category",
            label: "Category",
            type: "text",
            required: true,
          },
          {
            name: "excerpt",
            label: "Excerpt",
            type: "textarea",
            required: true,
          },
          {
            name: "body",
            label: "Article body",
            type: "textarea",
            required: true,
          },
          {
            name: "imageKey",
            label: "News image",
            type: "image",
            category: "news",
          },
          { name: "featured", label: "Featured article", type: "checkbox" },
        ]}
        submitLabel="Create draft"
        title="Add an article"
      />
    </div>
  );
}
