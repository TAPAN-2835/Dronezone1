import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Paperclip, Send, Smile, Phone, MoreVertical, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { chatThreads, messagesByThread } from "@/data/demo";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/chat")({
  head: () => ({ meta: [{ title: "Chat — DroneZone" }] }),
  component: Chat,
});

function Chat() {
  const [active, setActive] = useState(chatThreads[0].id);
  const [draft, setDraft] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const thread = chatThreads.find((t) => t.id === active)!;
  const msgs = messagesByThread[thread.id];

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid h-[calc(100vh-220px)] min-h-[520px] grid-cols-1 md:grid-cols-[320px_1fr]">
        {/* Threads */}
        <div className={`border-r ${mobileOpen ? "hidden md:flex" : "flex"} flex-col`}>
          <div className="border-b p-4">
            <h2 className="font-display text-lg font-semibold">Messages</h2>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations…" className="h-9 pl-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chatThreads.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActive(t.id);
                  setMobileOpen(true);
                }}
                className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition ${
                  active === t.id ? "bg-primary/5" : "hover:bg-muted/40"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {t.customer.name.split(" ").map((p) => p[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  {t.customer.online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{t.customer.name}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">10:35 AM</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">{t.lastMessage}</span>
                    {t.unread > 0 && (
                      <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {t.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className={`${mobileOpen ? "flex" : "hidden md:flex"} flex-col`}>
          <div className="flex items-center gap-3 border-b p-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {thread.customer.name.split(" ").map((p) => p[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{thread.customer.name}</div>
              <div className="text-xs text-success">
                {thread.customer.online ? "Online" : "Last seen 12m ago"}
              </div>
            </div>
            <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,oklch(0.97_0.015_255)_0%,oklch(0.984_0.005_247)_100%)] p-4">
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
                  <div className={`mt-1 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {m.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

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
        </div>
      </div>
    </Card>
  );
}
