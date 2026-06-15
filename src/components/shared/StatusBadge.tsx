import { cn } from "@/lib/utils";
import { type JobStatus, statusLabel, statusTone } from "@/data/demo";

const tones: Record<ReturnType<typeof statusTone>, string> = {
  blue: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
  green: "bg-success/15 text-success ring-1 ring-inset ring-success/30",
  amber: "bg-warning/15 text-[oklch(0.45_0.15_75)] ring-1 ring-inset ring-warning/30",
  red: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25",
  slate: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
};

export function StatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[statusTone(status)],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {statusLabel(status)}
    </span>
  );
}
