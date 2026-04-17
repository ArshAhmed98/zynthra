import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, X, ChevronDown, Lock, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { NxButton } from "./NxButton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/useIsAdmin";
import { useTheme } from "@/lib/theme";
import { AuthModal } from "./AuthModal";
import { ShieldCheck } from "lucide-react";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Solutions", to: "/solutions" },
  { label: "Pricing", to: "/pricing" },
  { label: "Resources", to: "/resources" },
  { label: "Company", to: "/company" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { theme, toggleTheme } = useTheme();
  const route = useRouterState({ select: (s) => s.location.pathname });
  const isAdminPage = route.startsWith("/admin");

  if (isAdminPage) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "py-2" : "py-4",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            className={cn(
              "flex items-center justify-between rounded-2xl px-4 sm:px-6 transition-all duration-300",
              scrolled ? "h-14 glass-strong shadow-glass" : "h-16 bg-transparent",
            )}
          >
            <Logo />

            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map((item) => {
                const active = route === item.to || (item.to !== "/" && route.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "relative px-4 py-2 text-sm transition-colors",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {(item.label === "Products" || item.label === "Solutions") && (
                      <ChevronDown className="ml-1 inline h-3.5 w-3.5 opacity-60" />
                    )}
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-brand"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin">
                      <NxButton variant="ghost" size="sm">
                        <ShieldCheck className="h-3.5 w-3.5 text-cyan" /> Admin
                      </NxButton>
                    </Link>
                  )}
                  <Link to="/dashboard">
                    <NxButton variant="ghost" size="sm">Dashboard</NxButton>
                  </Link>
                  <NxButton variant="outline" size="sm" onClick={() => signOut()}>
                    Sign Out
                  </NxButton>
                </>
              ) : (
                <>
                  <NxButton variant="ghost" size="sm" onClick={() => setAuthOpen(true)}>
                    Login
                  </NxButton>
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title={theme === "dark" ? "Light mode" : "Dark mode"}
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => navigate({ to: "/admin-access" })}
                    className="p-2 text-muted-foreground/20 hover:text-muted-foreground/40 transition-opacity"
                    title="Admin"
                  >
                    <Lock className="h-3.5 w-3.5" />
                  </button>
                  <NxButton size="sm" pulseRing onClick={() => setAuthOpen(true)}>
                    Get Started Free
                  </NxButton>
                </>
              )}
            </div>

            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between p-4">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="px-6 pt-8 flex flex-col gap-2">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-2xl font-display font-bold border-b border-white/5"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8 flex flex-col gap-3">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      <NxButton className="w-full" size="lg">Dashboard</NxButton>
                    </Link>
                    <NxButton variant="outline" size="lg" className="w-full" onClick={() => { signOut(); setOpen(false); }}>
                      Sign Out
                    </NxButton>
                  </>
                ) : (
                  <>
                    <NxButton variant="ghost" size="lg" className="w-full" onClick={() => { setOpen(false); setAuthOpen(true); }}>
                      Login
                    </NxButton>
                    <NxButton size="lg" className="w-full" onClick={() => { setOpen(false); setAuthOpen(true); }}>
                      Get Started Free
                    </NxButton>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
