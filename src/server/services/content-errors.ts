import { Prisma } from "@prisma/client";

export class ContentServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentServiceError";
  }
}

export function rethrowContentMutationError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new ContentServiceError(
        "A record with the same slug, TMDB ID, or promotion code already exists.",
      );
    }

    if (error.code === "P2025") {
      throw new ContentServiceError(
        "A related record no longer exists. Refresh the page and try again.",
      );
    }

    if (error.code === "P2003") {
      throw new ContentServiceError(
        "This record is still in use and cannot be deleted.",
      );
    }
  }

  throw error;
}
