import type { Metadata } from "next";
import { AuthExperience } from "@/components/forms/auth-experience";
import { LoginForm } from "@/components/forms/login-form";
import { siteConfig } from "@/config/site";
import { getSafeBookingReturnTo } from "@/server/auth/booking-return-to";

export const metadata: Metadata = {
  title: "Sign In",
  description: `Sign in to your ${siteConfig.name} account.`,
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const returnTo = getSafeBookingReturnTo(query.returnTo);

  return (
    <AuthExperience
      description="Sign in to see your upcoming showtimes, saved seats, and cinema history."
      title="Welcome back"
    >
      <LoginForm returnTo={returnTo ?? undefined} />
    </AuthExperience>
  );
}
