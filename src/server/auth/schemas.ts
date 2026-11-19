import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(80),
    email: z
      .string()
      .trim()
      .max(254, "Email address is too long.")
      .toLowerCase()
      .email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .max(254, "Email address is too long.")
    .toLowerCase()
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Enter your password.")
    .max(128, "Password must be 128 characters or fewer."),
});

export interface AuthActionState {
  error?: string;
}

export function firstValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the information and try again.";
}
