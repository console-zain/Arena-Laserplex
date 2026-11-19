import { LegalPage, createLegalMetadata } from "@/components/legal/legal-page";
import type { LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

const description = `Current refund information for ${siteConfig.name} reservations.`;

export const metadata = createLegalMetadata("Refund Policy", description);

const sections: readonly LegalSection[] = [
  {
    title: "Current online booking flow",
    paragraphs: [
      "The current website lets customers reserve seats but does not collect payment online. As a result, the website cannot issue an online payment refund for these reservations.",
      "If you believe you were charged in connection with a reservation, contact the cinema using the direct contact details shown on the Contact page and include your booking reference. Do not send payment-card details.",
    ],
  },
  {
    title: "Future paid bookings",
    paragraphs: [
      "A final refund policy, including any time limits and payment-method details, must be approved and published before the cinema starts accepting online payments. Any rights that apply under local law remain unaffected.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      description={description}
      sections={sections}
      title="Refund Policy"
    />
  );
}
