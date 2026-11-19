import { z } from "zod";
import { isValidMediaObjectKey } from "@/lib/media-keys";

const utcDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Enter a valid UTC date and time.")
  .refine((value) => {
    const date = new Date(`${value}:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 16) === value
    );
  }, "Enter a valid UTC date and time.")
  .transform((value) => new Date(`${value}:00.000Z`));

const optionalUtcDateTime = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  utcDateTime.nullable(),
);

const optionalImageKey = z
  .string()
  .trim()
  .max(500)
  .transform((value) => (value.length > 0 ? value : null))
  .refine(
    (value) => value === null || isValidMediaObjectKey(value, "event"),
    "Upload an event image.",
  );

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(1, "Enter an event title.").max(180),
    category: z.string().trim().min(1, "Enter an event category.").max(80),
    summary: z.string().trim().min(1, "Enter an event summary.").max(500),
    body: z.string().trim().min(1, "Enter event details.").max(20_000),
    startsAt: utcDateTime,
    endsAt: optionalUtcDateTime,
    imageKey: optionalImageKey,
  })
  .superRefine((event, context) => {
    if (event.endsAt && event.endsAt <= event.startsAt) {
      context.addIssue({
        code: "custom",
        message: "The end time must be after the start time.",
        path: ["endsAt"],
      });
    }
  });

export const eventIdSchema = z.string().uuid("Choose a valid event.");

export type EventFormInput = z.infer<typeof eventFormSchema>;
