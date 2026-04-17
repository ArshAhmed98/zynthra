import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/usage")({
  component: () => (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="font-display text-3xl font-extrabold">Usage</h1>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {["API calls", "Voice minutes", "Storage"].map((m) => (
          <div key={m} className="glass rounded-2xl p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{m}</div>
            <div className="font-display text-3xl font-extrabold mt-2 text-gradient">—</div>
          </div>
        ))}
      </div>
    </div>
  ),
});
