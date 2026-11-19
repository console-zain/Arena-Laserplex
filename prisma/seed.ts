import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const screenLayouts = [
  { code: "L", name: "L Screen", capacity: 120, rows: 8, seatsPerRow: 15 },
  { code: "XL", name: "XL Screen", capacity: 240, rows: 12, seatsPerRow: 20 },
] as const;

const rowLabels = "ABCDEFGHJKLMNPQRSTUVWXYZ";

async function seedScreen(layout: (typeof screenLayouts)[number]) {
  const screen = await prisma.screen.upsert({
    where: { code: layout.code },
    update: {
      name: layout.name,
      capacity: layout.capacity,
      isActive: true,
    },
    create: {
      code: layout.code,
      name: layout.name,
      capacity: layout.capacity,
    },
  });

  const seats: Prisma.SeatCreateManyInput[] = [];

  for (let rowIndex = 0; rowIndex < layout.rows; rowIndex += 1) {
    const rowLabel = rowLabels[rowIndex];

    if (!rowLabel) {
      throw new Error(`Missing row label for ${layout.name}.`);
    }

    for (let seatNumber = 1; seatNumber <= layout.seatsPerRow; seatNumber += 1) {
      seats.push({
        screenId: screen.id,
        rowLabel,
        seatNumber,
        type:
          rowIndex === layout.rows - 1 && seatNumber <= 2
            ? "ACCESSIBLE"
            : "STANDARD",
      });
    }
  }

  await prisma.seat.createMany({ data: seats, skipDuplicates: true });

  const activeSeatCount = await prisma.seat.count({
    where: { screenId: screen.id, isActive: true },
  });

  if (activeSeatCount !== layout.capacity) {
    throw new Error(
      `${layout.name} has ${activeSeatCount} active seats; expected ${layout.capacity}.`,
    );
  }
}

async function main() {
  for (const layout of screenLayouts) {
    await seedScreen(layout);
  }
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
