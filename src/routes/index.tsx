import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { SocialProof } from "@/components/site/SocialProof";
import { Products } from "@/components/site/Products";
import { AiShowcase } from "@/components/site/AiShowcase";
import { Solutions } from "@/components/site/Solutions";
import { Pricing } from "@/components/site/Pricing";
import { Resources } from "@/components/site/Resources";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <SocialProof />
      <Products />
      <AiShowcase />
      <Solutions />
      <Pricing />
      <Resources />
      <About />
      <Contact />
    </>
  );
}
