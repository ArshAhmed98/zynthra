import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter, Youtube, Lock } from "lucide-react";
import { Logo } from "./Logo";
import { NxButton } from "./NxButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FOOTER = [
  {
    title: "Products",
    links: ["NexaAgent", "NexaVoice", "NexaChat", "NexaCall", "NexaAPI", "NexaStudio"],
  },
  {
    title: "Solutions",
    links: ["Financial Services", "eCommerce", "Healthcare", "Logistics", "Education", "Startups"],
  },
  {
    title: "Resources",
    links: ["Blog", "Documentation", "Case Studies", "Webinars", "Whitepapers", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Partners", "Contact", "Status"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "GDPR", "DPA", "Cookies"],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("subscribers").insert({ email });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.success("You're already subscribed ✨");
      else toast.error(error.message);
      return;
    }
    setEmail("");
    toast.success("Welcome aboard 🚀");
  };

  return (
    <footer className="relative mt-20 border-t border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-brand animate-breathe" />
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Logo size="lg" />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              The intelligence layer for everything. Build, automate, and scale with sovereign AI infrastructure.
            </p>
            <form onSubmit={subscribe} className="mt-6 flex gap-2 max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm h-11 outline-none focus:border-cyan/50"
              />
              <NxButton type="submit" size="md" disabled={loading}>
                {loading ? "..." : "Subscribe"}
              </NxButton>
            </form>
            <div className="mt-6 flex gap-3">
              {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl glass hover:border-cyan/40 hover:text-cyan transition-colors"
                  aria-label="social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {FOOTER.map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-sm font-bold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
          <p>© 2025 Zynthra Technologies Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-foreground">Privacy Policy</Link>
            <Link to="/" className="hover:text-foreground">Terms</Link>
            <a href="#" className="hover:text-foreground">Status Page</a>
            <Link to="/admin-access" className="opacity-30 hover:opacity-60 transition-opacity" title="Admin">
              <Lock className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
