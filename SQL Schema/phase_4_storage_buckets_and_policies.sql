-- DroneZone Phase 2A: private Supabase Storage buckets and object policies.
-- Forward-only. Requires phase_3_storage_metadata.sql.

BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('provider-verification', 'provider-verification', FALSE, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('provider-equipment', 'provider-equipment', FALSE, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('request-attachments', 'request-attachments', FALSE, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS provider_verification_insert_own ON storage.objects;
DROP POLICY IF EXISTS provider_verification_select_authorized ON storage.objects;
DROP POLICY IF EXISTS provider_verification_delete_own ON storage.objects;
DROP POLICY IF EXISTS provider_equipment_insert_own ON storage.objects;
DROP POLICY IF EXISTS provider_equipment_select_authorized ON storage.objects;
DROP POLICY IF EXISTS provider_equipment_delete_own ON storage.objects;
DROP POLICY IF EXISTS request_attachments_insert_customer ON storage.objects;
DROP POLICY IF EXISTS request_attachments_select_authorized ON storage.objects;
DROP POLICY IF EXISTS request_attachments_delete_owner ON storage.objects;

CREATE POLICY provider_verification_insert_own ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'provider-verification'
  AND public.get_current_user_role() = 'provider'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
  AND (
    NOT EXISTS (SELECT 1 FROM public.provider_documents pd WHERE pd.storage_path = name)
    OR EXISTS (SELECT 1 FROM public.provider_documents pd WHERE pd.storage_path = name AND pd.provider_id = auth.uid() AND pd.verification_status IN ('pending', 'rejected'))
  )
);
CREATE POLICY provider_verification_select_authorized ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'provider-verification'
  AND ((storage.foldername(name))[1] = auth.uid()::TEXT OR public.is_current_user_admin())
);
CREATE POLICY provider_verification_delete_own ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'provider-verification'
  AND public.get_current_user_role() = 'provider'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY provider_equipment_insert_own ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'provider-equipment'
  AND public.get_current_user_role() = 'provider'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
  AND (
    NOT EXISTS (SELECT 1 FROM public.provider_equipment pe WHERE pe.storage_path = name)
    OR EXISTS (SELECT 1 FROM public.provider_equipment pe WHERE pe.storage_path = name AND pe.provider_id = auth.uid() AND pe.verification_status IN ('pending', 'rejected'))
  )
);
CREATE POLICY provider_equipment_select_authorized ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'provider-equipment'
  AND ((storage.foldername(name))[1] = auth.uid()::TEXT OR public.is_current_user_admin())
);
CREATE POLICY provider_equipment_delete_own ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'provider-equipment'
  AND public.get_current_user_role() = 'provider'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY request_attachments_insert_customer ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'request-attachments'
  AND public.get_current_user_role() = 'customer'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
  AND public.customer_owns_request(((storage.foldername(name))[2])::UUID)
);
CREATE POLICY request_attachments_select_authorized ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'request-attachments'
  AND EXISTS (
    SELECT 1 FROM public.request_attachments ra
    WHERE ra.storage_path = name AND public.can_access_request_files(ra.service_request_id)
  )
);
CREATE POLICY request_attachments_delete_owner ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'request-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
  AND public.get_current_user_role() = 'customer'
  AND public.customer_owns_request(((storage.foldername(name))[2])::UUID)
  AND (
    NOT EXISTS (SELECT 1 FROM public.request_attachments ra WHERE ra.storage_path = name)
    OR EXISTS (SELECT 1 FROM public.request_attachments ra WHERE ra.storage_path = name AND ra.uploaded_by = auth.uid())
  )
);

COMMIT;
