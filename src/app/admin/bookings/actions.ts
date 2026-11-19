"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/guards";
import { cancelBookingForAdmin } from "@/server/services/bookings";
import { bookingLookupSchema } from "@/server/validation/booking";

export async function cancelAdminBookingAction(bookingId: string) {
  await requireAdmin();
  const parsedId = bookingLookupSchema.shape.bookingId.parse(bookingId);

  await cancelBookingForAdmin(parsedId);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
}
