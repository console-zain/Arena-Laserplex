import { DataTable } from "@/components/admin/data-table";
import type { DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { cancelAdminBookingAction } from "@/app/admin/bookings/actions";
import { listBookings } from "@/server/repositories/bookings";

const bookingInclude = {
  user: { select: { name: true, email: true } },
  showtime: {
    include: {
      movie: { select: { title: true } },
      screen: { select: { name: true } },
    },
  },
} as const;

type BookingRow = Awaited<
  ReturnType<typeof loadBookings>
>[number];

function loadBookings() {
  return listBookings({
    orderBy: { createdAt: "desc" },
    include: bookingInclude,
  });
}

function displayStatus(status: BookingRow["status"]) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Pending";
    case "CONFIRMED":
      return "Confirmed";
    case "CANCELLED":
      return "Cancelled";
    case "EXPIRED":
      return "Expired";
    default:
      return "Refunded";
  }
}

export default async function AdminBookingsPage() {
  const bookings = await loadBookings();
  const columns: readonly DataTableColumn<BookingRow>[] = [
    {
      key: "bookingReference",
      header: "Booking reference",
      render: (booking) => (
        <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
          {booking.bookingReference}
        </span>
      ),
    },
    {
      key: "movie",
      header: "Movie",
      render: (booking) => booking.showtime.movie.title,
    },
    {
      key: "showtime",
      header: "Showtime",
      render: (booking) =>
        new Intl.DateTimeFormat("en", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "UTC",
        }).format(booking.showtime.startsAt),
    },
    {
      key: "screen",
      header: "Screen",
      render: (booking) => booking.showtime.screen.name,
    },
    {
      key: "customer",
      header: "Customer",
      render: (booking) => (
        <div>
          <p className="m-0 font-medium">{booking.user.name}</p>
          <p className="mb-0 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {booking.user.email}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (booking) => (
        <StatusBadge status={displayStatus(booking.status)} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (booking) =>
        booking.status === "PENDING_PAYMENT" ||
        booking.status === "CONFIRMED" ? (
          <form action={cancelAdminBookingAction.bind(null, booking.id)}>
            <button
              className="text-xs font-medium text-rose-600 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500"
              type="submit"
            >
              Cancel
            </button>
          </form>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="m-0 text-xl font-semibold">Bookings</h2>
        <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
          Reservations and customer details from the database.
        </p>
      </div>
      <DataTable
        columns={columns}
        getRowId={(booking) => booking.id}
        rows={bookings}
        emptyMessage="No bookings are available."
      />
      <p className="m-0 text-xs text-slate-500 dark:text-slate-400">
        Cancelling a booking releases its held or booked seats.
      </p>
    </div>
  );
}
