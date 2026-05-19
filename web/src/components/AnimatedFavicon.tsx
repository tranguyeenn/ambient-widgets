import { useEffect } from "react";
import { startAnimatedFavicon } from "../lib/animatedFavicon";

/** Drives the spinning ring favicon in the browser tab. */
export default function AnimatedFavicon() {
  useEffect(() => startAnimatedFavicon(), []);
  return null;
}
