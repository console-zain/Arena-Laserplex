import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/common/button";
import { Card, CardContent } from "@/components/common/card";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { SectionTitle } from "@/components/common/section-title";
import {
  BookingList,
  partitionAccountBookings,
} from "@/components/account/booking-list";
import { siteConfig } from "@/config/site";
import { logoutAction } from "@/server/auth/actions";
import { requireCustomer } from "@/server/auth/guards";
import { getCustomerBookingHistory } from "@/server/services/bookings";

export const metadata: Metadata = {
  title: "My Account",
  description: `Manage your ${siteConfig.name} account.`,
  robots: { index: false, follow: false },
};

export default async function MyAccountPage() {
  const { user } = await requireCustomer();
  const bookings = await getCustomerBookingHistory(user.id);
  const now = new Date();
  const { upcoming, history } = partitionAccountBookings(bookings, now);
  const memberSince = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(user.createdAt);

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="py-8 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <PageHeader
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "My Account" },
            ]}
            description={`Welcome back, ${user.name}.`}
            title="My account"
          />
          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
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
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <SectionTitle
              className="mb-0"
              subtitle="Previous, cancelled, and expired bookings."
              title="Booking history"
              titleId="booking-history-title"
            />
            {history.length > 3 ? (
              <Button asChild variant="outline">
                <Link href="/my-account-2">View full history</Link>
              </Button>
            ) : null}
          </div>
          <BookingList
            bookings={history.slice(0, 3)}
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

        <section
          aria-labelledby="account-information-title"
          className="mt-12 border-t border-[var(--v3-border)] pt-10"
        >
          <SectionTitle
            className="mb-6"
            title="Personal information"
            titleId="account-information-title"
          />
          <Card>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--v3-text-muted)]">
                    Full name
                  </dt>
                  <dd className="mb-0 mt-2">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--v3-text-muted)]">
                    Email address
                  </dt>
                  <dd className="mb-0 mt-2 break-all">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--v3-text-muted)]">
                    Member since
                  </dt>
                  <dd className="mb-0 mt-2">{memberSince}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </section>
      </Container>
    </main>
  );
}
