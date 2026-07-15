import { definePage, Link, useNavigate } from "@/lib/router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, Mail, Phone, Lock, ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { resolveUserRole } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { defaultRouteForRole } from "@/lib/api/auth";
import { useLocation } from "react-router-dom";

export const Page = definePage("/login")({
  head: () => ({
    meta: [
      { title: "Login â€” DroneZone Provider" },
      { name: "description", content: "Login to your DroneZone service provider workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"email" | "mobile">("email");
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "mobile") {
      toast.info("Mobile login is not available yet. Please use email.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error || !data.user) {
      toast.error(error?.message || "Unable to sign in");
      return;
    }
    toast.success("Welcome back");
    try {
      const role = await resolveUserRole(data.user);
      if (!role) throw new Error("Account role/profile provisioning is incomplete");
      const requested = new URLSearchParams(location.search).get("returnTo");
      const safeReturn =
        requested?.startsWith("/") && !requested.startsWith("//") ? requested : null;
      navigate({ to: safeReturn || defaultRouteForRole(role), replace: true });
    } catch (roleError) {
      toast.error(roleError instanceof Error ? roleError.message : "Unable to load account role");
      navigate({ to: "/forbidden?reason=provisioning", replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[oklch(0.22_0.05_264)] p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,oklch(0.4_0.18_263)_0%,transparent_45%),radial-gradient(circle_at_80%_90%,oklch(0.35_0.15_220)_0%,transparent_50%)]" />
        <div className="relative">
          <Logo size={36} withText={false} />
          <div className="mt-3 font-display text-2xl font-bold">DroneZone</div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">Service Provider</div>
        </div>
        <div className="relative space-y-6">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Run your drone service business â€” end to end.
          </h2>
          <p className="text-white/70">
            Manage requests, send quotations, track active jobs, and chat with customers in one
            workspace.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              "Real-time job requests across India",
              "Professional invoice-grade quotations",
              "Live workflow timeline for every repair",
              "Secure payouts and customer ratings",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-white/85">
                <CheckCircle2 className="h-4 w-4 text-[oklch(0.85_0.15_152)]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-white/60">
          <Shield className="h-4 w-4" />
          DGCA-aligned Â· ISO 27001 ready
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Login to continue managing your services.
          </p>

          <div className="mt-6 inline-flex rounded-lg border bg-card p-1 text-sm">
            <button
              onClick={() => setMode("email")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                mode === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </button>
            <button
              onClick={() => setMode("mobile")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                mode === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Phone className="h-3.5 w-3.5" /> Mobile
            </button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "email" ? (
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-9"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="phone">Mobile number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="h-11 pl-9"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) return toast.error("Enter your email first.");
                    const { error } = await supabase.auth.resetPasswordForEmail(email);
                    if (error) toast.error(error.message);
                    else toast.success("Password reset instructions sent.");
                  }}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-accent"
                  aria-label="Toggle password visibility"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox defaultChecked /> Remember me for 30 days
            </label>

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full text-sm font-semibold"
              disabled={loading}
            >
              {loading ? (
                "Signing inâ€¦"
              ) : (
                <>
                  Login <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
