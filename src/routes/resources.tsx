import { createFileRoute } from "@tanstack/react-router";
import { Resources } from "@/components/site/Resources";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resources — Zynthra" }, { name: "description", content: "Blog, documentation, case studies, webinars and whitepapers from the NexaCore team." }] }),
  component: () => <div className="pt-32"><Resources /></div>,
});
