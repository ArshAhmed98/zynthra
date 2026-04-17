import { useState } from "react";
import { motion } from "framer-motion";
import { Play, ChevronDown, ShieldCheck, Globe2, Zap, BadgeCheck, X } from "lucide-react";
import { NeuralMesh } from "./NeuralMesh";
import { NxButton } from "./NxButton";
import { AuthModal } from "./AuthModal";

const LINE_2_WORD = "Everything.".split("");
const TRUST = [
  { icon: ShieldCheck, label: "SOC 2 Certified" },
  { icon: BadgeCheck, label: "GDPR Ready" },
  { icon: Zap, label: "99.99% Uptime" },
  { icon: Globe2, label: "ISO 27001" },
];

export function Hero() {
  const [demo, setDemo] = useState(false);
  const [auth, setAuth] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 -z-0">
        <NeuralMesh />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[var(--brand-cyan)] opacity-20 blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[var(--brand-coral)] opacity-25 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-mono"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
          New: NexaAgent v3 with GPT-5.2 reasoning →
        </motion.div>

        <h1 className="mt-8 font-display font-extrabold leading-[0.92] tracking-[-0.04em] text-[clamp(3rem,10vw,8rem)]">
          <Stagger text="The Intelligence" />
          <br />
          <span className="text-foreground/90"><Stagger text="Layer for " delay={2.0} /></span>
          <span className="text-gradient inline-flex italic">
            {LINE_2_WORD.map((c: string, i: number) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4 + i * 0.05, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {c === " " ? "\u00A0" : c}
              </motion.span>
            ))}
          </span>
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.95 }}
            className="inline-block w-[0.06em] h-[0.8em] ml-2 align-baseline bg-cyan animate-blink"
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.8, duration: 0.6 }}
          className="mt-8 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground"
        >
          Zynthra unifies AI agents, voice intelligence, cloud communication, and automation into one sovereign platform — built for enterprises that refuse to compromise.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.0, duration: 0.6 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <NxButton size="lg" pulseRing onClick={() => setAuth(true)}>
            Start Building Free →
          </NxButton>
          <NxButton size="lg" variant="ghost" onClick={() => setDemo(true)}>
            <Play className="h-4 w-4" /> Watch Demo
          </NxButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.3, duration: 0.6 }}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          {TRUST.map((t) => (
            <div key={t.label} className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
              <t.icon className="h-3.5 w-3.5 text-cyan" /> {t.label}
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground text-xs"
      >
        Scroll
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>

      {demo && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-6 bg-background/85 backdrop-blur-md" onClick={() => setDemo(false)}>
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl aspect-video glass-strong rounded-2xl overflow-hidden">
            <button onClick={() => setDemo(false)} className="absolute right-3 top-3 z-10 p-2 rounded-lg bg-black/40 hover:bg-black/60" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <div className="h-full w-full grid place-items-center text-muted-foreground bg-gradient-to-br from-cyan/10 via-accent/10 to-destructive/10">
              <div className="text-center">
                <Play className="h-10 w-10 mx-auto mb-3 text-cyan" />
                <p className="font-display text-xl">Demo video coming soon</p>
                <p className="text-xs mt-1">A guided walkthrough of Zynthra's platform.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal open={auth} onClose={() => setAuth(false)} />
    </section>
  );
}

function Stagger({ text, delay = 1.6 }: { text: string; delay?: number; }) {
  return (
    <span className="inline-flex">
      {text.split("").map((c, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.035, duration: 0.5 }}
        >
          {c === " " ? "\u00A0" : c}
        </motion.span>
      ))}
    </span>
  );
}
