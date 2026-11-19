import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { ContactForm } from "@/components/forms/contact-form";
import { siteConfig } from "@/config/site";
import { getCinemaSettings } from "@/server/services/settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Arena Laserplex and plan your visit.",
  openGraph: {
    title: `Contact | ${siteConfig.name}`,
    description: "Contact Arena Laserplex and plan your visit.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getCinemaSettings();
  const socialLinks = [
    { label: "Website", href: settings.websiteUrl },
    { label: "Instagram", href: settings.instagramUrl },
    { label: "X", href: settings.xUrl },
    { label: "WhatsApp", href: settings.whatsappUrl },
    { label: "Facebook", href: settings.facebookUrl },
  ].filter(
    (link): link is { label: string; href: string } => Boolean(link.href),
  );

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
            description={
              settings.description ||
              "Get in touch with the cinema or find details to plan your visit."
            }
            title={`Contact ${settings.cinemaName}`}
          />

          <section
            aria-labelledby="contact-details-title"
            className="contact-details-panel mt-8 rounded-[var(--v3-radius-card)] border border-[var(--v3-border)] bg-[var(--v3-surface)] p-5 sm:p-7"
          >
            <h2
              className="m-0 font-[var(--font-heading)] text-2xl font-semibold tracking-tight"
              id="contact-details-title"
            >
              Visit or contact us
            </h2>
            <address className="mt-4 space-y-3 text-sm not-italic leading-6 text-[var(--v3-text-secondary)]">
              {settings.address ? <p className="m-0">{settings.address}</p> : null}
              {settings.contactEmail ? (
                <p className="m-0">
                  Email:{" "}
                  <a
                    className="underline underline-offset-4 hover:text-[var(--v3-text-primary)]"
                    href={`mailto:${settings.contactEmail}`}
                  >
                    {settings.contactEmail}
                  </a>
                </p>
              ) : null}
              {settings.contactPhone ? (
                <p className="m-0">
                  Phone:{" "}
                  <a
                    className="underline underline-offset-4 hover:text-[var(--v3-text-primary)]"
                    href={`tel:${settings.contactPhone.replace(/[^\d+]/g, "")}`}
                  >
                    {settings.contactPhone}
                  </a>
                </p>
              ) : null}
            </address>
            {socialLinks.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 p-0 text-sm">
                {socialLinks.map((link) => (
                  <li className="list-none" key={link.label}>
                    <a
                      className="underline underline-offset-4 hover:text-[var(--v3-text-primary)]"
                      href={link.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            {!settings.address &&
            !settings.contactEmail &&
            !settings.contactPhone &&
            socialLinks.length === 0 ? (
              <p className="mb-0 mt-4 text-sm text-[var(--v3-text-muted)]">
                Contact information will be added soon.
              </p>
            ) : null}
          </section>

          <section aria-labelledby="contact-form-title" className="mt-8">
            <h2
              className="mb-5 font-[var(--font-heading)] text-2xl font-semibold tracking-tight"
              id="contact-form-title"
            >
              Send a message
            </h2>
            <p className="mb-5 text-sm leading-6 text-[var(--v3-text-muted)]">
              This form currently validates a message but does not send or store it.
              Use the contact links above to reach the cinema.
            </p>
            <ContactForm />
          </section>
        </div>
      </Container>
    </main>
  );
}
