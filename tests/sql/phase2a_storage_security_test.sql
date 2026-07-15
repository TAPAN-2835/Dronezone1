\set ON_ERROR_STOP on
-- Run only in the controlled development project after Phase 1 test identities
-- and both Phase 2A migrations exist. All fixture changes are rolled back.
BEGIN;

\set customer_a '10000000-0000-0000-0000-000000000001'
\set customer_b '10000000-0000-0000-0000-000000000002'
\set provider_a '20000000-0000-0000-0000-000000000001'
\set provider_b '20000000-0000-0000-0000-000000000002'
\set admin_user '30000000-0000-0000-0000-000000000001'
\set request_a '71000000-0000-0000-0000-000000000001'
\set request_b '71000000-0000-0000-0000-000000000002'
\set assignment_a '72000000-0000-0000-0000-000000000001'

INSERT INTO public.service_requests (
  id, request_number, customer_id, drone_id, category_id, service_address_id,
  title, description, status
) VALUES
  (:'request_a', 'REQ-STORAGE-A', :'customer_a', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Storage A', 'Attachment isolation A', 'approved'),
  (:'request_b', 'REQ-STORAGE-B', :'customer_b', '50000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'Storage B', 'Attachment isolation B', 'approved');
INSERT INTO public.job_assignments (id, service_request_id, provider_id, assigned_by, status, is_active_assignment)
VALUES (:'assignment_a', :'request_a', :'provider_a', :'admin_user', 'accepted', TRUE);

INSERT INTO public.provider_documents (id, provider_id, document_type, document_name, storage_path, mime_type, file_size) VALUES
  ('73000000-0000-0000-0000-000000000001', :'provider_a', 'dgca_certificate', 'a.pdf', :'provider_a' || '/a.pdf', 'application/pdf', 100),
  ('73000000-0000-0000-0000-000000000002', :'provider_b', 'dgca_certificate', 'b.pdf', :'provider_b' || '/b.pdf', 'application/pdf', 100);
INSERT INTO public.provider_equipment (id, provider_id, equipment_name, storage_path, mime_type, file_size) VALUES
  ('74000000-0000-0000-0000-000000000001', :'provider_a', 'A equipment', :'provider_a' || '/a.jpg', 'image/jpeg', 100),
  ('74000000-0000-0000-0000-000000000002', :'provider_b', 'B equipment', :'provider_b' || '/b.jpg', 'image/jpeg', 100);
INSERT INTO public.request_attachments (id, service_request_id, uploaded_by, storage_path, file_name, mime_type, file_size) VALUES
  ('75000000-0000-0000-0000-000000000001', :'request_a', :'customer_a', :'customer_a' || '/' || :'request_a' || '/a.jpg', 'a.jpg', 'image/jpeg', 100),
  ('75000000-0000-0000-0000-000000000002', :'request_b', :'customer_b', :'customer_b' || '/' || :'request_b' || '/b.jpg', 'b.jpg', 'image/jpeg', 100);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', :'provider_a', TRUE);
SELECT (COUNT(*) = 1)::INTEGER AS provider_document_isolation FROM public.provider_documents \gset
\if :provider_document_isolation \else \echo 'FAIL provider document isolation' \quit 1 \endif
SELECT (COUNT(*) = 1)::INTEGER AS provider_equipment_isolation FROM public.provider_equipment \gset
\if :provider_equipment_isolation \else \echo 'FAIL provider equipment isolation' \quit 1 \endif
SELECT (COUNT(*) = 1)::INTEGER AS assigned_attachment_visible FROM public.request_attachments \gset
\if :assigned_attachment_visible \else \echo 'FAIL assigned attachment visibility' \quit 1 \endif

SELECT set_config('request.jwt.claim.sub', :'provider_b', TRUE);
SELECT (COUNT(*) = 0)::INTEGER AS unrelated_attachment_hidden FROM public.request_attachments \gset
\if :unrelated_attachment_hidden \else \echo 'FAIL unrelated provider attachment access' \quit 1 \endif

SELECT set_config('request.jwt.claim.sub', :'customer_a', TRUE);
SELECT (COUNT(*) = 1)::INTEGER AS customer_attachment_isolation FROM public.request_attachments \gset
\if :customer_attachment_isolation \else \echo 'FAIL customer attachment isolation' \quit 1 \endif
SELECT (COUNT(*) = 0)::INTEGER AS customer_provider_documents_hidden FROM public.provider_documents \gset
\if :customer_provider_documents_hidden \else \echo 'FAIL customer provider-document access' \quit 1 \endif

\set ON_ERROR_STOP off
INSERT INTO public.provider_documents (provider_id, document_type, document_name, storage_path, mime_type, file_size)
VALUES (:'provider_a', 'other', 'bad.exe', :'provider_a' || '/bad.exe', 'application/octet-stream', 10);
\if :ERROR \else \echo 'FAIL invalid document MIME accepted' \quit 1 \endif
INSERT INTO public.request_attachments (service_request_id, uploaded_by, storage_path, file_name, mime_type, file_size)
VALUES (:'request_a', :'customer_a', :'customer_a' || '/' || :'request_a' || '/huge.pdf', 'huge.pdf', 'application/pdf', 10485761);
\if :ERROR \else \echo 'FAIL oversized attachment accepted' \quit 1 \endif
INSERT INTO public.request_attachments (service_request_id, uploaded_by, storage_path, file_name, mime_type, file_size)
VALUES (:'request_a', :'customer_a', :'customer_a' || '/' || :'request_a' || '/a.jpg', 'duplicate.jpg', 'image/jpeg', 100);
\if :ERROR \else \echo 'FAIL duplicate storage path accepted' \quit 1 \endif
\set ON_ERROR_STOP on

SELECT set_config('request.jwt.claim.sub', :'admin_user', TRUE);
SELECT (COUNT(*) = 2)::INTEGER AS admin_documents_visible FROM public.provider_documents \gset
\if :admin_documents_visible \else \echo 'FAIL admin document visibility' \quit 1 \endif
SELECT public.review_provider_document('73000000-0000-0000-0000-000000000001', 'approved');
SELECT public.review_provider_equipment('74000000-0000-0000-0000-000000000001', 'approved');

RESET ROLE;
SET LOCAL ROLE anon;
\set ON_ERROR_STOP off
SELECT * FROM public.provider_documents;
\if :ERROR \else \echo 'FAIL anonymous metadata read allowed' \quit 1 \endif
\set ON_ERROR_STOP on
RESET ROLE;

-- Storage-object alignment and signed URL expiry are SDK integration checks:
-- 1. upload a valid object and force metadata insert failure; assert the object is removed;
-- 2. delete an unapproved item; assert both object and metadata disappear;
-- 3. create a 5-second signed URL, assert immediate 200 then expiry denial after 6 seconds.

ROLLBACK;
\echo 'PASS: Phase 2A metadata RLS and constraints'
