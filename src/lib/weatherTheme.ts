import type { WeatherCategory } from "./weatherCodes";

export type WeatherTheme = {
  category: WeatherCategory;
  background: string;
  glassBackground: string;
  glassBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  effect: "none" | "rain" | "snow";
};

const THEMES: Record<WeatherCategory, WeatherTheme> = {
  "clear-day": {
    category: "clear-day",
    background:
      "linear-gradient(165deg, #4a8fe7 0%, #6eb5f7 38%, #9ed0ff 100%)",
    glassBackground: "rgba(255, 255, 255, 0.14)",
    glassBorder: "rgba(255, 255, 255, 0.28)",
    textPrimary: "rgba(255, 255, 255, 0.98)",
    textSecondary: "rgba(255, 255, 255, 0.88)",
    textMuted: "rgba(255, 255, 255, 0.62)",
    effect: "none",
  },
  "clear-night": {
    category: "clear-night",
    background:
      "linear-gradient(165deg, #0b1224 0%, #152238 45%, #1e2f4a 100%)",
    glassBackground: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.14)",
    textPrimary: "rgba(245, 248, 255, 0.98)",
    textSecondary: "rgba(230, 236, 248, 0.86)",
    textMuted: "rgba(210, 220, 240, 0.55)",
    effect: "none",
  },
  cloudy: {
    category: "cloudy",
    background:
      "linear-gradient(165deg, #5a6472 0%, #7a8796 42%, #9aa8b8 100%)",
    glassBackground: "rgba(255, 255, 255, 0.12)",
    glassBorder: "rgba(255, 255, 255, 0.2)",
    textPrimary: "rgba(255, 255, 255, 0.97)",
    textSecondary: "rgba(245, 247, 250, 0.88)",
    textMuted: "rgba(235, 240, 248, 0.58)",
    effect: "none",
  },
  fog: {
    category: "fog",
    background:
      "linear-gradient(165deg, #6b7078 0%, #8a9099 50%, #a8adb5 100%)",
    glassBackground: "rgba(255, 255, 255, 0.16)",
    glassBorder: "rgba(255, 255, 255, 0.22)",
    textPrimary: "rgba(255, 255, 255, 0.96)",
    textSecondary: "rgba(248, 250, 252, 0.86)",
    textMuted: "rgba(240, 244, 248, 0.58)",
    effect: "none",
  },
  rain: {
    category: "rain",
    background:
      "linear-gradient(165deg, #2a3544 0%, #3d4f63 48%, #4a6278 100%)",
    glassBackground: "rgba(255, 255, 255, 0.1)",
    glassBorder: "rgba(255, 255, 255, 0.16)",
    textPrimary: "rgba(245, 248, 255, 0.98)",
    textSecondary: "rgba(230, 238, 250, 0.88)",
    textMuted: "rgba(210, 222, 240, 0.58)",
    effect: "rain",
  },
  thunderstorm: {
    category: "thunderstorm",
    background:
      "linear-gradient(165deg, #1a1528 0%, #2d2540 42%, #3a3350 100%)",
    glassBackground: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.14)",
    textPrimary: "rgba(248, 244, 255, 0.98)",
    textSecondary: "rgba(230, 224, 248, 0.88)",
    textMuted: "rgba(200, 192, 230, 0.58)",
    effect: "rain",
  },
  snow: {
    category: "snow",
    background:
      "linear-gradient(165deg, #b8c8d8 0%, #d4e0ec 45%, #e8f0f8 100%)",
    glassBackground: "rgba(255, 255, 255, 0.35)",
    glassBorder: "rgba(255, 255, 255, 0.5)",
    textPrimary: "rgba(28, 36, 48, 0.94)",
    textSecondary: "rgba(36, 46, 58, 0.82)",
    textMuted: "rgba(48, 58, 72, 0.58)",
    effect: "snow",
  },
};

export function getWeatherTheme(category: WeatherCategory): WeatherTheme {
  return THEMES[category];
}

export function themeToCssVars(theme: WeatherTheme): Record<string, string> {
  return {
    "--weather-bg": theme.background,
    "--weather-glass-bg": theme.glassBackground,
    "--weather-glass-border": theme.glassBorder,
    "--weather-text": theme.textPrimary,
    "--weather-text-secondary": theme.textSecondary,
    "--weather-text-muted": theme.textMuted,
  };
}
