# Weather widget

Frontend widget: Open-Meteo forecast, BigDataCloud reverse geocoding, and Tauri geolocation plugin (`@tauri-apps/plugin-geolocation`) for macOS location permission + coordinates.

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

## Location logic

| File | Role |
|------|------|
| `src/lib/weatherLocation.ts` | Atlanta default, resolve saved vs default, `activateMyLocation()` |
| `src/lib/locationStorage.ts` | `localStorage` persistence (`orbit.weather-location`) for user lat/lon |
| `src/lib/userLocation.ts` | Browser Geolocation API wrapper |
| `src/lib/weatherApi.ts` | Fetch forecast + location name |
| `src/lib/weatherCodes.ts` | WMO code → label + category |
| `src/lib/weatherTheme.ts` | Category → gradient background + rain/snow effects |

### Defaults

- **Fallback city:** Atlanta (`33.749°, -84.388°`) when no saved location
- **User location label:** `"Current Location"` if reverse geocode fails; otherwise `"City, State"`

### “Use my location”

1. `requestUserLocation()` → browser prompt  
2. **Granted:** save coords to `localStorage`, fetch weather, show resolved name or `"Current Location"`  
3. **Denied / error:** clear saved location, show Atlanta + small notice (e.g. *“Location access denied — showing Atlanta”*)

### macOS permission

`src-tauri/Info.plist` includes `NSLocationWhenInUseUsageDescription` (merged at build). Restart the app after changing it.

## UI

- `WeatherWidget.tsx` — loading, error, refresh every 10 minutes  
- Condition-themed background (clear day/night, cloudy, fog, rain, thunderstorm, snow)  
- Compact layout via CSS container queries when window is small/square  

## Related docs

- [runtime-windows.md](./runtime-windows.md)
- [runtime-zenquotes.md](./runtime-zenquotes.md) — filename legacy; documents DummyJSON quote mode for lyrics widget
