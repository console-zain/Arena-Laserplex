import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export function findPromotionById(id: string) {
  return db.promotion.findUnique({ where: { id } });
}

export function findPromotionByCode(code: string) {
  return db.promotion.findUnique({ where: { code } });
}

export function listPromotions(): Prisma.PrismaPromise<
  Prisma.PromotionGetPayload<Prisma.PromotionDefaultArgs>[]
>;
export function listPromotions<T extends Prisma.PromotionFindManyArgs>(
  args: T,
): Prisma.PrismaPromise<Prisma.PromotionGetPayload<T>[]>;
export function listPromotions(args: Prisma.PromotionFindManyArgs = {}) {
  return db.promotion.findMany(args);
}

export function createPromotion(data: Prisma.PromotionCreateInput) {
  return db.promotion.create({ data });
}

export function updatePromotion(
  where: Prisma.PromotionWhereUniqueInput,
  data: Prisma.PromotionUpdateInput,
) {
  return db.promotion.update({ where, data });
}

export function deletePromotion(where: Prisma.PromotionWhereUniqueInput) {
  return db.promotion.delete({ where });
}

export async function countPromotionReferences(promotionId: string) {
  const [bookings, redemptions] = await Promise.all([
    db.booking.count({ where: { promotionId } }),
    db.promotionRedemption.count({ where: { promotionId } }),
  ]);
  return bookings + redemptions;
}
