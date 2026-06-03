import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Smartphone, Wrench, Shield, ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DroneZone — Drone Service Ecosystem" },
      { name: "description", content: "Customer App, Different Roles , and Admin Console — unified in one platform." },
    ],
  }),
  component: Entry,
});

function Entry() {
  const [phase, setPhase] = useState<"splash" | "select">("splash");
  useEffect(() => {
    const t = setTimeout(() => setPhase("select"), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,oklch(0.95_0.05_255)_0%,transparent_55%),radial-gradient(circle_at_80%_85%,oklch(0.93_0.06_220)_0%,transparent_55%)]" />
      <AnimatePresence mode="wait">
        {phase === "splash" ? <Splash key="s" /> : <Selector key="w" />}
      </AnimatePresence>
    </div>
  );
}

function Splash() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-5 text-center"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 140 }}
        >
          <Logo size={72} withText={false} />
        </motion.div>
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">DroneZone</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Drone Service Ecosystem</p>
        </div>
        <div className="mt-3 h-1 w-44 overflow-hidden rounded-full bg-border">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
            className="h-full w-1/2 rounded-full bg-primary"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

const workspaces = [
  {
    to: "/customer/dashboard" as const,
    title: "Customer App",
    icon: Smartphone,
    desc: "Raise requests, track repairs, manage AMC plans and invoices.",
    cta: "Enter Customer App",
    accent: "from-[oklch(0.65_0.18_220)] to-[oklch(0.55_0.22_255)]",
  },
  {
    to: "/app/dashboard" as const,
    title: "Different Roles ",
    icon: Wrench,
    desc: "Manage jobs, quotations, schedules and customer communication.",
    cta: "Enter Provider Workspace",
    accent: "from-[oklch(0.55_0.22_255)] to-[oklch(0.55_0.22_290)]",
  },
  {
    to: "/admin/dashboard" as const,
    title: "Admin Console",
    icon: Shield,
    desc: "Manage users, providers, requests, analytics and platform operations.",
    cta: "Enter Admin Console",
    accent: "from-[oklch(0.45_0.15_260)] to-[oklch(0.3_0.08_264)]",
  },
];

function Selector() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-8 sm:px-8 sm:py-12"
    >
      <header className="flex items-center justify-between">
        <Logo />
        <div className="hidden items-center gap-2 rounded-full border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Demo Mode · No login required
        </div>
      </header>

      <div className="mt-12 max-w-3xl sm:mt-20">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Welcome to DroneZone</div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
          Choose your workspace
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          A complete drone service ecosystem. Pick the experience you want to explore — every workspace is one click away.
        </p>
      </div>

      <div className="mt-10 grid flex-1 gap-5 sm:mt-14 lg:grid-cols-3">
        {workspaces.map((w, i) => {
          const Icon = w.icon;
          return (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
            >
              <Link
                to={w.to}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${w.accent}`} />
                <div className={`mb-5 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${w.accent} text-white shadow`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight">{w.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{w.desc}</p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {w.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:mt-14">
        <div>© {new Date().getFullYear()} DroneZone · Built for the modern drone services industry.</div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hover:text-foreground">Provider Sign In</Link>
          <Link to="/customer/onboarding" className="hover:text-foreground">Customer Onboarding</Link>
        </div>
      </footer>
    </motion.div>
  );
}
