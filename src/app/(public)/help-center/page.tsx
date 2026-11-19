import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/common/card";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Help Center",
  description: `Answers about movies, reservations, and accounts at ${siteConfig.name}.`,
};

const helpTopics = [
  {
    question: "How do I reserve seats?",
    answer:
      "Choose a movie and showtime, select available seats, and follow the booking steps. The current website flow does not collect payment online.",
  },
  {
    question: "Where can I see my bookings?",
    answer:
      "Sign in and open My Account to see upcoming bookings and booking history.",
  },
  {
    question: "Can I cancel a confirmed booking online?",
    answer:
      "Self-service cancellation is not currently available. Contact the cinema using direct details shown on the Contact page and provide your booking reference.",
  },
  {
    question: "I forgot my password. How can I recover my account?",
    answer:
      "Email-based password recovery is not configured yet. Use a direct contact method shown on the Contact page; do not send your password or payment details.",
  },
  {
    question: "Why did my seat hold expire?",
    answer:
      "Temporary holds expire if the booking is not completed in time, releasing the seats for other customers.",
  },
] as const;

export default function HelpCenterPage() {
  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="py-8 sm:py-12">
        <PageHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Help Center" }]}
          description="Answers to common questions about films, seat reservations, and accounts."
          title="Help Center"
        />
        <div className="mx-auto mt-8 grid max-w-4xl gap-4">
          {helpTopics.map((topic) => (
            <Card key={topic.question}>
              <CardContent>
                <h2 className="mb-2 mt-0 text-lg font-semibold">
                  {topic.question}
                </h2>
                <p className="m-0 text-sm leading-7 text-[var(--v3-text-secondary)]">
                  {topic.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mx-auto mb-0 mt-7 max-w-4xl text-sm leading-6 text-[var(--v3-text-muted)]">
          Need more help? Visit{" "}
          <Link
            className="text-[var(--v3-accent-secondary)] underline underline-offset-4"
            href="/contact"
          >
            Contact
          </Link>
          . The message form currently validates locally and does not send
          messages; use direct contact details displayed there if available.
        </p>
      </Container>
    </main>
  );
}
