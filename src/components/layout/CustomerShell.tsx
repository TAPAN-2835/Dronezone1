import { Link, useRouterState } from "@/lib/router";
import { motion, AnimatePresence } from "framer-motion";
import { Home, FileText, MessageSquare, Shield, User, ArrowLeft, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import type { ReactNode } from "react";

const tabs = [
  { to: "/customer/dashboard", label: "Home", icon: Home },
  { to: "/customer/requests", label: "Requests", icon: FileText },
  { to: "/customer/chat", label: "Chat", icon: MessageSquare },
  { to: "/customer/amc", label: "AMC", icon: Shield },
  { to: "/customer/profile", label: "Profile", icon: User },
] as const;

export function CustomerShell({
  title,
  showBack = false,
  rightSlot,
  children,
}: {
  title?: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-[oklch(0.97_0.012_255)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background shadow-2xl shadow-foreground/5 sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:rounded-3xl sm:border sm:overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card/95 px-4 backdrop-blur">
          {showBack ? (
            <Link
              to="/customer/dashboard"
              className="-ml-1 grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : (
            <Logo size={28} withText={false} />
          )}
          <div className="font-display text-base font-semibold tracking-tight">
            {title ?? "DroneZone"}
          </div>
          <div className="ml-auto flex items-center gap-1">
            {rightSlot ?? (
              <Link
                to="/customer/notifications"
                className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <nav className="sticky bottom-0 z-30 border-t bg-card/95 backdrop-blur">
          <ul className="grid grid-cols-5">
            {tabs.map((t) => {
              const active = pathname === t.to || pathname.startsWith(t.to + "/");
              const Icon = t.icon;
              return (
                <li key={t.to}>
                  <Link
                    to={t.to}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="cust-tab"
                        className="absolute -top-px h-0.5 w-10 rounded-full bg-primary"
                      />
                    )}
                    <Icon className="h-5 w-5" />
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
