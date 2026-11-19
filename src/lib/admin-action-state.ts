import { ZodError } from "zod";
import { ContentServiceError } from "@/server/services/content-errors";

export interface AdminActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
}

export function getAdminActionError(error: unknown): AdminActionState {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};

    for (const issue of error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    return {
      error:
        Object.keys(fieldErrors).length > 0
          ? "Please correct the highlighted fields."
          : error.issues[0]?.message ?? "The submitted data is invalid.",
      fieldErrors,
    };
  }

  if (error instanceof ContentServiceError) {
    return { error: error.message };
  }

  throw error;
}
