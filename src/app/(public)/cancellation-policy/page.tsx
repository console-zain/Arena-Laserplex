import { LegalPage, createLegalMetadata } from "@/components/legal/legal-page";
import type { LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

const description = `How seat reservations and cancellations currently work at ${siteConfig.name}.`;

export const metadata = createLegalMetadata(
  "Cancellation Policy",
  description,
);

const sections: readonly LegalSection[] = [
  {
    title: "Seat holds",
    paragraphs: [
      "A temporary seat hold may expire if a reservation is not completed in time. When a hold expires, the seats can become available to other customers.",
    ],
  },
  {
    title: "Confirmed reservations",
    paragraphs: [
      "The current customer account pages do not provide a self-service cancellation action. If you need to change or cancel a confirmed reservation, contact the cinema using the direct contact details shown on the Contact page and provide your booking reference.",
      "The current website does not collect payment online. Cancellation and refund terms for any future paid bookings must be published before payments are accepted; applicable statutory rights remain unaffected.",
    ],
  },
];

export default function CancellationPolicyPage() {
  return (
    <LegalPage
      description={description}
      sections={sections}
      title="Cancellation Policy"
    />
  );
}
