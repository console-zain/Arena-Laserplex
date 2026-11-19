import { StatusPage, createStatusMetadata } from "@/components/common/status-page";

export const metadata = createStatusMetadata("Scheduled Maintenance");

export default function MaintenancePage() {
  return (
    <StatusPage
      description="Arena Laserplex is temporarily unavailable while the service is updated. Please try again later."
      eyebrow="Cinema systems"
      primaryAction={{ label: "Return home", href: "/" }}
      secondaryAction={{ label: "Contact", href: "/contact" }}
      title="We'll be back soon"
    />
  );
}
