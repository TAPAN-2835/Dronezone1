import { definePage, Link } from "@/lib/router";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { getCustomerInvoices } from "@/lib/api/customer";

export const Page = definePage("/customer/invoices")({
  head: () => ({ meta: [{ title: "Invoices — DroneZone" }] }),
  loader: () => getCustomerInvoices(),
  component: () => (
    <CustomerShell title="Invoices" showBack>
      <Invoices />
    </CustomerShell>
  ),
});
function Invoices() {
  const rows = Page.useLoaderData<Awaited<ReturnType<typeof getCustomerInvoices>>>();
  return (
    <div className="space-y-3 p-5">
      {rows.map((row: any) => {
        const subtotal = Number(row.fixed_price);
        const tax = (subtotal * Number(row.tax_percent || 0)) / 100;
        const currency = row.currency || "INR";
        const money = (v: number) =>
          new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(v);
        return (
          <Link
            key={row.id}
            to="/customer/requests/$id"
            params={{ id: row.id }}
            className="block rounded-xl border bg-card p-4 hover:bg-muted/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{row.request_number}</div>
                <div className="text-xs text-muted-foreground">{row.title}</div>
              </div>
              <div className="font-bold">{money(subtotal + tax)}</div>
            </div>
            <div className="mt-3 flex justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>
                Base {money(subtotal)} · Tax {row.tax_percent || 0}%
              </span>
              <span>
                {row.completed_at
                  ? new Date(row.completed_at).toLocaleDateString("en-IN")
                  : "Completed"}
              </span>
            </div>
          </Link>
        );
      })}
      {!rows.length && (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No completed fixed-price jobs are available for invoicing.
        </div>
      )}
    </div>
  );
}
