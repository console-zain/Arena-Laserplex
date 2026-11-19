import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export function findShowtimeById(id: string) {
  return db.showtime.findUnique({ where: { id } });
}

export function listShowtimes(args: Prisma.ShowtimeFindManyArgs = {}) {
  return db.showtime.findMany(args);
}

export function createShowtime(data: Prisma.ShowtimeCreateInput) {
  return db.showtime.create({ data });
}

export function updateShowtime(
  where: Prisma.ShowtimeWhereUniqueInput,
  data: Prisma.ShowtimeUpdateInput,
) {
  return db.showtime.update({ where, data });
}

export function deleteShowtime(where: Prisma.ShowtimeWhereUniqueInput) {
  return db.showtime.delete({ where });
}
