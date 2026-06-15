import { createFileRoute } from "@tanstack/react-router";
import { categories, droneModels } from "@/data/admin";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Services & Models — DroneZone Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Services &amp; Models</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Service Categories"
          items={categories.map((c) => ({ a: c.name, b: c.desc, active: c.active }))}
          cta="+ Add Category"
        />
        <div className="space-y-6">
          <Section
            title="Most Frequently Serviced Models"
            items={[
              { a: "DJI Mavic 3", b: "Service Count: 142 | Freq: High", c: "Last: 12 May 2026" },
              { a: "DJI Mini 4 Pro", b: "Service Count: 89 | Freq: Medium", c: "Last: 10 May 2026" },
              { a: "DJI Air 3", b: "Service Count: 65 | Freq: Medium", c: "Last: 05 May 2026" },
            ]}
          />
          <Section
            title="Previously Worked-On Models"
            items={[
              { a: "DJI Phantom 4 RTK", b: "Service Count: 24 | Freq: Low", c: "Last: 18 Apr 2026" },
              { a: "Autel EVO II Pro", b: "Service Count: 18 | Freq: Low", c: "Last: 02 Apr 2026" },
            ]}
          />
        </div>
      </div>
    </div>
  ),
});

function Section({
  title,
  items,
  cta,
}: {
  title: string;
  items: { a: string; b: string; c?: string; active?: boolean }[];
  cta?: string;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div className="font-display font-semibold">{title}</div>
        {cta && (
          <button className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            {cta}
          </button>
        )}
      </div>
      <ul className="divide-y">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between gap-3 p-4 text-sm">
            <div className="min-w-0">
              <div className="font-semibold truncate">{it.a}</div>
              <div className="truncate text-xs text-muted-foreground">{it.b}</div>
            </div>
            {it.active !== undefined ? (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  it.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {it.active ? "Active" : "Inactive"}
              </span>
            ) : it.c ? (
              <span className="shrink-0 text-xs text-muted-foreground">{it.c}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}