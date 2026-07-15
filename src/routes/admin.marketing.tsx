import { definePage } from "@/lib/router";
import { campaigns } from "@/data/admin";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Mail, MousePointerClick } from "lucide-react";

export const Page = definePage("/admin/marketing")({
  head: () => ({ meta: [{ title: "Marketing â€” DroneZone Admin" }] }),
  component: MarketingPage,
});

function MarketingPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Campaign Management</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Analytics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Emails Sent
              </div>
              <div className="mt-1 font-display text-2xl font-bold">14,200</div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Delivery Rate
              </div>
              <div className="mt-1 font-display text-2xl font-bold text-success">98.2%</div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Open Rate</div>
              <div className="mt-1 font-display text-2xl font-bold">42.5%</div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Click Rate
              </div>
              <div className="mt-1 font-display text-2xl font-bold">12.8%</div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border bg-card sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Campaign Name</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Audience</th>
                    <th className="px-4 py-3 text-left">Sent On</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr
                      key={c.name}
                      className="border-t hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedCampaign(c)}
                    >
                      <td className="px-4 py-3 font-semibold text-primary">{c.name}</td>
                      <td className="px-4 py-3">{c.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.audience}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.sent}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card stack */}
          <div className="space-y-3 sm:hidden">
            {campaigns.map((c) => (
              <div
                key={c.name}
                className="rounded-xl border bg-card p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setSelectedCampaign(c)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate text-primary">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.type} Â· {c.audience}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                    {c.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Sent: {c.sent}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Create campaign form */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 h-fit">
          <div className="font-display font-semibold text-lg border-b pb-3 mb-4">
            Create New Campaign
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Campaign Name
              </label>
              <input
                placeholder="e.g. Summer Promo"
                className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Campaign Type
              </label>
              <select className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/40">
                <option>Promotion</option>
                <option>Discount</option>
                <option>Offer</option>
                <option>Announcement</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Recipients
              </label>
              <select className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/40">
                <option>Select Existing Users (All)</option>
                <option>Select Existing Users (Active)</option>
                <option>Upload Email List (CSV)</option>
                <option>Manual Email Entry</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Email Subject
              </label>
              <input
                placeholder="Subject Line"
                className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Message Content
              </label>
              <textarea
                rows={5}
                placeholder="Write your email body here..."
                className="mt-1 w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <button className="h-11 w-full rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground">
              Send Campaign
            </button>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedCampaign.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCampaign.type} Â· {selectedCampaign.audience} Â· Sent{" "}
                  {selectedCampaign.sent}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border bg-muted/20 p-3 text-center">
                  <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-xs uppercase text-muted-foreground">Sent</div>
                  <div className="font-semibold">{selectedCampaign.sentCount ?? 0}</div>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3 text-center">
                  <Mail className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-xs uppercase text-muted-foreground">Open Rate</div>
                  <div className="font-semibold text-success">
                    {selectedCampaign.openRate ?? "0%"}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3 text-center">
                  <MousePointerClick className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-xs uppercase text-muted-foreground">Clicks</div>
                  <div className="font-semibold">N/A</div>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase">
                    Subject
                  </div>
                  <div className="text-sm font-medium mt-0.5">
                    {selectedCampaign.subject ?? "No Subject"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase">
                    Email Body
                  </div>
                  <div className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedCampaign.body ?? "No body content."}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
