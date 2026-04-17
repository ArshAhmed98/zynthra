import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/billing")({
  component: () => (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="font-display text-3xl font-extrabold">Billing</h1>
      <div className="mt-8 glass rounded-2xl p-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Current plan</div>
        <div className="font-display text-2xl font-extrabold mt-1">Starter — Free</div>
        <p className="text-sm text-muted-foreground mt-2">Upgrade to Growth for 100k API calls/month.</p>
      </div>
    </div>
  ),
});
