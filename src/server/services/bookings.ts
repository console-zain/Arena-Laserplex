import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import type { ShowtimeSeatStatus } from "@prisma/client";
import { db } from "@/lib/db";
import {
  bookingLookupSchema,
  confirmBookingSchema,
  seatHoldSchema,
  type BookingLookupInput,
  type ConfirmBookingInput,
  type SeatHoldInput,
} from "@/server/validation/booking";

const HOLD_DURATION_MS = 10 * 60 * 1000;
const MAX_POSTGRES_INTEGER = 2_147_483_647;

type TransactionClient = Prisma.TransactionClient;

interface LockedShowtimeSeat {
  id: string;
  seatId: string;
  status: ShowtimeSeatStatus;
  holdExpiresAt: Date | null;
}

const customerBookingInclude = {
  showtime: {
    select: {
      startsAt: true,
      endsAt: true,
      language: true,
      movie: { select: { title: true } },
      screen: { select: { name: true } },
    },
  },
  seats: {
    orderBy: { seatLabel: "asc" },
    select: { id: true, seatLabel: true, priceMinor: true },
  },
} satisfies Prisma.BookingInclude;

export class BookingServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingServiceError";
  }
}

function firstValidationMessage(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Check your booking details and try again.";
}

async function releaseExpiredHoldsInTransaction(
  transaction: TransactionClient,
  now: Date,
) {
  const expiredBookings = await transaction.booking.findMany({
    where: {
      status: "PENDING_PAYMENT",
      holdExpiresAt: { lte: now },
    },
    orderBy: { id: "asc" },
    select: { id: true },
  });

  if (expiredBookings.length === 0) {
    return 0;
  }

  const bookingIds = expiredBookings.map((booking) => booking.id);
  const expired = await transaction.booking.updateMany({
    where: {
      id: { in: bookingIds },
      status: "PENDING_PAYMENT",
      holdExpiresAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  });

  await transaction.showtimeSeat.updateMany({
    where: {
      bookingId: { in: bookingIds },
      status: "HELD",
    },
    data: {
      status: "AVAILABLE",
      bookingId: null,
      holdExpiresAt: null,
    },
  });

  return expired.count;
}

async function lockCustomer(
  transaction: TransactionClient,
  userId: string,
) {
  const lockedUsers = await transaction.$queryRaw<{ id: string }[]>(
    Prisma.sql`
      SELECT "id"
      FROM "User"
      WHERE "id" = ${userId}::uuid
      FOR UPDATE
    `,
  );

  if (lockedUsers.length === 0) {
    throw new BookingServiceError("Your customer account is unavailable.");
  }

  const user = await transaction.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });

  if (!user || user.status !== "ACTIVE" || user.role !== "CUSTOMER") {
    throw new BookingServiceError("Your customer account is unavailable.");
  }
}

async function lockSelectedShowtimeSeats(
  transaction: TransactionClient,
  showtimeId: string,
  seatIds: readonly string[],
) {
  const seatIdParameters = Prisma.join(
    seatIds.map((seatId) => Prisma.sql`${seatId}::uuid`),
  );

  return transaction.$queryRaw<LockedShowtimeSeat[]>(Prisma.sql`
    SELECT "id", "seatId", "status", "holdExpiresAt"
    FROM "ShowtimeSeat"
    WHERE "showtimeId" = ${showtimeId}::uuid
      AND "seatId" IN (${seatIdParameters})
    ORDER BY "seatId"
    FOR UPDATE
  `);
}

async function lockShowtime(
  transaction: TransactionClient,
  showtimeId: string,
) {
  const lockedShowtimes = await transaction.$queryRaw<{ id: string }[]>(
    Prisma.sql`
      SELECT "id"
      FROM "Showtime"
      WHERE "id" = ${showtimeId}::uuid
      FOR UPDATE
    `,
  );

  return lockedShowtimes.length > 0;
}

function createBookingReference() {
  return `AL-${randomBytes(6).toString("hex").toUpperCase()}`;
}

export async function releaseExpiredHolds() {
  return db.$transaction((transaction) =>
    releaseExpiredHoldsInTransaction(transaction, new Date()),
  );
}

