import { LegalPage, createLegalMetadata } from "@/components/legal/legal-page";
import type { LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

const description = `Terms for using the ${siteConfig.name} website and booking preview.`;

export const metadata = createLegalMetadata("Terms of Service", description);

const sections: readonly LegalSection[] = [
  {
    title: "Using this website",
    paragraphs: [
      `The ${siteConfig.name} website lets visitors browse movie and event information, create an account, and reserve seats where showtimes are available. Use the site lawfully and do not interfere with its operation or attempt to access another person's account or information.`,
      "You are responsible for keeping your sign-in details secure and for activity performed through your account. Contact the cinema if you believe someone else has accessed it.",
    ],
  },
  {
    title: "Listings and reservations",
    paragraphs: [
      "Movie information, event details, showtimes, and seat availability can change. A reservation is confirmed only when the site displays a booking confirmation. Temporary seat holds may expire if they are not completed in time.",
      "The current website flow does not collect payment to confirm a booking. Any future paid booking terms must be published before online payments are introduced.",
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: [
      "Do not use the website to break the law, disrupt services, probe accounts or systems without authorization, or submit content that is fraudulent or harmful. These rules cover acceptable use for the current site; there is no public posting or community feature.",
    ],
  },
  {
    title: "Changes and applicable rights",
    paragraphs: [
      "The cinema may update website information and these terms. Nothing on this page limits rights that cannot be excluded under applicable law. The operator should add its legal entity, governing law, and approved booking terms before production launch.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPage
      description={description}
      sections={sections}
      title="Terms of Service"
    />
  );
}
