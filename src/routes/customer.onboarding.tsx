import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export const Route = createFileRoute("/customer/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — DroneZone" }] }),
  component: Onboarding,
});

function Onboarding() {
  return (
    <div className="min-h-screen bg-[oklch(0.97_0.012_255)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:rounded-3xl sm:border sm:shadow-2xl sm:shadow-foreground/5 sm:overflow-hidden">
        <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-8 pt-16 text-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,oklch(0.95_0.05_255)_0%,transparent_60%)]" />
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 140 }}
          >
            <Logo size={80} withText={false} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-display text-3xl font-bold tracking-tight">Welcome to DroneZone</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Reliable. Fast. Professional.
              <br />
              Drone service at your doorstep.
            </p>
          </motion.div>
        </div>
        <div className="space-y-3 p-6 pb-10">
          <Link
            to="/customer/login"
            className="flex h-12 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Login <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/customer/login"
            className="flex h-12 items-center justify-center rounded-xl border-2 border-primary text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            Create Account
          </Link>
          <Link
            to="/customer/dashboard"
            className="block pt-2 text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Skip — enter demo
          </Link>
        </div>
      </div>
    </div>
  );
}
