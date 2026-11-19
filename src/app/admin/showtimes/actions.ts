"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/guards";
import {
  cancelShowtime,
  createShowtime,
  ShowtimeServiceError,
  updateShowtime,
} from "@/server/services/showtimes";
import {
  showtimeFormSchema,
  updateShowtimeFormSchema,
} from "@/server/validation/showtime";

export interface ShowtimeActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
}

function validationState(error: z.ZodError): ShowtimeActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return {
    error:
      Object.keys(fieldErrors).length > 0
        ? "Please correct the highlighted fields."
        : error.issues[0]?.message ?? "Check the showtime details and try again.",
    fieldErrors,
  };
}

function formValues(formData: FormData) {
  return {
    movieId: formData.get("movieId"),
    screenId: formData.get("screenId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    language: formData.get("language") ?? "",
    price: formData.get("price"),
  };
}

export async function createShowtimeAction(
  _previousState: ShowtimeActionState,
  formData: FormData,
): Promise<ShowtimeActionState> {
  const { user } = await requireAdmin();
  const parsed = showtimeFormSchema.safeParse(formValues(formData));

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  try {
    await createShowtime(parsed.data, user.id);
  } catch (error) {
    if (error instanceof ShowtimeServiceError) {
      return { error: error.message };
    }

    throw error;
  }

  revalidatePath("/admin/showtimes");
  return { success: "Showtime created with seat inventory." };
}

export async function updateShowtimeAction(
  _previousState: ShowtimeActionState,
  formData: FormData,
): Promise<ShowtimeActionState> {
  await requireAdmin();
  const parsed = updateShowtimeFormSchema.safeParse({
    ...formValues(formData),
    showtimeId: formData.get("showtimeId"),
  });

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  try {
    await updateShowtime(parsed.data);
  } catch (error) {
    if (error instanceof ShowtimeServiceError) {
      return { error: error.message };
    }

    throw error;
  }

  revalidatePath("/admin/showtimes");
  revalidatePath(`/admin/showtimes/${parsed.data.showtimeId}/edit`);
  return { success: "Showtime updated." };
}

export async function cancelShowtimeAction(
  _previousState: ShowtimeActionState,
  formData: FormData,
): Promise<ShowtimeActionState> {
  await requireAdmin();
  const parsedId = z
    .string()
    .uuid("Select a valid showtime to cancel.")
    .safeParse(formData.get("showtimeId"));

  if (!parsedId.success) {
    return { error: parsedId.error.issues[0]?.message };
  }

  try {
    await cancelShowtime(parsedId.data);
  } catch (error) {
    if (error instanceof ShowtimeServiceError) {
      return { error: error.message };
    }

    throw error;
  }

  revalidatePath("/admin/showtimes");
  return { success: "Showtime cancelled." };
}
