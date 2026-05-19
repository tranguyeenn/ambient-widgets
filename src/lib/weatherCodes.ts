/** WMO weather interpretation codes (Open-Meteo). */
export type WeatherCategory =
  | "clear-day"
  | "clear-night"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "thunderstorm";

const CONDITION_LABELS: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

export function getConditionLabel(weatherCode: number): string {
  if (CONDITION_LABELS[weatherCode]) {
    return CONDITION_LABELS[weatherCode];
  }
  return "Unknown";
}

export function getWeatherCategory(
  weatherCode: number,
  isDay: boolean,
): WeatherCategory {
  if (weatherCode === 0 || weatherCode === 1) {
    return isDay ? "clear-day" : "clear-night";
  }
  if (weatherCode === 2 || weatherCode === 3) {
    return "cloudy";
  }
  if (weatherCode === 45 || weatherCode === 48) {
    return "fog";
  }
  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    return "rain";
  }
  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    (weatherCode >= 85 && weatherCode <= 86)
  ) {
    return "snow";
  }
  if (weatherCode >= 95 && weatherCode <= 99) {
    return "thunderstorm";
  }
  return isDay ? "clear-day" : "clear-night";
}
