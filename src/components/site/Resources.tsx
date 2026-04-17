import { useState } from "react";
import { Search, FileText, BookOpen, Trophy, Video, Download, GitBranch } from "lucide-react";
import { SectionTitle, Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Blog", "Docs", "Case Studies", "Webinars"] as const;
type F = typeof FILTERS[number];

const RESOURCES: { type: F; title: string; desc: string; icon: typeof FileText }[] = [
  { type: "Blog", title: "How NexaAgent powers 10M conversations/day", desc: "A deep dive into our orchestration layer.", icon: FileText },
  { type: "Blog", title: "The economics of voice AI", desc: "Why latency under 500ms matters for customer trust.", icon: FileText },
  { type: "Blog", title: "Building sovereign AI in regulated industries", desc: "Patterns we learned the hard way.", icon: FileText },
  { type: "Docs", title: "NexaDocs — full API reference", desc: "REST, WebSockets, SDKs, MCP and more.", icon: BookOpen },
  { type: "Case Studies", title: "Helix bank cut handling time by 47%", desc: "From 4 minutes to 2:08 average.", icon: Trophy },
  { type: "Case Studies", title: "Lumen scaled support 8× without new hires", desc: "AI-first contact center transformation.", icon: Trophy },
  { type: "Case Studies", title: "Orbit logistics reclaimed 12k hours/year", desc: "Driver coordination automated end-to-end.", icon: Trophy },
  { type: "Webinars", title: "Live: Designing voice agents that don't suck", desc: "Thursday • 11am PT", icon: Video },
  { type: "Webinars", title: "Workshop: NexaFlow in 60 minutes", desc: "On-demand replay available.", icon: Video },
];

const EXTRA = [
  { title: "Whitepapers", desc: "Research-grade reports", icon: Download },
  { title: "Changelog", desc: "Latest product updates", icon: GitBranch },
];

export function Resources() {
  const [filter, setFilter] = useState<F>("All");
  const [q, setQ] = useState("");

  const visible = RESOURCES.filter(
    (r) => (filter === "All" || r.type === filter) &&
           (q === "" || r.title.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          eyebrow="Resources"
          title={<>Learn, <span className="text-gradient">Build</span>, Grow</>}
          subtitle="Articles, docs, customer stories, and live sessions to accelerate your team."
        />

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search resources..."
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm outline-none focus:border-cyan/50"
              />
            </div>
            <div className="flex gap-1.5 p-1 glass rounded-xl overflow-x-auto">
              {FILTERS.map((f) => (
                <button key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 h-9 rounded-lg text-xs whitespace-nowrap transition-colors",
                    filter === f ? "bg-gradient-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >{f}</button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((r) => (
            <TiltCard key={r.title}>
              <div className="aspect-[16/9] rounded-xl bg-gradient-soft mb-4 grid place-items-center">
                <r.icon className="h-8 w-8 text-cyan" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan">{r.type}</span>
              <h3 className="mt-2 font-display font-bold text-base leading-snug">{r.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
            </TiltCard>
          ))}
          {EXTRA.map((r) => (
            <TiltCard key={r.title} accent="violet">
              <div className="aspect-[16/9] rounded-xl bg-gradient-soft mb-4 grid place-items-center">
                <r.icon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-display font-bold text-base">{r.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
