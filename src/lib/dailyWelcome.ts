const LEGACY_LAST_WELCOME_SHOWN_KEY = "ambient:lastWelcomeShownDate";
export const LAST_WELCOME_SHOWN_KEY = "orbit:lastWelcomeShownDate";

function migrateLegacyWelcomeKey(): void {
  try {
    const legacy = localStorage.getItem(LEGACY_LAST_WELCOME_SHOWN_KEY);
    if (legacy && !localStorage.getItem(LAST_WELCOME_SHOWN_KEY)) {
      localStorage.setItem(LAST_WELCOME_SHOWN_KEY, legacy);
    }
    if (legacy) {
      localStorage.removeItem(LEGACY_LAST_WELCOME_SHOWN_KEY);
    }
  } catch {
    /* ignore */
  }
}

export const DAILY_MESSAGES = [
  "Start with one clear task. Momentum comes after.",
  "Today does not need to be perfect. It needs to begin.",
  "Protect your attention first.",
  "Pick the next honest step.",
  "Small progress still counts.",
  "Begin before you feel ready.",
  "Your job is to focus on the next block.",
  "Less noise. More signal.",
  "Do the important thing before the easy thing.",
  "You only need one good start.",
] as const;

/** Local calendar date as YYYY-MM-DD (not UTC). */
export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hashDateKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Same message for the entire local calendar day; changes when the date changes. */
export function getDailyMessage(date = new Date()): string {
  const index = hashDateKey(getLocalDateKey(date)) % DAILY_MESSAGES.length;
  return DAILY_MESSAGES[index]!;
}

export function formatWelcomeDateLine(date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function getLastWelcomeShownDate(): string | null {
  migrateLegacyWelcomeKey();
  try {
    return localStorage.getItem(LAST_WELCOME_SHOWN_KEY);
  } catch {
    return null;
  }
}

const DEV_SESSION_KEY = "orbit:welcome-shown-session";

export function shouldShowWelcome(now = new Date()): boolean {
  const today = getLocalDateKey(now);
  if (import.meta.env.DEV) {
    try {
      return sessionStorage.getItem(DEV_SESSION_KEY) !== today;
    } catch {
      return getLastWelcomeShownDate() !== today;
    }
  }
  return getLastWelcomeShownDate() !== today;
}

export function markWelcomeShownToday(now = new Date()): void {
  const today = getLocalDateKey(now);
  try {
    localStorage.setItem(LAST_WELCOME_SHOWN_KEY, today);
    if (import.meta.env.DEV) {
      sessionStorage.setItem(DEV_SESSION_KEY, today);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearWelcomeShownToday(): void {
  try {
    localStorage.removeItem(LAST_WELCOME_SHOWN_KEY);
    sessionStorage.removeItem(DEV_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
