import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/welcome-shell.css";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import DailyWelcomeOverlay from "./components/DailyWelcomeOverlay";
import {
  clearWelcomeShownToday,
  markWelcomeShownToday,
  shouldShowWelcome,
} from "./lib/dailyWelcome";

/** Brief delay after startup so the overlay appears on the desktop, not during login UI. */
const SHOW_DELAY_MS = 600;
export const WELCOME_CHECK_EVENT = "daily-welcome-check";

async function presentWelcome(force = false): Promise<boolean> {
  if (!force && !shouldShowWelcome()) return false;

  const win = getCurrentWindow();
  await win.setAlwaysOnTop(true);
  await win.setFullscreen(true);
  await win.show();
  await win.setFocus();
  return true;
}

async function hideWelcomeWindow(): Promise<void> {
  const win = getCurrentWindow();
  await win.setFullscreen(false);
  await win.setAlwaysOnTop(false);
  await win.hide();
}

function WelcomeApp() {
  const [open, setOpen] = useState(false);

  const tryPresent = useCallback(async (force = false) => {
    const shown = await presentWelcome(force);
    if (shown) setOpen(true);
  }, []);

  const dismiss = useCallback(async () => {
    markWelcomeShownToday();
    setOpen(false);
    await hideWelcomeWindow();
  }, []);

  const debugShowAgain = useCallback(async () => {
    clearWelcomeShownToday();
    setOpen(true);
    await presentWelcome(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const maybePresent = () => {
      if (cancelled || document.visibilityState !== "visible") return;
      void tryPresent();
    };

    const timer = window.setTimeout(maybePresent, SHOW_DELAY_MS);

    let unlisten: (() => void) | undefined;
    void listen<void>(WELCOME_CHECK_EVENT, maybePresent).then((fn) => {
      unlisten = fn;
    });

    document.addEventListener("visibilitychange", maybePresent);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unlisten?.();
      document.removeEventListener("visibilitychange", maybePresent);
    };
  }, [tryPresent]);

  if (!open) return null;

  return (
    <DailyWelcomeOverlay
      onDismiss={() => void dismiss()}
      onDebugShowAgain={
        import.meta.env.DEV ? () => void debugShowAgain() : undefined
      }
    />
  );
}

const el = document.getElementById("root");
if (!el) {
  throw new Error("Welcome entry: missing #root");
}

createRoot(el).render(
  <StrictMode>
    <WelcomeApp />
  </StrictMode>,
);
