import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowRight, Info } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, quotations, inr } from "@/data/demo";

export const Route = createFileRoute("/app/quotations")({
  head: () => ({ meta: [{ title: "Quotation History — DroneZone" }] }),
  component: QuotationHistory,
});

function QuotationHistory() {
  return (
    <>
      <PageHeader
        title="Quotation History"
        description="View all past and pending quotations linked to service requests."
      />

      {/* Banner directing to new workflow */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">New quotation workflow</div>
              <div className="text-xs text-muted-foreground">
                Quotations are now created inline within the request review page — linked directly
                to each job.
              </div>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link to="/app/requests">
              Go to Requests <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent quotations table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-primary" /> All Quotations
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Quotation</th>
                <th className="px-4 py-3 text-left font-medium">Job</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Fixed Price</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quotations.map((q) => {
                const j = jobs.find((x) => x.id === q.jobId)!;
                const sub = q.hardwareCost + q.laborCost + q.shippingCost;
                const discountAmt = Math.round((sub * q.discountPercent) / 100);
                const afterDiscount = sub - discountAmt;
                const total = afterDiscount + Math.round((afterDiscount * q.gstPercent) / 100);
                const statusClass =
                  q.status === "accepted"
                    ? "bg-success/15 text-success"
                    : q.status === "sent"
                      ? "bg-primary/10 text-primary"
                      : q.status === "customer_review"
                        ? "bg-warning/15 text-[oklch(0.45_0.15_75)]"
                        : "bg-muted text-muted-foreground";
                return (
                  <tr key={q.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{q.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{j.issue}</div>
                      <div className="text-xs text-muted-foreground">
                        {j.id} · {j.customer.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass}`}
                      >
                        {q.status === "customer_review" ? "Pending" : q.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{inr(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {quotations.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">No quotations yet.</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
