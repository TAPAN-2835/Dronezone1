# DroneZone Phase 2A Storage Audit

Baseline: `main` at `07becb0309ae2fac91809cc1dacfbb014450dc93`.

## Current storage contract

The executed 11-table schema has no file metadata tables and no committed
Storage bucket policies. The root has one Supabase browser client and no
storage helper. All private access must therefore be introduced through new
forward migrations and the browser must continue using only the anonymous key
plus the signed-in user's JWT.

## Upload UI inventory

| UI / route                                     | Expected input                                                                 | Owner                | Viewers                            | Sensitive            | Current behavior                                                     | Target behavior                                                                                       | Table                 | Bucket                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------ | -------------------- | ---------------------------------- | -------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------- | ----------------------- |
| Provider multi-step signup (`/app/signup`)     | DGCA certificate, identity proof, optional business registration; PDF/JPEG/PNG | Provider             | Owner, admin                       | Yes                  | Filename-only demo toast; the route duplicates the real signup entry | Keep account creation in `/signup`; upload authenticated verification files from `/app/verification`  | `provider_documents`  | `provider-verification` |
| Provider verification (`/app/verification`)    | Requested/replacement verification documents; PDF/JPEG/PNG                     | Provider             | Owner, admin                       | Yes                  | Local demo status and demo resubmission                              | Load profile/document status, upload replacements, delete pending/rejected files, display admin notes | `provider_documents`  | `provider-verification` |
| Provider profile (`/app/profile`)              | Equipment evidence image; JPEG/PNG/WebP                                        | Provider             | Owner, admin                       | Moderately sensitive | Entire profile/equipment presentation uses demo data                 | Live provider equipment list, image upload, update/delete and verification state                      | `provider_equipment`  | `provider-equipment`    |
| Admin provider detail (`/admin/providers/:id`) | No upload; secure review                                                       | Provider owns source | Admin                              | Yes                  | Static `providerDocs` and mock equipment                             | Live metadata, short-lived signed previews, status/admin notes, admin-only review RPCs                | Both provider tables  | Both provider buckets   |
| Customer new request (`/customer/new-request`) | Issue photos or PDF; JPEG/PNG/WebP/PDF                                         | Customer/request     | Customer, assigned provider, admin | Yes                  | No live upload                                                       | Submit request transaction first, then upload selected files under customer/request path              | `request_attachments` | `request-attachments`   |
| Customer request detail                        | Existing issue evidence                                                        | Customer/request     | Customer, assigned provider, admin | Yes                  | No attachment list                                                   | Live list with signed view/download and owner delete                                                  | `request_attachments` | `request-attachments`   |
| Provider request detail                        | Existing issue evidence                                                        | Customer/request     | Assigned provider, admin           | Yes                  | Reads optional mock `job.attachments`                                | Live metadata and signed URLs for assigned request only                                               | `request_attachments` | `request-attachments`   |
| Admin request detail                           | Existing issue evidence                                                        | Customer/request     | Admin                              | Yes                  | No attachment list                                                   | Live metadata and signed previews                                                                     | `request_attachments` | `request-attachments`   |
| Grievance form                                 | Evidence image/PDF                                                             | Grievance author     | Undefined                          | Yes                  | Plain unused file input                                              | Out of scope because no grievance table exists                                                        | Future                | Future                  |
| Chat/marketing/AMC placeholders                | Various                                                                        | Undefined            | Undefined                          | Varies               | Mock/unimplemented                                                   | Explicitly out of Phase 2A                                                                            | Future                | Future                  |

## File controls

- Verification documents: PDF, JPEG and PNG; maximum 10 MiB.
- Equipment evidence: JPEG, PNG and WebP; maximum 8 MiB.
- Request attachments: PDF, JPEG, PNG and WebP; maximum 10 MiB.
- Storage paths use generated UUID filenames and a MIME-derived extension.
- Original names are metadata only and never authorization input.
- All three buckets remain private; clients receive short-lived signed URLs.

## Signup consolidation decision

`/signup` is the real Supabase provider account flow. `/app/signup` was a legacy
multi-step UI nested inside the protected provider shell and must not create a
second Auth implementation. Its runtime route now redirects to
`/app/verification`, the single authenticated document-upload surface. The old
route source remains only as dormant UI reference and is not imported at runtime.
