import { useState } from "react";
import {
  Award,
  BadgeCheck,
  Building2,
  Eye,
  Mail,
  MapPin,
  Phone,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { definePage, useRouter } from "@/lib/router";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getProviderDashboard } from "@/lib/api/provider";
import {
  deleteProviderEquipment,
  getProviderEquipmentSignedUrl,
  listProviderEquipment,
  uploadProviderEquipmentImage,
  type ProviderEquipment,
} from "@/lib/api/storage";

export const Page = definePage("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — DroneZone" }] }),
  loader: async () => {
    const [{ profile }, equipment] = await Promise.all([
      getProviderDashboard(),
      listProviderEquipment(),
    ]);
    return { profile, equipment };
  },
  component: Profile,
});

function Profile() {
  const { profile, equipment } = Page.useLoaderData();
  const router = useRouter();
  const [equipmentName, setEquipmentName] = useState("");
  const [uploading, setUploading] = useState(false);
  const user = Array.isArray(profile?.users) ? profile.users[0] : profile?.users;
  const initials = `${user?.first_name?.[0] ?? "P"}${user?.last_name?.[0] ?? ""}`;

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your service provider identity, verification and equipment."
      />
      <Card className="overflow-hidden">
        <div className="h-28 bg-[linear-gradient(120deg,oklch(0.55_0.21_263),oklch(0.65_0.18_220))]" />
        <CardContent className="-mt-12 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar className="h-24 w-24 ring-4 ring-card">
              <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold">
                  {user?.first_name} {user?.last_name}
                </h2>
                {profile?.status === "approved" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{profile?.business_name}</div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {user?.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {user?.phone}
                </span>
              </div>
            </div>
            <div className="flex gap-6">
              <Stat label="Jobs done" value={profile?.total_jobs_completed ?? 0} />
              <Stat
                label="Rating"
                value={
                  <>
                    <Star className="inline h-4 w-4 fill-warning text-warning" />{" "}
                    {profile?.average_rating ?? "New"}
                  </>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Section title="Business details" icon={Building2}>
          <Row label="Business name" value={profile?.business_name ?? "—"} />
          <Row label="Registration" value={profile?.business_registration_number ?? "—"} />
          <Row
            label="Experience"
            value={profile?.years_of_experience ? `${profile.years_of_experience} years` : "—"}
          />
        </Section>
        <Section title="Service area" icon={MapPin}>
          <Row label="City" value={profile?.service_area_city ?? "—"} />
          <Row label="State" value={profile?.service_area_state ?? "—"} />
          <Row
            label="Provider class"
            value={profile?.equipment_class ? `Class ${profile.equipment_class}` : "Unassigned"}
          />
        </Section>

        <Section title="Equipment evidence" icon={Award} className="lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={equipmentName}
              onChange={(event) => setEquipmentName(event.target.value)}
              placeholder="Equipment name"
              className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm"
            />
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Add evidence image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={uploading}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  if (!equipmentName.trim()) return toast.error("Enter the equipment name first");
                  setUploading(true);
                  try {
                    await uploadProviderEquipmentImage(file, { equipmentName });
                    setEquipmentName("");
                    toast.success("Equipment evidence uploaded");
                    await router.invalidate();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Upload failed");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </label>
          </div>
          {equipment.length === 0 ? (
            <p className="text-sm text-muted-foreground">No equipment evidence uploaded.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {equipment.map((item: ProviderEquipment) => (
                <li key={item.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{item.equipment_name}</div>
                    <div className="text-xs capitalize text-muted-foreground">
                      Quantity {item.quantity} · {item.verification_status}
                    </div>
                    {item.admin_notes && (
                      <p className="text-xs text-destructive">Admin: {item.admin_notes}</p>
                    )}
                  </div>
                  {item.storage_path && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          window.open(
                            await getProviderEquipmentSignedUrl(item),
                            "_blank",
                            "noopener,noreferrer",
                          );
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Unable to open image",
                          );
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {item.verification_status !== "approved" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={async () => {
                        try {
                          await deleteProviderEquipment(item);
                          toast.success("Equipment removed");
                          await router.invalidate();
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Delete failed");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="font-display text-xl font-bold">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
function Section({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: typeof Building2;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}
