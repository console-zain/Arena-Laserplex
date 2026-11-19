import { Prisma } from "@prisma/client";
import { siteConfig } from "@/config/site";
import {
  findCinemaSettings,
  saveCinemaSettings,
} from "@/server/repositories/settings";
import type { CinemaSettingsInput } from "@/server/validation/settings";

export interface CinemaSettingsData extends CinemaSettingsInput {}

export interface CinemaSettingsState {
  settings: CinemaSettingsData;
  databaseReady: boolean;
}

const defaults: CinemaSettingsData = {
  cinemaName: siteConfig.name,
  description: siteConfig.description,
  address: "",
  timezone: "Asia/Colombo",
  contactEmail: null,
  contactPhone: null,
  websiteUrl: null,
  instagramUrl: null,
  xUrl: null,
  whatsappUrl: null,
  facebookUrl: null,
};

export function isCinemaSettingsMigrationPending(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    String(error.meta?.table ?? "").includes("CinemaSettings")
  );
}

export async function getCinemaSettingsState(): Promise<CinemaSettingsState> {
  let settings;
  try {
    settings = await findCinemaSettings();
  } catch (error) {
    if (isCinemaSettingsMigrationPending(error)) {
      return { settings: defaults, databaseReady: false };
    }

    throw error;
  }

  if (!settings) {
    return { settings: defaults, databaseReady: true };
  }

  return {
    settings: {
      cinemaName: settings.cinemaName,
      description: settings.description,
      address: settings.address,
      timezone: settings.timezone,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      websiteUrl: settings.websiteUrl,
      instagramUrl: settings.instagramUrl,
      xUrl: settings.xUrl,
      whatsappUrl: settings.whatsappUrl,
      facebookUrl: settings.facebookUrl,
    },
    databaseReady: true,
  };
}

export async function getCinemaSettings(): Promise<CinemaSettingsData> {
  return (await getCinemaSettingsState()).settings;
}

export function saveCinemaSettingsRecord(input: CinemaSettingsInput) {
  return saveCinemaSettings(input);
}
