"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminActionError, type AdminActionState } from "@/lib/admin-action-state";
import { requireAdmin } from "@/server/auth/guards";
import {
  createEventRecord,
  deleteEventRecord,
  publishEventRecord,
  updateEventRecord,
} from "@/server/services/events";
import { eventFormSchema, eventIdSchema } from "@/server/validation/events";

function refreshEventPages() {
  revalidatePath("/");
  revalidatePath("/event");
  revalidatePath("/event/[slug]", "page");
  revalidatePath("/admin/events");
  revalidatePath("/admin/dashboard");
}

export async function createEventAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin();
  try {
    await createEventRecord(
      eventFormSchema.parse(Object.fromEntries(formData)),
      session.user.id,
    );
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshEventPages();
  redirect("/admin/events");
}

export async function updateEventAction(
  id: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  try {
    await updateEventRecord(
      eventIdSchema.parse(id),
      eventFormSchema.parse(Object.fromEntries(formData)),
    );
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshEventPages();
  redirect("/admin/events");
}

export async function publishEventAction(id: string) {
  await requireAdmin();
  await publishEventRecord(eventIdSchema.parse(id));
  refreshEventPages();
}

export async function deleteEventAction(
  id: string,
  _previousState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  try {
    await deleteEventRecord(eventIdSchema.parse(id));
  } catch (error) {
    return getAdminActionError(error);
  }

  refreshEventPages();
  return {};
}
