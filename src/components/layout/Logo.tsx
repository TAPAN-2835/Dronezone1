import logoJp from "@/assets/logo.jpeg";

export function Logo({
  size = 32,
  withText = true,
  tagline = "Drone Service Ecosystem",
}: {
  size?: number;
  withText?: boolean;
  tagline?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logoJp}
        alt="DroneZone Logo"
        className="rounded-xl object-cover border border-border"
        style={{ width: size, height: size }}
      />
      {withText && (
        <div className="leading-tight">
          <div className="font-display text-base font-bold tracking-tight text-foreground">DroneZone</div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{tagline}</div>
        </div>
      )}
    </div>
  );
}