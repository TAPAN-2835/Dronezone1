import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({ meta: [{ title: "Settings — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">My Profile</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main profile card */}
        <div className="rounded-xl border bg-card p-5 sm:p-6 lg:col-span-2">
          {/* Avatar + name row — wraps gracefully */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary sm:h-16 sm:w-16">
              AD
            </div>
            <div className="min-w-0">
              <div className="font-display text-base font-semibold sm:text-lg">Admin User</div>
              <div className="text-sm text-muted-foreground">System Administrator</div>
            </div>
          </div>

          {/* Fields grid — 1 col on mobile, 2 on sm+ */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" value="Admin User" />
            <Field label="Email" value="admin@dronezone.com" />
            <Field label="Phone" value="+91 98765 43210" />
            <Field label="Designation" value="System Administrator" />
          </div>

          <button className="mt-6 h-11 w-full rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground sm:w-auto">
            Update Profile
          </button>
        </div>

        {/* Security sidebar */}
        <div className="rounded-xl border bg-card p-5 sm:p-6">
          <div className="font-display font-semibold">Security</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage password and two-factor authentication.
          </p>
          <button className="mt-4 h-10 w-full rounded-lg border text-sm font-semibold hover:bg-accent transition-colors">
            Change Password
          </button>
          <button className="mt-2 h-10 w-full rounded-lg border text-sm font-semibold hover:bg-accent transition-colors">
            Enable 2FA
          </button>
        </div>
      </div>
    </div>
  ),
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <input
        defaultValue={value}
        className="mt-1 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
      />
    </div>
  );
}
