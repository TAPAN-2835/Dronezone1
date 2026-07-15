# DroneZone Codebase Comparison Report

Audit baseline:

- Canonical application: repository root
- Migration reference: `Drone/Dronezone1-main`
- Database source of truth: `SQL Schema`
- Branch at audit start: `main`
- Commit at audit start: `36897c66762aa4f8f73d27c47bee68ef0260d31b`
- Recursive comparison result: 60 identical files, 59 changed files, 5 root-only files, and 27 Drone-project-only files after excluding dependencies, build output, caches, Git metadata, and environment files.

## 1. Root Project Summary

- **Framework:** Vite 7, React 19, and TypeScript. The root is the current canonical browser application.
- **Dependencies:** React, React DOM, React Router DOM, Radix UI, Tailwind CSS, Lucide, Recharts, Sonner, and supporting UI libraries. The audited root package did not yet include the Supabase JavaScript client.
- **Routing:** React Router DOM routes are assembled in `src/App.tsx`. Pages use the local Vite compatibility helper in `src/lib/router.tsx`; there is no generated TanStack route tree.
- **Auth implementation:** Provider authentication still uses `src/lib/auth-store.ts`, browser `localStorage`, and demo credentials. Customer and admin areas are not backed by one global Supabase session/role guard in the audited version.
- **Supabase implementation:** Supabase URL and anonymous-key variable names exist in the root environment configuration, but the audited root source has no Supabase client, session listener, or database service modules.
- **Mock-data usage:** The application relies extensively on `src/data/admin.ts`, `src/data/customer.ts`, and `src/data/demo.ts`. Several screens also contain static arrays, simulated mutations, and toast-only actions.
- **Build configuration:** `vite.config.ts`, `index.html`, and `src/main.tsx` form a standard Vite entry path. The root configuration intentionally contains no TanStack Start, Nitro, or Lovable plugin.

## 2. Drone Folder Summary

- **Framework:** `Drone/Dronezone1-main` is an older TanStack Start application with generated file-based routing. It also contains Lovable-specific and Nitro/Vercel configuration.
- **Dependencies:** It adds `@supabase/supabase-js`, TanStack Router, TanStack Start, TanStack Query, a TanStack Vite router plugin, Lovable Vite configuration, and Nitro. Those framework packages are not compatible with the canonical Vite routing architecture as a direct copy.
- **Routing:** Routes use `createFileRoute`, generated `routeTree.gen.ts`, `src/router.tsx`, `src/start.ts`, and `src/server.ts`. These files must not replace the Vite entry point or React Router route map.
- **Auth implementation:** `src/lib/auth-store.tsx` introduces a Supabase-backed AuthProvider, session restoration, an auth-state listener, logout, and a role value. Its role is read mainly from user metadata rather than the executed `user_roles`/`roles` tables. Some Drone files still import the former localStorage auth API, and `routes/login.tsx` calls a `login` method that the new AuthProvider does not expose.
- **Supabase implementation:** `src/lib/supabase.ts` provides one browser client. Customer, provider, request, and admin query modules are present under `src/lib/api`, but they are implemented as TanStack Start `createServerFn` modules and must be converted to Vite-compatible service modules.
- **Backend/server changes:** The `.server.ts` modules contain reusable query and mutation logic, but they use the public browser Supabase client. They are not a trusted server boundary. Authorization currently depends on frontend/server-function checks while the database RLS policies remain overly permissive.
- **Migration-related files:** The reference contains duplicate auth-trigger and customer-status migration files, a storage-policy SQL file not found in the root SQL source-of-truth folder, `updated_er_diagram.md`, and a top-level schema copy. The storage SQL execution state is not proven by the repository contents.

## 3. File Comparison Matrix

The matrix groups files only where every file in the group has the same comparison result and recommended action.

