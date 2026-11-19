import { z } from "zod";
import { isValidMediaObjectKey } from "@/lib/media-keys";

const optionalImageKey = z
  .string()
  .trim()
  .max(500)
  .transform((value) => (value.length > 0 ? value : null))
  .refine(
    (value) => value === null || isValidMediaObjectKey(value, "news"),
    "Upload a news image.",
  );

const formBoolean = z.preprocess(
  (value) => value === "on" || value === "true",
  z.boolean(),
);

export const newsFormSchema = z.object({
  title: z.string().trim().min(1, "Enter an article title.").max(200),
  excerpt: z.string().trim().min(1, "Enter an article summary.").max(500),
  body: z.string().trim().min(1, "Enter article content.").max(30_000),
  category: z.string().trim().min(1, "Enter an article category.").max(80),
  imageKey: optionalImageKey,
  featured: formBoolean,
});

export const newsIdSchema = z.string().uuid("Choose a valid article.");

export type NewsFormInput = z.infer<typeof newsFormSchema>;
