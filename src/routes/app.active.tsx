import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Circle, MapPin, MessageSquare, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, stages, type JobStatus } from "@/data/demo";
import { useState } from "react";

export const Route = createFileRoute("/app/active")({
  head: () => ({ meta: [{ title: "Active Jobs — DroneZone" }] }),
  component: Active,
});

function Active() {
  const active = jobs.filter((j) =>
    ["accepted", "en_route", "on_site", "in_progress", "testing"].includes(j.status),
  );
  const [selectedId, setSelectedId] = useState(active[0]?.id);
  const selected = active.find((j) => j.id === selectedId) ?? active[0];

  if (!selected) {
    return (
      <>
        <PageHeader title="Active Jobs" description="No active jobs right now." />
      </>
    );
  }

  const currentIdx = stages.findIndex((s) => s.key === selected.status);

  return (
    <>
      <PageHeader title="Active Jobs" description="Track ongoing repairs and update workflow status." />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-sm">In progress · {active.length}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {active.map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedId(j.id)}
                className={`w-full px-4 py-3 text-left transition ${
                  selectedId === j.id ? "bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{j.id}</span>
                  <StatusBadge status={j.status} />
                </div>
                <div className="mt-1 truncate text-sm font-semibold">{j.issue}</div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{j.customer.name}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{selected.id}</span>
                    <StatusBadge status={selected.status} />
                  </div>
                  <h2 className="mt-1 font-display text-xl font-semibold">{selected.issue}</h2>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {selected.location}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" /> Call
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/app/chat">
                      <MessageSquare className="h-4 w-4" /> Chat
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Workflow timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-6 border-l-2 border-border pl-6">
                {stages.map((s, i) => {
                  const done = i < currentIdx;
                  const current = i === currentIdx;
                  return (
                    <li key={s.key} className="relative">
                      <span
                        className={`absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                          done
                            ? "border-success bg-success text-success-foreground"
                            : current
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : current ? (
                          <motion.span
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{ duration: 1.4, repeat: Infinity }}
                            className="h-2 w-2 rounded-full bg-current"
                          />
                        ) : (
                          <Circle className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className={`text-sm font-semibold ${
                              done || current ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {s.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {done
                              ? `Completed · May 12, 10:${10 + i * 5} AM`
                              : current
                                ? "In progress"
                                : "Pending"}
                          </div>
                        </div>
                        {current && i < stages.length - 1 && (
                          <Button size="sm" variant="outline">
                            Update status
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
                <Button>
                  <Check className="h-4 w-4" /> Mark as completed
                </Button>
                <Button variant="outline">Move to next stage</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
