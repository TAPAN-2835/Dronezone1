\set ON_ERROR_STOP on

-- Deterministic test identities.
\set customer_a '10000000-0000-0000-0000-000000000001'
\set customer_b '10000000-0000-0000-0000-000000000002'
\set provider_a '20000000-0000-0000-0000-000000000001'
\set provider_b '20000000-0000-0000-0000-000000000002'
\set provider_pending '20000000-0000-0000-0000-000000000003'
\set admin_user '30000000-0000-0000-0000-000000000001'

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  (:'customer_a', 'customer-a@test.invalid', '{"role":"customer","first_name":"Customer","last_name":"A","phone":"9000000001"}'),
  (:'customer_b', 'customer-b@test.invalid', '{"role":"customer","first_name":"Customer","last_name":"B","phone":"9000000002"}'),
  (:'provider_a', 'provider-a@test.invalid', '{"role":"provider","first_name":"Provider","last_name":"A","phone":"9000000011","business_name":"Provider A"}'),
  (:'provider_b', 'provider-b@test.invalid', '{"role":"provider","first_name":"Provider","last_name":"B","phone":"9000000012","business_name":"Provider B"}'),
  (:'provider_pending', 'provider-pending@test.invalid', '{"role":"provider","first_name":"Provider","last_name":"Pending","phone":"9000000013","business_name":"Pending Provider"}'),
  (:'admin_user', 'admin@test.invalid', '{"role":"customer","first_name":"Test","last_name":"Admin","phone":"9000000099"}');

UPDATE public.user_roles
SET role_id = (SELECT id FROM public.roles WHERE name = 'admin')
WHERE user_id = :'admin_user';

UPDATE public.provider_profiles
SET status = 'approved', equipment_class = 2
WHERE user_id IN (:'provider_a', :'provider_b');

INSERT INTO public.addresses (id, user_id, address_line_1, city, state, postal_code) VALUES
  ('40000000-0000-0000-0000-000000000001', :'customer_a', 'A Street', 'Pune', 'MH', '411001'),
  ('40000000-0000-0000-0000-000000000002', :'customer_b', 'B Street', 'Mumbai', 'MH', '400001');
INSERT INTO public.drones (id, owner_id, model, manufacturer, serial_number) VALUES
  ('50000000-0000-0000-0000-000000000001', :'customer_a', 'A1', 'Test', 'SERIAL-A'),
  ('50000000-0000-0000-0000-000000000002', :'customer_b', 'B1', 'Test', 'SERIAL-B');
INSERT INTO public.service_categories (id, name, is_active)
VALUES ('60000000-0000-0000-0000-000000000001', 'Repair Test', TRUE);

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', :'customer_a', FALSE);

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.addresses) <> 1 THEN
    RAISE EXCEPTION 'RLS failure: customer A address isolation';
  END IF;
  IF (SELECT COUNT(*) FROM public.drones) <> 1 THEN
    RAISE EXCEPTION 'RLS failure: customer A drone isolation';
  END IF;
  IF EXISTS (SELECT 1 FROM public.customer_profiles WHERE user_id = '10000000-0000-0000-0000-000000000002') THEN
    RAISE EXCEPTION 'RLS failure: customer A can read customer B profile';
  END IF;
END $$;

SELECT (public.submit_service_request(
  '50000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  'Transactional test request',
  'Validate the complete hardened workflow'
)).id AS request_id \gset

\set ON_ERROR_STOP off
INSERT INTO public.job_status_history (
  job_assignment_id, from_status, to_status, changed_by, changed_by_role, change_source
) VALUES (
  uuid_generate_v4(), 'pending', 'accepted', :'customer_a', 'customer', 'browser'
);
\if :ERROR
\else
  \echo 'FAIL: customer inserted job history'
  \quit 1
\endif
\set ON_ERROR_STOP on

SELECT set_config('request.jwt.claim.sub', :'admin_user', FALSE);
SELECT public.review_service_request(:'request_id');
SELECT public.approve_service_request(:'request_id');

\set ON_ERROR_STOP off
SELECT public.assign_provider(:'request_id', :'provider_pending');
\if :ERROR
\else
  \echo 'FAIL: pending provider was assigned'
  \quit 1
\endif
\set ON_ERROR_STOP on

SELECT (public.assign_provider(:'request_id', :'provider_a')).id AS assignment_id \gset

SELECT set_config('request.jwt.claim.sub', :'provider_b', FALSE);
SELECT (COUNT(*) = 0)::INTEGER AS provider_assignment_isolated
FROM public.job_assignments WHERE id = :'assignment_id' \gset
\if :provider_assignment_isolated
\else
  \echo 'FAIL: provider B can read provider A assignment'
  \quit 1
\endif

\set ON_ERROR_STOP off
SELECT public.provider_accept_assignment(:'assignment_id');
\if :ERROR
\else
  \echo 'FAIL: provider B accepted provider A assignment'
  \quit 1
\endif
\set ON_ERROR_STOP on

SELECT set_config('request.jwt.claim.sub', :'provider_a', FALSE);
SELECT public.provider_accept_assignment(:'assignment_id', 'Accepted for service');
SELECT public.start_job(:'assignment_id');
SELECT public.update_job_timeline(:'assignment_id', CURRENT_DATE + 2, 2, 'Parts lead time', 'Customer informed');
SELECT public.complete_job(:'assignment_id', 'Repair and safety checks completed');

\set ON_ERROR_STOP off
SELECT public.provider_accept_assignment(:'assignment_id');
\if :ERROR
\else
  \echo 'FAIL: completed assignment was accepted again'
  \quit 1
\endif
SELECT public.complete_job(:'assignment_id', 'Duplicate completion');
\if :ERROR
\else
  \echo 'FAIL: completed assignment was completed again'
  \quit 1
\endif
\set ON_ERROR_STOP on

SELECT set_config('request.jwt.claim.sub', :'customer_a', FALSE);
SELECT (status = 'completed')::INTEGER AS request_completed
FROM public.service_requests WHERE id = :'request_id' \gset
\if :request_completed
\else
  \echo 'FAIL: customer does not see completed request'
  \quit 1
\endif
SELECT (COUNT(*) >= 5)::INTEGER AS history_complete
FROM public.job_status_history WHERE job_assignment_id = :'assignment_id' \gset
\if :history_complete
\else
  \echo 'FAIL: expected assignment history was not written'
  \quit 1
\endif

RESET ROLE;
\echo 'PASS: Phase 1 RLS and transactional workflow tests completed'
