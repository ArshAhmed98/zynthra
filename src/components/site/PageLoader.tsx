import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PageLoader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative flex flex-col items-center gap-4">
            <div className="relative h-16 w-16">
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const r = 28;
                return (
                  <motion.span
                    key={i}
                    className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-cyan"
                    style={{ boxShadow: "0 0 10px var(--brand-cyan)" }}
                    initial={{
                      x: Math.cos(angle) * 120 - 3,
                      y: Math.sin(angle) * 120 - 3,
                      opacity: 0,
                    }}
                    animate={{
                      x: Math.cos(angle) * r - 3,
                      y: Math.sin(angle) * r - 3,
                      opacity: 1,
                    }}
                    transition={{ duration: 0.8, delay: i * 0.04, ease: "easeOut" }}
                  />
                );
              })}
              <motion.div
                className="absolute inset-0 m-auto h-6 w-6 rounded-md bg-gradient-brand"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              />
            </div>
            <motion.p
              className="font-display text-sm tracking-widest text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              NEXACORE
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
