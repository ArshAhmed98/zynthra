import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Building2, User as UserIcon, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { NxButton } from "./NxButton";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

interface Props { open: boolean; onClose: () => void; }

const PLANS = [
  { id: "starter", name: "Starter", price: "Free", desc: "Best to start tinkering" },
  { id: "growth", name: "Growth", price: "$99/mo", desc: "Most popular", highlight: true },
  { id: "enterprise", name: "Enterprise", price: "Custom", desc: "Tailored to scale" },
];

export function AuthModal({ open, onClose }: Props) {
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("Engineer");
  const [plan, setPlan] = useState("growth");

  const reset = () => {
    setStep(1); setEmail(""); setPassword(""); setName(""); setCompany("");
    setRole("Engineer"); setPlan("growth"); setMode("signup");
  };

  const handleClose = () => { onClose(); setTimeout(reset, 300); };

  const handleLogin = async () => {
    if (!email || !password) return toast.error("Email and password required");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Welcome back ✨");
    handleClose();
    nav({ to: "/dashboard" });
  };

  const handleSignupStep1 = async () => {
    if (!email || password.length < 6) return toast.error("Email + 6+ char password required");
    setStep(2);
  };

  const handleSignupFinish = async () => {
    setLoading(true);
    const { error } = await signUp(email, password, {
      display_name: name, company, role, plan,
    });
    setLoading(false);
    if (error) return toast.error(error);
    setStep(4);
    setTimeout(() => {
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 }, colors: ["#00F5FF", "#7B2FFF", "#FF3D6B"] });
    }, 200);
  };

  const goDash = () => { handleClose(); nav({ to: "/dashboard" }); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-strong rounded-3xl p-8 border border-white/10 shadow-glass overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-brand opacity-30 blur-3xl pointer-events-none" />
            <button onClick={handleClose} className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10" aria-label="Close">
              <X className="h-4 w-4" />
            </button>

            {mode === "login" ? (
              <div className="relative">
                <h2 className="font-display text-2xl font-bold">Welcome back</h2>
                <p className="text-sm text-muted-foreground mt-1">Sign in to your Zynthra workspace.</p>
                <div className="mt-6 space-y-3">
                  <Field icon={<Mail className="h-4 w-4" />} type="email" placeholder="Work email" value={email} onChange={setEmail} />
                  <Field icon={<Lock className="h-4 w-4" />} type="password" placeholder="Password" value={password} onChange={setPassword} />
                </div>
                <NxButton size="lg" className="w-full mt-6" onClick={handleLogin} disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4" />
                </NxButton>
                <p className="text-xs text-center mt-4 text-muted-foreground">
                  No account?{" "}
                  <button onClick={() => { setMode("signup"); setStep(1); }} className="text-cyan hover:underline">Get started free</button>
                </p>
              </div>
            ) : (
              <div className="relative">
                <Stepper step={step} />
                {step === 1 && (
                  <>
                    <h2 className="font-display text-2xl font-bold mt-4">Create your account</h2>
                    <p className="text-sm text-muted-foreground mt-1">Start free. No credit card required.</p>
                    <div className="mt-6 space-y-3">
                      <Field icon={<Mail className="h-4 w-4" />} type="email" placeholder="Work email" value={email} onChange={setEmail} />
                      <Field icon={<Lock className="h-4 w-4" />} type="password" placeholder="Password (6+ chars)" value={password} onChange={setPassword} />
                    </div>
                    <NxButton size="lg" className="w-full mt-6" onClick={handleSignupStep1}>
                      Continue <ArrowRight className="h-4 w-4" />
                    </NxButton>
                    <p className="text-xs text-center mt-4 text-muted-foreground">
                      Already have an account?{" "}
                      <button onClick={() => setMode("login")} className="text-cyan hover:underline">Sign in</button>
                    </p>
                  </>
                )}
                {step === 2 && (
                  <>
                    <h2 className="font-display text-2xl font-bold mt-4">Tell us about you</h2>
                    <div className="mt-6 space-y-3">
                      <Field icon={<UserIcon className="h-4 w-4" />} placeholder="Your name" value={name} onChange={setName} />
                      <Field icon={<Building2 className="h-4 w-4" />} placeholder="Company" value={company} onChange={setCompany} />
                      <select
                        value={role} onChange={(e) => setRole(e.target.value)}
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm focus:border-cyan/50 outline-none"
                      >
                        {["Engineer", "Product", "Founder/CEO", "Designer", "Operations", "Other"].map((r) => (
                          <option key={r} value={r} className="bg-background">{r}</option>
                        ))}
                      </select>
                    </div>
                    <NxButton size="lg" className="w-full mt-6" onClick={() => setStep(3)}>Continue <ArrowRight className="h-4 w-4" /></NxButton>
                  </>
                )}
                {step === 3 && (
                  <>
                    <h2 className="font-display text-2xl font-bold mt-4">Pick a plan</h2>
                    <p className="text-sm text-muted-foreground mt-1">You can change this anytime.</p>
                    <div className="mt-5 space-y-2">
                      {PLANS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPlan(p.id)}
                          className={cn(
                            "w-full text-left rounded-2xl p-4 border transition-all",
                            plan === p.id ? "border-cyan/50 bg-white/5 glow-cyan" : "border-white/10 hover:border-white/20",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-display font-bold">{p.name}</div>
                              <div className="text-xs text-muted-foreground">{p.desc}</div>
                            </div>
                            <div className="text-sm font-mono">{p.price}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <NxButton size="lg" className="w-full mt-6" onClick={handleSignupFinish} disabled={loading}>
                      {loading ? "Creating..." : "Create account"} <Sparkles className="h-4 w-4" />
                    </NxButton>
                  </>
                )}
                {step === 4 && (
                  <div className="text-center py-6">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gradient-brand grid place-items-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="font-display text-2xl font-bold">You're in! 🎉</h2>
                    <p className="text-sm text-muted-foreground mt-2">Your Zynthra workspace is ready.</p>
                    <NxButton size="lg" className="w-full mt-6" onClick={goDash}>Go to Dashboard <ArrowRight className="h-4 w-4" /></NxButton>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stepper({ step }: { step: number }) {
  const total = 4;
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i < step ? "bg-gradient-brand" : "bg-white/10")} />
      ))}
    </div>
  );
}

function Field({
  icon, type = "text", placeholder, value, onChange,
}: { icon?: React.ReactNode; type?: string; placeholder: string; value: string; onChange: (v: string) => void; }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={cn(
          "h-11 w-full rounded-xl border border-white/10 bg-white/5 text-sm outline-none focus:border-cyan/50",
          icon ? "pl-10 pr-4" : "px-4",
        )}
      />
    </div>
  );
}
