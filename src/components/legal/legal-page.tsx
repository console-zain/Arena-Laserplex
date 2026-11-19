import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/common/card";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { siteConfig } from "@/config/site";

export interface LegalSection {
  title: string;
  paragraphs: readonly ReactNode[];
}

interface LegalPageProps {
  title: string;
  description: string;
  sections: readonly LegalSection[];
}

export function createLegalMetadata(
  title: string,
  description: string,
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      type: "website",
    },
  };
}

export function LegalPage({
  title,
  description,
  sections,
}: LegalPageProps) {
  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="py-8 sm:py-12">
        <PageHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
          description={description}
          title={title}
        />
        <aside
          className="mt-6 rounded-2xl border border-[var(--v3-accent-primary)]/25 bg-[var(--v3-surface)] p-4 text-sm leading-6 text-[var(--v3-text-secondary)] sm:p-5"
          role="note"
        >
          These pages describe the current Arena Laserplex website preview.
          They are not legal advice and should be reviewed and customized for
          the cinema&apos;s operating practices and jurisdiction before
          production launch.
        </aside>
        <div className="mx-auto mt-6 grid max-w-4xl gap-4">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardContent>
                <h2 className="mb-3 mt-0 text-xl font-semibold tracking-tight">
                  {section.title}
                </h2>
                <div className="grid gap-3 text-sm leading-7 text-[var(--v3-text-secondary)]">
                  {section.paragraphs.map((paragraph, index) => (
                    <p className="m-0" key={`${section.title}-${index}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mx-auto mb-0 mt-6 max-w-4xl text-sm text-[var(--v3-text-muted)]">
          Questions? Visit the{" "}
          <Link
            className="text-[var(--v3-accent-secondary)] underline underline-offset-4"
            href="/contact"
          >
            Contact page
          </Link>
          . Its message form currently validates locally and does not send
          messages; use any direct contact details displayed there.
        </p>
      </Container>
    </main>
  );
}
