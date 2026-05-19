import type { Coordinates } from "./weatherApi";

const LEGACY_STORAGE_KEY = "ambient-widgets.weather-location";
const STORAGE_KEY = "orbit.weather-location";

export type SavedUserLocation = Coordinates & {
  savedAt: number;
};

function isSavedUserLocation(value: unknown): value is SavedUserLocation {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.latitude === "number" &&
    typeof record.longitude === "number" &&
    Number.isFinite(record.latitude) &&
    Number.isFinite(record.longitude) &&
    record.latitude >= -90 &&
    record.latitude <= 90 &&
    record.longitude >= -180 &&
    record.longitude <= 180
  );
}

function migrateLegacyStorageKey(): void {
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, legacy);
    }
    if (legacy) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function getSavedUserLocation(): SavedUserLocation | null {
  migrateLegacyStorageKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isSavedUserLocation(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveUserLocation(coords: Coordinates): void {
  const entry: SavedUserLocation = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    savedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
}

export function clearSavedUserLocation(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
