import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Mic, MessageSquare, Brain, Headphones, Languages,
  Phone, Network, Radio, MessageCircle, Video, Workflow,
  Layers, Wand2, Cpu, Server, Lock, GitBranch,
  Code2, Smartphone, BoxSelect, FileText, Rss, FlaskConical,
  ArrowRight,
} from "lucide-react";
import { TiltCard } from "./TiltCard";
import { SectionTitle, Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

type Product = { name: string; desc: string; icon: typeof Bot };
const TABS: { id: string; label: string; products: Product[] }[] = [
  { id: "ai", label: "AI Intelligence", products: [
    { name: "NexaAgent", desc: "Autonomous AI agents for enterprise workflows", icon: Bot },
    { name: "NexaVoice", desc: "GenAI-powered voice bot with real-time speech", icon: Mic },
    { name: "NexaChat", desc: "Intelligent chat agents with context memory", icon: MessageSquare },
    { name: "NexaMind", desc: "Conversation intelligence & quality analysis", icon: Brain },
    { name: "NexaAssist", desc: "Real-time agent guidance & coaching", icon: Headphones },
    { name: "NexaLingo", desc: "Multilingual AI translation engine", icon: Languages },
  ]},
  { id: "comms", label: "Communications", products: [
    { name: "NexaCall", desc: "Cloud telephony & smart IVR", icon: Phone },
    { name: "NexaTrunk", desc: "Dynamic SIP trunking at scale", icon: Network },
    { name: "NexaStream", desc: "Voice streaming for bots & agents", icon: Radio },
    { name: "NexaSMS", desc: "Business messaging: SMS, WhatsApp, RCS", icon: MessageCircle },
    { name: "NexaWebRTC", desc: "In-app voice/video calling APIs", icon: Video },
    { name: "NexaBridge", desc: "Omnichannel routing engine", icon: Workflow },
  ]},
  { id: "platform", label: "Platform & Infra", products: [
    { name: "Zynthra Platform", desc: "Unified AI + human harmony layer", icon: Layers },
    { name: "NexaStudio", desc: "No-code agent & bot builder", icon: Wand2 },
    { name: "NexaOps", desc: "LLM orchestration & deployment", icon: Cpu },
    { name: "NexaEdge", desc: "On-device / edge AI inference", icon: Server },
    { name: "NexaVault", desc: "Encrypted data store & compliance vault", icon: Lock },
    { name: "NexaFlow", desc: "Visual workflow automation builder", icon: GitBranch },
  ]},
  { id: "dev", label: "Developer Tools", products: [
    { name: "NexaAPI", desc: "REST + WebSocket APIs", icon: Code2 },
    { name: "NexaSDK", desc: "Mobile & web SDKs (iOS, Android, JS)", icon: Smartphone },
    { name: "NexaMCP", desc: "Model context protocol server", icon: BoxSelect },
    { name: "NexaDocs", desc: "Interactive API documentation", icon: FileText },
    { name: "NexaWebhooks", desc: "Real-time event streaming", icon: Rss },
    { name: "NexaSandbox", desc: "Live testing environment", icon: FlaskConical },
  ]},
];

const ACCENTS = ["cyan", "violet", "coral", "cyan"] as const;

export function Products() {
  const [active, setActive] = useState("ai");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          eyebrow="Products"
          title={<>One Platform.<br /><span className="text-gradient">Infinite Possibility.</span></>}
          subtitle="Every tool you need to build, automate, and scale — under one roof."
        />

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap justify-center gap-2 p-1.5 glass rounded-2xl mx-auto w-fit">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "relative px-4 sm:px-5 h-10 rounded-xl text-xs sm:text-sm font-medium transition-colors",
                  active === t.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active === t.id && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-brand"
                    transition={{ type: "spring", damping: 22 }}
                  />
                )}
                <span className="relative">{t.label}</span>
                {/* unused i */}
                <span className="hidden">{i}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div className="relative mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {tab.products.map((p, i) => {
                const accent = ACCENTS[i % ACCENTS.length];
                return (
                  <TiltCard key={p.name} accent={accent}>
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "h-11 w-11 rounded-xl grid place-items-center",
                        accent === "violet" ? "bg-accent/15 text-accent" :
                        accent === "coral"  ? "bg-destructive/15 text-destructive" :
                                               "bg-cyan/15 text-cyan",
                      )}>
                        <p.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">v3</span>
                    </div>
                    <h3 className="mt-5 font-display font-bold text-lg">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                    <button className="mt-4 inline-flex items-center gap-1 text-xs text-cyan opacity-0 group-hover:opacity-100 transition-opacity hover:gap-2">
                      Learn more <ArrowRight className="h-3 w-3" />
                    </button>
                  </TiltCard>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
