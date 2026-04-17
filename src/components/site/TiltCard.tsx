import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/** Glassmorphic card with magnetic 3D tilt on hover. */
export function TiltCard({
  children, className, accent = "cyan",
}: { children: ReactNode; className?: string; accent?: "cyan" | "violet" | "coral"; }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { damping: 18, stiffness: 200 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { damping: 18, stiffness: 200 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  const accentClass =
    accent === "violet" ? "hover:border-accent/40 hover:shadow-[0_0_24px_oklch(0.55_0.27_295/30%)]" :
    accent === "coral"  ? "hover:border-destructive/40 hover:shadow-[0_0_24px_oklch(0.68_0.24_18/30%)]" :
                          "hover:border-cyan/40 hover:shadow-[0_0_24px_oklch(0.86_0.18_215/30%)]";

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className={cn(
        "relative glass rounded-2xl p-6 transition-colors duration-300 will-change-transform",
        accentClass,
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
