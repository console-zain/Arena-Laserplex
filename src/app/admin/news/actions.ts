"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminActionError, type AdminActionState } from "@/lib/admin-action-state";
import { requireAdmin } from "@/server/auth/guards";
import {
  createNewsRecord,
  deleteNewsRecord,
  publishNewsRecord,
  updateNewsRecord,
} from "@/server/services/news";
import { newsFormSchema, newsIdSchema } from "@/server/validation/news";

function refreshNewsPages() {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/news/[slug]", "page");
  revalidatePath("/admin/news");
  revalidatePath("/admin/dashboard");
}

export async function createNewsAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();
  try {
    await createNewsRecord(
      newsFormSchema.parse(Object.fromEntries(formData)),
      session.user.id,
    );
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshNewsPages();
  redirect("/admin/news");
}

export async function updateNewsAction(
  id: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  try {
    await updateNewsRecord(
      newsIdSchema.parse(id),
      newsFormSchema.parse(Object.fromEntries(formData)),
    );
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshNewsPages();
  redirect("/admin/news");
}

export async function publishNewsAction(id: string) {
  await requireAdmin();
  await publishNewsRecord(newsIdSchema.parse(id));
  refreshNewsPages();
}

export async function deleteNewsAction(
  id: string,
  _previousState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  try {
    await deleteNewsRecord(newsIdSchema.parse(id));
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshNewsPages();
  return {};
}
