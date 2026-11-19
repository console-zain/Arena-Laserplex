import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSafeBookingReturnTo } from "@/server/auth/booking-return-to";

async function getActiveSession(unauthenticatedRedirect: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.status !== "ACTIVE") {
    redirect(unauthenticatedRedirect);
  }

  return session;
}

export async function requireUser() {
  return getActiveSession("/login");
}

export async function requireAdmin() {
  const session = await getActiveSession("/admin/login");

  if (session.user.role !== "ADMIN") {
    redirect("/my-account");
  }

  return session;
}

export async function requireCustomer(returnTo?: string) {
  const safeReturnTo = getSafeBookingReturnTo(returnTo);
  const loginRedirect = safeReturnTo
    ? `/login?returnTo=${encodeURIComponent(safeReturnTo)}`
    : "/login";
  const session = await getActiveSession(loginRedirect);

  if (session.user.role !== "CUSTOMER") {
    redirect("/admin/dashboard");
  }

  return session;
}
