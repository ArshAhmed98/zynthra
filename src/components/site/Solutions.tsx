import { motion } from "framer-motion";
import { SectionTitle } from "./Reveal";

const INDUSTRIES = [
  { name: "Financial Services", color: "from-cyan/30 via-accent/30 to-transparent",
    cases: ["Fraud detection", "Collections automation", "KYC & compliance bots", "Wealth advisor copilots"] },
  { name: "eCommerce", color: "from-accent/30 via-destructive/30 to-transparent",
    cases: ["Cart recovery", "Support automation", "Delivery alerts", "Personalized upsell"] },
  { name: "Healthcare", color: "from-cyan/40 via-cyan/10 to-transparent",
    cases: ["Patient engagement", "Appointment bots", "HIPAA-ready voice", "Clinical summaries"] },
  { name: "Logistics", color: "from-destructive/30 via-cyan/20 to-transparent",
    cases: ["Shipment tracking", "Driver coordination", "ETA alerts", "Yard management"] },
  { name: "Education", color: "from-accent/40 via-cyan/20 to-transparent",
    cases: ["Student onboarding", "AI tutors", "Attendance systems", "Multilingual outreach"] },
  { name: "Startups", color: "from-cyan/30 via-accent/20 to-destructive/20",
    cases: ["Affordable APIs", "Fast onboarding", "Scale-as-you-grow", "Founder copilots"] },
];

export function Solutions() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          eyebrow="Solutions"
          title={<>Built for <span className="text-gradient">Your World</span></>}
          subtitle="Tailored playbooks for every industry. Drop-in fast, scale boldly."
        />

        <div className="mt-12 -mx-6 px-6 overflow-x-auto pb-6">
          <div className="flex gap-5 min-w-max">
            {INDUSTRIES.map((ind, i) => (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05 }}
                className="group relative w-[300px] sm:w-[340px] h-[420px] rounded-2xl overflow-hidden glass border border-white/10 hover:border-cyan/30 transition-colors"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${ind.color} opacity-50`} />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                <div className="relative h-full p-6 flex flex-col justify-between">
                  <div className="text-xs font-mono text-muted-foreground">/{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <h3 className="font-display text-2xl font-extrabold">{ind.name}</h3>
                    <div className="overflow-hidden mt-3">
                      <ul className="space-y-1.5 text-sm text-foreground/80 transition-transform duration-500 translate-y-3 group-hover:translate-y-0">
                        {ind.cases.map((c) => (
                          <li key={c} className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-cyan" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
