import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length > 0 ? value : null));

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .transform((value) => (value.length > 0 ? value : null))
  .refine(
    (value) => value === null || /^https?:\/\/\S+$/i.test(value),
    "Enter a complete link beginning with http:// or https://.",
  );

export const cinemaSettingsSchema = z.object({
  cinemaName: z.string().trim().min(1, "Enter the cinema name.").max(160),
  description: z.string().trim().max(2000),
  address: z.string().trim().max(500),
  timezone: z.string().trim().min(1, "Enter the cinema timezone.").max(100),
  contactEmail: z
    .string()
    .trim()
    .max(320)
    .transform((value) => (value.length > 0 ? value : null))
    .refine(
      (value) => value === null || z.email().safeParse(value).success,
      "Enter a valid contact email.",
    ),
  contactPhone: optionalText(80),
  websiteUrl: optionalUrl,
  instagramUrl: optionalUrl,
  xUrl: optionalUrl,
  whatsappUrl: optionalUrl,
  facebookUrl: optionalUrl,
});

export type CinemaSettingsInput = z.infer<typeof cinemaSettingsSchema>;
