import Link from "next/link";
import { LegalPage, createLegalMetadata } from "@/components/legal/legal-page";
import type { LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

const description = `Security guidance for accounts and bookings on ${siteConfig.name}.`;

export const metadata = createLegalMetadata("Security Policy", description);

const sections: readonly LegalSection[] = [
  {
    title: "Protect your account",
    paragraphs: [
      "Use a unique password for your Arena Laserplex account, keep your sign-in details private, and sign out on shared devices. Do not share passwords or booking references publicly.",
      "If you think someone else has accessed your account, use the direct contact details on the Contact page. Password recovery by email is not currently configured.",
    ],
  },
  {
    title: "Report a security concern",
    paragraphs: [
      <>
        Read our{" "}
        <Link
          className="text-[var(--v3-accent-secondary)] underline underline-offset-4"
          href="/responsible-disclosure"
        >
          Responsible Disclosure
        </Link>{" "}
        guidance before reporting a suspected vulnerability. Do not attempt to
        access or change another person&apos;s data.
      </>,
    ],
  },
  {
    title: "Current status",
    paragraphs: [
      "This security policy describes the current website preview and is not a security certification or guarantee. No independent security audit or bug-bounty program is represented here.",
    ],
  },
];

export default function SecurityPolicyPage() {
  return (
    <LegalPage
      description={description}
      sections={sections}
      title="Security Policy"
    />
  );
}
