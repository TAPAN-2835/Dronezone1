import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Home, FileText, MessageSquare, Shield, User, ArrowLeft, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { customer } from "@/data/customer";

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
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation Left Sidebar (hidden on mobile) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Logo />
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Customer Portal
          </div>
          <ul className="space-y-1">
            {tabs.map((t) => {
              const active = pathname === t.to || pathname.startsWith(t.to + "/");
              const Icon = t.icon;
              return (
                <li key={t.to}>
                  <Link
                    to={t.to}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-cust-active"
                        className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-primary"
                      />
                    )}
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{t.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-accent/50">
            <Avatar className="h-9 w-9 border border-primary/10">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{customer.name}</div>
              <div className="truncate text-xs text-muted-foreground">{customer.email}</div>
            </div>
            <Link to="/login" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Right Column Layout */}
      <div className="flex min-h-screen w-full flex-col md:pl-64">
        {/* Mobile Header (hidden on desktop) */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card/95 px-4 backdrop-blur md:hidden">
          {showBack ? (
            <Link to="/customer/dashboard" className="-ml-1 grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : (
            <Logo size={28} withText={false} />
          )}
          <div className="font-display text-base font-semibold tracking-tight">{title ?? "DroneZone"}</div>
          <div className="ml-auto flex items-center gap-1">
            {rightSlot ?? (
              <Link to="/customer/notifications" className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              </Link>
            )}
          </div>
        </header>

        {/* Desktop Header (hidden on mobile) */}
        <header className="sticky top-0 z-30 hidden h-16 items-center gap-3 border-b bg-card/95 px-8 backdrop-blur md:flex">
          {showBack && (
            <Link to="/customer/dashboard" className="-ml-2 grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent border bg-background" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div className="font-display text-lg font-bold tracking-tight text-foreground">{title ?? "DroneZone"}</div>
          <div className="ml-auto flex items-center gap-2">
            {rightSlot ?? (
              <Link to="/customer/notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-accent border bg-background" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-destructive" />
              </Link>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          <div className="mx-auto w-full max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation (hidden on desktop) */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur md:hidden">
          <ul className="grid grid-cols-5">
            {tabs.map((t) => {
              const active = pathname === t.to || pathname.startsWith(t.to + "/");
              const Icon = t.icon;
              return (
                <li key={t.to}>
                  <Link to={t.to} className={cn("relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
                    {active && <motion.span layoutId="cust-tab" className="absolute -top-px h-0.5 w-10 rounded-full bg-primary" />}
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