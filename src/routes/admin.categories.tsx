import { definePage, useRouter } from "@/lib/router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPricingAdminData, setServiceCategory, setServicePricing } from "@/lib/api/platform";
import { toast } from "sonner";

export const Page = definePage("/admin/categories")({
  head: () => ({ meta: [{ title: "Services & Pricing — DroneZone Admin" }] }),
  loader: () => getPricingAdminData(),
  component: Categories,
});
function Categories() {
  const { categories, pricing } =
    Page.useLoaderData<Awaited<ReturnType<typeof getPricingAdminData>>>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [tax, setTax] = useState("18");
  const [busy, setBusy] = useState(false);
  async function add() {
    setBusy(true);
    try {
      await setServiceCategory({ name, active: true });
      setName("");
      toast.success("Category added");
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to add category");
    } finally {
      setBusy(false);
    }
  }
  async function price() {
    setBusy(true);
    try {
      await setServicePricing({
        categoryId,
        pricingType: "category",
        amount: Number(amount),
        taxPercent: Number(tax),
      });
      setAmount("");
      toast.success("Fixed price saved");
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save pricing");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Services & Fixed Pricing</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card">
          <div className="border-b p-4 font-semibold">Service categories</div>
          <div className="divide-y">
            {categories.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.description || "No description"}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${c.is_active ? "bg-success/15 text-success" : "bg-muted"}`}
                >
                  {c.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t p-4">
            <Input
              placeholder="New category"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button disabled={busy || !name.trim()} onClick={() => void add()}>
              Add
            </Button>
          </div>
        </div>
        <div className="rounded-xl border bg-card">
          <div className="border-b p-4 font-semibold">Fixed category pricing</div>
          <div className="divide-y">
            {pricing.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold">{p.service_categories?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Effective {new Date(p.effective_from).toLocaleDateString("en-IN")} · Tax{" "}
                    {p.tax_percent}%
                  </div>
                </div>
                <div className="font-semibold">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: p.currency,
                  }).format(p.amount)}
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-2 border-t p-4 sm:grid-cols-4">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 rounded-lg border bg-background px-2 text-sm sm:col-span-2"
            >
              {categories.map((c: any) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min="0"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="Tax %"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
            />
            <Button
              className="sm:col-span-4"
              disabled={busy || !categoryId || Number(amount) < 0 || !amount}
              onClick={() => void price()}
            >
              Save fixed price
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
