import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  FileText,
  Calendar,
  MessageSquare,
  History,
  Bell,
  User,
  Settings,
  Search,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { provider, notifications } from "@/data/demo";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/requests", label: "Job Requests", icon: Inbox },
  { to: "/app/active", label: "Active Jobs", icon: Briefcase },
  { to: "/app/quotations", label: "Quotations", icon: FileText },
  { to: "/app/schedule", label: "Schedule", icon: Calendar },
  { to: "/app/chat", label: "Chat", icon: MessageSquare },
  { to: "/app/history", label: "Service History", icon: History },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

const mobileNav = [
  { to: "/app/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/app/requests", label: "Jobs", icon: Inbox },
  { to: "/app/chat", label: "Chat", icon: MessageSquare },
  { to: "/app/schedule", label: "Plan", icon: Calendar },
  { to: "/app/profile", label: "Me", icon: User },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-primary"
                    />
                  )}
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.to === "/app/notifications" && unread > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              RS
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{provider.name}</div>
            <div className="truncate text-xs text-muted-foreground">{provider.business.name}</div>
          </div>
          <Link to="/login" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="lg:hidden">
        <Logo withText={false} />
      </div>
      <div className="relative ml-auto hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search jobs, customers, drones…"
          className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate({ to: "/app/notifications" })}
        className="relative ml-auto sm:ml-0"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </Button>
      <Avatar className="h-9 w-9 ring-2 ring-primary/10">
        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">RS</AvatarFallback>
      </Avatar>
    </header>
  );
}

function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {mobileNav.map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-sidebar lg:block">
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-sidebar lg:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <TopBar onMenu={() => setOpen(true)} />
        <main className="flex-1 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}