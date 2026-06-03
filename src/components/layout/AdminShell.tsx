import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Wrench, Inbox, Layers, AlertOctagon, BarChart3, Megaphone, Settings, Search, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logoJp from "@/assets/logo.jpeg";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/providers", label: "Service Providers", icon: Wrench },
  { to: "/admin/requests", label: "Requests", icon: Inbox },
  { to: "/admin/categories", label: "Services & Models", icon: Layers },
  { to: "/admin/disputes", label: "Disputes", icon: AlertOctagon },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { to: "/admin/profile", label: "Settings", icon: Settings },
] as const;

export function AdminShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen bg-[oklch(0.97_0.012_255)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[oklch(0.22_0.05_264)] text-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <img
            src={logoJp}
            alt="DroneZone Logo"
            className="h-8 w-8 rounded-lg object-cover border border-white/10"
          />
          <div className="leading-tight">
            <div className="font-display text-sm font-bold">DroneZone</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-white/50">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
                )}
              >
                {active && <motion.span layoutId="admin-active" className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-primary" />}
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/65 hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" /> Exit Console
          </Link>
        </div>
      </aside>
      <div className="flex w-full flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search anything…" className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15" />
          </div>
          <button className="relative grid h-10 w-10 place-items-center rounded-lg text-muted-foreground hover:bg-accent" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <div className="flex items-center gap-2.5 rounded-lg border bg-card px-2 py-1.5">
            <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">AD</AvatarFallback></Avatar>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold leading-tight">Admin</div>
              <div className="text-[10px] text-muted-foreground">Super Admin</div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="mx-auto w-full max-w-7xl">
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}