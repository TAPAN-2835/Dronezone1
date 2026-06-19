import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  Award,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/app/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — DroneZone Provider" },
      { name: "description", content: "Create your DroneZone service provider account." },
    ],
  }),
  component: SignUpPage,
});

const steps = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Address & Business", icon: Building2 },
  { id: 3, label: "Certifications", icon: Award },
  { id: 4, label: "Equipment & Tools", icon: Shield },
  { id: 5, label: "Review & Submit", icon: FileCheck },
];

function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [show, setShow] = useState(false);

  /* Step 1 */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  /* Step 2 */
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");

  /* Step 3 */
  const [certs, setCerts] = useState<string[]>([]);
  const [idProof, setIdProof] = useState("");
  const [dgca, setDgca] = useState("");
  const [businessDoc, setBusinessDoc] = useState("");

  /* Step 4 */
  const [equipment, setEquipment] = useState<{name: string, image: string}[]>([]);
  const [newEquipName, setNewEquipName] = useState("");
  const [newEquipImage, setNewEquipImage] = useState("");

  const certOptions = [
    "DGCA Certified Pilot",
    "DJI Authorized Technician",
    "ISO 9001 Trained",
    "FAA Part 107",
    "EASA Certification",
  ];

  const canNext = () => {
    if (step === 1) return fullName && email && phone && password.length >= 6;
    if (step === 2) return address && city && state && pincode;
    if (step === 3) return certs.length > 0;
    return true;
  };

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
            Join India's leading drone service network.
          </h2>
          <p className="text-white/70">
            Get verified, start receiving job requests, and grow your drone repair business with
            DroneZone.
          </p>
          {/* Progress steps */}
          <div className="space-y-3">
            {steps.map((s) => {
              const Icon = s.icon;
              const done = step > s.id;
              const current = step === s.id;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 ${current ? "text-white" : done ? "text-white/70" : "text-white/30"}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      done
                        ? "border-[oklch(0.85_0.15_152)] bg-[oklch(0.85_0.15_152)] text-[oklch(0.22_0.05_264)]"
                        : current
                          ? "border-white bg-white/10"
                          : "border-white/20"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                  </div>
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-white/60">
          <Shield className="h-4 w-4" />
          Your data is encrypted and securely stored.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          {/* Mobile progress bar */}
          <div className="mb-6 lg:hidden">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Step {step} of 5</span>
              <span>{steps[step - 1].label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {step === 1 && "Create your account"}
            {step === 2 && "Address & Business"}
            {step === 3 && "Certifications & Documents"}
            {step === 4 && "Equipment & Tools"}
            {step === 5 && "Review & Submit"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {step === 1 && "Enter your personal details to get started."}
            {step === 2 && "Tell us where you operate."}
            {step === 3 && "Upload your credentials for verification."}
            {step === 4 && "List your drone equipment and tools."}
            {step === 5 && "Verify your information before submitting."}
          </p>

          <div className="mt-6 space-y-4">
            {step === 1 && (
              <>
                <FormField icon={User} label="Full Name" required>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="h-11 pl-9"
                    required
                  />
                </FormField>
                <FormField icon={Mail} label="Email" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@email.com"
                    className="h-11 pl-9"
                    required
                  />
                </FormField>
                <FormField icon={Phone} label="Phone" required>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-11 pl-9"
                    required
                  />
                </FormField>
                <div className="space-y-1.5">
                  <Label>
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="h-11 pl-9 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-accent"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <FormField icon={Building2} label="Address" required>
                  <Textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="12, MG Road, Block A"
                    rows={2}
                    className="pl-9"
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bengaluru"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Karnataka"
                      className="h-11"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Pincode <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560001"
                    className="h-11"
                    required
                  />
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                    Optional Business Details
                  </div>
                  <div className="space-y-3">
                    <FormField icon={Building2} label="Business Name">
                      <Input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="SkyFix Drone Services"
                        className="h-11 pl-9"
                      />
                    </FormField>
                    <div className="space-y-1.5">
                      <Label>GSTIN</Label>
                      <Input
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="29AAACS1234A1Z5"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>
                    Certifications <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid gap-2">
                    {certOptions.map((c) => (
                      <label
                        key={c}
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition ${
                          certs.includes(c) ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${
                            certs.includes(c) ? "border-primary bg-primary" : "border-border"
                          }`}
                        >
                          {certs.includes(c) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="text-sm font-medium">{c}</span>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={certs.includes(c)}
                          onChange={(e) => {
                            if (e.target.checked) setCerts([...certs, c]);
                            else setCerts(certs.filter((x) => x !== c));
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                    Verification Documents
                  </div>
                  <div className="space-y-3">
                    <UploadField label="DGCA Certificate" value={dgca} onChange={setDgca} />
                    <UploadField
                      label="ID Proof (Aadhaar / PAN)"
                      value={idProof}
                      onChange={setIdProof}
                    />
                    <UploadField
                      label="Business Registration (optional)"
                      value={businessDoc}
                      onChange={setBusinessDoc}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <div className="space-y-4">
                {equipment.map((eq, i) => (
                  <div key={i} className="flex justify-between items-center bg-muted/30 p-2 rounded border">
                    <span className="font-medium text-sm">{eq.name}</span>
                    <span className="text-xs text-success">{eq.image ? "Image attached" : ""}</span>
                  </div>
                ))}
                <div className="flex gap-2 items-center">
                  <Input 
                    placeholder="Equipment Name (e.g. DJI Mavic 3)" 
                    value={newEquipName} 
                    onChange={e => setNewEquipName(e.target.value)} 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="shrink-0"
                    onClick={() => {
                      setNewEquipImage("simulated-upload.jpg");
                      toast.success("Simulated equipment image upload");
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" /> Photo
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (newEquipName) {
                        setEquipment([...equipment, { name: newEquipName, image: newEquipImage || "placeholder.jpg" }]);
                        setNewEquipName("");
                        setNewEquipImage("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <ReviewSection title="Personal Information">
                  <ReviewRow label="Full Name" value={fullName} />
                  <ReviewRow label="Email" value={email} />
                  <ReviewRow label="Phone" value={phone} />
                </ReviewSection>
                <ReviewSection title="Address">
                  <ReviewRow label="Address" value={address} />
                  <ReviewRow label="City / State" value={`${city}, ${state} ${pincode}`} />
                  {businessName && <ReviewRow label="Business" value={businessName} />}
                  {gstin && <ReviewRow label="GSTIN" value={gstin} />}
                </ReviewSection>
                <ReviewSection title="Certifications">
                  <div className="flex flex-wrap gap-1.5">
                    {certs.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </ReviewSection>
                <ReviewSection title="Documents">
                  <ReviewRow label="DGCA Certificate" value={dgca || "Not uploaded"} />
                  <ReviewRow label="ID Proof" value={idProof || "Not uploaded"} />
                  <ReviewRow label="Business Doc" value={businessDoc || "Not uploaded"} />
                </ReviewSection>
                <ReviewSection title="Equipment">
                  <ReviewRow label="Total Items" value={equipment.length.toString()} />
                </ReviewSection>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} className="flex-1" disabled={!canNext()}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  toast.success("Application submitted! Redirecting to verification…");
                  setTimeout(() => navigate({ to: "/app/verification" }), 800);
                }}
                className="flex-1 bg-success hover:bg-success/90"
              >
                <Check className="h-4 w-4" /> Submit Application
              </Button>
            )}
          </div>

          {step === 1 && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-primary hover:underline">
                Login
              </a>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function FormField({
  icon: Icon,
  label,
  required,
  children,
}: {
  icon: typeof User;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}

function UploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <button
        type="button"
        onClick={() => {
          onChange(label + "_uploaded.pdf");
          toast.success(`${label} uploaded (demo)`);
        }}
        className={`flex w-full items-center gap-3 rounded-lg border-2 border-dashed p-3 text-left transition hover:border-primary/40 ${
          value ? "border-success/40 bg-success/5" : "border-border"
        }`}
      >
        {value ? (
          <>
            <Check className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">{value}</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Click to upload</span>
          </>
        )}
      </button>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
