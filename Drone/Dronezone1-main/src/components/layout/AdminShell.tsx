import { useState, useEffect } from "react";
import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Inbox,
  Layers,
  AlertOctagon,
  BarChart3,
  Megaphone,
  Settings,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logoJp from "@/assets/logo.jpeg";
import { useAuth } from "@/lib/auth-store";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/providers", label: "Service Providers", icon: Wrench },
  { to: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { to: "/admin/requests", label: "Requests", icon: Inbox },
  { to: "/admin/categories", label: "Services & Models", icon: Layers },
  { to: "/admin/grievances", label: "Grievances", icon: AlertOctagon },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { to: "/admin/profile", label: "Settings", icon: Settings },
] as const;

interface AdminSidebarContentProps {
  pathname: string;
  onNavigate?: () => void;
}

function AdminSidebarContent({ pathname, onNavigate }: AdminSidebarContentProps) {
  const { signOut } = useAuth();
  return (
    <div className="flex h-full flex-col bg-[oklch(0.22_0.05_264)] text-white">
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
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/65 hover:bg-white/5 hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-active"
                  className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-primary"
                />
              )}
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          onClick={async () => {
            await signOut();
            if (onNavigate) onNavigate();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/65 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Exit Console
        </button>
      </div>
    </div>
  );
}

export function AdminShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, loading, role } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate({ to: "/login", replace: true });
      } else if (role !== "admin") {
        if (role === "customer") navigate({ to: "/customer/dashboard", replace: true });
        else if (role === "provider") navigate({ to: "/app/dashboard", replace: true });
      }
    }
  }, [user, loading, role, navigate]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user || role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[oklch(0.97_0.012_255)]">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[oklch(0.22_0.05_264)] text-white lg:flex">
        <AdminSidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
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
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-4 z-50 rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <AdminSidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex w-full flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <img
              src={logoJp}
              alt="DroneZone Logo"
              className="h-7 w-7 rounded object-cover border"
            />
          </div>
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search anything…"
              className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <button
            className="relative grid h-10 w-10 place-items-center rounded-lg text-muted-foreground hover:bg-accent"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <div className="flex items-center gap-2.5 rounded-lg border bg-card px-2 py-1.5">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold leading-tight">Admin</div>
              <div className="text-[10px] text-muted-foreground">Super Admin</div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="mx-auto w-full max-w-7xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
