import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";

const LOGOS = ["Northwind", "Acme", "Helix", "Lumen", "Kestrel", "Orbit", "Vega", "Ironwood", "Stellar", "Quantum", "Apex", "Nimbus"];

export function SocialProof() {
  return (
    <section className="relative py-20 border-y border-white/5 bg-background/50">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-center text-sm font-mono text-muted-foreground tracking-wider uppercase">
            Trusted by 2,000+ enterprises across 30+ countries
          </p>
        </Reveal>

        <div className="mt-10 space-y-4 overflow-hidden">
          <div className="flex gap-6 animate-marquee" style={{ width: "max-content" }}>
            {[...LOGOS, ...LOGOS].map((name, i) => <LogoCard key={`a-${i}`} name={name} />)}
          </div>
          <div className="flex gap-6 animate-marquee-reverse" style={{ width: "max-content" }}>
            {[...LOGOS.slice().reverse(), ...LOGOS.slice().reverse()].map((name, i) => <LogoCard key={`b-${i}`} name={name} />)}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 10, suffix: "B+", label: "API calls / month" },
            { value: 500, suffix: "ms", label: "Avg response time" },
            { value: 40, suffix: "+", label: "Integrations" },
            { value: 24, suffix: "/7", label: "AI support" },
          ].map((s) => (
            <Reveal key={s.label}>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-gradient">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LogoCard({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl glass px-6 py-3 min-w-fit">
      <div className="h-6 w-6 rounded bg-gradient-brand opacity-70" />
      <span className="font-display font-bold text-foreground/80">{name}</span>
    </div>
  );
}
