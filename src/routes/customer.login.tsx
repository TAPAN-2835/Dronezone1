import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/customer/login")({
  head: () => ({ meta: [{ title: "Login — DroneZone" }] }),
  component: CustomerLogin,
});

function CustomerLogin() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  return (
    <div className="min-h-screen bg-[oklch(0.97_0.012_255)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background px-8 pt-12 sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:rounded-3xl sm:border sm:shadow-2xl sm:shadow-foreground/5">
        <Logo size={36} withText={false} />
        <div className="mt-10">
          <h1 className="font-display text-3xl font-bold tracking-tight">Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back!</p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Welcome back, John"); nav({ to: "/customer/dashboard" }); }}
          className="mt-8 space-y-4"
        >
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email / Mobile Number</label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input defaultValue="john.doe@email.com" className="h-12 w-full rounded-xl border bg-card pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15" />
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <a className="text-xs font-medium text-primary">Forgot Password?</a>
            </div>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type={show ? "text" : "password"} defaultValue="Drone@123" className="h-12 w-full rounded-xl border bg-card pl-10 pr-10 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" className="mt-2 h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Login
          </button>
        </form>
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or continue with</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex justify-center gap-4">
          {["G", "", "O"].map((l, i) => (
            <button key={i} className="grid h-12 w-12 place-items-center rounded-full border bg-card text-base font-semibold text-foreground hover:bg-accent">
              {l || ""}
            </button>
          ))}
        </div>
        <p className="mt-auto py-8 text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/customer/onboarding" className="font-semibold text-primary">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}