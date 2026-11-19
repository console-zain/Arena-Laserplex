"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminActionError, type AdminActionState } from "@/lib/admin-action-state";
import { requireAdmin } from "@/server/auth/guards";
import {
  activatePromotionRecord,
  createPromotionRecord,
  deletePromotionRecord,
  disablePromotionRecord,
  updatePromotionRecord,
} from "@/server/services/promotions";
import {
  promotionFormSchema,
  promotionIdSchema,
} from "@/server/validation/promotions";

function refreshPromotionPages() {
  revalidatePath("/admin/promotions");
  revalidatePath("/admin/dashboard");
}

export async function createPromotionAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  try {
    await createPromotionRecord(
      promotionFormSchema.parse(Object.fromEntries(formData)),
    );
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshPromotionPages();
  redirect("/admin/promotions");
}

export async function updatePromotionAction(
  id: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  try {
    await updatePromotionRecord(
      promotionIdSchema.parse(id),
      promotionFormSchema.parse(Object.fromEntries(formData)),
    );
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshPromotionPages();
  redirect("/admin/promotions");
}

export async function activatePromotionAction(id: string) {
  await requireAdmin();
  await activatePromotionRecord(promotionIdSchema.parse(id));
  refreshPromotionPages();
}

export async function disablePromotionAction(id: string) {
  await requireAdmin();
  await disablePromotionRecord(promotionIdSchema.parse(id));
  refreshPromotionPages();
}

export async function deletePromotionAction(
  id: string,
  _previousState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  try {
    await deletePromotionRecord(promotionIdSchema.parse(id));
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshPromotionPages();
  return {};
}
