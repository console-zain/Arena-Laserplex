import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/common/button";
import { Card, CardContent } from "@/components/common/card";
import { Container } from "@/components/common/container";

interface StatusPageProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
}

export function createStatusMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}

export function StatusPage({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: StatusPageProps) {
  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="flex min-h-[65vh] items-center justify-center py-12 sm:py-16">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-7 text-center sm:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--v3-accent-secondary)]">
              {eyebrow}
            </p>
            <h1 className="mb-0 mt-0 text-3xl font-bold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mb-0 mt-4 max-w-xl text-sm leading-7 text-[var(--v3-text-secondary)] sm:text-base">
              {description}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
              {secondaryAction ? (
                <Button asChild variant="outline">
                  <Link href={secondaryAction.href}>
                    {secondaryAction.label}
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
