-- DroneZone Phase 2A: private file metadata and review RPCs.
-- Forward-only. Requires the successfully executed Phase 1 migrations.

BEGIN;

CREATE TABLE IF NOT EXISTS public.provider_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(user_id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('dgca_certificate', 'identity_proof', 'business_registration', 'other')),
  document_name VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type VARCHAR(100) NOT NULL CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png')),
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.provider_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(user_id) ON DELETE CASCADE,
  equipment_name VARCHAR(150) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 1000),
  storage_path TEXT UNIQUE,
  mime_type VARCHAR(100) CHECK (mime_type IS NULL OR mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  file_size BIGINT CHECK (file_size IS NULL OR (file_size > 0 AND file_size <= 8388608)),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((storage_path IS NULL) = (mime_type IS NULL)),
  CHECK ((storage_path IS NULL) = (file_size IS NULL))
);

CREATE TABLE IF NOT EXISTS public.request_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')),
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_documents_provider_status
  ON public.provider_documents(provider_id, verification_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_provider_equipment_provider_status
  ON public.provider_equipment(provider_id, verification_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_attachments_request
  ON public.request_attachments(service_request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_attachments_uploader
  ON public.request_attachments(uploaded_by);

DROP TRIGGER IF EXISTS trg_provider_documents_updated_at ON public.provider_documents;
CREATE TRIGGER trg_provider_documents_updated_at
  BEFORE UPDATE ON public.provider_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_provider_equipment_updated_at ON public.provider_equipment;
CREATE TRIGGER trg_provider_equipment_updated_at
  BEFORE UPDATE ON public.provider_equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.can_access_request_files(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    public.is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM public.service_requests AS sr
      WHERE sr.id = p_request_id AND sr.customer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.job_assignments AS ja
      WHERE ja.service_request_id = p_request_id
        AND ja.provider_id = auth.uid()
        AND ja.status IN ('pending', 'accepted', 'in_progress', 'on_hold', 'completed')
    ), FALSE
  )
$$;

CREATE OR REPLACE FUNCTION public.review_provider_document(
  p_document_id UUID,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS public.provider_documents
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin UUID := public.require_current_role('admin');
  v_document public.provider_documents;
BEGIN
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Document review status must be approved or rejected';
  END IF;
  IF p_status = 'rejected' AND NULLIF(TRIM(p_admin_notes), '') IS NULL THEN
    RAISE EXCEPTION 'Admin notes are required when rejecting a document';
  END IF;
  UPDATE public.provider_documents
  SET verification_status = p_status,
      admin_notes = NULLIF(TRIM(p_admin_notes), ''),
      verified_by = v_admin,
      verified_at = NOW()
  WHERE id = p_document_id
  RETURNING * INTO v_document;
  IF NOT FOUND THEN RAISE EXCEPTION 'Provider document not found'; END IF;
  RETURN v_document;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_provider_equipment(
  p_equipment_id UUID,
  p_status TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS public.provider_equipment
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin UUID := public.require_current_role('admin');
  v_equipment public.provider_equipment;
BEGIN
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Equipment review status must be approved or rejected';
  END IF;
  IF p_status = 'rejected' AND NULLIF(TRIM(p_admin_notes), '') IS NULL THEN
    RAISE EXCEPTION 'Admin notes are required when rejecting equipment';
  END IF;
  UPDATE public.provider_equipment
  SET verification_status = p_status,
      admin_notes = NULLIF(TRIM(p_admin_notes), ''),
      verified_by = v_admin,
      verified_at = NOW()
  WHERE id = p_equipment_id
  RETURNING * INTO v_equipment;
  IF NOT FOUND THEN RAISE EXCEPTION 'Provider equipment not found'; END IF;
  RETURN v_equipment;
END;
$$;

ALTER TABLE public.provider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_attachments ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.provider_documents, public.provider_equipment, public.request_attachments FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.provider_documents TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.provider_equipment TO authenticated;
GRANT UPDATE (equipment_name, description, quantity) ON public.provider_equipment TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.request_attachments TO authenticated;

CREATE POLICY provider_documents_select_owner_admin ON public.provider_documents
FOR SELECT TO authenticated USING (provider_id = auth.uid() OR public.is_current_user_admin());
CREATE POLICY provider_documents_insert_owner ON public.provider_documents
FOR INSERT TO authenticated WITH CHECK (provider_id = auth.uid() AND public.get_current_user_role() = 'provider' AND verification_status = 'pending' AND verified_by IS NULL AND verified_at IS NULL);
CREATE POLICY provider_documents_delete_owner_unapproved ON public.provider_documents
FOR DELETE TO authenticated USING (provider_id = auth.uid() AND verification_status IN ('pending', 'rejected'));

CREATE POLICY provider_equipment_select_owner_admin ON public.provider_equipment
FOR SELECT TO authenticated USING (provider_id = auth.uid() OR public.is_current_user_admin());
CREATE POLICY provider_equipment_insert_owner ON public.provider_equipment
FOR INSERT TO authenticated WITH CHECK (provider_id = auth.uid() AND public.get_current_user_role() = 'provider' AND verification_status = 'pending' AND verified_by IS NULL AND verified_at IS NULL);
CREATE POLICY provider_equipment_update_owner_unapproved ON public.provider_equipment
FOR UPDATE TO authenticated USING (provider_id = auth.uid() AND verification_status IN ('pending', 'rejected'))
WITH CHECK (provider_id = auth.uid() AND verification_status IN ('pending', 'rejected'));
CREATE POLICY provider_equipment_delete_owner_unapproved ON public.provider_equipment
FOR DELETE TO authenticated USING (provider_id = auth.uid() AND verification_status IN ('pending', 'rejected'));

CREATE POLICY request_attachments_select_authorized ON public.request_attachments
FOR SELECT TO authenticated USING (public.can_access_request_files(service_request_id));
CREATE POLICY request_attachments_insert_customer ON public.request_attachments
FOR INSERT TO authenticated WITH CHECK (
  uploaded_by = auth.uid()
  AND public.get_current_user_role() = 'customer'
  AND EXISTS (SELECT 1 FROM public.service_requests AS sr WHERE sr.id = service_request_id AND sr.customer_id = auth.uid())
);
CREATE POLICY request_attachments_delete_owner ON public.request_attachments
FOR DELETE TO authenticated USING (
  uploaded_by = auth.uid()
  AND EXISTS (SELECT 1 FROM public.service_requests AS sr WHERE sr.id = service_request_id AND sr.customer_id = auth.uid())
);

REVOKE ALL ON FUNCTION public.can_access_request_files(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_provider_document(UUID, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_provider_equipment(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_request_files(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_provider_document(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_provider_equipment(UUID, TEXT, TEXT) TO authenticated;

COMMIT;
