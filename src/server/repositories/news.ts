import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export function findNewsById(id: string) {
  return db.news.findUnique({ where: { id } });
}

export function findNewsBySlug(slug: string) {
  return db.news.findUnique({ where: { slug } });
}

export function listNews(): Prisma.PrismaPromise<
  Prisma.NewsGetPayload<Prisma.NewsDefaultArgs>[]
>;
export function listNews<T extends Prisma.NewsFindManyArgs>(
  args: T,
): Prisma.PrismaPromise<Prisma.NewsGetPayload<T>[]>;
export function listNews(args: Prisma.NewsFindManyArgs = {}) {
  return db.news.findMany(args);
}

export function createNews(data: Prisma.NewsCreateInput) {
  return db.news.create({ data });
}

export function updateNews(
  where: Prisma.NewsWhereUniqueInput,
  data: Prisma.NewsUpdateInput,
) {
  return db.news.update({ where, data });
}

export function deleteNews(where: Prisma.NewsWhereUniqueInput) {
  return db.news.delete({ where });
}
