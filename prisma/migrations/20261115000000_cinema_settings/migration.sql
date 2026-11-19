CREATE TABLE "CinemaSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "cinemaName" TEXT NOT NULL DEFAULT 'Arena Laserplex',
    "description" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Colombo',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "websiteUrl" TEXT,
    "instagramUrl" TEXT,
    "xUrl" TEXT,
    "whatsappUrl" TEXT,
    "facebookUrl" TEXT,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CinemaSettings_pkey" PRIMARY KEY ("id")
);
