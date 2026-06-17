import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Shield, CheckCircle2, UploadCloud } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Register — DroneZone Provider" },
      { name: "description", content: "Register as a DroneZone service provider." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { registerProvider } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [govId, setGovId] = useState("");
  const [certifications, setCertifications] = useState("");
  const [professionalDocs, setProfessionalDocs] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [serviceCategories, setServiceCategories] = useState("");
  const [experienceDetails, setExperienceDetails] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (
        !fullName ||
        !email ||
        !phone ||
        !address ||
        !govId ||
        !certifications ||
        !professionalDocs ||
        !serviceCategories ||
        !experienceDetails
      ) {
        toast.error("Please fill all mandatory fields.");
        setLoading(false);
        return;
      }

      // Format validations
      if (!email.includes("@")) {
        toast.error("Invalid email format.");
        setLoading(false);
        return;
      }

      if (phone.length < 10) {
        toast.error("Invalid phone number.");
        setLoading(false);
        return;
      }

      setTimeout(() => {
        try {
          registerProvider({
            fullName,
            email,
            phone,
            address,
            govId,
            certifications,
            professionalDocs,
            businessName,
            serviceCategories,
            experienceDetails,
          });

          // Simulated Email Notification
          toast.success("Verification Submitted", {
            description:
              "Your account has been submitted for verification. You will receive an update once our team reviews your documents.",
            duration: 6000,
          });

          navigate({ to: "/login" });
        } catch (error: any) {
          toast.error(error.message || "Registration failed");
          setLoading(false);
        }
      }, 1000);
    } catch (err) {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[oklch(0.22_0.05_264)] p-12 text-white lg:flex lg:sticky lg:top-0 lg:h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,oklch(0.4_0.18_263)_0%,transparent_45%),radial-gradient(circle_at_80%_90%,oklch(0.35_0.15_220)_0%,transparent_50%)]" />
        <div className="relative">
          <Logo size={36} withText={false} />
          <div className="mt-3 font-display text-2xl font-bold">DroneZone</div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">
            Provider Registration
          </div>
        </div>
        <div className="relative space-y-6">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Join the elite network of drone professionals.
          </h2>
          <p className="text-white/70">
            Get access to verified job requests, seamless quotation workflows, and secure payouts.
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
          DGCA-aligned · ISO 27001 ready
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl py-8"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Create an account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Register as a service provider to start getting requests.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium tracking-tight border-b pb-2">Personal Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="businessName">Business Name (Optional)</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">
                    Complete Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium tracking-tight border-b pb-2 pt-4">
                Professional Details
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="serviceCategories">
                    Service Categories (e.g. Repair, Maintenance){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="serviceCategories"
                    value={serviceCategories}
                    onChange={(e) => setServiceCategories(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="experienceDetails">
                    Experience Details <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="experienceDetails"
                    value={experienceDetails}
                    onChange={(e) => setExperienceDetails(e.target.value)}
                    required
                    placeholder="e.g., 5 years repairing DJI drones"
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium tracking-tight border-b pb-2 pt-4">
                Verification Documents
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="govId">
                    Government ID / Verification ID <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="govId"
                      value={govId}
                      onChange={(e) => setGovId(e.target.value)}
                      required
                      placeholder="Enter ID Number or Document Name"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        setGovId("Uploaded-ID.pdf");
                        toast.success("Simulated ID Upload");
                      }}
                    >
                      <UploadCloud className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="certifications">
                    Required Certifications <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="certifications"
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      required
                      placeholder="Certification docs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        setCertifications("Uploaded-Certs.pdf");
                        toast.success("Simulated Certs Upload");
                      }}
                    >
                      <UploadCloud className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="professionalDocs">
                    Professional Documents <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="professionalDocs"
                      value={professionalDocs}
                      onChange={(e) => setProfessionalDocs(e.target.value)}
                      required
                      placeholder="Business Reg, GST, etc."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        setProfessionalDocs("Uploaded-ProfDocs.zip");
                        toast.success("Simulated Docs Upload");
                      }}
                    >
                      <UploadCloud className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full text-sm font-semibold mt-6"
              disabled={loading}
            >
              {loading ? (
                "Registering…"
              ) : (
                <>
                  Create Account <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
