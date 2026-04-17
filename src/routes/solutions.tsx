import { createFileRoute } from "@tanstack/react-router";
import { Solutions } from "@/components/site/Solutions";

export const Route = createFileRoute("/solutions")({
  head: () => ({ meta: [{ title: "Solutions — Zynthra" }, { name: "description", content: "Industry-tailored AI + cloud playbooks for finance, healthcare, eCommerce, logistics, education and startups." }] }),
  component: () => <div className="pt-32"><Solutions /></div>,
});