export async function createSeatHold(input: SeatHoldInput) {
  const parsed = seatHoldSchema.safeParse(input);

  if (!parsed.success) {
    throw new BookingServiceError(firstValidationMessage(parsed.error));
  }

  const { userId, showtimeId, seatIds, idempotencyKey } = parsed.data;

  return db.$transaction(
    async (transaction) => {
      const now = new Date();
      await releaseExpiredHoldsInTransaction(transaction, now);
      await lockCustomer(transaction, userId);

      const existingRequest = await transaction.booking.findUnique({
        where: {
          userId_idempotencyKey: { userId, idempotencyKey },
        },
        include: {
          seats: {
            select: { showtimeSeat: { select: { seatId: true } } },
          },
        },
      });

      if (existingRequest) {
        const existingSeatIds = existingRequest.seats
          .map(({ showtimeSeat }) => showtimeSeat.seatId)
          .sort();
        const requestedSeatIds = [...seatIds].sort();
        const sameSeatSelection =
          existingRequest.showtimeId === showtimeId &&
          existingSeatIds.length === requestedSeatIds.length &&
          existingSeatIds.every(
            (seatId, index) => seatId === requestedSeatIds[index],
          );

        if (!sameSeatSelection) {
          throw new BookingServiceError(
            "This booking request was already used for a different seat selection.",
          );
        }

        if (existingRequest.status === "CONFIRMED") {
          return existingRequest;
        }

        if (
          existingRequest.status === "PENDING_PAYMENT" &&
          existingRequest.holdExpiresAt &&
          existingRequest.holdExpiresAt > now
        ) {
          return existingRequest;
        }

        throw new BookingServiceError(
          "This seat hold has expired. Select your seats again.",
        );
      }

      const activeHold = await transaction.booking.findFirst({
        where: {
          userId,
          showtimeId,
          status: "PENDING_PAYMENT",
          holdExpiresAt: { gt: now },
        },
        select: { id: true },
      });

      if (activeHold) {
        throw new BookingServiceError(
          "You already have an active hold for this showtime. Continue that booking or wait for it to expire.",
        );
      }

      if (!(await lockShowtime(transaction, showtimeId))) {
        throw new BookingServiceError(
          "This showtime is no longer available for booking.",
        );
      }

      const showtime = await transaction.showtime.findUnique({
        where: { id: showtimeId },
        select: {
          id: true,
          startsAt: true,
          status: true,
          basePriceMinor: true,
          currency: true,
          movie: { select: { title: true, status: true } },
          screen: { select: { id: true, name: true, isActive: true } },
        },
      });

      if (
        !showtime ||
        showtime.status !== "SCHEDULED" ||
        showtime.startsAt <= now ||
        showtime.movie.status !== "PUBLISHED" ||
        !showtime.screen.isActive
      ) {
        throw new BookingServiceError(
          "This showtime is no longer available for booking.",
        );
      }

      const lockedSeats = await lockSelectedShowtimeSeats(
        transaction,
        showtimeId,
        seatIds,
      );

      if (lockedSeats.length !== seatIds.length) {
        throw new BookingServiceError(
          "One or more selected seats do not belong to this showtime.",
        );
      }

      if (lockedSeats.some((seat) => seat.status !== "AVAILABLE")) {
        throw new BookingServiceError(
          "One or more selected seats are no longer available. Refresh and choose again.",
        );
      }

      const seatInventory = await transaction.showtimeSeat.findMany({
        where: { id: { in: lockedSeats.map((seat) => seat.id) } },
        include: {
          seat: {
            select: {
              screenId: true,
              isActive: true,
              rowLabel: true,
              seatNumber: true,
            },
          },
        },
      });

      if (
        seatInventory.length !== lockedSeats.length ||
        seatInventory.some(
          ({ seat }) =>
            !seat.isActive || seat.screenId !== showtime.screen.id,
        )
      ) {
        throw new BookingServiceError(
          "One or more selected seats are no longer part of this screen's active layout.",
        );
      }

      const subtotalMinor = showtime.basePriceMinor * seatInventory.length;

      if (
        !Number.isSafeInteger(subtotalMinor) ||
        subtotalMinor > MAX_POSTGRES_INTEGER
      ) {
        throw new BookingServiceError(
          "The selected seat total exceeds the supported booking amount.",
        );
      }

      const holdExpiresAt = new Date(now.getTime() + HOLD_DURATION_MS);
      const booking = await transaction.booking.create({
        data: {
          bookingReference: createBookingReference(),
          userId,
          showtimeId,
          idempotencyKey,
          subtotalMinor,
          totalMinor: subtotalMinor,
          currency: showtime.currency,
          holdExpiresAt,
          seats: {
            create: seatInventory.map((inventory) => ({
              showtimeSeatId: inventory.id,
              seatLabel: `${inventory.seat.rowLabel}-${inventory.seat.seatNumber}`,
              priceMinor: showtime.basePriceMinor,
            })),
          },
        },
      });

      const heldSeats = await transaction.showtimeSeat.updateMany({
        where: {
          id: { in: lockedSeats.map((seat) => seat.id) },
          status: "AVAILABLE",
        },
        data: {
          status: "HELD",
          bookingId: booking.id,
          holdExpiresAt,
        },
      });

      if (heldSeats.count !== lockedSeats.length) {
        throw new BookingServiceError(
          "Seat availability changed while creating the hold. Try again.",
        );
      }

      return booking;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );
}

export async function createBooking(input: ConfirmBookingInput) {
  const parsed = confirmBookingSchema.safeParse(input);

  if (!parsed.success) {
    throw new BookingServiceError(firstValidationMessage(parsed.error));
  }

  const { userId, bookingId } = parsed.data;
  const result = await db.$transaction(
    async (transaction) => {
      const now = new Date();
      await releaseExpiredHoldsInTransaction(transaction, now);

      const initialBooking = await transaction.booking.findUnique({
        where: { id: bookingId },
        select: { showtimeId: true },
      });

      if (
        !initialBooking ||
        !(await lockShowtime(transaction, initialBooking.showtimeId))
      ) {
        return { error: "This booking could not be found." } as const;
      }

      const lockedBookings = await transaction.$queryRaw<{ id: string }[]>(
        Prisma.sql`
          SELECT "id"
          FROM "Booking"
          WHERE "id" = ${bookingId}::uuid
          FOR UPDATE
        `,
      );

      if (lockedBookings.length === 0) {
        return { error: "This booking could not be found." } as const;
      }

      const booking = await transaction.booking.findUnique({
        where: { id: bookingId },
        include: { seats: { select: { showtimeSeatId: true } } },
      });

      if (!booking || booking.userId !== userId) {
        return { error: "This booking could not be found." } as const;
      }

      const user = await transaction.user.findUnique({
        where: { id: userId },
        select: { role: true, status: true },
      });

      if (!user || user.status !== "ACTIVE" || user.role !== "CUSTOMER") {
        return { error: "Your customer account is unavailable." } as const;
      }

      if (booking.status === "CONFIRMED") {
        return { bookingId: booking.id } as const;
      }

      if (booking.status !== "PENDING_PAYMENT") {
        return {
          error: "This booking is no longer available to confirm.",
        } as const;
      }

      if (!booking.holdExpiresAt || booking.holdExpiresAt <= now) {
        return {
          error: "Your seat hold has expired. Select your seats again.",
        } as const;
      }

      const showtime = await transaction.showtime.findUnique({
        where: { id: booking.showtimeId },
        select: {
          status: true,
          startsAt: true,
          movie: { select: { status: true } },
          screen: { select: { isActive: true } },
        },
      });

      if (
        !showtime ||
        showtime.status !== "SCHEDULED" ||
        showtime.startsAt <= now ||
        showtime.movie.status !== "PUBLISHED" ||
        !showtime.screen.isActive
      ) {
        await transaction.showtimeSeat.updateMany({
          where: { bookingId: booking.id, status: "HELD" },
          data: {
            status: "AVAILABLE",
            bookingId: null,
            holdExpiresAt: null,
          },
        });
        await transaction.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED", holdExpiresAt: null },
        });

        return {
          error: "The showtime is no longer available. Your seat hold was released.",
        } as const;
      }

      const lockedSeats = await transaction.$queryRaw<
        { id: string; status: ShowtimeSeatStatus; holdExpiresAt: Date | null }[]
      >(Prisma.sql`
        SELECT "id", "status", "holdExpiresAt"
        FROM "ShowtimeSeat"
        WHERE "bookingId" = ${booking.id}::uuid
        ORDER BY "id"
        FOR UPDATE
      `);

      if (
        lockedSeats.length !== booking.seats.length ||
        lockedSeats.length === 0 ||
        lockedSeats.some(
          (seat) =>
            seat.status !== "HELD" ||
            !seat.holdExpiresAt ||
            seat.holdExpiresAt <= now,
        )
      ) {
        return {
          error: "Your seat hold is no longer valid. Select your seats again.",
        } as const;
      }

      const bookedSeats = await transaction.showtimeSeat.updateMany({
        where: {
          id: { in: lockedSeats.map((seat) => seat.id) },
          bookingId: booking.id,
          status: "HELD",
          holdExpiresAt: { gt: now },
        },
        data: {
          status: "BOOKED",
          holdExpiresAt: null,
        },
      });

      if (bookedSeats.count !== lockedSeats.length) {
        throw new BookingServiceError(
          "Seat availability changed while confirming. Refresh and try again.",
        );
      }

      await transaction.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED", holdExpiresAt: null },
      });

      return { bookingId: booking.id } as const;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );

  if ("error" in result) {
    throw new BookingServiceError(
      result.error ?? "This booking could not be confirmed.",
    );
  }

  if (!result.bookingId) {
    throw new BookingServiceError("This booking could not be confirmed.");
  }

  return db.booking.findUniqueOrThrow({
    where: { id: result.bookingId },
    include: customerBookingInclude,
  });
}

