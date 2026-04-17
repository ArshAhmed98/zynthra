import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Bot, CheckCircle2 } from "lucide-react";
import { SectionTitle, Reveal } from "./Reveal";
import { NxButton } from "./NxButton";

const SCRIPT = [
  "Hi Zynthra, our customer support team is overwhelmed.",
  "Can you build an AI agent that handles refund requests?",
];
const STEPS = [
  "Spawning NexaAgent instance...",
  "Loading refund policy from NexaVault...",
  "Routing through NexaBridge omnichannel...",
  "Connecting NexaVoice for phone fallback...",
  "Deploying to production ✓",
];

export function AiShowcase() {
  const [typed, setTyped] = useState("");
  const [stepIdx, setStepIdx] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const full = SCRIPT.join("\n");
    let i = 0;
    let timer: ReturnType<typeof setInterval>;
    const reset = () => {
      setTyped("");
      setStepIdx(0);
      i = 0;
      timer = setInterval(() => {
        i++;
        if (i <= full.length) setTyped(full.slice(0, i));
        else {
          clearInterval(timer);
          let s = 0;
          const stepTimer = setInterval(() => {
            s++;
            setStepIdx(s);
            if (s >= STEPS.length) clearInterval(stepTimer);
          }, 600);
        }
      }, 35);
    };
    reset();
    const loop = setInterval(() => setTick((t) => t + 1), 11000);
    return () => { clearInterval(timer); clearInterval(loop); };
  }, [tick]);

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          eyebrow="Live demo"
          title={<>Watch Zynthra <span className="text-gradient">Think</span></>}
          subtitle="From input to outcome in milliseconds."
        />

        <Reveal delay={0.1}>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="glass-strong rounded-2xl p-5 font-mono text-sm border border-white/10 min-h-[340px]">
              <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-white/10">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-cyan/70" />
                <span className="ml-3 text-xs text-muted-foreground">terminal · user query</span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                <span className="text-cyan">$ </span>{typed}
                <span className="inline-block w-2 h-4 -mb-0.5 bg-cyan animate-blink" />
              </pre>
            </div>

            <div className="glass-strong rounded-2xl p-5 border border-white/10 min-h-[340px]">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <Sparkles className="h-4 w-4 text-cyan" />
                <span className="text-xs text-muted-foreground">Zynthra orchestrator</span>
              </div>
              <ul className="space-y-3">
                {STEPS.map((s, i) => (
                  <motion.li
                    key={`${tick}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={i < stepIdx ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className={`mt-0.5 h-5 w-5 rounded grid place-items-center ${i < stepIdx ? "bg-cyan/20 text-cyan" : "bg-white/5 text-muted-foreground"}`}>
                      {i < stepIdx - 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Bot className="h-3 w-3" />}
                    </span>
                    <span className={i < stepIdx ? "text-foreground" : "text-muted-foreground"}>{s}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex justify-center">
            <NxButton variant="ghost" size="lg">See full demo <ArrowRight className="h-4 w-4" /></NxButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
