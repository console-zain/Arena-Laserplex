import { LegalPage, createLegalMetadata } from "@/components/legal/legal-page";
import type { LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

const description = `Accessibility information and feedback options for ${siteConfig.name}.`;

export const metadata = createLegalMetadata(
  "Accessibility Statement",
  description,
);

const sections: readonly LegalSection[] = [
  {
    title: "Our approach",
    paragraphs: [
      "Arena Laserplex aims to make the website usable with different devices and assistive technologies. The site includes semantic page structure, keyboard focus indicators, and responsive layouts, but it has not had a formal accessibility audit and we do not claim conformance to a particular standard.",
    ],
  },
  {
    title: "Report an accessibility issue",
    paragraphs: [
      "If a page or booking step creates a barrier, check the direct contact details on the Contact page and tell us which page and device or assistive technology you used. The Contact page message form currently validates locally and does not send messages.",
    ],
  },
  {
    title: "Ongoing improvements",
    paragraphs: [
      "Accessibility feedback will be reviewed as the website is developed. We will update this statement when an audit or significant accessibility improvements are completed.",
    ],
  },
];

export default function AccessibilityStatementPage() {
  return (
    <LegalPage
      description={description}
      sections={sections}
      title="Accessibility Statement"
    />
  );
}
