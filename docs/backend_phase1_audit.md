# DroneZone Backend Phase 1 Audit

Audit baseline: `main` at `e7bb73a46d12e60074022c93177abeb2aed6bf4c`.

## Source and verification boundary

The three committed files under `SQL Schema` are the database contract available to this repository. No privileged database connection, service-role credential, Supabase CLI project, or local Supabase stack is committed, so repository inspection can confirm the intended executed contract but cannot prove remote row contents or trigger execution history. The new migrations include preflight checks for assumptions that must be true in the target development database.

## Exact enums

| Enum | Values |
|---|---|
| `provider_status_enum` | `pending`, `in_review`, `approved`, `rejected`, `suspended` |
| `service_request_status_enum` | `draft`, `in_approval`, `review`, `approved`, `rejected`, `in_progress`, `completed`, `cancelled` |
| `job_assignment_status_enum` | `pending`, `accepted`, `rejected`, `in_progress`, `on_hold`, `completed`, `cancelled` |
| `priority_enum` | `low`, `medium`, `high`, `urgent` |
| `urgency_enum` | `normal`, `same_day`, `next_day`, `within_week` |
| `visit_type_enum` | `onsite`, `remote`, `pickup_delivery` |
| `gender_enum` | `male`, `female`, `other`, `prefer_not_to_say` |
| `drone_type_enum` | `quadcopter`, `hexacopter`, `fixed_wing`, `hybrid` |
| `warranty_status_enum` | `active`, `expired`, `unknown` |
| `drone_condition_enum` | `excellent`, `good`, `fair`, `damaged`, `unknown` |

## Exact table and foreign-key contract

| Table | Primary ownership/key relationships | Workflow-relevant fields |
|---|---|---|
| `users` | `id` is populated with `auth.users.id` by `handle_new_user`; no formal Auth FK exists in the old migration | Safe identity fields plus legacy `password_hash`, login tracking, audit actor fields and soft delete |
| `roles` | Unique `name` | Seeded `customer`, `provider`, `admin` |
| `user_roles` | `user_id → users.id`, `role_id → roles.id` | `revoked_at` denotes inactive mapping |
| `addresses` | `user_id → users.id` | Customer-owned service locations |
| `customer_profiles` | Unique `user_id → users.id`; `default_address_id → addresses.id` | Preferences and request counters; no approval/status field |
| `drones` | `owner_id → users.id` | Customer-owned service assets, soft delete |
| `provider_profiles` | Unique `user_id → users.id`; `verified_by`, `created_by`, `updated_by → users.id` | Integer `equipment_class` constrained to 1–3; verification state and counters |
| `service_categories` | Independent lookup | `is_active`, request counter |
| `service_requests` | `customer_id → users.id`, `drone_id → drones.id`, `category_id → service_categories.id`, `service_address_id → addresses.id`; cancellation/review actors → `users.id` | Request lifecycle timestamps, status and priority; no generic `created_by`/`updated_by` and no rejection-reason column |
| `job_assignments` | `service_request_id → service_requests.id`, provider/admin/cancellation actors → `users.id` | Assignment sequence, active flag, provider notes, timeline dates, completion fields and counters |
| `job_status_history` | Mandatory `job_assignment_id → job_assignments.id`; `changed_by → users.id` | Immutable assignment transition log with string statuses, role, source, trigger and notes |

## Auth provisioning

- The existing `on_auth_user_created` trigger inserts a `public.users` row with the same UUID as `auth.users`.
- It assigns one role from `roles` and creates a customer or provider profile.
- Customer accounts do not have or require an admin-approval status.
- The legacy trigger trusts `raw_user_meta_data.role`, which could request `admin`, and it lacks a pinned `search_path`.
- Provider signup sends `businessName` while the old trigger primarily reads `business_name`, causing fallback business names.
- The hardening migration replaces the trigger function, permits only customer/provider self-provisioning, supports both business-name keys, pins `search_path`, and adds a formal Auth foreign key after orphan preflight validation.
- Actual production provisioning success must be verified with controlled test signups after applying the migration in a development project.

## Existing RLS and grants

RLS is enabled on all 11 tables, but the old policies use blanket `USING (TRUE)`/`WITH CHECK (TRUE)` rules for authenticated users. Authenticated users can currently read every user/profile/request/assignment row and directly insert history or mutate requests. No database role helper exists.

The Phase 1 migration removes every old policy, revokes anonymous access and broad authenticated writes, adds `get_current_user_role()` based on active `user_roles → roles`, adds restrictive ownership/role policies, applies safe column grants to `users`, and makes workflow tables read-only outside RPCs except customer-owned draft creation/editing.

## Frontend findings

- The root contains one Supabase browser client and one global AuthProvider.
- No root source reads or validates `public.users.password_hash`.
- No service-role key name or credential appears in root Vite code.
- No localStorage/sessionStorage authentication remains.
- The AuthProvider currently falls back to mutable user metadata if the database role lookup fails; this must be removed.
- Provider status changes, assignment creation and assignment lifecycle changes currently use direct browser updates; these must move to RPCs.
- Several queries use `users(*)`; these must select safe columns explicitly once column privileges hide `password_hash` and login-tracking fields.
- TanStack Start, `createServerFn`, Lovable and Nitro are absent from the canonical root runtime.

## Workflow contract and gaps

- The stored legacy `supabase_schema.sql` creates `idx_customer_profiles_status`
  even though the same file's `customer_profiles` definition no longer contains
  `status`. This historical snapshot is internally inconsistent. It remains
  unchanged because it is recorded as already executed; isolated replay must
  tolerate this one obsolete-index error before applying the removal migration.

The approved core lifecycle is:

`draft → in_approval → review → approved → in_progress → completed`

`rejected` and `cancelled` are terminal request outcomes. Assignment lifecycle is:

`pending → accepted → in_progress → completed`

with `rejected`, `on_hold`, and `cancelled` as supported branch states. Provider rejection returns an approved request to the reassignment pool without rewriting the request to `review`.

Because `job_status_history.job_assignment_id` is mandatory, request submission/review/approval/rejection before assignment cannot be inserted there without changing the table contract. Phase 1 records those transitions in `service_requests` status/timestamps/admin notes. Assignment creation and all provider transitions are written to `job_status_history` atomically.

Other known schema gaps remain out of scope: quotations/fixed pricing, feedback, AMC, grievances, notifications, campaigns, chat persistence and file metadata/storage.
