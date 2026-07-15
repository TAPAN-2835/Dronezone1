# DroneZone Backend Integration — Next Steps

This plan is based on the final canonical Vite root after the Drone migration merge. It does not treat the `Drone` reference folder, `project_summary.md`, or unexecuted SQL as proof of live functionality.

## 1. Current Completed State

- **Frontend modules:** Customer, provider, and admin portal route structures and responsive UI are present in the root Vite application.
- **Database schema:** The executed schema source defines 11 application tables, 10 enums, indexes, lifecycle triggers, request numbering, seed roles/categories, and the Supabase Auth provisioning trigger.
- **Supabase integration:** One browser client exists at `src/lib/supabase.ts`. No service-role credential is used by the frontend.
- **Authentication:** One global `AuthProvider` restores the Supabase session, listens for auth changes, signs out, and resolves the active role from `user_roles` joined to `roles`, with metadata only as a compatibility fallback.
- **Profile synchronization:** The inspected Auth trigger provisions `public.users`, `user_roles`, and the corresponding customer/provider profile after an Auth signup.
- **Request creation:** Customer assets load from Supabase and `src/lib/api/requests.ts` inserts a real `service_requests` row for the authenticated customer.
- **Build status:** `npm install`, TypeScript, lint, production build, and Vite dev startup complete successfully. Lint has no errors and retains Fast Refresh warnings.
- **Live modules:** Sign-in, sign-up, password reset request, logout, session restoration, role guards, customer dashboard/request list/request detail/assets/request creation, provider dashboard/assignments/active/history/job detail/status updates, and admin dashboard/users/providers/requests/jobs reads are connected to Supabase services.
- **Remaining mock modules:** AMC, quotations, feedback, chat, notifications, grievances, campaigns/marketing, much of analytics, file uploads, provider equipment/documents, and several dashboard chart/summary values still use local data or simulated actions.

## 2. Backend Gap Analysis

| Module                    | Frontend Complete | Database Ready              | Auth Ready | API/Service Ready  | Live Data Ready | Remaining Work                                                                                   |
| ------------------------- | ----------------- | --------------------------- | ---------- | ------------------ | --------------- | ------------------------------------------------------------------------------------------------ |
| Authentication            | Yes               | Yes                         | Yes        | Yes                | Partial         | Harden role provisioning failures, remove metadata fallback after data cleanup, add auth tests   |
| Customer Profile          | Yes               | Yes                         | Yes        | Partial            | Partial         | Add read/update service and field mapping for all profile sections                               |
| Customer Drones           | Partial           | Yes                         | Yes        | Read only          | Partial         | Build create/edit/archive UI and validated mutations                                             |
| Addresses                 | Partial           | Yes                         | Yes        | Read only          | Partial         | Build create/edit/default/archive workflow                                                       |
| Service Requests          | Yes               | Yes                         | Yes        | Create/list/detail | Partial         | Submit-for-approval, cancellation, attachments, atomic workflow RPCs                             |
| Request Details           | Yes               | Yes                         | Yes        | Yes                | Partial         | Normalize assignment/provider joins and add live timeline/attachments                            |
| Provider Requests         | Yes               | Yes                         | Yes        | Yes                | Partial         | Move accept/reject transitions into RPCs and enforce RLS                                         |
| Job Assignments           | Yes               | Yes                         | Yes        | Partial            | Partial         | Admin assignment RPC, active-assignment constraint handling, audit/history writes                |
| Job Status History        | UI partial        | Yes                         | Yes        | No                 | No              | Add transition service/RPC and timeline reads                                                    |
| Provider Verification     | Yes               | Yes                         | Yes        | Partial            | Partial         | Correct document workflow, reason capture, atomic approval/rejection                             |
| Provider Equipment        | Yes               | No dedicated table          | Yes        | No                 | No              | Confirm whether equipment belongs in a new table or profile JSON/fields; migrate before API work |
| Provider Documents        | Yes               | No metadata table           | Yes        | No                 | No              | Add document metadata table and verified private Storage policies                                |
| Fixed Pricing             | UI partial        | No quotation/pricing table  | Yes        | No                 | No              | Design pricing/quotation tables and approval lifecycle                                           |
| Timeline Updates          | Yes               | `job_status_history` exists | Yes        | No                 | No              | Add validated transition RPC and render recorded events                                          |
| Feedback                  | Yes               | No feedback table           | Yes        | No                 | No              | Add schema, one-feedback-per-completed-job rule, service and RLS                                 |
| Notifications             | Yes               | No notification table       | Yes        | No                 | No              | Add schema, delivery preferences, Realtime subscription, read state                              |
| AMC                       | Yes               | No AMC tables               | Yes        | No                 | No              | Design plans, subscriptions, entitlements, renewals and billing integration                      |
| Admin User Management     | Yes               | Yes                         | Yes        | Read only          | Partial         | Add safe suspend/reactivate/audit operations through RPC or Edge Function                        |
| Admin Provider Management | Yes               | Yes                         | Yes        | Read/update        | Partial         | Move verification to atomic RPC; add class assignment and document review                        |
| Admin Request Monitoring  | Yes               | Yes                         | Yes        | Read only          | Partial         | Add review/approve/reject/assign operations and live status counts                               |
| Campaigns                 | Yes               | No                          | Yes        | No                 | No              | Add campaign/audience/delivery schema or external messaging service                              |
| Analytics                 | Yes               | Source tables partial       | Yes        | Partial counts     | Partial         | Replace hard-coded metrics; add SQL views/RPC aggregates and date filters                        |
| Grievances                | Yes               | No grievances table         | Yes        | No                 | No              | Add cases, comments, ownership, status history and escalation schema                             |
| File Storage              | UI partial        | Bucket SQL is unverified    | Yes        | No                 | No              | Review and execute a new safe migration, add metadata, signed URLs and upload services           |
| Audit Logs                | No dedicated UI   | Only per-row audit columns  | Yes        | No                 | No              | Add append-only audit event table/triggers and admin read policy                                 |

