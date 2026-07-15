import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search,
  Paperclip,
  Send,
  Smile,
  Phone,
  MoreVertical,
  ArrowLeft,
  Lock,
  MessageSquareOff,
  Eye,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { chatThreads, messagesByThread, jobs } from "@/data/demo";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/chat")({
  head: () => ({ meta: [{ title: "Chat — DroneZone" }] }),
  component: Chat,
});

const activeStatuses = new Set(["accepted", "en_route", "on_site", "in_progress", "testing"]);

function Chat() {
  const [active, setActive] = useState(chatThreads[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Categorise threads */
  const { activeThreads, closedThreads } = useMemo(() => {
    const act: typeof chatThreads = [];
    const closed: typeof chatThreads = [];
    for (const t of chatThreads) {
      const job = jobs.find((j) => j.id === t.jobId);
      if (!job) continue;
      if (activeStatuses.has(job.status)) {
        act.push(t);
      } else if (job.status === "completed") {
        closed.push(t);
      }
    }
    return { activeThreads: act, closedThreads: closed };
  }, []);

  const allVisibleThreads = [...activeThreads, ...closedThreads];
  const thread = allVisibleThreads.find((t) => t.id === active) ?? allVisibleThreads[0];
  if (!thread) {
    return (
      <Card className="p-8 text-center">
        <MessageSquareOff className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No chat threads available.</p>
      </Card>
    );
  }
  const msgs = messagesByThread[thread.id] ?? [];
  const linkedJob = jobs.find((j) => j.id === thread.jobId);
  const isActive = linkedJob ? activeStatuses.has(linkedJob.status) : false;
  const isClosed = linkedJob?.status === "completed" && linkedJob?.feedbackSubmitted === true;
  const isPendingFeedback = linkedJob?.status === "completed" && !linkedJob?.feedbackSubmitted;

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid h-[calc(100vh-220px)] min-h-[520px] grid-cols-1 md:grid-cols-[320px_1fr]">
        {/* Threads sidebar */}
        <div className={`border-r ${mobileOpen ? "hidden md:flex" : "flex"} flex-col`}>
          <div className="border-b p-4">
            <h2 className="font-display text-lg font-semibold">Messages</h2>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations…" className="h-9 pl-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Active threads */}
            {activeThreads.length > 0 && (
              <>
                <div className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Jobs
                </div>
                {activeThreads.map((t) => (
                  <ThreadItem
                    key={t.id}
                    thread={t}
                    isSelected={active === t.id}
                    onClick={() => {
                      setActive(t.id);
                      setMobileOpen(true);
                    }}
                  />
                ))}
              </>
            )}

            {/* Closed threads */}
            {closedThreads.length > 0 && (
              <>
                <div className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Closed · View Only
                </div>
                {closedThreads.map((t) => (
                  <ThreadItem
                    key={t.id}
                    thread={t}
                    isSelected={active === t.id}
                    onClick={() => {
                      setActive(t.id);
                      setMobileOpen(true);
                    }}
                    closed
                  />
                ))}
              </>
            )}

            {/* Disabled threads info */}
            {activeThreads.length === 0 && closedThreads.length === 0 && (
              <div className="p-6 text-center">
                <Lock className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Chat is available only for active jobs.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Conversation area */}
        <div className={`${mobileOpen ? "flex" : "hidden md:flex"} flex-col`}>
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b p-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {thread.customer.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{thread.customer.name}</div>
              <div className="text-xs text-muted-foreground">
                {isClosed ? (
                  <span className="text-muted-foreground">Chat closed · View history</span>
                ) : isPendingFeedback ? (
                  <span className="text-[oklch(0.45_0.15_75)]">Pending feedback</span>
                ) : thread.customer.online ? (
                  <span className="text-success">Online</span>
                ) : (
                  "Last seen 12m ago"
                )}
              </div>
            </div>
            {isActive && (
              <>
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </>
            )}
            {(isClosed || isPendingFeedback) && (
              <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                <Eye className="h-3 w-3" /> View Only
              </span>
            )}
          </div>

          {/* Closed chat banner */}
          {isClosed && (
            <div className="border-b bg-muted/50 px-4 py-2.5 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                <span>This chat was closed after job completion and feedback submission.</span>
              </div>
            </div>
          )}
          {isPendingFeedback && (
            <div className="border-b bg-warning/10 px-4 py-2.5 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-[oklch(0.45_0.15_75)]">
                <Lock className="h-3.5 w-3.5" />
                <span>Chat paused — pending customer feedback submission.</span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            className={`flex-1 space-y-3 overflow-y-auto p-4 ${isClosed || isPendingFeedback ? "opacity-60" : ""} bg-[radial-gradient(circle_at_50%_0%,oklch(0.97_0.015_255)_0%,oklch(0.984_0.005_247)_100%)]`}
          >
            {msgs.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    m.from === "me"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-card text-foreground"
                  }`}
                >
                  <div>{m.text}</div>
                  <div
                    className={`mt-1 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {m.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input area — only for active jobs */}
          {isActive ? (
            <div className="border-t p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {["On my way", "Reached site", "Will share quote", "Job completed"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setDraft(q)}
                    className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form
                className="flex items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim()) return;
                  setDraft("");
                }}
              >
                <Button type="button" variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  className="h-11"
                />
                <Button type="button" variant="ghost" size="icon" className="shrink-0">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button type="submit" size="icon" className="h-11 w-11 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="border-t bg-muted/30 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                {isClosed
                  ? "Chat closed — history view only"
                  : isPendingFeedback
                    ? "Waiting for feedback to close chat"
                    : "Chat available only during active jobs"}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function ThreadItem({
  thread,
  isSelected,
  onClick,
  closed,
}: {
  thread: (typeof chatThreads)[number];
  isSelected: boolean;
  onClick: () => void;
  closed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition ${
        isSelected ? "bg-primary/5" : "hover:bg-muted/40"
      } ${closed ? "opacity-60" : ""}`}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {thread.customer.name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        {!closed && thread.customer.online && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold">{thread.customer.name}</span>
          {closed && <Lock className="h-3 w-3 text-muted-foreground" />}
          {!closed && <span className="shrink-0 text-[10px] text-muted-foreground">10:35 AM</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">{thread.lastMessage}</span>
          {!closed && thread.unread > 0 && (
            <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {thread.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
