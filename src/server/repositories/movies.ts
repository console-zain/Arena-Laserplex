import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export function findMovieById(id: string) {
  return db.movie.findUnique({ where: { id } });
}

export function findMovieBySlug(slug: string) {
  return db.movie.findUnique({ where: { slug } });
}

export function listMovies(): Prisma.PrismaPromise<
  Prisma.MovieGetPayload<Prisma.MovieDefaultArgs>[]
>;
export function listMovies<T extends Prisma.MovieFindManyArgs>(
  args: T,
): Prisma.PrismaPromise<Prisma.MovieGetPayload<T>[]>;
export function listMovies(args: Prisma.MovieFindManyArgs = {}) {
  return db.movie.findMany(args);
}

export function createMovie(data: Prisma.MovieCreateInput) {
  return db.movie.create({ data });
}

export function updateMovie(
  where: Prisma.MovieWhereUniqueInput,
  data: Prisma.MovieUpdateInput,
) {
  return db.movie.update({ where, data });
}

export function deleteMovie(where: Prisma.MovieWhereUniqueInput) {
  return db.movie.delete({ where });
}

export async function deleteMovieWithUnusedShowtimes(
  movieId: string,
): Promise<"not-found" | "has-bookings" | "deleted"> {
  return db.$transaction(async (transaction) => {
    const movie = await transaction.movie.findUnique({
      where: { id: movieId },
      select: {
        showtimes: {
          select: {
            id: true,
            _count: { select: { bookings: true } },
          },
        },
      },
    });

    if (!movie) {
      return "not-found";
    }

    if (movie.showtimes.some((showtime) => showtime._count.bookings > 0)) {
      return "has-bookings";
    }

    const showtimeIds = movie.showtimes.map((showtime) => showtime.id);
    if (showtimeIds.length > 0) {
      await transaction.showtimeSeat.deleteMany({
        where: { showtimeId: { in: showtimeIds } },
      });
      await transaction.showtime.deleteMany({
        where: { id: { in: showtimeIds } },
      });
    }

    await transaction.movie.delete({ where: { id: movieId } });
    return "deleted";
  });
}
