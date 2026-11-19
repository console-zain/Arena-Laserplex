import { db } from "@/lib/db";
import type { CinemaSettingsInput } from "@/server/validation/settings";

const SETTINGS_ID = "default";

export function findCinemaSettings() {
  return db.cinemaSettings.findUnique({ where: { id: SETTINGS_ID } });
}

export function saveCinemaSettings(data: CinemaSettingsInput) {
  return db.cinemaSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}
