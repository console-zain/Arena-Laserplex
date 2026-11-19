import { z } from "zod";

const uuidSchema = z.string().uuid("A valid booking identifier is required.");

export const bookingLookupSchema = z.object({
  userId: uuidSchema,
  bookingId: uuidSchema,
});

export const seatHoldIntentSchema = z.object({
  showtimeId: uuidSchema,
  seatIds: z
    .array(uuidSchema)
    .min(1, "Choose at least one available seat.")
    .max(240, "You can select up to 240 seats.")
    .refine((seatIds) => new Set(seatIds).size === seatIds.length, {
      message: "A seat can only be selected once.",
    }),
  idempotencyKey: uuidSchema,
});

export const seatHoldSchema = seatHoldIntentSchema.extend({
  userId: uuidSchema,
});

export const confirmBookingSchema = bookingLookupSchema;

export type BookingLookupInput = z.infer<typeof bookingLookupSchema>;
export type SeatHoldIntentInput = z.infer<typeof seatHoldIntentSchema>;
export type SeatHoldInput = z.infer<typeof seatHoldSchema>;
export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;
