import { useState, useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Smartphone, Wrench, Shield, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't show switcher on landing page
  if (pathname === "/") return null;

  const roles = [
    {
      name: "Customer App",
      to: "/customer/dashboard",
      icon: Smartphone,
      color: "text-blue-600 bg-blue-50",
      active: pathname.startsWith("/customer"),
    },
    {
      name: "Provider Portal",
      to: "/app/dashboard",
      icon: Wrench,
      color: "text-amber-600 bg-amber-50",
      active: pathname.startsWith("/app"),
    },
    {
      name: "Admin Portal",
      to: "/admin/dashboard",
      icon: Shield,
      color: "text-indigo-600 bg-indigo-50",
      active: pathname.startsWith("/admin"),
    },
  ];

  return (
    <div ref={containerRef} className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6">
      <div className="relative">
        {open && (
          <div className="absolute bottom-14 right-0 mb-2 w-48 rounded-xl border bg-card p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 mb-1">
              Switch Workspace
            </div>
            <div className="space-y-0.5">
              {roles.map((r) => {
                const Icon = r.icon;
                return (
                  <Link
                    key={r.to}
                    to={r.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-xs font-medium transition-colors text-left",
                      r.active
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-md shrink-0",
                        r.active ? "bg-white/20 text-white" : r.color,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="flex-1 truncate">{r.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform active:scale-95 border border-primary/20"
          aria-label="Switch portal role"
        >
          <ArrowLeftRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
