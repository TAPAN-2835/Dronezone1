# DroneZone Phase 2A Storage Completion Report

## 1. Starting commit hash

`07becb0309ae2fac91809cc1dacfbb014450dc93` on `main`.

## 2. Tables added

The forward migration `SQL Schema/phase_3_storage_metadata.sql` adds:

- `provider_documents` with private object metadata and admin verification state;
- `provider_equipment` with quantity, evidence image metadata and verification state;
- `request_attachments` linked to the owning service request and uploader.

It also adds useful ownership/status indexes, existing `updated_at` triggers,
restrictive RLS, safe grants, `can_access_request_files`, and admin-only
`review_provider_document` / `review_provider_equipment` RPCs.

## 3. Buckets added

`SQL Schema/phase_4_storage_buckets_and_policies.sql` creates or hardens three
private buckets:

- `provider-verification` (10 MiB; PDF/JPEG/PNG)
- `provider-equipment` (8 MiB; JPEG/PNG/WebP)
- `request-attachments` (10 MiB; PDF/JPEG/PNG/WebP)

## 4. Storage policies added

- Provider bucket writes are restricted to the provider's `auth.uid()` folder.
- Verification/equipment reads are owner-or-admin only.
- Approved provider evidence cannot be deleted through the metadata workflow.
- Request attachment uploads require the authenticated customer folder and an
  owned request ID.
- Request reads require request ownership, an active assignment, or admin role.
- Cleanup of an orphan object is allowed after a failed metadata insert while
  preserving metadata ownership checks for normal deletion.
- No bucket is public and filenames are never authorization inputs.

## 5. Frontend routes integrated

- `/app/verification`: live provider status, document upload, progress,
  validation, signed preview, admin notes and unapproved delete/resubmission.
- `/app/profile`: live provider profile plus equipment evidence upload, signed
  preview, status/admin notes and unapproved deletion.
- `/customer/new-request`: optional multi-file selection; the request is created
  transactionally before attachments are uploaded and partial upload failure is
  reported without losing the request.
- Customer, provider and admin request detail routes use the shared private
  attachment list and short-lived signed links.

## 6. Admin review functionality

The admin provider detail loader reads provider documents/equipment under RLS,
opens evidence through signed URLs, displays status and notes, and calls
admin-only RPCs for approve/reject decisions. Existing provider approval and
class-assignment RPC actions remain intact.

## 7. Customer request attachments

Customers can upload JPEG, PNG, WebP and PDF evidence during request creation or
from their request detail page. Only the owner may delete metadata. Assigned
providers and admins receive read-only signed access. The service uses generated
UUID object names under `{customer_id}/{request_id}/` and keeps original names
only in metadata.

## 8. Remaining mock upload actions

- The legacy protected `/app/signup` source still contains filename-only demo
  controls, but it is no longer imported at runtime. `/app/signup` redirects to
  the canonical authenticated `/app/verification` flow.
- Grievance, chat, marketing and AMC file placeholders remain out of scope because
  their database modules do not exist.

## 9. Security-test status

`tests/sql/phase2a_storage_security_test.sql` covers metadata cross-user
isolation, assigned-provider access, admin review, anonymous denial, invalid MIME,
oversized files and duplicate paths. It also documents SDK checks for upload
cleanup, metadata cleanup and signed URL expiry. The user has since confirmed the
Phase 2A migrations were executed in the development project; the standalone SQL
security test still requires an explicit disposable-project run.

## 10. Lint status

Passed with zero errors. The existing 15 Fast Refresh export warnings remain.

## 11. TypeScript status

`npx tsc --noEmit` passed after all storage and route changes.

## 12. Build status

`npm run build` passed with Vite 7.3.5. The existing large-bundle warning remains.

## 13. Migration execution instructions

In the Supabase development project's SQL Editor, execute exactly in this order:

1. `SQL Schema/phase_3_storage_metadata.sql`
2. `SQL Schema/phase_4_storage_buckets_and_policies.sql`

Do not rerun or edit the already-executed Phase 1 files. Stop on any error and
capture the exact statement/error before creating a separate forward fix.

## 14. Remaining risks

- Storage policies and signed URLs still require authenticated cross-user verification in the development project.
- The SQL harness assumes the deterministic Phase 1 test identities/fixtures.
- Supabase JavaScript upload does not expose byte-level progress; the UI reports
  validated/uploaded/metadata-complete milestones.
- Object and metadata cleanup should be tested with injected failures after migration.
- The legacy `/app/signup` UI should be removed in a later UI-only cleanup.
- Browser smoke tests require the new migrations and role-specific test sessions.

## 15. Final commit hash

Pending local commit. No push will be performed.
