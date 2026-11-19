"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSafeBookingReturnTo } from "@/server/auth/booking-return-to";
import {
  firstValidationMessage,
  registerSchema,
  type AuthActionState,
} from "@/server/auth/schemas";

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  const returnTo = getSafeBookingReturnTo(formData.get("returnTo"));

  if (!parsed.success) {
    return { error: firstValidationMessage(parsed.error) };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 422) {
      return { error: "An account with this email already exists." };
    }

    throw error;
  }

  redirect(returnTo ?? "/");
}
