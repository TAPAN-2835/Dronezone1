import { definePage, useRouter } from "@/lib/router";
import { useMemo, useState } from "react";
import { createCampaign, listCampaigns, queueCampaign } from "@/lib/api/platform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Page = definePage("/admin/marketing")({
  head: () => ({ meta: [{ title: "Marketing — DroneZone Admin" }] }),
  loader: () => listCampaigns(),
  component: Marketing,
});
function Marketing() {
  const campaigns = Page.useLoaderData<Awaited<ReturnType<typeof listCampaigns>>>();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    type: "announcement",
    audience: "all",
    subject: "",
    body: "",
  });
  const [busy, setBusy] = useState(false);
  const totals = useMemo(
    () =>
      campaigns
        .flatMap((c) => c.campaign_recipients || [])
        .reduce(
          (a, r) => ({
            ...a,
            total: a.total + 1,
            [r.delivery_status]: (a as any)[r.delivery_status] + 1 || 1,
          }),
          { total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 } as any,
        ),
    [campaigns],
  );
  async function save() {
    setBusy(true);
    try {
      const c = await createCampaign(form);
      await queueCampaign(c.id);
      toast.success("Campaign queued for delivery");
      setForm({ name: "", type: "announcement", audience: "all", subject: "", body: "" });
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to create campaign");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Campaign Management</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Recipients", totals.total],
          ["Delivered", totals.delivered],
          ["Opened", totals.opened],
          ["Clicked", totals.clicked],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border bg-card p-4">
            <div className="text-xs uppercase text-muted-foreground">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="overflow-x-auto rounded-xl border bg-card lg:col-span-2">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Campaign</th>
                <th className="p-3 text-left">Audience</th>
                <th className="p-3 text-left">Recipients</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr className="border-t" key={c.id}>
                  <td className="p-3">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.subject}</div>
                  </td>
                  <td className="p-3 capitalize">{c.audience_type}</td>
                  <td className="p-3">{c.campaign_recipients?.length || 0}</td>
                  <td className="p-3 capitalize">{c.status}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!campaigns.length && (
            <div className="p-10 text-center text-sm text-muted-foreground">No campaigns yet.</div>
          )}
        </div>
        <div className="h-fit space-y-3 rounded-xl border bg-card p-4">
          <h2 className="font-semibold">Create campaign</h2>
          <Input
            placeholder="Campaign name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {["promotion", "discount", "offer", "announcement", "system"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value })}
          >
            {["all", "active", "customers", "providers"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <Input
            placeholder="Email subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <Textarea
            rows={6}
            placeholder="Message content"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <Button
            className="w-full"
            disabled={busy || !form.name || !form.subject || !form.body}
            onClick={() => void save()}
          >
            {busy ? "Queuing…" : "Create and queue"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Email recipients are queued here. Delivery/open/click states must come from the
            configured email provider webhook.
          </p>
        </div>
      </div>
    </div>
  );
}
