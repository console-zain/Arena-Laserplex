import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type {
  ShowtimeFormInput,
  UpdateShowtimeFormInput,
} from "@/server/validation/showtime";

type TransactionClient = Prisma.TransactionClient;

async function releaseActiveHoldsForShowtime(
  transaction: TransactionClient,
  showtimeId: string,
) {
  const now = new Date();
  const activeBookings = await transaction.booking.findMany({
    where: {
      showtimeId,
      status: "PENDING_PAYMENT",
      holdExpiresAt: { gt: now },
    },
    select: { id: true },
  });

  if (activeBookings.length === 0) {
    return;
  }

  const bookingIds = activeBookings.map((booking) => booking.id);
  await transaction.booking.updateMany({
    where: {
      id: { in: bookingIds },
      status: "PENDING_PAYMENT",
      holdExpiresAt: { gt: now },
    },
    data: { status: "CANCELLED", holdExpiresAt: null },
  });
  await transaction.showtimeSeat.updateMany({
    where: { bookingId: { in: bookingIds }, status: "HELD" },
    data: {
      status: "AVAILABLE",
      bookingId: null,
      holdExpiresAt: null,
    },
  });
}

export class ShowtimeServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShowtimeServiceError";
  }
}

function toUtcDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00.000Z`);
}

function isScheduleConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code === "P2034") {
    return true;
  }

  return (
    error.code === "P2004" &&
    JSON.stringify(error.meta).includes(
      "Showtime_no_overlapping_scheduled_screen",
    )
  );
}

async function assertScheduleAvailable(
  transaction: TransactionClient,
  screenId: string,
  startsAt: Date,
  endsAt: Date,
  exceptShowtimeId?: string,
) {
  const conflict = await transaction.showtime.findFirst({
    where: {
      screenId,
      status: "SCHEDULED",
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
      ...(exceptShowtimeId ? { id: { not: exceptShowtimeId } } : {}),
    },
    select: { id: true },
  });

  if (conflict) {
    throw new ShowtimeServiceError(
      "This screen already has a scheduled showtime during that period.",
    );
  }
}

async function getActiveSeats(
  transaction: TransactionClient,
  screenId: string,
  requireActiveScreen: boolean,
) {
  const screen = await transaction.screen.findUnique({
    where: { id: screenId },
    select: {
      id: true,
      isActive: true,
      seats: {
        where: { isActive: true },
        select: { id: true },
        orderBy: [{ rowLabel: "asc" }, { seatNumber: "asc" }],
      },
    },
  });

  if (!screen) {
    throw new ShowtimeServiceError("The selected screen no longer exists.");
  }

  if (requireActiveScreen && !screen.isActive) {
    throw new ShowtimeServiceError(
      "Choose an active screen for a scheduled showtime.",
    );
  }

  if (screen.seats.length === 0) {
    throw new ShowtimeServiceError(
      "The selected screen has no active seats. Configure its seat layout first.",
    );
  }

  return screen.seats;
}

async function getMovieScheduleDetails(
  transaction: TransactionClient,
  movieId: string,
) {
  const movie = await transaction.movie.findUnique({
    where: { id: movieId },
    select: {
      runtimeMinutes: true,
      originalLanguage: true,
      status: true,
      publishedAt: true,
      releaseDate: true,
    },
  });

  if (!movie) {
    throw new ShowtimeServiceError("The selected movie no longer exists.");
  }

  const now = new Date();
  if (
    movie.status !== "PUBLISHED" ||
    !movie.publishedAt ||
    movie.publishedAt > now ||
    !movie.releaseDate ||
    movie.releaseDate > now
  ) {
    throw new ShowtimeServiceError(
      "Only published movies released today or earlier can be scheduled. Upcoming movies become available after their release date.",
    );
  }

  const runtimeMinutes = movie.runtimeMinutes;
  if (!runtimeMinutes || runtimeMinutes <= 0) {
    throw new ShowtimeServiceError(
      "Add a valid runtime to the movie before scheduling a showtime.",
    );
  }

  return { runtimeMinutes, originalLanguage: movie.originalLanguage };
}

function mapDatabaseScheduleError(error: unknown): never {
  if (isScheduleConflict(error)) {
    throw new ShowtimeServiceError(
      "The screen schedule changed while saving. Refresh and choose another time.",
    );
  }

  throw error;
}

export async function createShowtime(
  input: ShowtimeFormInput,
  createdById: string,
) {
  const startsAt = toUtcDateTime(input.date, input.startTime);

  try {
    return await db.$transaction(
      async (transaction) => {
        const movie = await getMovieScheduleDetails(
          transaction,
          input.movieId,
        );
        const endsAt = new Date(
          startsAt.getTime() + movie.runtimeMinutes * 60_000,
        );
        const seats = await getActiveSeats(
          transaction,
          input.screenId,
          true,
        );

        await assertScheduleAvailable(
          transaction,
          input.screenId,
          startsAt,
          endsAt,
        );

        const showtime = await transaction.showtime.create({
          data: {
            movieId: input.movieId,
            screenId: input.screenId,
            startsAt,
            endsAt,
            basePriceMinor: input.price,
            currency: "LKR",
            language: input.language || movie.originalLanguage || "en",
            status: "SCHEDULED",
            createdById,
          },
        });

        await transaction.showtimeSeat.createMany({
          data: seats.map((seat) => ({
            showtimeId: showtime.id,
            seatId: seat.id,
          })),
        });

        return showtime;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    mapDatabaseScheduleError(error);
  }
}

export async function updateShowtime(input: UpdateShowtimeFormInput) {
  const startsAt = toUtcDateTime(input.date, input.startTime);

  try {
    return await db.$transaction(
      async (transaction) => {
        const lockedShowtimes = await transaction.$queryRaw<{ id: string }[]>(
          Prisma.sql`
            SELECT "id"
            FROM "Showtime"
            WHERE "id" = ${input.showtimeId}::uuid
            FOR UPDATE
          `,
        );

        if (lockedShowtimes.length === 0) {
          throw new ShowtimeServiceError("This showtime no longer exists.");
        }

        const existing = await transaction.showtime.findUnique({
          where: { id: input.showtimeId },
          select: {
            id: true,
            screenId: true,
            status: true,
            showtimeSeats: {
              select: {
                status: true,
                _count: { select: { bookingSeats: true } },
              },
            },
          },
        });

        if (!existing) {
          throw new ShowtimeServiceError("This showtime no longer exists.");
        }

        const movie = await getMovieScheduleDetails(
          transaction,
          input.movieId,
        );
        const endsAt = new Date(
          startsAt.getTime() + movie.runtimeMinutes * 60_000,
        );
        const screenChanged = existing.screenId !== input.screenId;
        const seats = await getActiveSeats(
          transaction,
          input.screenId,
          existing.status === "SCHEDULED",
        );

        if (existing.status === "SCHEDULED") {
          await assertScheduleAvailable(
            transaction,
            input.screenId,
            startsAt,
            endsAt,
            existing.id,
          );
        }

        if (screenChanged) {
          const inventoryInUse = existing.showtimeSeats.some(
            (seat) =>
              seat.status !== "AVAILABLE" || seat._count.bookingSeats > 0,
          );

          if (inventoryInUse) {
            throw new ShowtimeServiceError(
              "The screen cannot be changed after seats have been held or booked.",
            );
          }

          await transaction.showtimeSeat.deleteMany({
            where: { showtimeId: existing.id },
          });
          await transaction.showtimeSeat.createMany({
            data: seats.map((seat) => ({
              showtimeId: existing.id,
              seatId: seat.id,
            })),
          });
        }

        const updated = await transaction.showtime.update({
          where: { id: existing.id },
          data: {
            movieId: input.movieId,
            screenId: input.screenId,
            startsAt,
            endsAt,
            basePriceMinor: input.price,
            currency: "LKR",
            language: input.language || movie.originalLanguage || "en",
          },
        });

        return updated;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof ShowtimeServiceError) {
      throw error;
    }

    mapDatabaseScheduleError(error);
  }
}

export async function cancelShowtime(showtimeId: string) {
  await db.$transaction(async (transaction) => {
    const result = await transaction.showtime.updateMany({
      where: { id: showtimeId, status: "SCHEDULED" },
      data: { status: "CANCELLED" },
    });

    if (result.count === 0) {
      const showtime = await transaction.showtime.findUnique({
        where: { id: showtimeId },
        select: { id: true },
      });

      if (!showtime) {
        throw new ShowtimeServiceError("This showtime no longer exists.");
      }

      throw new ShowtimeServiceError(
        "Only scheduled showtimes can be cancelled.",
      );
    }

    await releaseActiveHoldsForShowtime(transaction, showtimeId);
  });
}
