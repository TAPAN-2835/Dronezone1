import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({ meta: [{ title: "Profile — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">My Profile</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 lg:col-span-2">
          <div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary">AD</div><div><div className="font-display text-lg font-semibold">Admin User</div><div className="text-sm text-muted-foreground">System Administrator</div></div></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" value="Admin User" />
            <Field label="Email" value="admin@dronezone.com" />
            <Field label="Phone" value="+91 98765 43210" />
            <Field label="Designation" value="System Administrator" />
          </div>
          <button className="mt-6 h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground">Update Profile</button>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="font-display font-semibold">Security</div>
          <p className="mt-2 text-sm text-muted-foreground">Manage password and 2FA.</p>
          <button className="mt-4 h-10 w-full rounded-lg border text-sm font-semibold hover:bg-accent">Change Password</button>
        </div>
      </div>
    </div>
  ),
});

function Field({ label, value }: { label: string; value: string }) {
  return (<div><div className="text-xs font-medium text-muted-foreground">{label}</div><input defaultValue={value} className="mt-1 h-11 w-full rounded-lg border bg-background px-3 text-sm" /></div>);
}