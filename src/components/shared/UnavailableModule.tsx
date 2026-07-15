import { Construction } from "lucide-react";

export function UnavailableModule({ title, reason }: { title: string; reason: string }) {
  return (
    <div className="grid min-h-[22rem] place-items-center rounded-xl border bg-card p-8 text-center">
      <div className="max-w-md">
        <Construction className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{reason}</p>
      </div>
    </div>
  );
}
