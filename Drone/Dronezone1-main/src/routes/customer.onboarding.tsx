import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/customer/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — DroneZone" }] }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!firstName || !lastName || !email || !password || !phone) {
        toast.error("Please fill all fields.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            role: "customer",
          },
        },
      });

      if (error) throw error;

      toast.success("Account created successfully!");
      navigate({ to: "/customer/dashboard" });
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.012_255)] lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:sticky lg:top-0 lg:h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,oklch(0.6_0.15_260)_0%,transparent_45%),radial-gradient(circle_at_80%_90%,oklch(0.5_0.15_240)_0%,transparent_50%)]" />
        <div className="relative">
          <Logo size={40} withText={false} />
          <div className="mt-4 font-display text-2xl font-bold">DroneZone Customer</div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
            Create Account
          </div>
        </div>
        <div className="relative space-y-6">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Professional drone services, on demand.
          </h2>
          <ul className="space-y-4 text-sm mt-8">
            {[
              "Verified, professional drone pilots",
              "Instant service requests & quotations",
              "Secure payments and tracking",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-primary-foreground/90">
                <CheckCircle2 className="h-5 w-5 text-white/50" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-primary-foreground/60">
          Fast · Reliable · Secure
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md py-8"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Welcome to DroneZone</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to book drone services instantly.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full text-sm font-semibold mt-6 rounded-xl"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/customer/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
