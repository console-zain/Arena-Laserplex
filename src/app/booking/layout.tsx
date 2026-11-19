import Link from "next/link";
import { Clapperboard } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="booking-shell flex min-h-screen flex-col bg-[var(--v3-canvas)] text-[var(--v3-text-primary)]">
      <a className="skip-link" href="#booking-main-content">
        Skip to booking content
      </a>
      <header className="sticky top-0 z-30 border-b border-[var(--v3-border)] bg-[color-mix(in_srgb,var(--v3-canvas)_92%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            aria-label="Arena Laserplex home"
            className="text-sm font-semibold tracking-[-0.02em] sm:text-base"
            href="/"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="brand-emblem">
                <Clapperboard size={20} strokeWidth={2.2} />
              </span>
              <span className="brand-wordmark">Arena Laserplex</span>
            </span>
          </Link>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div
        className="flex-1"
        id="booking-main-content"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}
