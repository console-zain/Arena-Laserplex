import { StatusPage, createStatusMetadata } from "@/components/common/status-page";

export const metadata = createStatusMetadata("Access Denied");

export default function ForbiddenPage() {
  return (
    <StatusPage
      description="Your current account does not have permission to view this page. If you believe this is a mistake, sign in with an authorized account or contact the cinema."
      eyebrow="403 · Access denied"
      primaryAction={{ label: "Return home", href: "/" }}
      secondaryAction={{ label: "Sign in", href: "/login" }}
      title="This area is restricted"
    />
  );
}
