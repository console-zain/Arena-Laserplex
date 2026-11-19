import type { Metadata } from "next";
import { AuthExperience } from "@/components/forms/auth-experience";
import { RegisterForm } from "@/components/forms/register-form";
import { siteConfig } from "@/config/site";
import { getSafeBookingReturnTo } from "@/server/auth/booking-return-to";

export const metadata: Metadata = {
  title: "Create an Account",
  description: `Create your ${siteConfig.name} account.`,
  robots: { index: false, follow: false },
};

interface RegisterPageProps {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const query = await searchParams;
  const returnTo = getSafeBookingReturnTo(query.returnTo);

  return (
    <AuthExperience
      description="Create your account to keep every movie night and booking in one place."
      title="Join the experience"
    >
      <RegisterForm returnTo={returnTo ?? undefined} />
    </AuthExperience>
  );
}
