import type { Metadata } from "next";
import { Card, CardContent } from "@/components/common/card";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import { PageBanner } from "@/components/layout/page-banner";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Learn how the ${siteConfig.name} website preview handles movie data, theme preferences, and form entries.`,
  openGraph: {
    title: `Privacy Policy | ${siteConfig.name}`,
    description: "Privacy information for the Arena Laserplex website preview.",
    type: "website",
  },
};

const privacySections = [
  {
    title: "Information entered into forms",
    paragraphs: [
      "The contact, sign-in, and registration forms on this site are interface previews. They validate entries in your browser and do not send or store the information.",
      "Do not enter real passwords or sensitive personal information into preview forms.",
    ],
  },
  {
    title: "Movie information",
    paragraphs: [
      "Movie listings and details are requested by the website server from The Movie Database (TMDB). The TMDB API key is configured for server-side requests and is not intended to be exposed in the browser.",
      "TMDB may process requests according to its own privacy policy and terms.",
    ],
  },
  {
    title: "Theme preference",
    paragraphs: [
      "The theme selector can save your light or dark preference in your browser so the site can remember your choice.",
    ],
  },
  {
    title: "Preview status",
    paragraphs: [
      "This website is an in-progress product preview. This notice describes the current demo behavior and is not a substitute for a reviewed privacy policy before production launch.",
    ],
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <PageBanner
        description="A clear overview of how this website preview handles information."
        eyebrow={siteConfig.name}
        title="Privacy Policy"
      />
      <Container className="pt-10 sm:pt-14">
        <PageHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
          description="Last updated November 12, 2026."
          title="Your Privacy"
        />
      </Container>
      <section aria-labelledby="privacy-content-title" className="cinema-section">
        <Container>
          <SectionTitle
            className="mb-8"
            eyebrow="Website preview"
            title="How This Site Handles Information"
            titleId="privacy-content-title"
          />
          <div className="mx-auto grid max-w-4xl gap-5">
            {privacySections.map((section) => (
              <Card className="privacy-policy-card" key={section.title}>
                <CardContent>
                  <h2 className="mb-3 mt-0 font-[var(--font-heading)] text-xl font-bold">
                    {section.title}
                  </h2>
                  <div className="grid gap-3 text-sm leading-7 text-[var(--muted)]">
                    {section.paragraphs.map((paragraph) => (
                      <p className="m-0" key={paragraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
