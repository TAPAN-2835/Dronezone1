import { createFileRoute } from "@tanstack/react-router";
import { Bell, Lock, Globe, Smartphone, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — DroneZone" }] }),
  component: Settings,
});

function Settings() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Preferences, notifications, and account security."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section icon={Bell} title="Notifications">
          <Toggle label="New job request alerts" defaultChecked />
          <Toggle label="Payment notifications" defaultChecked />
          <Toggle label="Customer messages" defaultChecked />
          <Toggle label="Weekly performance digest" />
          <Toggle label="Marketing emails" />
        </Section>

        <Section icon={Lock} title="Security">
          <Row label="Change password" cta="Update" />
          <Row label="Two-factor authentication" cta="Enable" />
          <Row label="Active sessions" cta="Manage" />
        </Section>

        <Section icon={Globe} title="Preferences">
          <Row label="Language" value="English (India)" cta="Change" />
          <Row label="Time zone" value="Asia/Kolkata" cta="Change" />
          <Row label="Currency" value="INR (₹)" cta="Change" />
        </Section>

        <Section icon={Smartphone} title="Mobile app">
          <Toggle label="Background location for ETA" defaultChecked />
          <Toggle label="Auto-accept verified customers" />
          <Toggle label="Show me as available outside hours" />
        </Section>

        <Section icon={HelpCircle} title="Support">
          <Row label="Help center" cta="Open" />
          <Row label="Contact support" cta="Email us" />
          <Row label="Report an issue" cta="Report" />
        </Section>
      </div>
    </>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Bell;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y">{children}</CardContent>
    </Card>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <span className="text-sm">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function Row({ label, value, cta }: { label: string; value?: string; cta: string }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {value && <div className="text-xs text-muted-foreground">{value}</div>}
      </div>
      <Button variant="ghost" size="sm" className="text-primary">
        {cta}
      </Button>
    </div>
  );
}
