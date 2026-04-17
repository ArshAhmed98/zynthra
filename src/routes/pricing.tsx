import { createFileRoute } from "@tanstack/react-router";
import { Pricing } from "@/components/site/Pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — Zynthra" }, { name: "description", content: "Plans that scale from free Starter to enterprise. Transparent pricing, no vendor lock-in." }] }),
  component: () => <div className="pt-32"><Pricing /></div>,
});
