import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const showtimeFieldsSchema = z.object({
  movieId: z.string().uuid("Choose a movie."),
  screenId: z.string().uuid("Choose a screen."),
  date: z.string().regex(datePattern, "Enter a valid show date."),
  startTime: z.string().regex(timePattern, "Enter a valid start time."),
  language: z.enum(["", "en", "ta", "si"]),
  price: z
    .string()
    .regex(/^\d{1,7}(?:\.\d{1,2})?$/, "Enter a valid price with up to 2 decimals.")
    .transform((value) => {
      const [whole = "0", fraction = ""] = value.split(".");
      return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    }),
});

function validateDateAndTime(
  showtime: z.output<typeof showtimeFieldsSchema>,
  context: z.RefinementCtx,
) {
  const startsAt = new Date(`${showtime.date}T${showtime.startTime}:00.000Z`);

  if (
    Number.isNaN(startsAt.getTime()) ||
    startsAt.toISOString().slice(0, 10) !== showtime.date
  ) {
    context.addIssue({
      code: "custom",
      message: "Enter a valid calendar date.",
      path: ["date"],
    });
    return;
  }

  if (startsAt <= new Date()) {
    context.addIssue({
      code: "custom",
      message: "Choose a future start time.",
      path: ["startTime"],
    });
  }
}

export const showtimeFormSchema =
  showtimeFieldsSchema.superRefine(validateDateAndTime);
export const updateShowtimeFormSchema = showtimeFieldsSchema
  .extend({ showtimeId: z.string().uuid("Invalid showtime.") })
  .superRefine(validateDateAndTime);

export type ShowtimeFormInput = z.infer<typeof showtimeFormSchema>;
export type UpdateShowtimeFormInput = z.infer<
  typeof updateShowtimeFormSchema
>;
