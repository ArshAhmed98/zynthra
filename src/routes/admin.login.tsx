import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: async () => {
    throw redirect({ to: "/admin-access" });
  },
  head: () => ({ meta: [{ title: "Admin Login — Zynthra" }, { name: "robots", content: "noindex" }] }),
  component: () => null,
});

function AdminLogin() {
  return null;
}