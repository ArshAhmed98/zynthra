import { useState } from "react";
import { Phone, Mail, MapPin, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { SectionTitle, Reveal } from "./Reveal";
import { NxButton } from "./NxButton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(40).optional(),
  subject: z.enum(["Sales", "Support", "Partnership", "Press", "General"]),
  message: z.string().trim().min(10, "Min 10 chars").max(2000),
});
type FormData = z.infer<typeof schema>;

export function Contact() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { subject: "Sales" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.from("contacts").insert(data);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent! We'll be in touch within 2 business hours.");
    reset();
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          eyebrow="Contact"
          title={<>Let's Build Something <span className="text-gradient">Extraordinary</span></>}
          subtitle="Our team responds within 2 business hours."
        />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Reveal className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full name" error={errors.name?.message}>
                  <input {...register("name")} className={input} placeholder="Jane Doe" />
                </Field>
                <Field label="Work email" error={errors.email?.message}>
                  <input {...register("email")} type="email" className={input} placeholder="jane@company.com" />
                </Field>
                <Field label="Company">
                  <input {...register("company")} className={input} placeholder="Acme Corp" />
                </Field>
                <Field label="Phone">
                  <input {...register("phone")} className={input} placeholder="+1 555 0100" />
                </Field>
              </div>
              <Field label="Subject">
                <select {...register("subject")} className={cn(input, "appearance-none")}>
                  {["Sales", "Support", "Partnership", "Press", "General"].map((s) => (
                    <option key={s} value={s} className="bg-background">{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Message" error={errors.message?.message}>
                <textarea {...register("message")} rows={5} className={cn(input, "h-auto py-3")} placeholder="Tell us what you're building..." />
              </Field>
              <NxButton type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send message →"}
              </NxButton>
            </form>
          </Reveal>

          <Reveal className="lg:col-span-2 space-y-3" delay={0.1}>
            <Info icon={Phone} label="Sales" value="+1 (800) NXA-CORE" />
            <Info icon={Mail} label="Email" value="hello@nexacore.ai" />
            <Info icon={MapPin} label="HQ" value="San Francisco, CA + Bengaluru, India" />
            <Info icon={MessageSquare} label="Live chat" value="Use NexaBot at the bottom right." />
            <div className="glass rounded-2xl p-1 overflow-hidden h-48 relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,245,255,0.15),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(123,47,255,0.15),transparent_50%)]" />
              <div className="absolute inset-0 grid place-items-center text-xs font-mono text-muted-foreground">
                map · dark theme
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const input = "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan/50 placeholder:text-muted-foreground/60";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      {children}
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </label>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5 flex items-start gap-4">
      <div className="h-10 w-10 rounded-xl bg-cyan/15 text-cyan grid place-items-center flex-shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display font-bold mt-0.5">{value}</div>
      </div>
    </div>
  );
}
