import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus, MapPin, Calendar, AlertTriangle, PlusCircle } from "lucide-react";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { toast } from "sonner";
import { createServiceRequest } from "@/lib/api/requests.server";
import { getCustomerAssets, createCustomerAsset } from "@/lib/api/customer.server";

export const Route = createFileRoute("/customer/new-request")({
  head: () => ({ meta: [{ title: "New Request — DroneZone" }] }),
  loader: () => getCustomerAssets(),
  component: () => (
    <CustomerShell title="Raise Service Request" showBack>
      <NewRequest />
    </CustomerShell>
  ),
});

function NewRequest() {
  const nav = useNavigate();
  const router = useRouter();
  const assets = Route.useLoaderData();
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [droneId, setDroneId] = useState(assets.drones[0]?.id || "");
  const [categoryId, setCategoryId] = useState(assets.categories[0]?.id || "");
  const [addressId, setAddressId] = useState(assets.addresses[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!droneId || !categoryId || !addressId || !title || !description) {
        throw new Error("Please fill all required fields.");
      }
      await createServiceRequest({
        data: {
          categoryId,
          droneId,
          title,
          description,
          serviceAddressId: addressId,
        },
      });
      toast.success("Request submitted!");
      nav({ to: "/customer/requests" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addDemoDrone = async () => {
    toast.promise(createCustomerAsset({ data: { type: "drone", model: "DJI Mavic 3 Pro (Demo)" } }), {
      loading: "Adding drone...",
      success: () => {
        router.invalidate();
        return "Demo drone added!";
      },
      error: "Failed to add drone"
    });
  };

  const addDemoAddress = async () => {
    toast.promise(createCustomerAsset({ data: { type: "address", address_line_1: "123 Drone St", city: "Bengaluru" } }), {
      loading: "Adding address...",
      success: () => {
        router.invalidate();
        return "Demo address added!";
      },
      error: "Failed to add address"
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
      <Field label="Service Category">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          required
        >
          <option value="" disabled>Select category...</option>
          {assets.categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>
      <Field 
        label="Drone" 
        rightSlot={
          <button type="button" onClick={addDemoDrone} className="text-xs flex items-center gap-1 text-primary">
            <PlusCircle className="w-3 h-3"/> Add
          </button>
        }
      >
        <select
          value={droneId}
          onChange={(e) => setDroneId(e.target.value)}
          className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          required
        >
          <option value="" disabled>Select your drone...</option>
          {assets.drones.map((d: any) => (
            <option key={d.id} value={d.id}>{d.model}</option>
          ))}
        </select>
        {assets.drones.length === 0 && <div className="text-xs text-destructive mt-1">Please add a drone first.</div>}
      </Field>
      
      <Field label="Issue Title">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Broken propeller"
          className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          required
        />
      </Field>
      <Field label="Problem Description">
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail…"
          className="w-full rounded-xl border bg-card p-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          required
        />
      </Field>
      
      <Field 
        label="Location" 
        icon={<MapPin className="h-4 w-4" />}
        rightSlot={
          <button type="button" onClick={addDemoAddress} className="text-xs flex items-center gap-1 text-primary">
            <PlusCircle className="w-3 h-3"/> Add
          </button>
        }
      >
        <select
          value={addressId}
          onChange={(e) => setAddressId(e.target.value)}
          className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          required
        >
          <option value="" disabled>Select your address...</option>
          {assets.addresses.map((a: any) => (
            <option key={a.id} value={a.id}>{a.address_line_1}, {a.city}</option>
          ))}
        </select>
        {assets.addresses.length === 0 && <div className="text-xs text-destructive mt-1">Please add an address first.</div>}
      </Field>
      <label className="flex items-center gap-3 rounded-xl border bg-card p-3">
        <input
          type="checkbox"
          checked={urgent}
          onChange={(e) => setUrgent(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <AlertTriangle className="h-4 w-4 text-warning" />
        <span className="flex-1 text-sm font-medium">Urgent / Priority Service</span>
      </label>
      <button
        type="submit"
        disabled={loading || assets.drones.length === 0 || assets.addresses.length === 0}
        className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
  icon,
  rightSlot
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {icon}
          {label}
        </div>
        {rightSlot}
      </div>
      {children}
    </div>
  );
}
