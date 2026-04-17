import { motion } from "framer-motion";
import { Linkedin, Lock, Zap, Globe2, Bot } from "lucide-react";
import { SectionTitle, Reveal } from "./Reveal";
import { CountUp } from "./CountUp";

const TIMELINE = [
  { year: 2020, title: "Founded in San Francisco", desc: "Two engineers, one whiteboard, one belief." },
  { year: 2021, title: "First 100 customers", desc: "NexaCall and NexaSMS go live." },
  { year: 2022, title: "Series A — $42M", desc: "Backed by leading enterprise investors." },
  { year: 2023, title: "NexaAgent launches", desc: "Autonomous AI agents enter production." },
  { year: 2024, title: "10B API calls / month", desc: "Crossed the milestone in November." },
  { year: 2025, title: "Zynthra Platform v3", desc: "Sovereign AI for the enterprise era." },
];

const TEAM = [
  { name: "Aria Vance", title: "Co-founder & CEO" },
  { name: "Kenji Mori", title: "Co-founder & CTO" },
  { name: "Priya Raman", title: "VP Engineering" },
  { name: "Diego Solano", title: "Chief Design Officer" },
];

const VALUES = [
  { icon: Lock, label: "Trust First" },
  { icon: Zap, label: "Move Fast" },
  { icon: Globe2, label: "Build Global" },
  { icon: Bot, label: "Human + AI" },
];

const COMPLIANCE = ["SOC 2", "ISO 27001", "GDPR", "HIPAA", "SSL", "VAPT"];

export function About() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          eyebrow="About us"
          title={<>We're Building the <span className="text-gradient">Nervous System</span> of Modern Enterprise</>}
        />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Zynthra was born from one belief: that intelligence should be accessible, actionable, and sovereign. We build the infrastructure that lets enterprises move at the speed of thought.
              </p>
              <p>
                Today, we power voice, chat, agents, and automation for thousands of teams across financial services, healthcare, logistics, and beyond — without ever holding their data hostage.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <Stat label="Founded" value="2020" />
                <Stat label="HQ" value="SF + BLR" />
                <Stat label="Team size" value={<><CountUp value={240} suffix="+" /></>} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ol className="relative border-l border-white/10 pl-6 space-y-6">
              {TIMELINE.map((t, i) => (
                <motion.li
                  key={t.year}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-gradient-brand glow-cyan" />
                  <div className="text-xs font-mono text-cyan">{t.year}</div>
                  <div className="font-display font-bold">{t.title}</div>
                  <div className="text-sm text-muted-foreground">{t.desc}</div>
                </motion.li>
              ))}
            </ol>
          </Reveal>
        </div>

        <div className="mt-20">
          <Reveal>
            <h3 className="font-display text-2xl font-extrabold text-center">Leadership</h3>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.05}>
                <div className="glass rounded-2xl p-6 text-center">
                  <div className="mx-auto h-20 w-20 rounded-full bg-gradient-brand mb-4 grid place-items-center font-display font-extrabold text-2xl text-primary-foreground">
                    {m.name.split(" ").map((p) => p[0]).join("")}
                  </div>
                  <div className="font-display font-bold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.title}</div>
                  <a href="#" className="mt-3 inline-flex h-8 w-8 items-center justify-center rounded-lg glass hover:text-cyan" aria-label="LinkedIn">
                    <Linkedin className="h-3.5 w-3.5" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-16 flex flex-wrap gap-3 justify-center">
            {VALUES.map((v) => (
              <div key={v.label} className="inline-flex items-center gap-2 rounded-full glass px-4 py-2">
                <v.icon className="h-4 w-4 text-cyan" /> <span className="text-sm">{v.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            {COMPLIANCE.map((c) => (
              <div key={c} className="relative overflow-hidden rounded-xl border border-white/10 px-4 py-2 text-xs font-mono">
                {c}
                <span className="animate-shimmer absolute inset-0 pointer-events-none" />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <div className="font-display text-xl font-extrabold text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
