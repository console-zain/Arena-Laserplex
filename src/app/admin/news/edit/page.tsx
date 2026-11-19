import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { updateNewsAction } from "@/app/admin/news/actions";
import { getStoredImageUrl } from "@/lib/public-content";
import { findNewsByIdForAdmin } from "@/server/services/news";

interface EditNewsPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function EditNewsPage({ searchParams }: EditNewsPageProps) {
  const { id } = await searchParams;
  const article = id ? await findNewsByIdForAdmin(id) : null;

  if (!article) {
    notFound();
  }

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
        action={updateNewsAction.bind(null, article.id)}
        description={`Current status: ${article.status}.`}
        fields={[
          { name: "title", label: "Title", type: "text", value: article.title, required: true },
          { name: "category", label: "Category", type: "text", value: article.category, required: true },
          { name: "excerpt", label: "Excerpt", type: "textarea", value: article.excerpt, required: true },
          { name: "body", label: "Article body", type: "textarea", value: article.body, required: true },
          {
            name: "imageKey",
            label: "News image",
            type: "image",
            category: "news",
            value: article.imageKey ?? "",
            previewUrl: getStoredImageUrl(article.imageKey),
          },
          { name: "featured", label: "Featured article", type: "checkbox", value: article.featured ? "true" : "false" },
        ]}
        submitLabel="Save article"
        title="Edit article"
      />
    </div>
  );
}
