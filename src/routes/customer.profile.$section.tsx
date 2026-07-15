import { definePage, Link } from "@/lib/router";
import { ArrowLeft } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { getCustomerProfile } from "@/lib/api/customer";
import { UnavailableModule } from "@/components/shared/UnavailableModule";

const titles: Record<string, string> = {
  personal: "Personal Details",
  business: "Business Details",
  certifications: "Certifications",
  areas: "Service Areas",
  documents: "Documents",
  bank: "Bank Details",
  "amc-prefs": "AMC Preferences",
  notifications: "Notification Preferences",
  support: "Help & Support",
};
export const Page = definePage("/customer/profile/$section")({
  head: ({ params }) => ({ meta: [{ title: `${params.section} — Profile` }] }),
  loader: () => getCustomerProfile(),
  component: Section,
});
function Section() {
  const section = Page.useParams().section ?? "";
  const data = Page.useLoaderData<Awaited<ReturnType<typeof getCustomerProfile>>>();
  const title = titles[section] || "Profile";
  let content: React.ReactNode;
  if (section === "personal")
    content = (
      <>
        <Panel>
          <Row label="Full name" value={`${data.account.first_name} ${data.account.last_name}`} />
          <Row label="Email" value={data.account.email} />
          <Row label="Phone" value={data.account.phone} />
          <Row
            label="Member since"
            value={new Date(data.account.created_at).toLocaleDateString("en-IN")}
          />
        </Panel>
        <Panel title="My drones">
          {data.drones.map((d: any) => (
            <div key={d.id} className="border-t py-3 first:border-0">
              <div className="font-semibold">
                {d.manufacturer} {d.model}
              </div>
              <div className="text-xs text-muted-foreground">
                {d.serial_number} · Warranty: {d.warranty_status}
              </div>
            </div>
          ))}
        </Panel>
      </>
    );
  else if (section === "areas")
    content = (
      <Panel title="Saved addresses">
        {data.addresses.map((a: any) => (
          <div key={a.id} className="border-t py-3 first:border-0">
            <div className="font-semibold">{a.label || "Address"}</div>
            <div className="text-sm text-muted-foreground">
              {[a.address_line_1, a.address_line_2, a.city, a.state, a.postal_code]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        ))}
      </Panel>
    );
  else if (section === "amc-prefs")
    content = (
      <Panel>
        <Row label="Current plan" value={data.subscription?.amc_plans?.name || "No plan"} />
        <Row
          label="Status"
          value={data.subscription?.status?.replaceAll("_", " ") || "Not subscribed"}
        />
        <Row label="Auto renewal" value={data.subscription?.auto_renew ? "Enabled" : "Disabled"} />
      </Panel>
    );
  else if (section === "support")
    content = (
      <Panel>
        <p className="text-sm text-muted-foreground">
          Contact details must be configured by the deployment owner. No demo contact information is
          shown.
        </p>
      </Panel>
    );
  else
    content = (
      <UnavailableModule
        title={`${title} is not configured`}
        reason="The current approved database schema has no secure fields for this section. Demo values were removed."
      />
    );
  return (
    <CustomerShell title={title} showBack>
      <div className="space-y-4 px-5 py-5">
        <Link
          to="/customer/profile"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Profile
        </Link>
        {content}
      </div>
    </CustomerShell>
  );
}
function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4 text-sm">
      {title && <div className="font-semibold">{title}</div>}
      {children}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium capitalize">{value}</div>
    </div>
  );
}