export async function getCustomerBooking(input: BookingLookupInput) {
  const parsed = bookingLookupSchema.safeParse(input);

  if (!parsed.success) {
    throw new BookingServiceError(firstValidationMessage(parsed.error));
  }

  await releaseExpiredHolds();

  return db.booking.findFirst({
    where: {
      id: parsed.data.bookingId,
      userId: parsed.data.userId,
    },
    include: customerBookingInclude,
  });
}

export async function getCustomerBookingHistory(userId: string) {
  const parsedUserId = bookingLookupSchema.shape.userId.safeParse(userId);

  if (!parsedUserId.success) {
    throw new BookingServiceError(firstValidationMessage(parsedUserId.error));
  }

  await releaseExpiredHolds();

  return db.booking.findMany({
    where: { userId: parsedUserId.data },
    orderBy: { createdAt: "desc" },
    include: customerBookingInclude,
  });
}

export async function cancelBookingForAdmin(bookingId: string) {
  const parsedId = bookingLookupSchema.shape.bookingId.safeParse(bookingId);
  if (!parsedId.success) {
    throw new BookingServiceError(firstValidationMessage(parsedId.error));
  }

  await db.$transaction(async (transaction) => {
    const initialBooking = await transaction.booking.findUnique({
      where: { id: parsedId.data },
      select: { showtimeId: true },
    });

    if (!initialBooking || !(await lockShowtime(transaction, initialBooking.showtimeId))) {
      throw new BookingServiceError("Booking not found.");
    }

    const lockedBookings = await transaction.$queryRaw<{ id: string }[]>(
      Prisma.sql`
        SELECT "id"
        FROM "Booking"
        WHERE "id" = ${parsedId.data}::uuid
        FOR UPDATE
      `,
    );

    if (lockedBookings.length === 0) {
      throw new BookingServiceError("Booking not found.");
    }

    const booking = await transaction.booking.findUnique({
      where: { id: parsedId.data },
      select: { status: true },
    });

    if (!booking) {
      throw new BookingServiceError("Booking not found.");
    }
    if (
      booking.status !== "PENDING_PAYMENT" &&
      booking.status !== "CONFIRMED"
    ) {
      throw new BookingServiceError("This booking can no longer be cancelled.");
    }

    await transaction.showtimeSeat.updateMany({
      where: {
        bookingId: parsedId.data,
        status: { in: ["HELD", "BOOKED"] },
      },
      data: {
        status: "AVAILABLE",
        bookingId: null,
        holdExpiresAt: null,
      },
    });
    await transaction.booking.update({
      where: { id: parsedId.data },
      data: { status: "CANCELLED", holdExpiresAt: null },
    });
  });
}
