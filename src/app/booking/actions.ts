"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  createBookingReturnPath,
  getSafeBookingReturnTo,
} from "@/server/auth/booking-return-to";
import { requireCustomer } from "@/server/auth/guards";
import {
  BookingServiceError,
  createBooking,
  createSeatHold,
} from "@/server/services/bookings";
import {
  confirmBookingSchema,
  seatHoldIntentSchema,
  seatHoldSchema,
} from "@/server/validation/booking";

export interface BookingActionState {
  error?: string;
}

function firstValidationMessage(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Check your booking details and try again.";
}

function parseSeatIds(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return parsed;
  } catch {
    return null;
  }
}

export async function createSeatHoldAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const intent = seatHoldIntentSchema.safeParse({
    showtimeId: formData.get("showtimeId"),
    seatIds: parseSeatIds(formData.get("seatIds")),
    idempotencyKey: formData.get("idempotencyKey"),
  });

  if (!intent.success) {
    return { error: firstValidationMessage(intent.error) };
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.status !== "ACTIVE") {
    const returnTo = createBookingReturnPath(
      intent.data.showtimeId,
      intent.data.idempotencyKey,
    );
    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/admin/dashboard");
  }

  const parsed = seatHoldSchema.safeParse({
    ...intent.data,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return { error: firstValidationMessage(parsed.error) };
  }

  let bookingId: string;
  try {
    const booking = await createSeatHold(parsed.data);
    bookingId = booking.id;
  } catch (error) {
    if (error instanceof BookingServiceError) {
      return { error: error.message };
    }

    throw error;
  }

  revalidatePath(`/booking/${parsed.data.showtimeId}`);
  redirect(
    `/booking/${parsed.data.showtimeId}/summary?bookingId=${encodeURIComponent(bookingId)}`,
  );
}

export async function createBookingAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const returnTo = getSafeBookingReturnTo(formData.get("returnTo"));
  const { user } = await requireCustomer(returnTo ?? undefined);
  const parsed = confirmBookingSchema.safeParse({
    userId: user.id,
    bookingId: formData.get("bookingId"),
  });

  if (!parsed.success) {
    return { error: firstValidationMessage(parsed.error) };
  }

  let bookingId: string;
  try {
    const booking = await createBooking(parsed.data);
    bookingId = booking.id;
  } catch (error) {
    if (error instanceof BookingServiceError) {
      return { error: error.message };
    }

    throw error;
  }

  revalidatePath("/my-account-2");
  redirect(`/booking/confirmation/${encodeURIComponent(bookingId)}`);
}
