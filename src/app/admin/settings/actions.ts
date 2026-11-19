"use server";

import { revalidatePath } from "next/cache";
import { getAdminActionError, type AdminActionState } from "@/lib/admin-action-state";
import { requireAdmin } from "@/server/auth/guards";
import {
  isCinemaSettingsMigrationPending,
  saveCinemaSettingsRecord,
} from "@/server/services/settings";
import { cinemaSettingsSchema } from "@/server/validation/settings";

export async function saveCinemaSettingsAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  try {
    const settings = cinemaSettingsSchema.parse(Object.fromEntries(formData));
    await saveCinemaSettingsRecord(settings);
  } catch (error) {
    if (isCinemaSettingsMigrationPending(error)) {
      return {
        error:
          "Settings storage has not been migrated. Confirm the development database branch, then run npm run db:migrate.",
      };
    }

    return getAdminActionError(error);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/");
  return { success: "Cinema information and contact links saved." };
}
