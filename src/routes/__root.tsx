import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { ClickSound } from "@/components/site/ClickSound";
import { CursorTrail } from "@/components/site/CursorTrail";
import { AmbientParticles } from "@/components/site/AmbientParticles";
import { PageLoader } from "@/components/site/PageLoader";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ChatWidget } from "@/components/site/ChatWidget";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,245,255,0.15),transparent_60%)]" />
      <div className="relative max-w-md text-center">
        <h1 className="font-display text-8xl font-extrabold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-display font-bold">Lost in space</h2>
        <p className="mt-2 text-sm text-muted-foreground">This route drifted out of orbit. Let's bring you home.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-brand px-5 h-11 text-sm font-medium text-primary-foreground">
          Take me home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zynthra — The Intelligence Layer for Everything" },
      { name: "description", content: "Zynthra unifies AI agents, voice intelligence, cloud communication, and automation into one sovereign platform built for enterprises." },
      { name: "author", content: "Zynthra" },
      { name: "theme-color", content: "#050510" },
      { property: "og:title", content: "Zynthra — The Intelligence Layer for Everything" },
      { property: "og:description", content: "Sovereign AI + cloud platform for enterprise-grade automation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Zynthra" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ClickSound />
        <PageLoader />
        <AmbientParticles />
        <CursorTrail />
        <div className="relative z-10">
          <Navbar />
          <main className="relative">
            <Outlet />
          </main>
          <Footer />
        </div>
        <ChatWidget />
        <Toaster theme="dark" position="bottom-center" richColors closeButton />
      </ThemeProvider>
    </AuthProvider>
  );
}
