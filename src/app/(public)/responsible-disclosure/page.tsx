import { LegalPage, createLegalMetadata } from "@/components/legal/legal-page";
import type { LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

const description = `Guidance for reporting security issues affecting ${siteConfig.name}.`;

export const metadata = createLegalMetadata(
  "Responsible Disclosure",
  description,
);

const sections: readonly LegalSection[] = [
  {
    title: "Please act safely",
    paragraphs: [
      "If you believe you have found a security issue, stop testing as soon as the issue is apparent. Do not access, copy, alter, or disclose other people's data; do not disrupt services; and do not perform social engineering, denial-of-service, or destructive testing.",
    ],
  },
  {
    title: "How to contact the cinema",
    paragraphs: [
      "Use a direct email address or phone number published on the Contact page, if one is available. The Contact page message form currently validates locally and does not transmit messages, so do not use it to submit sensitive vulnerability details. A dedicated security-reporting address and coordinated disclosure program have not been configured.",
    ],
  },
  {
    title: "Acknowledgements and rewards",
    paragraphs: [
      "There is currently no bug-bounty or reward program. Do not assume a report is accepted or authorized testing unless the cinema has confirmed this directly. This guidance does not grant permission to access systems or data.",
    ],
  },
];

export default function ResponsibleDisclosurePage() {
  return (
    <LegalPage
      description={description}
      sections={sections}
      title="Responsible Disclosure"
    />
  );
}
