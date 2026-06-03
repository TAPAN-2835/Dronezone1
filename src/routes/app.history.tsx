import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Download, TrendingUp, IndianRupee, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { jobs, inr } from "@/data/demo";

export const Route = createFileRoute("/app/history")({
  head: () => ({ meta: [{ title: "Service History — DroneZone" }] }),
  component: History,
});

function History() {
  const [q, setQ] = useState("");
  const completed = useMemo(
    () =>
      jobs
        .filter((j) => j.status === "completed" || j.status === "cancelled")
        .filter(
          (j) =>
            q === "" ||
            j.id.toLowerCase().includes(q.toLowerCase()) ||
            j.issue.toLowerCase().includes(q.toLowerCase()) ||
            j.customer.name.toLowerCase().includes(q.toLowerCase()),
        ),
    [q],
  );

  const totalRevenue = completed.reduce((s, j) => s + (j.amount ?? 0), 0);
  const avg = completed.length ? Math.round(totalRevenue / completed.length) : 0;

  return (
    <>
      <PageHeader
        title="Service History"
        description="Every completed visit, invoice, and customer record."
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={CheckCircle2} label="Completed jobs" value={String(completed.length)} tone="success" />
        <Stat icon={IndianRupee} label="Lifetime revenue" value={inr(totalRevenue)} tone="primary" />
        <Stat icon={TrendingUp} label="Avg ticket size" value={inr(avg)} tone="primary" />
        <Stat icon={CheckCircle2} label="Customer rating" value="4.8 / 5" tone="success" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search records…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">All time</Button>
            <Button variant="outline" size="sm">All cities</Button>
          </div>
        </div>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Job</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {completed.map((j) => (
                <tr key={j.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{j.issue}</div>
                    <div className="font-mono text-xs text-muted-foreground">{j.id} · {j.drone.model}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{j.customer.name}</div>
                    <div className="text-xs text-muted-foreground">{j.location}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(j.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                  <td className="px-4 py-3 text-right font-semibold">{j.amount ? inr(j.amount) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {completed.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">No records match your search.</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof CheckCircle2; label: string; value: string; tone: "primary" | "success" }) {
  const toneClass = tone === "success" ? "bg-success/15 text-success" : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="font-display text-lg font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
