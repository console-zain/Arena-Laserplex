"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getSafeBookingReturnTo } from "@/server/auth/booking-return-to";
import {
  firstValidationMessage,
  loginSchema,
  type AuthActionState,
} from "@/server/auth/schemas";

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const returnTo = getSafeBookingReturnTo(formData.get("returnTo"));

  if (!parsed.success) {
    return { error: firstValidationMessage(parsed.error) };
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return { error: "Invalid email or password." };
  }

  try {
    await auth.api.signInEmail({
      body: parsed.data,
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 401) {
      return { error: "Invalid email or password." };
    }

    throw error;
  }

  redirect(returnTo ?? "/");
}
