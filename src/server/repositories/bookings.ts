import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export function findBookingById(id: string) {
  return db.booking.findUnique({ where: { id } });
}

export function findBookingByReference(bookingReference: string) {
  return db.booking.findUnique({ where: { bookingReference } });
}

export function listBookings(): Prisma.PrismaPromise<
  Prisma.BookingGetPayload<Prisma.BookingDefaultArgs>[]
>;
export function listBookings<T extends Prisma.BookingFindManyArgs>(
  args: T,
): Prisma.PrismaPromise<Prisma.BookingGetPayload<T>[]>;
export function listBookings(args: Prisma.BookingFindManyArgs = {}) {
  return db.booking.findMany(args);
}

export function createBooking(data: Prisma.BookingCreateInput) {
  return db.booking.create({ data });
}

export function updateBooking(
  where: Prisma.BookingWhereUniqueInput,
  data: Prisma.BookingUpdateInput,
) {
  return db.booking.update({ where, data });
}

export function deleteBooking(where: Prisma.BookingWhereUniqueInput) {
  return db.booking.delete({ where });
}