| File                                                                                               | Root Status                                      | Drone Status                                                     | Difference                                                                                             | Recommended Action        |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------- |
| `index.html`                                                                                       | Present, canonical Vite entry                    | Absent                                                           | Required by Vite                                                                                       | Keep Root                 |
| `src/main.tsx`                                                                                     | Present, canonical Vite bootstrap                | Absent                                                           | Drone uses TanStack Start bootstrap files                                                              | Keep Root                 |
| `src/App.tsx`                                                                                      | Present, React Router route map                  | Absent                                                           | Drone uses generated file routes                                                                       | Merge Both                |
| `src/lib/router.tsx`                                                                               | Present, Vite route compatibility helper         | Absent                                                           | Drone loaders depend on TanStack route APIs                                                            | Merge Both                |
| `src/lib/auth-store.ts`                                                                            | Present, localStorage/demo auth                  | Absent                                                           | Obsolete after Supabase AuthProvider integration                                                       | Delete Obsolete Root File |
| `src/lib/supabase.ts`                                                                              | Absent                                           | Present                                                          | Single browser Supabase client                                                                         | Copy from Drone           |
| `src/lib/auth-store.tsx`                                                                           | Absent                                           | Present                                                          | Supabase session provider; needs database role lookup and Vite integration                             | Merge Both                |
| `src/lib/api/admin.server.ts`                                                                      | Absent                                           | Present                                                          | Live queries wrapped in TanStack Start server functions                                                | Merge Both                |
| `src/lib/api/customer.server.ts`                                                                   | Absent                                           | Present                                                          | Live queries wrapped in TanStack Start server functions                                                | Merge Both                |
| `src/lib/api/provider.server.ts`                                                                   | Absent                                           | Present                                                          | Live queries wrapped in TanStack Start server functions; includes a development self-assignment action | Merge Both                |
| `src/lib/api/requests.server.ts`                                                                   | Absent                                           | Present                                                          | Live request detail query wrapped in a TanStack Start server function                                  | Merge Both                |
| `src/lib/api/example.functions.ts`                                                                 | Absent                                           | Present                                                          | Scaffold/example logic with no production purpose                                                      | Ignore Drone Version      |
| `src/lib/config.server.ts`                                                                         | Absent                                           | Present                                                          | TanStack server-only configuration                                                                     | Ignore Drone Version      |
| `src/lib/error-capture.ts`, `src/lib/error-page.ts`                                                | Absent                                           | Present                                                          | TanStack/Lovable error scaffolding                                                                     | Ignore Drone Version      |
| `src/router.tsx`, `src/routes/__root.tsx`, `src/routeTree.gen.ts`, `src/start.ts`, `src/server.ts` | Absent                                           | Present                                                          | TanStack Start runtime and generated routing                                                           | Ignore Drone Version      |
| `.lovable/project.json`, `bun.lock`, `bunfig.toml`                                                 | Absent                                           | Present                                                          | Lovable/Bun project metadata not used by npm/Vite root                                                 | Ignore Drone Version      |
| `package.json`                                                                                     | Vite/React Router dependencies                   | TanStack Start/Lovable dependencies plus Supabase                | Add only the required Supabase dependency                                                              | Merge Both                |
| `package-lock.json`                                                                                | Root npm lockfile                                | Different framework lockfile                                     | Must be regenerated from the merged root package                                                       | Merge Both                |
| `vite.config.ts`                                                                                   | Vite React configuration                         | Lovable/TanStack/Nitro configuration                             | Drone version is incompatible with the canonical runtime                                               | Keep Root                 |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`                                         | Present                                          | Identical                                                        | No migration change                                                                                    | Keep Root                 |
| `eslint.config.js`                                                                                 | Vite-root version                                | Formatting/config difference                                     | No required Drone behavior identified                                                                  | Keep Root                 |
| `.gitignore`                                                                                       | Root rules                                       | Drone rules differ                                               | Root must additionally protect Vite environment files                                                  | Merge Both                |
| Root environment file                                                                              | Present; key names match Vite Supabase variables | Drone environment excluded                                       | Secrets must never be copied or printed                                                                | Keep Root                 |
| `src/layouts/AdminShell.tsx`                                                                       | Root UI and navigation                           | Adds Supabase role guard/logout                                  | Preserve UI and port auth behavior                                                                     | Merge Both                |
| `src/layouts/AppShell.tsx`                                                                         | Root provider UI and navigation                  | Adds Supabase role guard/logout                                  | Preserve UI and port auth behavior                                                                     | Merge Both                |
| `src/layouts/CustomerShell.tsx`                                                                    | Root customer UI and navigation                  | Adds Supabase role guard/logout                                  | Preserve UI and port auth behavior                                                                     | Merge Both                |
| `src/layouts/RoleSwitcher.tsx`                                                                     | Present                                          | Functionally identical after router normalization                | Framework import differs only                                                                          | Keep Root                 |
| `src/routes/customer.dashboard.tsx`                                                                | Static root page                                 | Drone adds live customer/profile/request loader                  | Port loader without TanStack APIs                                                                      | Merge Both                |
| `src/routes/customer.requests.index.tsx`                                                           | Static root page                                 | Drone adds live request list                                     | Port loader without TanStack APIs                                                                      | Merge Both                |
| `src/routes/customer.requests.$requestId.tsx`                                                      | Static root page                                 | Drone adds live request detail                                   | Port loader without TanStack APIs                                                                      | Merge Both                |
| `src/routes/customer.new-request.tsx`                                                              | UI flow uses demo assets                         | Drone adds live assets and request creation                      | Preserve workflow and port Supabase calls                                                              | Merge Both                |
| `src/routes/customer.login.tsx`, `src/routes/customer.onboarding.tsx`                              | Non-Supabase flow                                | Drone adds Supabase sign-in/sign-up                              | Port to the global Vite auth implementation                                                            | Merge Both                |
| `src/routes/app.dashboard.tsx`                                                                     | Static provider dashboard                        | Drone adds live profile/jobs/requests                            | Port live loader; omit development self-assignment                                                     | Merge Both                |
| `src/routes/app.requests.index.tsx`, `src/routes/app.requests.$requestId.tsx`                      | Static/demo request screens                      | Drone adds provider request queries and mutations                | Port live portions; retain UI carefully                                                                | Merge Both                |
| `src/routes/app.jobs.$jobId.tsx`, `src/routes/app.active.tsx`, `src/routes/app.history.tsx`        | Static/demo job screens                          | Drone adds live assignment/job queries                           | Port loaders without TanStack APIs                                                                     | Merge Both                |
| `src/routes/admin.dashboard.tsx`                                                                   | Static dashboard                                 | Drone adds live summary query                                    | Preserve UI and port live loader                                                                       | Merge Both                |
| `src/routes/admin.requests.index.tsx`, `src/routes/admin.requests.$requestId.tsx`                  | Static/demo screens                              | Drone adds live request queries                                  | Port live loaders                                                                                      | Merge Both                |
| `src/routes/admin.providers.index.tsx`, `src/routes/admin.providers.$providerId.tsx`               | Static/demo screens                              | Drone adds provider queries and review mutation                  | Port live portions                                                                                     | Merge Both                |
| `src/routes/admin.users.index.tsx`, `src/routes/admin.users.$userId.tsx`                           | Static/demo screens                              | Drone adds user queries                                          | Port live loaders                                                                                      | Merge Both                |
| `src/routes/admin.jobs.index.tsx`, `src/routes/admin.jobs.$jobId.tsx`                              | Static/demo screens                              | Drone adds job queries                                           | Port live loaders                                                                                      | Merge Both                |
| Remaining changed root routes                                                                      | Present and Vite-compatible                      | Mostly framework-import or formatting changes; some retain mocks | No verified migration behavior worth replacing                                                         | Keep Root                 |
| `src/routes/admin.analytics.tsx`                                                                   | Uses existing root data module                   | Drone removes an import while retaining derived values           | Drone version risks broken/incomplete data mapping                                                     | Keep Root                 |
| `src/data/admin.ts`, `src/data/customer.ts`, `src/data/demo.ts`                                    | Present with current UI-compatible types/data    | Formatting or small type differences                             | Still needed by non-live modules during incremental backend work                                       | Keep Root                 |
| Shared UI, components, hooks, styles, Logo, utilities (60 identical files)                         | Present                                          | Identical                                                        | No content difference                                                                                  | Keep Root                 |
| `Drone/updated_er_diagram.md`                                                                      | No root docs copy                                | Present                                                          | Useful migration documentation matching the current table set                                          | Copy from Drone           |
| `Drone/supabase_schema.sql`                                                                        | Equivalent schema exists under `SQL Schema`      | Present                                                          | Duplicate database source                                                                              | Ignore Drone Version      |
| Drone auth-trigger and status-migration SQL copies                                                 | Canonical copies exist under `SQL Schema`        | Present                                                          | Duplicate migration files                                                                              | Ignore Drone Version      |
| `supabase_storage_schema.sql`                                                                      | Absent from root SQL folder                      | Present                                                          | Private bucket policies; execution status and policy safety require review                             | Manual Review Required    |
| `src/routes/admin.disputes.tsx`, `src/routes/app.schedule.tsx`, `src/routes/README.md`             | Absent                                           | Present                                                          | Route/scaffold additions are not part of the verified Vite route map                                   | Manual Review Required    |

No working root source file is recommended for deletion merely because it is absent from Drone. The only obsolete root deletion is the localStorage authentication store after its Supabase replacement is integrated and all imports are removed.

## 4. Database Integration Review

### SQL source of truth

`SQL Schema` contains three files, all inspected in full:

1. `supabase_schema.sql`
2. `supabase_auth_trigger.sql`
3. `supabase_migration_remove_customer_status.sql`

The schema defines 11 application tables: `users`, `roles`, `user_roles`, `addresses`, `customer_profiles`, `drones`, `provider_profiles`, `service_categories`, `service_requests`, `job_assignments`, and `job_status_history`.

### Enums, indexes, and triggers

- Ten custom enums cover roles, verification, service requests, priority, provider classes, service types, assignments, jobs, address types, and drone status.
- The schema includes UUID and business-key indexes, role and relationship indexes, status indexes, and request/job lookup indexes.
- `updated_at` triggers are attached to mutable tables.
- A request-number sequence and trigger generate service request identifiers.
- A Supabase Auth trigger provisions `public.users`, a user role, and the matching customer/provider profile from `auth.users` metadata.
- Seed data creates standard roles and service categories.

### Compatibility findings

- The auth trigger uses the placeholder `supabase-auth` for the legacy non-null `password_hash` column. Frontend code must never read, create, or validate passwords in `public.users`.
- The current schema text creates an index on `customer_profiles(status)` although the table definition no longer includes that column. The later migration explicitly removes the column and its enum. Because the migrations were already executed successfully, these files must not be rerun or rewritten casually; a future clean-install migration should correct this history separately.
- `project_summary.md` mentions quotation work, but the inspected schema does not define a quotations table. Quotation UI cannot be considered database-ready.
- No SQL RPC functions or Edge Functions are defined in the inspected source-of-truth files.

### RLS review

RLS is enabled, but the inspected policies are broadly permissive for authenticated users. Several tables allow authenticated users to read or mutate records beyond their own role or ownership. Frontend role guards are therefore not sufficient security. Restrictive ownership and admin policies are a P0 follow-up before production use.

### Storage review

The Drone reference includes SQL for a private `verification_docs` bucket. It is not in the root SQL source-of-truth directory, and repository evidence does not prove it was executed. Its provider insert policy also requires ownership/path review, while its admin policy trusts auth metadata rather than the canonical database role mapping. It should remain a reviewed, pending migration rather than being executed or treated as complete.

## 5. Risk Report

- **Overwriting recent UI work:** Directly copying Drone routes would restore TanStack APIs and could overwrite mentor-approved Vite UI changes. All live behavior must be ported manually.
- **Duplicate authentication systems:** Root localStorage auth and Drone Supabase auth currently represent two incompatible sources of truth. The final root must retain only Supabase Auth.
- **Duplicate Supabase clients:** Importing client creation into multiple services would cause divergent session handling. One shared client is required.
- **Outdated imports:** Drone pages import `@tanstack/react-router`, generated `Route` objects, and `.server` modules. Those imports cannot enter the Vite root unchanged.
- **Incompatible framework files:** Lovable configuration, Nitro, TanStack Start bootstrap files, and the generated route tree would break the canonical Vite architecture.
- **Broken routes:** Loader-dependent Drone pages cannot work until their data-loading contract is adapted to React Router/Vite. The Drone generic login route also calls a missing AuthProvider method.
- **Outdated lockfile:** The Drone lockfile represents a different framework. The root lockfile must be updated only by npm from the merged root package.
- **Environment-variable issues:** The environment key names are correct, but the audited root filename is `env` rather than a Vite-recognized `.env`. It must be normalized without displaying, overwriting, or committing its values.
- **Service-role exposure:** No service-role variable was found in the inspected environment key names or source. Only the anonymous browser key may be used by the Vite frontend.
- **Duplicate mock/live data:** Many routes combine live loaders with static display values or toast-only actions. Each remaining mock must be documented and replaced phase by phase.
- **Weak database authorization:** Current RLS policies do not adequately enforce row ownership or role boundaries. Client-side checks and role-aware services are usability controls, not a security boundary.
- **Schema/frontend mismatch:** Quotations have UI but no table; storage execution is unverified; and the historical customer-status index conflicts with the final table shape.
- **Development-only mutations:** Drone contains a provider self-assignment helper. It must not be merged into the canonical application.

## 6. Planned Vite Conversion

- Keep Vite, React Router DOM, `index.html`, `src/main.tsx`, and the root route map.
- Add only `@supabase/supabase-js` from the Drone dependency set.
- Create one Supabase client and one AuthProvider with session restoration, session change handling, logout, and database-backed role lookup.
- Replace the localStorage provider authentication store and remove all imports of it.
- Convert reusable Drone `.server.ts` query logic into ordinary Vite client service modules. These use the anonymous client and therefore require correct RLS; sensitive admin transitions remain future RPC/Edge Function work.
- Adapt live route loaders and mutations to the Vite route compatibility layer while preserving existing UI and navigation.
- Keep static data only for modules that are not yet supported by the final database schema, and enumerate every remaining mock in `NEXT_BACKEND_STEPS.md`.
- Do not execute SQL or copy environment secrets during the merge.
