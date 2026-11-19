import { StatusPage, createStatusMetadata } from "@/components/common/status-page";

export const metadata = createStatusMetadata("Session Expired");

export default function SessionExpiredPage() {
  return (
    <StatusPage
      description="For your security, your sign-in session may have ended. Sign in again to continue to your bookings."
      eyebrow="Sign-in required"
      primaryAction={{ label: "Sign in again", href: "/login" }}
      secondaryAction={{ label: "Return home", href: "/" }}
      title="Your session has ended"
    />
  );
}
