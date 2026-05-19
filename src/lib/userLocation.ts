import type { Coordinates } from "./weatherApi";

export type GeolocationFailureReason =
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported";

export type GeolocationOutcome =
  | { ok: true; coords: Coordinates }
  | { ok: false; reason: GeolocationFailureReason; message: string };

const GEO_TIMEOUT_MS = 12_000;

function mapGeolocationError(
  code: number,
): { reason: GeolocationFailureReason; message: string } {
  switch (code) {
    case 1:
      return {
        reason: "denied",
        message: "Location access denied — showing Atlanta",
      };
    case 2:
      return {
        reason: "unavailable",
        message: "Location unavailable — showing Atlanta",
      };
    case 3:
      return {
        reason: "timeout",
        message: "Location timed out — showing Atlanta",
      };
    default:
      return {
        reason: "unavailable",
        message: "Could not get location — showing Atlanta",
      };
  }
}

/**
 * Requests the device location via the browser Geolocation API.
 */
export function requestUserLocation(): Promise<GeolocationOutcome> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({
      ok: false,
      reason: "unsupported",
      message: "Geolocation not supported — showing Atlanta",
    });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          ok: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        const mapped = mapGeolocationError(error.code);
        resolve({ ok: false, ...mapped });
      },
      {
        enableHighAccuracy: false,
        timeout: GEO_TIMEOUT_MS,
        maximumAge: 5 * 60 * 1000,
      },
    );
  });
}
