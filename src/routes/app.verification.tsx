import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileWarning,
  ArrowRight,
  Upload,
  Mail,
  Shield,
  Phone,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { VerificationStatus } from "@/data/demo";
import { toast } from "sonner";

export const Route = createFileRoute("/app/verification")({
  head: () => ({
    meta: [
      { title: "Account Verification — DroneZone" },
      { name: "description", content: "Your DroneZone provider account verification status." },
    ],
  }),
  component: VerificationPage,
});

const statusConfig: Record<VerificationStatus, {
  icon: typeof CheckCircle2;
  title: string;
  message: string;
  color: string;
  bgColor: string;
  iconBg: string;
}> = {
  pending: {
    icon: Clock,
    title: "Verification In Progress",
    message: "Your application is being reviewed by our team. This typically takes 1-2 business days.",
    color: "text-[oklch(0.45_0.15_75)]",
    bgColor: "bg-warning/5",
    iconBg: "bg-warning/15 text-[oklch(0.45_0.15_75)]",
  },
  approved: {
    icon: CheckCircle2,
    title: "Verification Approved!",
    message: "Welcome aboard! Your account is now active. You can start receiving and managing job requests.",
    color: "text-success",
    bgColor: "bg-success/5",
    iconBg: "bg-success/15 text-success",
  },
  rejected: {
    icon: XCircle,
    title: "Verification Rejected",
    message: "Unfortunately, your application was not approved. Please review the reason below and consider reapplying.",
    color: "text-destructive",
    bgColor: "bg-destructive/5",
    iconBg: "bg-destructive/10 text-destructive",
  },
  documents_required: {
    icon: FileWarning,
    title: "Additional Documents Required",
    message: "We need a few more documents to complete your verification. Please upload the requested items below.",
    color: "text-primary",
    bgColor: "bg-primary/5",
    iconBg: "bg-primary/10 text-primary",
  },
};

function VerificationPage() {
  const [status, setStatus] = useState<VerificationStatus>("pending");
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <Logo />
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Account Verification
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg space-y-6">
          {/* Status Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`overflow-hidden ${config.bgColor}`}>
                <CardContent className="p-6 sm:p-8 text-center space-y-4">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-full ${config.iconBg}`}>
                      {status === "pending" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Icon className="h-10 w-10" />
                        </motion.div>
                      ) : (
                        <Icon className="h-10 w-10" />
                      )}
                    </div>
                  </div>

                  <h1 className={`font-display text-2xl font-bold ${config.color}`}>{config.title}</h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">{config.message}</p>

                  {/* Status-specific content */}
                  {status === "pending" && (
                    <div className="rounded-lg border bg-card p-4 space-y-2 text-left">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated Timeline</div>
                      <div className="text-sm font-medium">1-2 business days</div>
                      <div className="text-xs text-muted-foreground">You'll receive a notification once the review is complete.</div>
                    </div>
                  )}

                  {status === "approved" && (
                    <Button asChild size="lg" className="w-full">
                      <Link to="/app/dashboard">
                        Go to Dashboard <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}

                  {status === "rejected" && (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-destructive/20 bg-card p-4 text-left">
                        <div className="text-xs font-semibold uppercase tracking-wide text-destructive mb-1">Reason</div>
                        <p className="text-sm text-muted-foreground">
                          Submitted certifications could not be verified. Please ensure your DGCA certificate is valid and clearly legible.
                        </p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button variant="outline" onClick={() => toast.info("Support email: support@dronezone.com")}>
                          <Mail className="h-4 w-4" /> Contact Support
                        </Button>
                        <Button onClick={() => {
                          setStatus("pending");
                          toast.success("Application resubmitted for review");
                        }}>
                          <RefreshCw className="h-4 w-4" /> Reapply
                        </Button>
                      </div>
                    </div>
                  )}

                  {status === "documents_required" && (
                    <div className="space-y-3 text-left">
                      <div className="rounded-lg border bg-card p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Required Documents</div>
                        <ul className="space-y-2">
                          {["Valid DGCA Pilot Certificate (front & back)", "Recent Address Proof (within 3 months)"].map((doc) => (
                            <li key={doc} className="flex items-start gap-2 text-sm">
                              <FileWarning className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setStatus("pending");
                          toast.success("Documents uploaded — resubmitted for review");
                        }}
                      >
                        <Upload className="h-4 w-4" /> Upload & Resubmit
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Email notification simulation (Item 14) */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notification History
              </div>
              <div className="space-y-2">
                {status === "approved" && (
                  <NotifCard
                    icon={CheckCircle2}
                    title="Account Verified"
                    body="Your DroneZone provider account has been approved. Welcome aboard!"
                    time="Just now"
                    color="text-success"
                  />
                )}
                {status === "rejected" && (
                  <NotifCard
                    icon={XCircle}
                    title="Verification Unsuccessful"
                    body="Your application could not be approved. Please review and reapply."
                    time="Just now"
                    color="text-destructive"
                  />
                )}
                {status === "documents_required" && (
                  <NotifCard
                    icon={FileWarning}
                    title="Additional Documents Needed"
                    body="Please submit the requested documents to proceed with verification."
                    time="Just now"
                    color="text-primary"
                  />
                )}
                <NotifCard
                  icon={Mail}
                  title="Application Received"
                  body="Thank you for signing up! We'll review your application shortly."
                  time="2 hours ago"
                  color="text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Demo controls */}
          <Card className="border-dashed">
            <CardContent className="p-4 space-y-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Demo: Simulate Verification Status
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DemoBtn label="Pending" active={status === "pending"} onClick={() => setStatus("pending")} />
                <DemoBtn label="Approved" active={status === "approved"} onClick={() => setStatus("approved")} />
                <DemoBtn label="Rejected" active={status === "rejected"} onClick={() => setStatus("rejected")} />
                <DemoBtn label="Docs Required" active={status === "documents_required"} onClick={() => setStatus("documents_required")} />
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Need help? Contact us at <a href="tel:+919876543210" className="font-medium text-primary hover:underline">+91 98765 43210</a>
          </p>
        </div>
      </main>
    </div>
  );
}

function NotifCard({ icon: Icon, title, body, time, color }: { icon: typeof CheckCircle2; title: string; body: string; time: string; color: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{body}</div>
      </div>
      <div className="text-[10px] text-muted-foreground shrink-0">{time}</div>
    </div>
  );
}

function DemoBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/40"
      }`}
    >
      {label}
    </button>
  );
}
