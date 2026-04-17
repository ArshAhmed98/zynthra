import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

/** Renders a number that counts up when scrolled into view. */
export function CountUp({
  value, suffix = "", prefix = "", duration = 2.2,
}: { value: number; suffix?: string; prefix?: string; duration?: number; }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) {
        const n = value >= 1000 ? Math.floor(v).toLocaleString() : v.toFixed(value % 1 ? 1 : 0);
        ref.current.textContent = `${prefix}${n}${suffix}`;
      }
    });
  }, [spring, value, prefix, suffix]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      {prefix}0{suffix}
    </motion.span>
  );
}
