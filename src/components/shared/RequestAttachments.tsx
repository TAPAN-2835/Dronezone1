import { useCallback, useEffect, useState } from "react";
import { Eye, FileText, Loader2, Paperclip, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteRequestAttachment,
  getRequestAttachmentSignedUrl,
  listRequestAttachments,
  uploadRequestAttachment,
  type RequestAttachment,
} from "@/lib/api/storage";

export function RequestAttachments({
  requestId,
  canUpload = false,
  canDelete = false,
  refreshKey = 0,
}: {
  requestId: string;
  canUpload?: boolean;
  canDelete?: boolean;
  refreshKey?: number;
}) {
  const [items, setItems] = useState<RequestAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listRequestAttachments(requestId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load attachments");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const view = async (item: RequestAttachment) => {
    try {
      window.open(await getRequestAttachmentSignedUrl(item), "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open attachment");
    }
  };

  return (
    <div className="space-y-3">
      {canUpload && (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary">
          {progress > 0 && progress < 100 ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {progress > 0 && progress < 100 ? `Uploading ${progress}%` : "Add image or PDF"}
          <input
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            disabled={progress > 0 && progress < 100}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              try {
                setProgress(1);
                await uploadRequestAttachment(requestId, file, { onProgress: setProgress });
                toast.success("Attachment uploaded");
                await load();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Upload failed");
              } finally {
                setProgress(0);
              }
            }}
          />
        </label>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading attachments…
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No attachments uploaded.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
              {item.mime_type === "application/pdf" ? (
                <FileText className="h-4 w-4 text-primary" />
              ) : (
                <Paperclip className="h-4 w-4 text-primary" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{item.file_name}</div>
                <div className="text-xs text-muted-foreground">
                  {(item.file_size / 1048576).toFixed(2)} MB
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => void view(item)} title="Open">
                <Eye className="h-4 w-4" />
              </Button>
              {canDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={async () => {
                    try {
                      await deleteRequestAttachment(item);
                      toast.success("Attachment deleted");
                      await load();
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Delete failed");
                    }
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