## 3. Remaining Mock Data

No application auth code uses `localStorage` or `sessionStorage`. The following root files still use static arrays, demo modules, simulated state, or toast-only actions:

| File or screen                                                     | Remaining mock behavior                                                                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/admin.ts`                                                | Static admin requests, users, providers, grievances, analytics, marketing and chart fixtures                                          |
| `src/data/customer.ts`                                             | Static customer, AMC, request, timeline, invoice and feedback fixtures                                                                |
| `src/data/demo.ts`                                                 | Static provider, jobs, notifications, quotations, chat, charts and status labels                                                      |
| `src/components/layout/AppShell.tsx`                               | Provider identity and notification badge still come from demo data                                                                    |
| `src/components/shared/GrievanceForm.tsx`                          | Submission is a toast-only action with a fake reference                                                                               |
| `src/components/shared/StatusBadge.tsx`                            | Labels/types are sourced from the demo module                                                                                         |
| `src/routes/admin.analytics.tsx`                                   | Analytics cards/charts are static                                                                                                     |
| `src/routes/admin.categories.tsx`                                  | Category/model management uses static data/actions                                                                                    |
| `src/routes/admin.dashboard.tsx`                                   | Primary totals are live; bottlenecks, charts, recent requests and quick stats remain static                                           |
| `src/routes/admin.grievances.tsx`, `admin.grievances.$id.tsx`      | Static grievance list/detail/actions                                                                                                  |
| `src/routes/admin.jobs.$id.tsx`                                    | Live job record with shared formatting data; timeline/actions are incomplete                                                          |
| `src/routes/admin.marketing.tsx`                                   | Static campaigns and simulated campaign actions                                                                                       |
| `src/routes/admin.providers.tsx`, `admin.providers.$id.tsx`        | Live provider records; some derived display fields and review toasts remain UI-only                                                   |
| `src/routes/admin.users.$id.tsx`                                   | Live user/request data with static presentation assumptions                                                                           |
| `src/routes/app.chat.tsx`                                          | Static threads/messages/jobs                                                                                                          |
| `src/routes/app.dashboard.tsx`                                     | Live counts/jobs; chart series, notifications and revenue remain demo data                                                            |
| `src/routes/app.history.tsx`                                       | Live assignments; rating values and some revenue assumptions are not schema-backed                                                    |
| `src/routes/app.notifications.tsx`                                 | Local notification array and simulated read state                                                                                     |
| `src/routes/app.profile.tsx`                                       | Static provider profile                                                                                                               |
| `src/routes/app.quotations.tsx`                                    | Entire quotation history is static; no quotation table exists                                                                         |
| `src/routes/app.requests.$id.tsx`                                  | Live assignment and accept/reject; quotation, customer-response simulation, timeline revision and conversion actions remain simulated |
| `src/routes/app.signup.tsx`                                        | Legacy parallel provider signup screen has simulated submission/upload behavior and should be consolidated with `/signup`             |
| `src/routes/app.verification.tsx`                                  | Verification status controls, uploads, resubmission and support actions are simulated                                                 |
| `src/routes/customer.amc.tsx`                                      | Static plan and toast-only renew/schedule/download/ticket actions                                                                     |
| `src/routes/customer.chat.tsx`                                     | Static messages and a demo lifecycle selector                                                                                         |
| `src/routes/customer.dashboard.tsx`                                | Profile and requests are live; AMC card remains static                                                                                |
| `src/routes/customer.invoices.tsx`                                 | Static invoices                                                                                                                       |
| `src/routes/customer.notifications.tsx`                            | Static notifications/read state                                                                                                       |
| `src/routes/customer.profile.tsx`, `customer.profile.$section.tsx` | Static profile and local edit behavior                                                                                                |
| `src/routes/customer.rate.tsx`                                     | Feedback submission is toast-only; no feedback table exists                                                                           |
| `src/routes/customer.requests.$id.tsx`                             | Request is live; provider relationship/timeline support is incomplete                                                                 |
| `src/routes/signup.tsx`                                            | Auth signup is live; document upload buttons only simulate upload                                                                     |

`src/components/ui/sidebar.tsx` also generates a random skeleton width for visual loading polish; this is not business data.

## 4. Required Supabase Services

### Direct Supabase queries

- Customer profile, drones, addresses, service categories, owned request lists/details.
- Provider profile, owned assignments, active/history lists, and job details.
- Admin read-only tables and safe aggregate views after restrictive admin RLS exists.
- Notifications and timeline reads once their tables/services are implemented.

### RPC functions

- Use transactions for lifecycle transitions, assignment changes, audit/history inserts, and any multi-table counters.
- Validate the caller's database role, record ownership, allowed prior status, target status, and audit actor in SQL.
- Do not trust route guards or `user_metadata` for privileged decisions.

### Edge Functions

- Admin invitations or privileged account operations requiring the Supabase Admin API.
- Notification email/SMS/push dispatch and webhook handling.
- Malware/content validation for uploaded documents if required.
- Payment/billing webhooks if AMC or paid quotations are introduced.

### Storage buckets

- `provider-verification` private bucket for identity, certification and business documents.
- `provider-equipment` private or controlled-public bucket for equipment evidence.
- `request-attachments` private bucket scoped to customer, assigned provider and admin.
- Store ownership and business linkage in a database metadata table; issue short-lived signed URLs.

### Realtime subscriptions

- Assignment creation/status changes for providers.
- Service request/job timeline updates for customers and admins.
- Notifications and chat only after role/ownership RLS is verified.

### RLS policies

- Replace all broad `authenticated` policies with ownership and role-aware policies.
- Centralize role checks in a stable SQL helper that reads active `user_roles`, not mutable JWT metadata.
- Test cross-customer, cross-provider, provider-to-admin and customer-to-admin access explicitly.

## 5. Recommended Backend Phases

### Phase 1 — Authentication Hardening

- Session restoration
- Protected routes
- Role guards
- Logout
- Auth loading states
- Admin authentication
- Provisioning failure monitoring and cross-role tests

### Phase 2 — Customer Live Integration

- Profile
- Drones
- Addresses
- Create request
- Request listing
- Request details
- Cancellation
- Feedback

### Phase 3 — Admin Request Workflow

- Request review
- Request approval/rejection
- Provider assignment
- Workflow status tracking

### Phase 4 — Provider Job Workflow

- Incoming assignments
- Accept/reject
- Fixed pricing
- Timeline updates
- Active jobs
- Completion
- History

### Phase 5 — Storage

- Provider documents
- Equipment images
- Request attachments
- Private buckets
- Signed URLs

### Phase 6 — Secondary Modules

- Notifications
- AMC
- Grievances
- Campaigns
- Analytics

### Phase 7 — Security and Testing

- RLS
- Cross-role access tests
- Workflow tests
- Error handling
- Build/deployment

RLS hardening for the tables already used by the browser should begin in Phase 1 and be completed before broader live rollout; it must not wait until the end merely because final regression testing is listed in Phase 7.

## 6. Required RPC Functions

The following recommendations are supported by the existing 11-table schema:

| Function                     | Existing tables used                                                             | Purpose                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `submit_service_request`     | `service_requests`, `customer_profiles`, `drones`, `addresses`                   | Atomically validate ownership and move a draft into approval                                 |
| `review_service_request`     | `service_requests`, `job_status_history`                                         | Record admin review and actor                                                                |
| `approve_service_request`    | `service_requests`, `job_status_history`                                         | Enforce review-to-approved transition                                                        |
| `reject_service_request`     | `service_requests`, `job_status_history`                                         | Record rejection and reason                                                                  |
| `assign_provider`            | `service_requests`, `job_assignments`, `provider_profiles`, `job_status_history` | Verify provider approval, deactivate prior assignment if allowed, create the next assignment |
| `provider_accept_assignment` | `job_assignments`, `service_requests`, `job_status_history`                      | Enforce provider ownership and pending-to-accepted transition                                |
| `provider_reject_assignment` | `job_assignments`, `service_requests`, `job_status_history`                      | Reject with reason and return the request for reassignment                                   |
| `update_job_timeline`        | `job_assignments`, `job_status_history`                                          | Record allowed status/timeline changes with actor and notes                                  |
| `start_job`                  | `job_assignments`, `service_requests`, `job_status_history`                      | Set timestamps and in-progress statuses atomically                                           |
| `complete_job`               | `job_assignments`, `service_requests`, `job_status_history`, `provider_profiles` | Complete the job/request and update provider counters atomically                             |
| `approve_provider`           | `provider_profiles`, `users`                                                     | Record verifier, timestamp and approved state                                                |
| `reject_provider`            | `provider_profiles`, `users`                                                     | Record verifier, rejection state and reason                                                  |
| `assign_provider_class`      | `provider_profiles`                                                              | Validate and set `equipment_class` from 1 to 3                                               |

`submit_feedback` is intentionally excluded because the final schema has no feedback table. Fixed-pricing/quotation RPCs are also excluded until quotation tables exist.

## 7. RLS Matrix

The permissions below are the required target policy. The current SQL is more permissive and must be replaced by a reviewed migration.

| Table                | Customer permissions                                               | Provider permissions                                                                                                 | Admin permissions                                             |
| -------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `users`              | Select/update own safe profile columns                             | Select/update own safe profile columns; select assigned customer's contact fields through a controlled view/RPC only | Select users; privileged updates through RPC/Edge Function    |
| `roles`              | Select role names only                                             | Select role names only                                                                                               | Select/manage only through controlled migration/admin service |
| `user_roles`         | Select own active role                                             | Select own active role                                                                                               | Select all; grant/revoke through privileged RPC               |
| `addresses`          | CRUD own non-deleted addresses                                     | Select service address only for an active assigned job                                                               | Select all; update only for support/audit cases               |
| `customer_profiles`  | Select/update own profile                                          | Select limited assigned-customer profile through view/RPC                                                            | Select/update all                                             |
| `drones`             | CRUD own drones                                                    | Select drone for assigned jobs                                                                                       | Select/update all for support                                 |
| `provider_profiles`  | Select approved public provider fields relevant to own assignments | Select/update own non-verification fields                                                                            | Select/update verification, class and suspension fields       |
| `service_categories` | Select active categories                                           | Select active categories                                                                                             | Full CRUD with audit controls                                 |
| `service_requests`   | Create/select/update own drafts; cancellation through RPC          | Select only assigned requests; workflow changes through RPC                                                          | Select all; review/approve/reject/assign through RPC          |
| `job_assignments`    | Select assignments belonging to own requests                       | Select own assignments; respond/update through RPC                                                                   | Select all; create/reassign through RPC                       |
| `job_status_history` | Select history for own requests                                    | Select history for own assignments; insert only through transition RPC                                               | Select all; inserts only through audited RPC                  |

## 8. File-by-File Implementation Plan

### Phase 1

- `src/lib/auth-store.tsx`: remove metadata fallback after role data cleanup; expose provisioning errors.
- `src/App.tsx`: add an explicit forbidden page and preserve requested return URL.
- `src/routes/login.tsx`, `src/routes/customer.login.tsx`: consolidate login UX and error handling.
- `SQL Schema/new_rls_hardening_migration.sql`: add ownership policies and role helper after review.
- Add auth/role guard tests beside the app test configuration.

### Phase 2

- `src/lib/api/customer.ts`: profile, drone, address mutations and cancellation/read normalization.
- `src/lib/api/requests.ts`: replace direct insert with `submit_service_request` RPC when ready.
- `src/routes/customer.profile.tsx`, `customer.profile.$section.tsx`: live profile forms.
- `src/routes/customer.new-request.tsx`: attachment support and submitted/draft choice.
- `src/routes/customer.requests.tsx`, `customer.requests.$id.tsx`: live lifecycle and cancellation.
- `src/routes/customer.rate.tsx`: implement only after feedback schema exists.

### Phase 3

- `src/lib/api/admin.ts`: call request review/approve/reject/assign RPCs.
- `src/routes/admin.requests.tsx`, `admin.requests.$id.tsx`: wire actions and live filters.
- `src/routes/admin.dashboard.tsx`: replace bottlenecks and recent requests with aggregate service data.

### Phase 4

- `src/lib/api/provider.ts`: replace direct status updates with provider RPCs and add timeline reads.
- `src/routes/app.requests.index.tsx`, `app.requests.$id.tsx`: remove simulated quotation/customer response.
- `src/routes/app.active.tsx`, `app.jobs.$id.tsx`, `app.history.tsx`: use timeline/completion RPCs.
- Add quotation/pricing migrations and services only after the data model is approved.

### Phase 5

- Add reviewed storage migration under `SQL Schema` rather than copying the Drone SQL blindly.
- `src/routes/signup.tsx`, `src/routes/app.verification.tsx`: real private uploads and metadata rows.
- `src/routes/customer.new-request.tsx`, `customer.requests.$id.tsx`: request attachments and signed URLs.
- Add `src/lib/api/storage.ts` for scoped upload, list, delete and signed URL operations.

### Phase 6

- Replace `src/data/admin.ts`, `src/data/customer.ts`, and `src/data/demo.ts` consumers module by module.
- Implement services/routes for notifications, AMC, grievances, campaigns, chat and analytics.
- Update `src/components/layout/AppShell.tsx` to use the authenticated provider and live notification count.

### Phase 7

- Add integration tests for `src/lib/api/*.ts`, role guards, route loaders and error boundaries.
- Add SQL/RLS tests for every row in the matrix.
- Add deployment environment validation and production error monitoring.

## 9. Priority

| Priority     | Tasks                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0 Critical  | Restrictive RLS, workflow RPCs, auth provisioning/role tests, remove simulated provider workflow actions, verify Storage policies before uploads |
| P1 Important | Customer profile/drones/addresses, admin workflow, provider timeline/completion, notification schema, aggregate dashboards, audit logging        |
| P2 Optional  | AMC, campaigns, advanced analytics, chat, marketing automation, UI-only export conveniences                                                      |

## 10. Estimated Sequence

1. Freeze and test the current 11-table contract; write an RLS migration and automated cross-role SQL tests.
2. Harden Auth and provisioning, then verify customer/provider/admin test accounts and refresh persistence.
3. Complete owned customer data and the full request lifecycle through transactional RPCs.
4. Complete admin review/assignment, then provider response/start/timeline/completion against the same transition rules.
5. Approve missing schemas for feedback, quotations/pricing, documents, equipment and grievances before wiring their UIs.
6. Implement private Storage and signed URLs after policy tests pass.
7. Replace secondary mock modules, then run full workflow, security, build and deployment regression tests.

Each checkpoint should ship only after its schema migration, RLS tests, service code, UI error states and production build pass together. This avoids presenting a UI-wired phase as backend-complete.

## 11. Risks

- **Schema/frontend mismatch:** Existing screens reference quotations, ratings, documents, equipment and grievances that do not have final tables.
- **Missing RLS:** Broad authenticated policies currently permit cross-role or cross-owner access.
- **Duplicate auth state:** The localStorage auth store is removed, but the two login UIs should still be consolidated to prevent behavioral drift.
- **Partial profile provisioning:** Trigger failure or incomplete metadata can leave Auth and public profile rows inconsistent.
- **Service-role exposure:** Never add a service-role key to Vite variables or browser code; privileged calls belong in Edge Functions.
- **Mock/live data inconsistency:** Several live pages still mix database records with static chart, rating, notification or workflow values.
- **Incorrect status transitions:** Direct browser updates can bypass allowed prior-state checks unless moved to RPCs.
- **Broken route guards:** Metadata fallback can disagree with revoked database roles; database role remains authoritative.
- **PostgREST relationship assumptions:** Some nested joins need verification against actual foreign-key relationship names.
- **Historical migration inconsistency:** The source schema references a removed customer status index and should not be rerun as a clean migration without repair.
- **Dependency audit:** npm currently reports one low and two high dependency vulnerabilities; review with `npm audit` and upgrade deliberately rather than applying a forced update blindly.

## 12. Recommended Next Antigravity Prompts

### 1. Auth hardening

> Audit the final root Vite app and executed DroneZone SQL. Implement a reviewed Supabase RLS hardening migration for all 11 tables, add database-role-only guards, provisioning error handling, auth loading/forbidden states, and customer/provider/admin cross-role tests. Do not expose service-role credentials or modify already executed migrations; create a new forward migration.

### 2. Customer APIs

> Complete Phase 2 in the canonical root: live customer profile, drones, addresses, submit/list/detail/cancel service requests, and robust error/loading states. Use ownership RLS and transactional RPCs where lifecycle changes span tables. Preserve the current Vite UI and remove only the mock data replaced by verified live services.

### 3. Admin request workflow

> Implement transactional admin request review, approval, rejection and provider assignment using the existing service_requests, provider_profiles, job_assignments and job_status_history tables. Add SQL RPCs with allowed-state validation and wire the existing admin request screens without reintroducing TanStack Start.

### 4. Provider workflow

> Complete the provider assignment workflow in the root Vite app: incoming assignments, accept/reject, start, on-hold, timeline updates, completion and history. Move direct status mutations into role-checked RPCs, remove all simulated customer-response controls, and add workflow tests.

### 5. Storage

> Design and implement a new forward migration for private provider verification documents, equipment images and request attachments. Review the Drone storage SQL only as reference. Add metadata ownership, restrictive policies, scoped uploads, signed URLs and cross-role tests; never use a service-role key in browser code.

### 6. Notifications and secondary modules

> Using the actual final schema as the baseline, propose and implement migrations plus services for notifications, grievances and AMC first, followed by campaigns and analytics. Replace the corresponding root static data consumers incrementally and document any module that still lacks an approved data model.

### 7. Testing and deployment

> Add a complete DroneZone test and deployment gate: unit tests for services/guards, Supabase RLS cross-role tests, customer-to-admin-to-provider workflow tests, error-state tests, environment validation, lint, TypeScript, production build and deployment smoke tests. Report evidence for each gate and do not claim live success without test accounts.
