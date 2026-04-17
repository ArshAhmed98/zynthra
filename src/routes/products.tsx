import { createFileRoute } from "@tanstack/react-router";
import { Products } from "@/components/site/Products";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Products — Zynthra" }, { name: "description", content: "Explore the full NexaCore product suite: AI agents, voice, communications, platform & developer tools." }] }),
  component: () => <div className="pt-32"><Products /></div>,
});
