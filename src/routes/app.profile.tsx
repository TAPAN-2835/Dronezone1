import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Building2, CreditCard, MapPin, Award, Star, Edit, Phone, Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { provider } from "@/data/demo";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — DroneZone" }] }),
  component: Profile,
});

function Profile() {
  return (
    <>
      <PageHeader
        title="Profile"
        description="Your service provider identity, certifications, and payouts."
        actions={
          <Button variant="outline"><Edit className="h-4 w-4" /> Edit profile</Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="h-28 bg-[linear-gradient(120deg,oklch(0.55_0.21_263),oklch(0.65_0.18_220))]" />
        <CardContent className="-mt-12 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar className="h-24 w-24 ring-4 ring-card">
              <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">RS</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold">{provider.name}</h2>
                {provider.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{provider.business.name} · Member since {provider.joinedAt}</div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {provider.email}</span>
                <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {provider.phone}</span>
              </div>
            </div>
            <div className="flex gap-6 sm:gap-8">
              <Stat label="Jobs done" value={String(provider.totalJobs)} />
              <Stat label="Rating" value={<><Star className="inline h-4 w-4 fill-warning text-warning" /> {provider.rating}</>} />
              <Stat label="On-time" value="98%" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Section title="Business details" icon={Building2}>
          <Row label="Business name" value={provider.business.name} />
          <Row label="GSTIN" value={provider.business.gst} />
          <Row label="Address" value={provider.business.address} />
        </Section>

        <Section title="Bank details" icon={CreditCard}>
          <Row label="Bank" value={provider.bank.name} />
          <Row label="Account" value={provider.bank.account} />
          <Row label="IFSC" value={provider.bank.ifsc} />
        </Section>

        <Section title="Service areas" icon={MapPin}>
          <div className="flex flex-wrap gap-1.5">
            {provider.serviceAreas.map((a) => (
              <span key={a} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {a}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Certifications" icon={Award}>
          <ul className="space-y-2">
            {provider.certifications.map((c) => (
              <li key={c} className="flex items-center gap-2 text-sm">
                <BadgeCheck className="h-4 w-4 text-success" /> {c}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="font-display text-xl font-bold">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Building2; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
      <Separator className="mt-3 last:hidden" />
    </div>
  );
}
