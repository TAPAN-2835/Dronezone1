import { useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { Bell, Check, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  archiveNotification,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "@/lib/api/platform";
import { toast } from "sonner";

export function NotificationCenter({ initial }: { initial: Notification[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const visible = useMemo(
    () => items.filter((item) => filter === "all" || !item.read_at),
    [filter, items],
  );

  async function markAll() {
    try {
      await markAllNotificationsRead();
      const now = new Date().toISOString();
      setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at || now })));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update notifications");
    }
  }

  async function read(item: Notification) {
    if (item.read_at) return;
    try {
      await markNotificationRead(item.id);
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry,
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to mark notification read");
    }
  }

  async function archive(id: string) {
    try {
      await archiveNotification(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to archive notification");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex rounded-lg border bg-card p-1 text-xs">
          {(["all", "unread"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-md px-3 py-1.5 capitalize ${filter === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {value}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => void markAll()}>
          <Check className="h-4 w-4" /> Mark all read
        </Button>
      </div>
      <div className="divide-y overflow-hidden rounded-xl border bg-card">
        {visible.map((item) => {
          const content = (
            <>
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${item.priority === "urgent" || item.priority === "high" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
              >
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {item.title}
                  {!item.read_at && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">{item.body}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(item.created_at).toLocaleString("en-IN")}
                </p>
              </div>
            </>
          );
          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-4 ${!item.read_at ? "bg-primary/5" : ""}`}
            >
              {item.deep_link ? (
                <Link
                  to={item.deep_link}
                  onClick={() => void read(item)}
                  className="flex min-w-0 flex-1 items-start gap-3"
                >
                  {content}
                </Link>
              ) : (
                <button
                  onClick={() => void read(item)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  {content}
                </button>
              )}
              <button
                aria-label="Archive notification"
                onClick={() => void archive(item.id)}
                className="rounded p-2 text-muted-foreground hover:bg-muted"
              >
                <Archive className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            You're all caught up.
          </div>
        )}
      </div>
    </div>
  );
}
