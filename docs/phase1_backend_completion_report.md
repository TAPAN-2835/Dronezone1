# DroneZone Phase 1 Backend Completion Report

## 1. Starting commit hash

`e7bb73a46d12e60074022c93177abeb2aed6bf4c` on `main`.

## 2. Existing schema confirmed

The contract audit covers all 11 application tables, 10 enums, foreign keys,
provisioning trigger, legacy RLS policies, and frontend usage. See
`docs/backend_phase1_audit.md`. The legacy schema snapshot contains one known
stale index statement for the removed `customer_profiles.status` column; no
previously executed SQL file was modified.

## 3. RLS policies added

`SQL Schema/phase_1_rls_hardening.sql` is a forward-only migration that:

- replaces blanket authenticated policies with owner/role/assignment policies;
- limits `users` browser access to safe columns (never `password_hash`);
- makes request/assignment/history lifecycle changes RPC-only;
- limits provider access to customers, addresses and drones attached to active jobs;
- limits customer provider visibility to a safe RPC projection;
- prevents anonymous application-table access;
- enforces one active role and one active assignment with partial unique indexes;
- adds an explicit validated `public.users.id -> auth.users.id` foreign key;
- uses SECURITY DEFINER predicate helpers to avoid recursive RLS evaluation.

## 4. Role helper functions

- `get_current_user_role()` uses `auth.uid() -> user_roles -> roles` and active
  database records only.
- `get_my_auth_context()` returns the authoritative role and profile-provisioned state.
- `is_current_user_admin()` and narrowly scoped assignment/ownership predicate
  helpers support policies without trusting mutable Auth metadata.
- `handle_new_user()` permits self-provisioning only for customer/provider roles,
  pins `search_path`, safely generates fallback values and provisions the profile.

## 5. RPC functions created

The forward migration `SQL Schema/phase_2_core_workflow_rpcs.sql` provides:

1. `submit_service_request`
2. `review_service_request`
3. `approve_service_request`
4. `reject_service_request`
5. `assign_provider`
6. `provider_accept_assignment`
7. `provider_reject_assignment`
8. `start_job`
9. `update_job_timeline`
10. `complete_job`
11. `approve_provider`
12. `reject_provider`
13. `assign_provider_class`

It also provides the safe customer projection
`get_assigned_provider_for_request`. All public workflow entrypoints validate
`auth.uid()`, active database role, ownership, prior status and required input;
they use a pinned search path and grant execution only to `authenticated`.

## 6. Frontend services changed

- Added `src/lib/api/auth.ts` for authoritative database auth context.
- Added consistent `callRpc()` error handling in `src/lib/api/shared.ts`.
- Customer request submission now calls `submit_service_request`.
- Admin and provider lifecycle services now use RPCs rather than direct updates.
- Queries joining `users` explicitly select safe columns.
- Customer request details load the safe provider projection and status history.
- Provider job details load assignment status history.

## 7. Customer screens integrated

- Live drones, addresses and active categories remain owner-protected reads.
- Fixed the invalid `addresses.deleted_at` filter (the table has no such column).
- New request submission now enters `in_approval` transactionally.
- Request list/detail and status tracking use live rows.
- Assigned provider business name, provider class, rating/phone projection,
  provider notes and assignment history are available without broad profile access.
- Cancellation was not added because the approved RPC lifecycle does not yet
  define a safe cancellation transition.

## 8. Admin screens integrated

- Real request search and exact enum status filters.
- Real waiting-for indicator and lifecycle stages.
- Review, approve, reject and approved-provider assignment RPC actions.
- Required rejection reason, disabled/busy states and refresh after success.
- Provider approve/reject and class assignment use admin-only RPCs.

## 9. Provider screens integrated

- Incoming assignment accept/reject uses RPCs and requires a rejection reason.
- Start, timeline/date update and completion use RPCs.
- Completion summary is captured.
- Active/history/job detail reads remain live and job detail shows status history.
- Unsupported hold/resume browser mutations were removed.

## 10. Mock actions removed

- Direct browser assignment and request status updates.
- Direct browser provider verification/classification updates.
- Self-assignment development behavior.
- Simulated customer timeline approval.
- Rendered quotation/fixed-pricing simulation. The mentor-approved quotation
  layout remains dormant in source behind `schemaSupportsQuotations = false`
  because no quotation table exists; it performs no action and renders no UI.

## 11. Remaining unsupported modules

AMC, campaigns, chat persistence, feedback, quotations/fixed pricing,
grievances persistence, notifications and file storage remain outside this
11-table phase.

## 12. RLS test results

`tests/sql/phase1_security_workflow_test.sql` and its local Supabase primitive
bootstrap document repeatable customer A/B, provider A/B, pending-provider and
admin checks. Per user direction, no Docker or external database was used for
the final run. Therefore these execution results are **pending**, not passed.
Apply both migrations to a disposable Supabase development project and execute
the harness before production.

## 13. Workflow test results

The harness covers create -> review -> approve -> assign -> accept -> start ->
timeline -> complete, customer visibility, history creation, cross-provider
access, unapproved-provider assignment and repeated invalid transitions.
Execution against Supabase is **pending** for the same reason above.

## 14. Lint result

Passed with zero errors. Fifteen pre-existing React Fast Refresh export warnings remain.

## 15. TypeScript result

`npx tsc --noEmit` passed.

## 16. Build result

`npm run build` passed with Vite 7.3.5. The existing large-chunk warning remains
(main bundle approximately 1.43 MB before gzip).

## 17. Remaining risks

- Migrations and cross-role tests must run in a safe Supabase development project.
- Target data must pass the one-active-role, one-active-assignment and Auth-orphan preflights.
- The legacy schema snapshot's obsolete customer-status index prevents a clean
  from-zero replay unless that historical statement is skipped; executed SQL remains untouched.
- Quotation code should be physically removed or implemented after its schema is approved.
- Route-level code splitting should address the current bundle-size warning.
- Production rollout needs a rollback window and post-migration role/profile checks.

## 18. Final commit hash

Not committed yet. Current code is based on
`e7bb73a46d12e60074022c93177abeb2aed6bf4c`; update this section after creating
the local commit. No push has been performed.
