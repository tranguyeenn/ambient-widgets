import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { fetchWeather, type WeatherSnapshot } from "../lib/weatherApi";
import {
  activateMyLocation,
  resolveWeatherLocation,
  type ResolvedWeatherLocation,
} from "../lib/weatherLocation";
import { getWeatherTheme, themeToCssVars } from "../lib/weatherTheme";
import "./WeatherWidget.css";

const REFRESH_MS = 10 * 60 * 1000;

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: WeatherSnapshot };

function formatUpdatedAt(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function WeatherWidget() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [activeLocation, setActiveLocation] = useState<ResolvedWeatherLocation>(
    () => resolveWeatherLocation(),
  );

  const loadWeather = useCallback(async (location: ResolvedWeatherLocation) => {
    try {
      const data = await fetchWeather(location);
      setActiveLocation(location);
      setState({ status: "ready", data });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load weather";
      setState({ status: "error", message });
    }
  }, []);

  useEffect(() => {
    const initial = resolveWeatherLocation();
    setActiveLocation(initial);
    void loadWeather(initial);

    const interval = setInterval(() => {
      void loadWeather(resolveWeatherLocation());
    }, REFRESH_MS);

    return () => clearInterval(interval);
  }, [loadWeather]);

  const onDragMouseDown = () => {
    void getCurrentWindow().startDragging();
  };

  const handleUseMyLocation = async () => {
    setLocating(true);
    setLocationNotice(null);

    const result = await activateMyLocation();

    if (!result.ok) {
      setLocationNotice(result.notice);
    }

    setActiveLocation(result.location);
    setState({ status: "loading" });
    await loadWeather(result.location);
    setLocating(false);
  };

  const theme =
    state.status === "ready"
      ? getWeatherTheme(state.data.category)
      : getWeatherTheme("cloudy");

  const cssVars = themeToCssVars(theme) as CSSProperties;

  const locationTitle =
    state.status === "ready"
      ? state.data.locationName
      : state.status === "error"
        ? activeLocation.fallbackLocationName
        : activeLocation.fallbackLocationName;

  return (
    <article
      className="weather-widget"
      aria-label="Weather"
      data-theme={theme.category}
      data-effect={theme.effect}
      style={cssVars}
    >
      <div className="weather-widget__backdrop" aria-hidden />
      {theme.effect === "rain" ? (
        <div
          className="weather-widget__effect weather-widget__effect--rain"
          aria-hidden
        />
      ) : null}
      {theme.effect === "snow" ? (
        <div
          className="weather-widget__effect weather-widget__effect--snow"
          aria-hidden
        />
      ) : null}

      <div className="weather-widget__glass">
        <header
          className="weather-widget__chrome"
          data-tauri-drag-region
          onMouseDown={onDragMouseDown}
        >
          <div className="weather-widget__location-row">
            <h1 className="weather-widget__location">{locationTitle}</h1>
            {state.status === "ready" ? (
              <p className="weather-widget__updated">
                Updated {formatUpdatedAt(state.data.updatedAt)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="weather-widget__locate"
            disabled={locating || state.status === "loading"}
            onClick={() => void handleUseMyLocation()}
          >
            {locating ? "Locating…" : "Use my location"}
          </button>
        </header>

        {locationNotice ? (
          <p className="weather-widget__notice" role="status">
            {locationNotice}
          </p>
        ) : null}

        <div className="weather-widget__body">
          {state.status === "loading" ? (
            <p className="weather-widget__status">Loading weather…</p>
          ) : null}

          {state.status === "error" ? (
            <div className="weather-widget__status-block">
              <p className="weather-widget__status">{state.message}</p>
              <button
                type="button"
                className="weather-widget__retry"
                onClick={() => {
                  setState({ status: "loading" });
                  void loadWeather(resolveWeatherLocation());
                }}
              >
                Try again
              </button>
            </div>
          ) : null}

          {state.status === "ready" ? (
            <>
              <p
                className="weather-widget__temp"
                aria-label="Current temperature"
              >
                {state.data.temperature}°
              </p>
              <p className="weather-widget__condition">{state.data.condition}</p>
              <p className="weather-widget__range">
                H {state.data.high}° · L {state.data.low}°
              </p>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
