import { useEffect } from "react";
import { playClickSound } from "@/lib/audio";

export function ClickSound() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON" || 
          target.tagName === "A" ||
          target.closest("button") || 
          target.closest("a")) {
        playClickSound();
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}