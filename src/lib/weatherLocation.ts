import {
  clearSavedUserLocation,
  getSavedUserLocation,
  saveUserLocation,
} from "./locationStorage";
import { requestUserLocation } from "./userLocation";
import type { Coordinates } from "./weatherApi";

/** Gwinnett County / Lawrenceville area default when location is unavailable. */
export const DEFAULT_COORDINATES: Coordinates = {
  latitude: 33.9562,
  longitude: -83.988,
};

export const DEFAULT_LOCATION_NAME = "Lawrenceville";
export const CURRENT_LOCATION_LABEL = "Current Location";

/** @deprecated Use DEFAULT_* — kept for existing mode checks */
export const ATLANTA_COORDINATES = DEFAULT_COORDINATES;
export const ATLANTA_LOCATION_NAME = DEFAULT_LOCATION_NAME;

export type WeatherLocationMode = "default" | "user";

export type ResolvedWeatherLocation = {
  coords: Coordinates;
  mode: WeatherLocationMode;
  /** Label if reverse geocoding fails */
  fallbackLocationName: string;
};

export function resolveWeatherLocation(): ResolvedWeatherLocation {
  const saved = getSavedUserLocation();
  if (saved) {
    return {
      coords: { latitude: saved.latitude, longitude: saved.longitude },
      mode: "user",
      fallbackLocationName: CURRENT_LOCATION_LABEL,
    };
  }

  return {
    coords: DEFAULT_COORDINATES,
    mode: "default",
    fallbackLocationName: DEFAULT_LOCATION_NAME,
  };
}

export type ActivateMyLocationResult =
  | { ok: true; location: ResolvedWeatherLocation }
  | { ok: false; notice: string; location: ResolvedWeatherLocation };

/**
 * Requests device location, persists coords on success, or returns area default.
 */
export async function activateMyLocation(): Promise<ActivateMyLocationResult> {
  const defaultFallback: ResolvedWeatherLocation = {
    coords: DEFAULT_COORDINATES,
    mode: "default",
    fallbackLocationName: DEFAULT_LOCATION_NAME,
  };

  const outcome = await requestUserLocation();

  if (!outcome.ok) {
    clearSavedUserLocation();
    return {
      ok: false,
      notice: outcome.message,
      location: defaultFallback,
    };
  }

  saveUserLocation(outcome.coords);

  return {
    ok: true,
    location: {
      coords: outcome.coords,
      mode: "user",
      fallbackLocationName: CURRENT_LOCATION_LABEL,
    },
  };
}
