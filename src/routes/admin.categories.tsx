import { createFileRoute } from "@tanstack/react-router";
import { categories, droneModels } from "@/data/admin";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Services & Models — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Services & Models</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Service Categories" items={categories.map(c => ({ a: c.name, b: c.desc, active: c.active }))} cta="+ Add Category" />
        <Section title="Drone Models" items={droneModels.map(d => ({ a: d.brand, b: d.model, active: d.active }))} cta="+ Add Model" />
      </div>
    </div>
  ),
});

function Section({ title, items, cta }: { title: string; items: { a: string; b: string; active: boolean }[]; cta: string }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b p-4"><div className="font-display font-semibold">{title}</div><button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">{cta}</button></div>
      <ul className="divide-y">{items.map((it, i) => (
        <li key={i} className="flex items-center justify-between p-4 text-sm"><div><div className="font-semibold">{it.a}</div><div className="text-xs text-muted-foreground">{it.b}</div></div><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${it.active?"bg-success/15 text-success":"bg-muted text-muted-foreground"}`}>{it.active?"Active":"Inactive"}</span></li>
      ))}</ul>
    </div>
  );
}