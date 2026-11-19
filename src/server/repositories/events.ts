import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export function findEventById(id: string) {
  return db.event.findUnique({ where: { id } });
}

export function findEventBySlug(slug: string) {
  return db.event.findUnique({ where: { slug } });
}

export function listEvents(): Prisma.PrismaPromise<
  Prisma.EventGetPayload<Prisma.EventDefaultArgs>[]
>;
export function listEvents<T extends Prisma.EventFindManyArgs>(
  args: T,
): Prisma.PrismaPromise<Prisma.EventGetPayload<T>[]>;
export function listEvents(args: Prisma.EventFindManyArgs = {}) {
  return db.event.findMany(args);
}

export function createEvent(data: Prisma.EventCreateInput) {
  return db.event.create({ data });
}

export function updateEvent(
  where: Prisma.EventWhereUniqueInput,
  data: Prisma.EventUpdateInput,
) {
  return db.event.update({ where, data });
}

export function deleteEvent(where: Prisma.EventWhereUniqueInput) {
  return db.event.delete({ where });
}
