import { supabase } from "@/lib/supabase";
import { callRpc, requireRole, requireUser, unwrap } from "./shared";

export type VerificationState = "pending" | "approved" | "rejected";
export type ProviderDocumentType =
  | "dgca_certificate"
  | "identity_proof"
  | "business_registration"
  | "other";

export type ProviderDocument = {
  id: string;
  provider_id: string;
  document_type: ProviderDocumentType;
  document_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  verification_status: VerificationState;
  admin_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
};

export type ProviderEquipment = {
  id: string;
  provider_id: string;
  equipment_name: string;
  description: string | null;
  quantity: number;
  storage_path: string | null;
  mime_type: string | null;
  file_size: number | null;
  verification_status: VerificationState;
  admin_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
};

export type RequestAttachment = {
  id: string;
  service_request_id: string;
  uploaded_by: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

type UploadOptions = { onProgress?: (percent: number) => void };

const documentMime = new Set(["application/pdf", "image/jpeg", "image/png"]);
const equipmentMime = new Set(["image/jpeg", "image/png", "image/webp"]);
const attachmentMime = new Set([...documentMime, "image/webp"]);
const extensionByMime: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function validateFile(file: File, allowed: Set<string>, maxBytes: number) {
  if (!allowed.has(file.type)) throw new Error("Unsupported file type");
  if (!file.size || file.size > maxBytes)
    throw new Error(`File must be smaller than ${Math.round(maxBytes / 1048576)} MB`);
}

function uniquePath(prefix: string, file: File) {
  const extension = extensionByMime[file.type];
  if (!extension) throw new Error("Unsupported file type");
  return `${prefix}/${crypto.randomUUID()}.${extension}`;
}

async function uploadObject(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (percent: number) => void,
) {
  onProgress?.(10);
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  onProgress?.(75);
}

async function cleanupObject(bucket: string, path: string) {
  await supabase.storage.from(bucket).remove([path]);
}

async function signedUrl(bucket: string, path: string, expiresIn = 300) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function uploadProviderDocument(
  file: File,
  documentType: ProviderDocumentType,
  options: UploadOptions = {},
) {
  const user = await requireRole("provider");
  validateFile(file, documentMime, 10 * 1048576);
  const path = uniquePath(user.id, file);
  await uploadObject("provider-verification", path, file, options.onProgress);
  try {
    const row = unwrap(
      await supabase
        .from("provider_documents")
        .insert({
          provider_id: user.id,
          document_type: documentType,
          document_name: file.name.slice(0, 255),
          storage_path: path,
          mime_type: file.type,
          file_size: file.size,
        })
        .select()
        .single(),
    );
    options.onProgress?.(100);
    return row as ProviderDocument;
  } catch (error) {
    await cleanupObject("provider-verification", path);
    throw error;
  }
}

export async function listProviderDocuments(providerId?: string) {
  const user = await requireUser();
  const rows = unwrap(
    await supabase
      .from("provider_documents")
      .select("*")
      .eq("provider_id", providerId ?? user.id)
      .order("created_at", { ascending: false }),
  );
  return (rows ?? []) as ProviderDocument[];
}

export async function deleteProviderDocument(document: ProviderDocument) {
  await requireRole("provider");
  const removed = await supabase.storage
    .from("provider-verification")
    .remove([document.storage_path]);
  if (removed.error) throw new Error(removed.error.message);
  unwrap(await supabase.from("provider_documents").delete().eq("id", document.id));
}

export const getProviderDocumentSignedUrl = (document: ProviderDocument, expiresIn = 300) =>
  signedUrl("provider-verification", document.storage_path, expiresIn);

export async function uploadProviderEquipmentImage(
  file: File,
  input: { equipmentName: string; description?: string; quantity?: number },
  options: UploadOptions = {},
) {
  const user = await requireRole("provider");
  validateFile(file, equipmentMime, 8 * 1048576);
  if (!input.equipmentName.trim()) throw new Error("Equipment name is required");
  const path = uniquePath(user.id, file);
  await uploadObject("provider-equipment", path, file, options.onProgress);
  try {
    const row = unwrap(
      await supabase
        .from("provider_equipment")
        .insert({
          provider_id: user.id,
          equipment_name: input.equipmentName.trim(),
          description: input.description?.trim() || null,
          quantity: input.quantity ?? 1,
          storage_path: path,
          mime_type: file.type,
          file_size: file.size,
        })
        .select()
        .single(),
    );
    options.onProgress?.(100);
    return row as ProviderEquipment;
  } catch (error) {
    await cleanupObject("provider-equipment", path);
    throw error;
  }
}

export async function listProviderEquipment(providerId?: string) {
  const user = await requireUser();
  const rows = unwrap(
    await supabase
      .from("provider_equipment")
      .select("*")
      .eq("provider_id", providerId ?? user.id)
      .order("created_at", { ascending: false }),
  );
  return (rows ?? []) as ProviderEquipment[];
}

export async function updateProviderEquipment(
  id: string,
  changes: { equipmentName?: string; description?: string; quantity?: number },
) {
  await requireRole("provider");
  return unwrap(
    await supabase
      .from("provider_equipment")
      .update({
        ...(changes.equipmentName !== undefined && {
          equipment_name: changes.equipmentName.trim(),
        }),
        ...(changes.description !== undefined && { description: changes.description.trim() }),
        ...(changes.quantity !== undefined && { quantity: changes.quantity }),
      })
      .eq("id", id)
      .select()
      .single(),
  ) as ProviderEquipment;
}

export async function deleteProviderEquipment(equipment: ProviderEquipment) {
  await requireRole("provider");
  if (equipment.storage_path) {
    const removed = await supabase.storage
      .from("provider-equipment")
      .remove([equipment.storage_path]);
    if (removed.error) throw new Error(removed.error.message);
  }
  unwrap(await supabase.from("provider_equipment").delete().eq("id", equipment.id));
}

export const getProviderEquipmentSignedUrl = (equipment: ProviderEquipment, expiresIn = 300) => {
  if (!equipment.storage_path) throw new Error("Equipment image is unavailable");
  return signedUrl("provider-equipment", equipment.storage_path, expiresIn);
};

export async function uploadRequestAttachment(
  requestId: string,
  file: File,
  options: UploadOptions = {},
) {
  const user = await requireRole("customer");
  validateFile(file, attachmentMime, 10 * 1048576);
  const path = uniquePath(`${user.id}/${requestId}`, file);
  await uploadObject("request-attachments", path, file, options.onProgress);
  try {
    const row = unwrap(
      await supabase
        .from("request_attachments")
        .insert({
          service_request_id: requestId,
          uploaded_by: user.id,
          storage_path: path,
          file_name: file.name.slice(0, 255),
          mime_type: file.type,
          file_size: file.size,
        })
        .select()
        .single(),
    );
    options.onProgress?.(100);
    return row as RequestAttachment;
  } catch (error) {
    await cleanupObject("request-attachments", path);
    throw error;
  }
}

export async function listRequestAttachments(requestId: string) {
  await requireUser();
  const rows = unwrap(
    await supabase
      .from("request_attachments")
      .select("*")
      .eq("service_request_id", requestId)
      .order("created_at", { ascending: true }),
  );
  return (rows ?? []) as RequestAttachment[];
}

export const getRequestAttachmentSignedUrl = (attachment: RequestAttachment, expiresIn = 300) =>
  signedUrl("request-attachments", attachment.storage_path, expiresIn);

export async function deleteRequestAttachment(attachment: RequestAttachment) {
  await requireRole("customer");
  const removed = await supabase.storage
    .from("request-attachments")
    .remove([attachment.storage_path]);
  if (removed.error) throw new Error(removed.error.message);
  unwrap(await supabase.from("request_attachments").delete().eq("id", attachment.id));
}

export const reviewProviderDocument = (
  id: string,
  status: "approved" | "rejected",
  adminNotes?: string,
) =>
  callRpc("review_provider_document", {
    p_document_id: id,
    p_status: status,
    p_admin_notes: adminNotes?.trim() || null,
  });

export const reviewProviderEquipment = (
  id: string,
  status: "approved" | "rejected",
  adminNotes?: string,
) =>
  callRpc("review_provider_equipment", {
    p_equipment_id: id,
    p_status: status,
    p_admin_notes: adminNotes?.trim() || null,
  });

export type PlatformAttachment = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

async function uploadPlatformAttachment(
  bucket: "feedback-attachments" | "grievance-attachments",
  table: "feedback_attachments" | "grievance_attachments",
  parentColumn: "feedback_id" | "grievance_id",
  parentId: string,
  file: File,
  options: UploadOptions = {},
) {
  const user = await requireUser();
  validateFile(file, attachmentMime, 10 * 1048576);
  const path = uniquePath(`${user.id}/${parentId}`, file);
  await uploadObject(bucket, path, file, options.onProgress);
  try {
    const row = unwrap(
      await supabase
        .from(table)
        .insert({
          [parentColumn]: parentId,
          uploaded_by: user.id,
          storage_path: path,
          file_name: file.name.slice(0, 255),
          mime_type: file.type,
          file_size: file.size,
        })
        .select()
        .single(),
    );
    options.onProgress?.(100);
    return row as PlatformAttachment;
  } catch (error) {
    await cleanupObject(bucket, path);
    throw error;
  }
}

export const uploadFeedbackAttachment = (feedbackId: string, file: File, options?: UploadOptions) =>
  uploadPlatformAttachment(
    "feedback-attachments",
    "feedback_attachments",
    "feedback_id",
    feedbackId,
    file,
    options,
  );

export const uploadGrievanceAttachment = (
  grievanceId: string,
  file: File,
  options?: UploadOptions,
) =>
  uploadPlatformAttachment(
    "grievance-attachments",
    "grievance_attachments",
    "grievance_id",
    grievanceId,
    file,
    options,
  );

export const getFeedbackAttachmentSignedUrl = (item: PlatformAttachment, expiresIn = 300) =>
  signedUrl("feedback-attachments", item.storage_path, expiresIn);
export const getGrievanceAttachmentSignedUrl = (item: PlatformAttachment, expiresIn = 300) =>
  signedUrl("grievance-attachments", item.storage_path, expiresIn);

export async function deletePlatformAttachment(
  bucket: "feedback-attachments" | "grievance-attachments",
  table: "feedback_attachments" | "grievance_attachments",
  item: PlatformAttachment,
) {
  await requireUser();
  const removed = await supabase.storage.from(bucket).remove([item.storage_path]);
  if (removed.error) throw new Error(removed.error.message);
  unwrap(await supabase.from(table).delete().eq("id", item.id));
}
