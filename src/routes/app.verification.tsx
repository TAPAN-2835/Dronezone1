import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  FileWarning,
  Loader2,
  Shield,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { definePage, Link, useRouter } from "@/lib/router";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProviderDashboard } from "@/lib/api/provider";
import {
  deleteProviderDocument,
  getProviderDocumentSignedUrl,
  listProviderDocuments,
  uploadProviderDocument,
  type ProviderDocument,
  type ProviderDocumentType,
} from "@/lib/api/storage";

export const Page = definePage("/app/verification")({
  head: () => ({ meta: [{ title: "Account Verification — DroneZone" }] }),
  loader: async () => {
    const [{ profile }, documents] = await Promise.all([
      getProviderDashboard(),
      listProviderDocuments(),
    ]);
    return { profile, documents };
  },
  component: VerificationPage,
});

const documentLabels: Record<ProviderDocumentType, string> = {
  dgca_certificate: "DGCA Certificate",
  identity_proof: "Identity Proof",
  business_registration: "Business Registration",
  other: "Other Document",
};

function VerificationPage() {
  const { profile, documents } = Page.useLoaderData();
  const router = useRouter();
  const [uploading, setUploading] = useState<ProviderDocumentType | null>(null);
  const [progress, setProgress] = useState(0);
  const status = profile?.status ?? "pending";
  const rejectedDocument = documents.some(
    (document: ProviderDocument) => document.verification_status === "rejected",
  );
  const Icon =
    status === "approved"
      ? CheckCircle2
      : status === "rejected"
        ? XCircle
        : rejectedDocument
          ? FileWarning
          : Clock;

  const openDocument = async (document: ProviderDocument) => {
    try {
      window.open(await getProviderDocumentSignedUrl(document), "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open document");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <Logo />
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" /> Account Verification
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
        <Card
          className={
            status === "approved"
              ? "border-success/30 bg-success/5"
              : status === "rejected"
                ? "border-destructive/30 bg-destructive/5"
                : "border-warning/30 bg-warning/5"
          }
        >
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-background">
              <Icon className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold capitalize">
              Verification {status.replaceAll("_", " ")}
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground">
              {status === "approved"
                ? "Your provider account is approved."
                : status === "rejected"
                  ? profile?.rejection_reason || "Your provider application needs attention."
                  : "Upload the required documents. Administrators can review only these private files."}
            </p>
            {status === "approved" && (
              <Button asChild>
                <Link to="/app/dashboard">Open dashboard</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Verification Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  "dgca_certificate",
                  "identity_proof",
                  "business_registration",
                ] as ProviderDocumentType[]
              ).map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 text-center hover:border-primary/40"
                >
                  {uploading === type ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">{documentLabels[type]}</span>
                  {uploading === type && (
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                  )}
                  <input
                    className="sr-only"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    disabled={uploading !== null}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      setUploading(type);
                      try {
                        await uploadProviderDocument(file, type, { onProgress: setProgress });
                        toast.success("Document uploaded for review");
                        await router.invalidate();
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Upload failed");
                      } finally {
                        setUploading(null);
                        setProgress(0);
                      }
                    }}
                  />
                </label>
              ))}
            </div>

            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((document: ProviderDocument) => (
                  <li
                    key={document.id}
                    className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{document.document_name}</div>
                      <div className="text-xs capitalize text-muted-foreground">
                        {documentLabels[document.document_type]} · {document.verification_status}
                      </div>
                      {document.admin_notes && (
                        <p className="mt-1 text-xs text-destructive">
                          Admin: {document.admin_notes}
                        </p>
                      )}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => void openDocument(document)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {document.verification_status !== "approved" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={async () => {
                          try {
                            await deleteProviderDocument(document);
                            toast.success("Document removed");
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
