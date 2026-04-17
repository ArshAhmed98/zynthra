import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children, delay = 0, className,
}: { children: ReactNode; delay?: number; className?: string; }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  eyebrow, title, subtitle, center = true,
}: { eyebrow?: string; title: ReactNode; subtitle?: ReactNode; center?: boolean; }) {
  return (
    <Reveal>
      <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
        {eyebrow && (
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-mono text-cyan mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05]">
          {title}
        </h2>
        {subtitle && <p className="mt-4 text-base sm:text-lg text-muted-foreground">{subtitle}</p>}
      </div>
    </Reveal>
  );
}
