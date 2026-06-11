import { cn } from "@/lib/utils";
import { formatJobAge, getAgeTone, getJobAgeDays, ageToneStyles } from "@/lib/job-aging";
import { Clock } from "lucide-react";

export function JobAgeBadge({
  createdAt,
  className,
  showIcon = true,
}: {
  createdAt: string;
  className?: string;
  showIcon?: boolean;
}) {
  const days = getJobAgeDays(createdAt);
  const tone = getAgeTone(days);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
        ageToneStyles[tone],
        className,
      )}
    >
      {showIcon && <Clock className="h-3 w-3" />}
      {formatJobAge(createdAt)}
    </span>
  );
}
