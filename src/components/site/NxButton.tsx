import { forwardRef, useRef, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { playClick } from "@/lib/sound";

type Variant = "primary" | "ghost" | "outline" | "subtle";
type Size = "sm" | "md" | "lg";

interface NxButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  pulseRing?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-brand text-primary-foreground font-semibold shadow-[0_0_24px_oklch(0.86_0.18_215/30%)] hover:shadow-[0_0_32px_oklch(0.86_0.18_215/50%)]",
  ghost:
    "glass text-foreground hover:bg-white/8 hover:border-white/15",
  outline:
    "border border-white/15 bg-transparent hover:bg-white/5",
  subtle:
    "bg-white/5 hover:bg-white/10 text-foreground",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export const NxButton = forwardRef<HTMLButtonElement, NxButtonProps>(
  ({ className, variant = "primary", size = "md", pulseRing, onClick, children, ...props }, ref) => {
    const innerRef = useRef<HTMLButtonElement | null>(null);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      playClick();
      const btn = innerRef.current;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement("span");
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
          position:absolute;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;
          width:${size}px;height:${size}px;border-radius:9999px;background:rgba(255,255,255,0.35);
          transform:scale(0);animation:ripple 600ms ease-out;pointer-events:none;
        `;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }
      onClick?.(e);
    };

    return (
      <button
        ref={(el) => {
          innerRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        }}
        onClick={handleClick}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-xl overflow-hidden",
          "transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          variants[variant],
          sizes[size],
          pulseRing && "animate-pulse-ring",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
NxButton.displayName = "NxButton";
