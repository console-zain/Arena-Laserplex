import { slugify } from "@/lib/slug";
import {
  createNews,
  deleteNews,
  findNewsById,
  listNews,
  updateNews,
} from "@/server/repositories/news";
import {
  ContentServiceError,
  rethrowContentMutationError,
} from "@/server/services/content-errors";
import type { NewsFormInput } from "@/server/validation/news";

export function listAdminNews() {
  return listNews({ orderBy: { updatedAt: "desc" } });
}

export function listPublishedNews() {
  const now = new Date();
  return listNews({
    where: { status: "PUBLISHED", publishedAt: { lte: now } },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });
}

export function findNewsBySlug(slug: string) {
  const now = new Date();
  return listNews({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: now },
    },
    take: 1,
  }).then((articles) => articles[0] ?? null);
}

export function findNewsByIdForAdmin(id: string) {
  return findNewsById(id);
}

function newsData(input: NewsFormInput) {
  return {
    slug: slugify(input.title),
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    category: input.category,
    imageKey: input.imageKey,
    featured: input.featured,
  };
}

export async function createNewsRecord(
  input: NewsFormInput,
  adminId: string,
) {
  try {
    return await createNews({
      ...newsData(input),
      author: { connect: { id: adminId } },
    });
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function updateNewsRecord(id: string, input: NewsFormInput) {
  try {
    return await updateNews({ id }, newsData(input));
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function publishNewsRecord(id: string) {
  if (!(await findNewsById(id))) {
    throw new ContentServiceError("Article not found.");
  }

  try {
    return await updateNews(
      { id },
      { status: "PUBLISHED", publishedAt: new Date() },
    );
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function archiveNewsRecord(id: string) {
  try {
    return await updateNews({ id }, { status: "ARCHIVED" });
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function deleteNewsRecord(id: string) {
  try {
    return await deleteNews({ id });
  } catch (error) {
    rethrowContentMutationError(error);
  }
}
