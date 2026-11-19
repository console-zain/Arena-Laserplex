import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function promoteExistingUser() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    throw new Error("Set ADMIN_EMAIL to the email of an existing customer.");
  }

  const result = await db.user.updateMany({
    where: { email, status: "ACTIVE" },
    data: { role: "ADMIN" },
  });

  if (result.count !== 1) {
    throw new Error("No active user exists with the configured email address.");
  }

  console.info("Administrator role granted to the existing active user.");
}

promoteExistingUser()
  .catch((error: unknown) => {
    console.error("Could not promote the existing user to administrator.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
