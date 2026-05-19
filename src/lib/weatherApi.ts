import { getConditionLabel, getWeatherCategory } from "./weatherCodes";
import type { WeatherCategory } from "./weatherCodes";
import type { ResolvedWeatherLocation } from "./weatherLocation";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type WeatherSnapshot = {
  temperature: number;
  condition: string;
  high: number;
  low: number;
  locationName: string;
  weatherCode: number;
  isDay: boolean;
  category: WeatherCategory;
  updatedAt: Date;
};

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
/** Open-Meteo has no reverse geocoding; BigDataCloud client API is free, keyless, CORS-friendly. */
const REVERSE_GEOCODE_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

type ForecastCurrent = {
  temperature_2m: number;
  weather_code: number;
  is_day: number;
};

type ForecastDaily = {
  temperature_2m_max: number[];
  temperature_2m_min: number[];
};

type ForecastResponse = {
  current?: ForecastCurrent;
  daily?: ForecastDaily;
};

type ReverseGeocodeResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
};

function isForecastResponse(value: unknown): value is ForecastResponse {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const current = record.current;
  const daily = record.daily;
  if (typeof current !== "object" || current === null) return false;
  if (typeof daily !== "object" || daily === null) return false;
  const c = current as Record<string, unknown>;
  const d = daily as Record<string, unknown>;
  return (
    typeof c.temperature_2m === "number" &&
    typeof c.weather_code === "number" &&
    typeof c.is_day === "number" &&
    Array.isArray(d.temperature_2m_max) &&
    Array.isArray(d.temperature_2m_min) &&
    typeof d.temperature_2m_max[0] === "number" &&
    typeof d.temperature_2m_min[0] === "number"
  );
}

function parseReverseGeocodeName(data: ReverseGeocodeResponse): string | null {
  const city = data.city?.trim() || data.locality?.trim();
  if (!city) return null;

  const region = data.principalSubdivision?.trim();
  return region ? `${city}, ${region}` : city;
}

async function fetchLocationName(
  coords: Coordinates,
  fallbackName: string,
): Promise<string> {
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    localityLanguage: "en",
  });

  const response = await fetch(`${REVERSE_GEOCODE_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Geocoding HTTP ${response.status}`);
  }

  const data = (await response.json()) as ReverseGeocodeResponse;
  return parseReverseGeocodeName(data) ?? fallbackName;
}

async function fetchForecast(coords: Coordinates): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: "temperature_2m,weather_code,is_day",
    daily: "temperature_2m_max,temperature_2m_min",
    temperature_unit: "fahrenheit",
    timezone: "auto",
    forecast_days: "1",
  });

  const response = await fetch(`${FORECAST_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Forecast HTTP ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!isForecastResponse(data)) {
    throw new Error("Invalid forecast response");
  }

  return data;
}

/**
 * Fetches current weather and today's high/low from Open-Meteo (no API key).
 */
export async function fetchWeather(
  location: ResolvedWeatherLocation,
): Promise<WeatherSnapshot> {
  const { coords, fallbackLocationName } = location;

  const [forecast, locationName] = await Promise.all([
    fetchForecast(coords),
    fetchLocationName(coords, fallbackLocationName).catch(
      () => fallbackLocationName,
    ),
  ]);

  const current = forecast.current!;
  const daily = forecast.daily!;
  const isDay = current.is_day === 1;
  const weatherCode = current.weather_code;

  return {
    temperature: Math.round(current.temperature_2m),
    condition: getConditionLabel(weatherCode),
    high: Math.round(daily.temperature_2m_max[0]),
    low: Math.round(daily.temperature_2m_min[0]),
    locationName,
    weatherCode,
    isDay,
    category: getWeatherCategory(weatherCode, isDay),
    updatedAt: new Date(),
  };
}
