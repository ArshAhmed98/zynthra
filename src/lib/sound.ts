import { Howl } from "howler";

let clickSound: Howl | null = null;
let muted = false;

// A short data-URI tick (tiny synthetic click) so we don't need an asset file.
const TICK_DATA_URI =
  "data:audio/wav;base64,UklGRrQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YZAAAAAAAAAAEABwAFAAcADwAJAAEAEgAYABwAHAAaAB" +
  "QAEgAaAByAEYAWgBQAEAAQABAAFAATAAwACAAGAAUABEACgAGAAQAAQAAAAAAAAAA";

export function playClick() {
  if (muted) return;
  if (typeof window === "undefined") return;
  try {
    if (!clickSound) {
      clickSound = new Howl({ src: [TICK_DATA_URI], volume: 0.18, html5: false });
    }
    clickSound.stop();
    clickSound.play();
  } catch {
    /* no-op */
  }
}

export function setMuted(value: boolean) {
  muted = value;
}
export function isMuted() {
  return muted;
}
