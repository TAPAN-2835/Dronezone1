import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { availability, jobs } from "@/data/demo";

export const Route = createFileRoute("/app/schedule")({
  head: () => ({ meta: [{ title: "Schedule — DroneZone" }] }),
  component: Schedule,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Schedule() {
  const [online, setOnline] = useState(availability.online);
  const [working, setWorking] = useState<string[]>(availability.workingDays);
  const today = new Date("2026-06-02");

  const monthName = today.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  return (
    <>
      <PageHeader
        title="Schedule"
        description="Manage your availability and view upcoming visits."
        actions={
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <span className={`h-2 w-2 rounded-full ${online ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
            <span className="text-sm font-medium">{online ? "Online" : "Offline"}</span>
            <Switch checked={online} onCheckedChange={setOnline} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{monthName}</CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="sm">Today</Button>
                <Button variant="outline" size="sm">Month</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                {days.map((d) => (
                  <div key={d} className="py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={"e" + i} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const date = i + 1;
                  const isToday = date === today.getDate();
                  const hasJobs = [3, 7, 12, 15, 18, 22, 25].includes(date);
                  return (
                    <div
                      key={date}
                      className={`relative aspect-square rounded-lg border p-1.5 text-left text-sm transition hover:bg-accent ${
                        isToday ? "border-primary bg-primary/5 font-semibold text-primary" : ""
                      }`}
                    >
                      <span>{date}</span>
                      {hasJobs && (
                        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          <span className="h-1 w-1 rounded-full bg-success" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upcoming visits</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {jobs.slice(0, 5).map((j) => (
                <div key={j.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-[10px] uppercase">
                      {new Date(j.scheduledAt).toLocaleString("en-IN", { month: "short" })}
                    </span>
                    <span className="font-display text-base font-bold">
                      {new Date(j.scheduledAt).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{j.issue}</div>
                    <div className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(j.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      <MapPin className="ml-1 h-3 w-3" />
                      <span className="truncate">{j.location}</span>
                    </div>
                  </div>
                  <StatusBadge status={j.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From</Label>
                <Input type="time" defaultValue={availability.workingHours.start} className="mt-1.5 h-10" />
              </div>
              <div>
                <Label>To</Label>
                <Input type="time" defaultValue={availability.workingHours.end} className="mt-1.5 h-10" />
              </div>
            </div>

            <div>
              <Label>Working days</Label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {days.map((d) => {
                  const on = working.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() =>
                        setWorking((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))
                      }
                      className={`h-9 w-11 rounded-md border text-xs font-semibold transition ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-card text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Max jobs per day</Label>
              <Input type="number" defaultValue={availability.maxJobsPerDay} className="mt-1.5 h-10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Break from</Label>
                <Input type="time" defaultValue={availability.breakStart} className="mt-1.5 h-10" />
              </div>
              <div>
                <Label>Break to</Label>
                <Input type="time" defaultValue={availability.breakEnd} className="mt-1.5 h-10" />
              </div>
            </div>

            <Button className="w-full">
              <CalendarIcon className="h-4 w-4" /> Save availability
            </Button>

            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              Mark yourself offline to pause new job requests while you're on a break or off-duty.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
