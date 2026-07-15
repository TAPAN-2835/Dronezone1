const REFERENCE_DATE = new Date("2026-06-02T10:00:00");

export function getJobAgeDays(createdAt: string): number {
  const created = new Date(createdAt);
  const diffMs = REFERENCE_DATE.getTime() - created.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatJobAge(createdAt: string): string {
  const days = getJobAgeDays(createdAt);
  if (days === 0) return "Today";
  if (days === 1) return "1 Day Old";
  return `${days} Days Old`;
}

export type AgeTone = "fresh" | "moderate" | "stale" | "critical";

export function getAgeTone(days: number): AgeTone {
  if (days <= 2) return "fresh";
  if (days <= 7) return "moderate";
  if (days <= 14) return "stale";
  return "critical";
}

export const ageToneStyles: Record<AgeTone, string> = {
  fresh: "bg-success/15 text-success ring-success/30",
  moderate: "bg-primary/10 text-primary ring-primary/20",
  stale: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-warning/30",
  critical: "bg-destructive/10 text-destructive ring-destructive/25",
};
