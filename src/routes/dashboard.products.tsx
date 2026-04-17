import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/products")({
  component: () => (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="font-display text-3xl font-extrabold">My Products</h1>
      <p className="text-muted-foreground mt-1">Products you've enabled on your workspace.</p>
      <div className="mt-8 glass rounded-2xl p-12 text-center text-sm text-muted-foreground">No products enabled yet. Visit the marketplace to add one.</div>
    </div>
  ),
});
