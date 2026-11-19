import { z } from "zod";
import { isValidMediaObjectKey } from "@/lib/media-keys";

const dateTimeInput = z
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

const optionalInteger = z.preprocess(
  (value) => {
    if (typeof value !== "string" || value.trim() === "") {
      return null;
    }

    return Number(value);
  },
  z.number().int().positive().max(2_147_483_647).nullable(),
);

const optionalImageKey = z
  .string()
  .trim()
  .max(500)
  .transform((value) => (value.length > 0 ? value : null))
  .refine(
    (value) => value === null || isValidMediaObjectKey(value, "promotion"),
    "Upload a promotion image.",
  );

export const promotionFormSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a promotion name.").max(160),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .max(40)
      .transform((value) => (value.length > 0 ? value : null))
      .refine(
        (value) => value === null || /^[A-Z0-9_-]+$/.test(value),
        "Use letters, numbers, dashes, or underscores for the promotion code.",
      ),
    description: z
      .string()
      .trim()
      .min(1, "Enter a promotion description.")
      .max(2000),
    imageKey: optionalImageKey,
    discountType: z.enum(["PERCENT", "FIXED"]),
    discountValue: z.coerce
      .number()
      .int()
      .positive()
      .max(2_147_483_647),
    startsAt: dateTimeInput,
    endsAt: dateTimeInput,
    totalRedemptionLimit: optionalInteger,
    perUserLimit: optionalInteger,
    minimumSpendMinor: optionalInteger,
  })
  .superRefine((promotion, context) => {
    if (promotion.endsAt <= promotion.startsAt) {
      context.addIssue({
        code: "custom",
        message: "The end date must be after the start date.",
        path: ["endsAt"],
      });
    }

    if (
      promotion.discountType === "PERCENT" &&
      promotion.discountValue > 100
    ) {
      context.addIssue({
        code: "custom",
        message: "Percentage discounts cannot exceed 100.",
        path: ["discountValue"],
      });
    }
  });

export const promotionIdSchema = z.string().uuid("Choose a valid promotion.");

export type PromotionFormInput = z.infer<typeof promotionFormSchema>;
