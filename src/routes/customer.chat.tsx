import { createFileRoute } from "@tanstack/react-router";
import { Paperclip, Camera, Send } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { chatMessages } from "@/data/customer";

export const Route = createFileRoute("/customer/chat")({
  head: () => ({ meta: [{ title: "Chat — DroneZone" }] }),
  component: () => (
    <CustomerShell title="Rahul Kumar">
      <Chat />
    </CustomerShell>
  ),
});

function Chat() {
  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col bg-[oklch(0.97_0.012_255)]">
      <div className="border-b bg-card px-4 py-2 text-center text-[10px] font-medium text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> Online
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {chatMessages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${m.from === "me" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-card border"}`}>
              {m.text}
              <div className={`mt-1 text-[10px] ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}`}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t bg-card p-3">
        <button className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent"><Paperclip className="h-4 w-4" /></button>
        <button className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent"><Camera className="h-4 w-4" /></button>
        <input placeholder="Type a message…" className="h-10 flex-1 rounded-full border bg-background px-4 text-sm outline-none focus:border-primary/40" />
        <button className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Send className="h-4 w-4" /></button>
      </div>
    </div>
  );
}