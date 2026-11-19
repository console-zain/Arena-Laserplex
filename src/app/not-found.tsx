import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/common/button";
import { Container } from "@/components/common/container";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested Arena Laserplex page could not be found.",
};

export default function NotFound() {
  return (
    <main className="public-site mx-auto flex min-h-[55vh] w-full max-w-5xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <Container>
        <p className="eyebrow">Between reels</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">
          The page you&apos;re looking for may have moved or is no longer
          available.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Return to Arena Laserplex</Link>
        </Button>
      </Container>
    </main>
  );
}
