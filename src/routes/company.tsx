import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";

export const Route = createFileRoute("/company")({
  head: () => ({ meta: [{ title: "Company — Zynthra" }, { name: "description", content: "Meet the team building the nervous system of modern enterprise." }] }),
  component: () => (
    <div className="pt-32">
      <About />
      <Contact />
    </div>
  ),
});
