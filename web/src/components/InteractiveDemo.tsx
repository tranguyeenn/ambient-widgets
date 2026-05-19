import Section from "./Section";
import OrbitDesktopDemo from "./demo/OrbitDesktopDemo";

export default function InteractiveDemo() {
  return (
    <Section
      id="demo"
      label="Interactive demo"
      title="The same widgets, on a desktop canvas"
      description="Glass calendar, lyric tile, and weather window positioned like the macOS app. Try month navigation, lyric vs quote mode, the daily welcome overlay, and a distraction nudge."
    >
      <OrbitDesktopDemo />
      <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
        Preview only: the shipping app uses separate transparent Tauri windows on
        your real desktop. Toolbar controls exist here to explore behavior.
      </p>
    </Section>
  );
}
