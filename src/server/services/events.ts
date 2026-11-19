import { slugify } from "@/lib/slug";
import {
  createEvent,
  deleteEvent,
  findEventById,
  listEvents,
  updateEvent,
} from "@/server/repositories/events";
import {
  ContentServiceError,
  rethrowContentMutationError,
} from "@/server/services/content-errors";
import type { EventFormInput } from "@/server/validation/events";

export function listAdminEvents() {
  return listEvents({
    include: { screen: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export function listPublishedEvents(upcomingOnly = false) {
  const now = new Date();
  return listEvents({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: now },
      ...(upcomingOnly ? { startsAt: { gte: now } } : {}),
    },
    include: { screen: { select: { name: true } } },
    orderBy: { startsAt: "asc" },
  });
}

export function findEventBySlug(slug: string) {
  const now = new Date();
  return listEvents({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: now },
    },
    include: { screen: { select: { name: true } } },
    take: 1,
  }).then((events) => events[0] ?? null);
}

export function findEventByIdForAdmin(id: string) {
  return findEventById(id);
}

function eventData(input: EventFormInput) {
  return {
    slug: slugify(input.title),
    title: input.title,
    category: input.category,
    summary: input.summary,
    body: input.body,
    imageKey: input.imageKey,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    timeZone: "UTC",
  };
}

export async function createEventRecord(
  input: EventFormInput,
  adminId: string,
) {
  try {
    return await createEvent({
      ...eventData(input),
      author: { connect: { id: adminId } },
    });
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function updateEventRecord(id: string, input: EventFormInput) {
  try {
    return await updateEvent({ id }, eventData(input));
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function publishEventRecord(id: string) {
  const event = await findEventById(id);
  if (!event) {
    throw new ContentServiceError("Event not found.");
  }
  if (event.status === "CANCELLED") {
    throw new ContentServiceError("A cancelled event cannot be published.");
  }

  try {
    return await updateEvent(
      { id },
      { status: "PUBLISHED", publishedAt: new Date() },
    );
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function archiveEventRecord(id: string) {
  try {
    return await updateEvent({ id }, { status: "ARCHIVED" });
  } catch (error) {
    rethrowContentMutationError(error);
  }
}

export async function deleteEventRecord(id: string) {
  try {
    return await deleteEvent({ id });
  } catch (error) {
    rethrowContentMutationError(error);
  }
}
