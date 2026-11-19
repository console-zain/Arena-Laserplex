import {
  createPromotion,
  countPromotionReferences,
  deletePromotion,
  findPromotionById,
  listPromotions,
  updatePromotion,
} from "@/server/repositories/promotions";
import {
  ContentServiceError,
  rethrowContentMutationError,
} from "@/server/services/content-errors";
import type { PromotionFormInput } from "@/server/validation/promotions";

export function listAdminPromotions() {
  return listPromotions({ orderBy: { updatedAt: "desc" } });
}

function promotionData(input: PromotionFormInput) {
  return {
    name: input.name,
    code: input.code,
    description: input.description,
    imageKey: input.imageKey,
    discountType: input.discountType,
    discountValue: input.discountValue,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    totalRedemptionLimit: input.totalRedemptionLimit,
    perUserLimit: input.perUserLimit,
    minimumSpendMinor: input.minimumSpendMinor,
  };
}

export async function createPromotionRecord(input: PromotionFormInput) {
  try {
    return await createPromotion(promotionData(input));
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function updatePromotionRecord(
  id: string,
  input: PromotionFormInput,
) {
  try {
    return await updatePromotion({ id }, promotionData(input));
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export function findPromotionByIdForAdmin(id: string) {
  return findPromotionById(id);
}

export async function activatePromotionRecord(id: string) {
  const promotion = await findPromotionById(id);
  if (!promotion) {
    throw new ContentServiceError("Promotion not found.");
  }
  if (promotion.endsAt <= new Date()) {
    throw new ContentServiceError(
      "An expired promotion cannot be activated.",
    );
  }

  try {
    return await updatePromotion({ id }, { status: "ACTIVE" });
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function disablePromotionRecord(id: string) {
  try {
    return await updatePromotion({ id }, { status: "DISABLED" });
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function deletePromotionRecord(id: string) {
  if (!(await findPromotionById(id))) {
    throw new ContentServiceError("Promotion not found.");
  }

  if ((await countPromotionReferences(id)) > 0) {
    throw new ContentServiceError(
      "This promotion is linked to bookings or redemptions and cannot be deleted.",
    );
  }

  try {
    return await deletePromotion({ id });
  } catch (error) {
    rethrowContentMutationError(error);
  }
}
