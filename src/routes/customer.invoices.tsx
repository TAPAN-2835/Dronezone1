import { definePage } from "@/lib/router";
import { Download } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { invoice, inr } from "@/data/customer";

export const Page = definePage("/customer/invoices")({
  head: () => ({ meta: [{ title: "Invoice â€” DroneZone" }] }),
  component: () => (
    <CustomerShell title="Invoice Details" showBack>
      <Invoice />
    </CustomerShell>
  ),
});

function Invoice() {
  return (
    <div className="space-y-4 px-5 py-5">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Invoice</div>
            <div className="mt-0.5 font-display text-xl font-bold">#{invoice.id}</div>
          </div>
          <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
            {invoice.status}
          </span>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted-foreground">Date</span>
          <span className="font-medium">{invoice.date}</span>
        </div>
        <div className="mt-4 space-y-2 border-t pt-4">
          {invoice.items.map((it) => (
            <div key={it.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{it.label}</span>
              <span>{inr(it.amount)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1.5 border-t pt-4 text-sm">
          <Row label="Subtotal" value={inr(invoice.subtotal)} />
          <Row label="GST (18%)" value={inr(invoice.gst)} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="font-display text-base font-semibold">Total</span>
          <span className="font-display text-2xl font-bold">{inr(invoice.total)}</span>
        </div>
        <div className="mt-4 flex justify-between border-t pt-4 text-sm">
          <span className="text-muted-foreground">Payment Method</span>
          <span className="font-medium">{invoice.method}</span>
        </div>
      </div>
      <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-primary text-sm font-semibold text-primary hover:bg-primary/5">
        <Download className="h-4 w-4" /> Download Invoice
      </button>
      <button className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        Make Another Payment
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
