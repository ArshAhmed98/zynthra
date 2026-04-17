import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { SectionTitle, Reveal } from "./Reveal";
import { NxButton } from "./NxButton";
import { AuthModal } from "./AuthModal";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    id: "starter", name: "Starter", monthly: 0, annual: 0, suffix: "Free",
    cta: "Get Started Free",
    features: ["1,000 API calls / month", "1 AI Agent", "Community support", "Basic analytics", "NexaSDK access"],
  },
  {
    id: "growth", name: "Growth", monthly: 99, annual: 79, suffix: "/month",
    cta: "Start Free Trial", popular: true,
    features: ["100,000 API calls / month", "10 AI Agents", "NexaVoice + NexaChat", "Priority support", "Advanced analytics", "Webhook access"],
  },
  {
    id: "enterprise", name: "Enterprise", monthly: null, annual: null, suffix: "Custom",
    cta: "Contact Sales",
    features: ["Unlimited everything", "Dedicated infrastructure", "SLA guarantee", "Custom integrations", "SSO + RBAC", "Onboarding team"],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  const [auth, setAuth] = useState(false);

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          eyebrow="Pricing"
          title={<>Plans That <span className="text-gradient">Scale With You</span></>}
          subtitle="No hidden fees. No vendor lock-in. Cancel anytime."
        />

        <Reveal delay={0.1}>
          <div className="mt-10 flex justify-center items-center gap-3">
            <span className={cn("text-sm", !annual && "text-foreground")}>Monthly</span>
            <button
              onClick={() => setAnnual((a) => !a)}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                annual ? "bg-gradient-brand" : "bg-white/10",
              )}
              aria-label="Toggle annual billing"
            >
              <motion.span
                layout transition={{ type: "spring", damping: 22 }}
                className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-background shadow", annual ? "left-[22px]" : "left-0.5")}
              />
            </button>
            <span className={cn("text-sm flex items-center gap-2", annual && "text-foreground")}>
              Annual
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan/15 text-cyan">SAVE 20%</span>
            </span>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => {
            const price = tier.monthly === null ? null : (annual ? tier.annual : tier.monthly);
            return (
              <Reveal key={tier.id} delay={i * 0.08}>
                <div className={cn(
                  "relative h-full rounded-3xl p-8 transition-all",
                  tier.popular
                    ? "border-gradient bg-card glow-cyan"
                    : "glass border border-white/10",
                )}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-primary-foreground inline-flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Most Popular
                    </div>
                  )}
                  <h3 className="font-display text-2xl font-extrabold">{tier.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    {price !== null && price !== undefined ? (
                      <>
                        <span className="font-display text-5xl font-extrabold">${price}</span>
                        <span className="text-muted-foreground">{tier.suffix}</span>
                      </>
                    ) : (
                      <span className="font-display text-4xl font-extrabold">{tier.suffix}</span>
                    )}
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-cyan mt-0.5 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <NxButton
                    size="lg"
                    variant={tier.popular ? "primary" : "ghost"}
                    className="w-full mt-8"
                    onClick={() => setAuth(true)}
                  >
                    {tier.cta}
                  </NxButton>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
      <AuthModal open={auth} onClose={() => setAuth(false)} />
    </section>
  );
}
