import {
  clearSavedUserLocation,
  getSavedUserLocation,
  saveUserLocation,
} from "./locationStorage";
import { requestUserLocation } from "./userLocation";
import type { Coordinates } from "./weatherApi";

export const ATLANTA_COORDINATES: Coordinates = {
  latitude: 33.749,
  longitude: -84.388,
};

export const ATLANTA_LOCATION_NAME = "Atlanta";
export const CURRENT_LOCATION_LABEL = "Current Location";

export type WeatherLocationMode = "atlanta" | "user";

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
    coords: ATLANTA_COORDINATES,
    mode: "atlanta",
    fallbackLocationName: ATLANTA_LOCATION_NAME,
  };
}

export type ActivateMyLocationResult =
  | { ok: true; location: ResolvedWeatherLocation }
  | { ok: false; notice: string; location: ResolvedWeatherLocation };

/**
 * Requests browser geolocation, persists coords on success, or returns Atlanta fallback.
 */
export async function activateMyLocation(): Promise<ActivateMyLocationResult> {
  const atlantaFallback: ResolvedWeatherLocation = {
    coords: ATLANTA_COORDINATES,
    mode: "atlanta",
    fallbackLocationName: ATLANTA_LOCATION_NAME,
  };

  const outcome = await requestUserLocation();

  if (!outcome.ok) {
    clearSavedUserLocation();
    return {
      ok: false,
      notice: outcome.message,
      location: atlantaFallback,
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
