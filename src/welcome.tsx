import { StrictMode, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/welcome-shell.css";
import { listen } from "@tauri-apps/api/event";
import { currentMonitor, getCurrentWindow } from "@tauri-apps/api/window";
import DailyWelcomeOverlay from "./components/DailyWelcomeOverlay";
import {
  clearWelcomeShownToday,
  markWelcomeShownToday,
  shouldShowWelcome,
} from "./lib/dailyWelcome";

/** Wait for the welcome webview + widgets to finish launching. */
const SHOW_DELAY_MS = 1500;
export const WELCOME_CHECK_EVENT = "daily-welcome-check";

/** Fill the current monitor (full-screen overlay without macOS Space switching). */
async function fitWelcomeFullscreen(): Promise<void> {
  const win = getCurrentWindow();
  const monitor = await currentMonitor();
  if (!monitor) {
    await win.center();
    return;
  }
  await win.setSize(monitor.size);
  await win.setPosition(monitor.position);
}

async function showWelcomeOverlay(): Promise<void> {
  const win = getCurrentWindow();
  try {
    await fitWelcomeFullscreen();
  } catch {
    await win.center();
  }
  await win.setAlwaysOnTop(true);
  await win.show();
  await win.setFocus();
}

async function hideWelcomeWindow(): Promise<void> {
  const win = getCurrentWindow();
  await win.setAlwaysOnTop(false);
  await win.hide();
}

async function ensureWidgetsVisible(): Promise<void> {
  const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
  for (const label of ["lyric", "calendar", "weather"]) {
    const widget = await WebviewWindow.getByLabel(label);
    if (widget && !(await widget.isVisible())) {
      await widget.show();
    }
  }
}

function WelcomeApp() {
  const [open, setOpen] = useState(false);
  const closedForSessionRef = useRef(false);
  const presentingRef = useRef(false);

  const tryPresent = useCallback(async (force = false) => {
    if (presentingRef.current) return;
    if (closedForSessionRef.current && !force) return;
    if (!force && !shouldShowWelcome()) return;

    presentingRef.current = true;
    setOpen(true);

    try {
      await showWelcomeOverlay();
    } catch (error) {
      console.error("[orbit welcome]", error);
      setOpen(false);
      await hideWelcomeWindow();
    } finally {
      presentingRef.current = false;
    }
  }, []);

  const dismiss = useCallback(async () => {
    closedForSessionRef.current = true;
    markWelcomeShownToday();
    setOpen(false);
    await hideWelcomeWindow();
    await ensureWidgetsVisible();
  }, []);

  const debugShowAgain = useCallback(async () => {
    closedForSessionRef.current = false;
    clearWelcomeShownToday();
    await tryPresent(true);
  }, [tryPresent]);

  useEffect(() => {
    let cancelled = false;

    const maybePresent = () => {
      if (cancelled || closedForSessionRef.current) return;
      void tryPresent();
    };

    const timer = window.setTimeout(maybePresent, SHOW_DELAY_MS);

    let unlisten: (() => void) | undefined;
    void listen<void>(WELCOME_CHECK_EVENT, maybePresent).then((fn) => {
      unlisten = fn;
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unlisten?.();
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
