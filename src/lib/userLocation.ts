import type { Coordinates } from "./weatherApi";

export type GeolocationFailureReason =
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported";

export type GeolocationOutcome =
  | { ok: true; coords: Coordinates }
  | { ok: false; reason: GeolocationFailureReason; message: string };

const GEO_TIMEOUT_MS = 8_000;

const DENIED_MESSAGE =
  "Location access denied — enable Orbit in System Settings → Privacy & Security → Location Services";

function isTauriRuntime(): boolean {
  return (
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window)
  );
}

function mapGeolocationError(
  code: number,
): { reason: GeolocationFailureReason; message: string } {
  switch (code) {
    case 1:
      return { reason: "denied", message: DENIED_MESSAGE };
    case 2:
      return {
        reason: "unavailable",
        message: "Location unavailable — check Location Services",
      };
    case 3:
      return { reason: "timeout", message: "Location timed out — try again" };
    default:
      return { reason: "unavailable", message: "Could not get location" };
  }
}

function mapPluginError(error: unknown): {
  reason: GeolocationFailureReason;
  message: string;
} {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Could not get location";

  const lower = text.toLowerCase();
  if (lower.includes("denied") || lower.includes("permission")) {
    return { reason: "denied", message: DENIED_MESSAGE };
  }
  if (lower.includes("timeout")) {
    return { reason: "timeout", message: "Location timed out — try again" };
  }
  return { reason: "unavailable", message: text };
}

async function requestTauriLocation(): Promise<GeolocationOutcome> {
  const {
    checkPermissions,
    requestPermissions,
    getCurrentPosition,
  } = await import("@tauri-apps/plugin-geolocation");

  let permissions = await checkPermissions();
  if (
    permissions.location === "prompt" ||
    permissions.location === "prompt-with-rationale"
  ) {
    permissions = await requestPermissions(["location"]);
  }

  if (permissions.location !== "granted") {
    return {
      ok: false,
      reason: "denied",
      message: DENIED_MESSAGE,
    };
  }

  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: GEO_TIMEOUT_MS,
      maximumAge: 5 * 60 * 1000,
    });

    return {
      ok: true,
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch (error) {
    return { ok: false, ...mapPluginError(error) };
  }
}

function requestBrowserLocation(): Promise<GeolocationOutcome> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({
      ok: false,
      reason: "unsupported",
      message: "Geolocation not supported in this window",
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
        enableHighAccuracy: true,
        timeout: GEO_TIMEOUT_MS,
        maximumAge: 5 * 60 * 1000,
      },
    );
  });
}

/**
 * Requests device location. Uses Tauri's geolocation plugin in the native app
 * (triggers the real macOS permission dialog); falls back to the browser API in `npm run dev`.
 */
export function requestUserLocation(): Promise<GeolocationOutcome> {
  if (isTauriRuntime()) {
    return requestTauriLocation();
  }
  return requestBrowserLocation();
}
