import { LegalPage, createLegalMetadata } from "@/components/legal/legal-page";
import type { LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

const description = `Important information about ${siteConfig.name} website content.`;

export const metadata = createLegalMetadata("Disclaimer", description);

const sections: readonly LegalSection[] = [
  {
    title: "Movie and event information",
    paragraphs: [
      "Movie descriptions, artwork, ratings, release dates, and other metadata may come from third-party sources and can be incomplete or out of date. Showtimes, event details, and seat availability are subject to change; confirm the details shown during booking.",
      "Third-party names, services, and media remain the property of their respective owners. Their presence does not imply endorsement of Arena Laserplex.",
    ],
  },
  {
    title: "Website preview",
    paragraphs: [
      "This website is still being developed. Some contact and support controls may be previews and may not transmit information. Do not submit passwords, payment-card information, or other sensitive data through a form unless the page clearly confirms that the relevant service is active.",
    ],
  },
  {
    title: "No professional advice",
    paragraphs: [
      "Website information is provided for general informational purposes and is not legal, financial, or other professional advice. This disclaimer does not exclude liability or consumer rights where exclusion is not permitted by law.",
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <LegalPage
      description={description}
      sections={sections}
      title="Disclaimer"
    />
  );
}
