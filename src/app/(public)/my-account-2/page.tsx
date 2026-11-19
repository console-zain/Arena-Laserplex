import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/common/button";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import {
  BookingList,
  partitionAccountBookings,
} from "@/components/account/booking-list";
import { siteConfig } from "@/config/site";
import { requireCustomer } from "@/server/auth/guards";
import { getCustomerBookingHistory } from "@/server/services/bookings";

export const metadata: Metadata = {
  title: "Booking History",
  description: `View your ${siteConfig.name} upcoming bookings and history.`,
  robots: { index: false, follow: false },
};

export default async function MyAccountAlternatePage() {
  const { user } = await requireCustomer();
  const bookings = await getCustomerBookingHistory(user.id);
  const now = new Date();
  const { upcoming, history } = partitionAccountBookings(bookings, now);

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="py-8 sm:py-12">
        <PageHeader
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "My Account", href: "/my-account" },
            { label: "Booking History" },
          ]}
          description="Upcoming showtimes, active seat holds, and past bookings."
          title="Your bookings"
        />

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/my-account">Account overview</Link>
          </Button>
        </div>

        <section aria-labelledby="upcoming-bookings-title" className="mt-10">
          <SectionTitle
            className="mb-6"
            subtitle="Confirmed showtimes and active seat holds."
            title="Upcoming bookings"
            titleId="upcoming-bookings-title"
          />
          <BookingList
            bookings={upcoming}
            emptyMessage="You have no upcoming bookings or active seat holds."
            now={now}
          />
        </section>

        <section
          aria-labelledby="booking-history-title"
          className="mt-12 border-t border-[var(--v3-border)] pt-10"
        >
          <SectionTitle
            className="mb-6"
            subtitle="Previous, cancelled, and expired bookings."
            title="Booking history"
            titleId="booking-history-title"
          />
          <BookingList
            bookings={history}
            emptyMessage="Your past bookings will appear here."
            now={now}
          />
        </section>

        {bookings.length === 0 ? (
          <div className="mt-8">
            <Button asChild>
              <Link href="/movies">Browse Movies</Link>
            </Button>
          </div>
        ) : null}
      </Container>
    </main>
  );
}
