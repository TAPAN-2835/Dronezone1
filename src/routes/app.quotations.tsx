import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Send, FileDown, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/layout/Logo";
import { jobs, quotations, inr, provider } from "@/data/demo";
import { toast } from "sonner";

export const Route = createFileRoute("/app/quotations")({
  head: () => ({ meta: [{ title: "Quotations — DroneZone" }] }),
  component: Quotations,
});

function Quotations() {
  const [jobId, setJobId] = useState(jobs[0].id);
  const job = jobs.find((j) => j.id === jobId)!;

  const [parts, setParts] = useState(2500);
  const [labor, setLabor] = useState(1000);
  const [travel, setTravel] = useState(500);
  const [discount, setDiscount] = useState(0);
  const [gst, setGst] = useState(18);
  const [notes, setNotes] = useState("");

  const subtotal = parts + labor + travel - discount;
  const tax = Math.round((subtotal * gst) / 100);
  const total = subtotal + tax;

  return (
    <>
      <PageHeader
        title="Quotations"
        description="Build invoice-grade quotations with live calculations and send them to customers."
        actions={
          <Button variant="outline">
            <Plus className="h-4 w-4" /> Quotation history
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Build quotation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Linked job</Label>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="h-10 w-full rounded-md border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/15"
              >
                {jobs.slice(0, 12).map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.id} — {j.issue}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MoneyField label="Parts cost" value={parts} onChange={setParts} />
              <MoneyField label="Labor charge" value={labor} onChange={setLabor} />
              <MoneyField label="Travel charge" value={travel} onChange={setTravel} />
              <MoneyField label="Discount" value={discount} onChange={setDiscount} />
            </div>

            <div className="space-y-1.5">
              <Label>GST (%)</Label>
              <Input type="number" value={gst} onChange={(e) => setGst(+e.target.value || 0)} className="h-10" />
            </div>

            <div className="space-y-1.5">
              <Label>Notes to customer</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional terms, warranty, or instructions…"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/40 p-5">
            <div className="flex items-start justify-between">
              <Logo />
              <div className="text-right">
                <div className="font-display text-lg font-bold">Quotation</div>
                <div className="text-xs text-muted-foreground">QT-{2000 + jobs.indexOf(job) + 1}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">From</div>
                <div className="mt-1 font-semibold">{provider.business.name}</div>
                <div className="text-xs text-muted-foreground">{provider.business.address}</div>
                <div className="text-xs text-muted-foreground">GSTIN: {provider.business.gst}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Bill to</div>
                <div className="mt-1 font-semibold">{job.customer.name}</div>
                <div className="text-xs text-muted-foreground">{job.customer.phone}</div>
                <div className="text-xs text-muted-foreground">{job.location}</div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Description</th>
                    <th className="px-4 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{job.issue}</div>
                      <div className="text-xs text-muted-foreground">{job.drone.model}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">{inr(parts)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">Labor charges</td>
                    <td className="px-4 py-2.5 text-right">{inr(labor)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">Travel / visit charge</td>
                    <td className="px-4 py-2.5 text-right">{inr(travel)}</td>
                  </tr>
                  {discount > 0 && (
                    <tr className="text-success">
                      <td className="px-4 py-2.5">Discount applied</td>
                      <td className="px-4 py-2.5 text-right">− {inr(discount)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-1.5 text-sm">
              <Row label="Subtotal" value={inr(subtotal)} />
              <Row label={`GST (${gst}%)`} value={inr(tax)} />
              <div className="flex items-center justify-between border-t pt-3 text-base font-bold">
                <span>Total amount</span>
                <span className="text-primary">{inr(total)}</span>
              </div>
            </div>

            {notes && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Notes:</span> {notes}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2 border-t pt-5">
              <Button onClick={() => toast.success("Quotation sent to customer")}>
                <Send className="h-4 w-4" /> Send to customer
              </Button>
              <Button variant="outline" onClick={() => toast.success("PDF downloaded")}>
                <FileDown className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent quotations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Recent quotations</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Quotation</th>
                <th className="px-4 py-3 text-left font-medium">Job</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quotations.slice(0, 6).map((q) => {
                const j = jobs.find((x) => x.id === q.jobId)!;
                const sub = q.partsCost + q.laborCost + q.travelCost - q.discount;
                const total = sub + Math.round((sub * q.gstPercent) / 100);
                const statusClass = q.status === "accepted"
                  ? "bg-success/15 text-success"
                  : q.status === "sent"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground";
                return (
                  <tr key={q.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{q.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{j.issue}</div>
                      <div className="text-xs text-muted-foreground">{j.id} · {j.customer.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{inr(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(+e.target.value || 0)}
          className="h-10 pl-7"
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
