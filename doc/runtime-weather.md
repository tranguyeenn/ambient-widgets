# Weather widget

Frontend widget: [Open-Meteo](https://open-meteo.com) forecast, [BigDataCloud](https://www.bigdatacloud.com/docs/api/free-reverse-geocode-client) reverse geocoding, and `@tauri-apps/plugin-geolocation` for macOS location permission + coordinates.

## Window

| Label | URL | Default size |
|-------|-----|--------------|
| `weather` | `pages/weather.html` | 160×160 (min 112×112, max 480×480) |

Position and size persist via `tauri-plugin-window-state` (same as lyric/calendar). `alwaysOnTop: false` — normal desktop layering.

## Data sources

| API | Purpose | Key |
|-----|---------|-----|
| [Open-Meteo Forecast](https://open-meteo.com/en/docs) | Current temp, WMO weather code, daily high/low | None |
| [BigDataCloud reverse geocode](https://www.bigdatacloud.com/docs/api/free-reverse-geocode-client) | City name from lat/lon | None |
| `@tauri-apps/plugin-geolocation` | User location + macOS permission prompt (native app) | `geolocation:default` capability |
| `navigator.geolocation` | Fallback in browser-only `npm run dev` | None |

CSP `connect-src` in `tauri.conf.json` must allow `https://api.open-meteo.com` and `https://api.bigdatacloud.net` (and `https://dummyjson.com` for lyrics quotes).

## Location logic

| File | Role |
|------|------|
| `src/lib/weatherLocation.ts` | Area default (Lawrenceville), resolve saved vs default, `activateMyLocation()` |
| `src/lib/locationStorage.ts` | `localStorage` (`orbit.weather-location`; migrates legacy `ambient-widgets.weather-location`) |
| `src/lib/userLocation.ts` | Tauri geolocation plugin in app; browser API in Vite-only dev |
| `src/lib/weatherApi.ts` | Fetch forecast + location name (prefers `locality` over metro `city`) |
| `src/lib/weatherCodes.ts` | WMO code → label + category |
| `src/lib/weatherTheme.ts` | Category → gradient background + rain/snow effects |

### Defaults

- **Fallback area:** Lawrenceville, GA (`33.9562°, -83.988°`) when no saved location
- **User location label:** `"Current Location"` if reverse geocode fails; otherwise `"City, State"` (e.g. `Lawrenceville, Georgia`)

### Startup

1. Load weather immediately for saved coords or the Lawrenceville default (no waiting on GPS)
2. If no saved location, request location in the background and refresh when granted

### “Use my location”

1. `requestUserLocation()` → Tauri permission dialog (native) or browser prompt (Vite-only)
2. **Granted:** save coords to `localStorage`, fetch weather, show resolved name
3. **Denied / error:** clear saved location, keep area default + notice in the widget

### macOS permission

`src-tauri/Info.plist` includes `NSLocationWhenInUseUsageDescription`. Enable **Orbit** under **System Settings → Privacy & Security → Location Services**. Restart the app after changing permissions.

## UI

- `WeatherWidget.tsx` — loading, error, refresh every 10 minutes
- Condition-themed background (clear day/night, cloudy, fog, rain, thunderstorm, snow)
- Compact layout via CSS container queries when the window is small/square

## Related docs

- [runtime-windows.md](./runtime-windows.md)
- [runtime-quotes.md](./runtime-quotes.md) — DummyJSON quote mode (lyrics widget)
