\set ON_ERROR_STOP on
-- Run only in a disposable Supabase test project after phase1_security_workflow_test.sql
-- and after migrations phase_5 and phase_6. All changes are rolled back.
BEGIN;

\set customer_a '10000000-0000-0000-0000-000000000001'
\set customer_b '10000000-0000-0000-0000-000000000002'
\set provider_a '20000000-0000-0000-0000-000000000001'
\set admin_user '30000000-0000-0000-0000-000000000001'

INSERT INTO public.notifications(recipient_id,notification_type,title,body) VALUES
  (:'customer_a','system','A private','Customer A only'),
  (:'customer_b','system','B private','Customer B only');
INSERT INTO public.amc_plans(id,name,price,duration_months,created_by)
VALUES('70000000-0000-0000-0000-000000000001','Test AMC',1000,12,:'admin_user') ON CONFLICT DO NOTHING;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', :'customer_a', FALSE);

DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM public.notifications WHERE recipient_id='10000000-0000-0000-0000-000000000002') THEN
    RAISE EXCEPTION 'RLS failure: customer A can read customer B notifications';
  END IF;
  IF EXISTS(SELECT 1 FROM public.audit_logs) THEN
    RAISE EXCEPTION 'RLS failure: customer can read audit logs';
  END IF;
END $$;

SELECT (public.create_grievance('Service quality','Test grievance','Security workflow test','medium',NULL,NULL)).id AS grievance_id \gset
SELECT (public.subscribe_amc('70000000-0000-0000-0000-000000000001',false)).id AS subscription_id \gset

\set ON_ERROR_STOP off
SELECT public.subscribe_amc('70000000-0000-0000-0000-000000000001',false);
\if :ERROR
\else
  \echo 'FAIL: duplicate live AMC subscription was allowed'
  \quit 1
\endif
SELECT public.set_service_pricing('60000000-0000-0000-0000-000000000001','category',1000,18,'INR',CURRENT_DATE,NULL,NULL);
\if :ERROR
\else
  \echo 'FAIL: customer changed fixed pricing'
  \quit 1
\endif
\set ON_ERROR_STOP on

SELECT id AS completed_assignment_id FROM public.job_assignments
WHERE service_request_id IN (SELECT id FROM public.service_requests WHERE customer_id=:'customer_a')
  AND status='completed' ORDER BY completed_at DESC LIMIT 1 \gset
\if :{?completed_assignment_id}
  SELECT public.submit_feedback(:'completed_assignment_id',5,'Phase 2 workflow verified',ARRAY['Service Quality']);
  \set ON_ERROR_STOP off
  SELECT public.submit_feedback(:'completed_assignment_id',4,'Duplicate must fail','{}');
  \if :ERROR
  \else
    \echo 'FAIL: duplicate feedback was allowed'
    \quit 1
  \endif
  \set ON_ERROR_STOP on
\else
  \echo 'NOTICE: feedback test skipped because Phase 1 fixture has no completed assignment'
\endif

SELECT set_config('request.jwt.claim.sub', :'provider_a', FALSE);
\set ON_ERROR_STOP off
SELECT public.update_grievance(:'grievance_id','resolved',NULL,NULL,NULL);
\if :ERROR
\else
  \echo 'FAIL: provider executed admin grievance transition'
  \quit 1
\endif
SELECT public.get_admin_analytics();
\if :ERROR
\else
  \echo 'FAIL: provider read admin analytics'
  \quit 1
\endif
\set ON_ERROR_STOP on

SELECT set_config('request.jwt.claim.sub', :'admin_user', FALSE);
SELECT public.set_service_pricing('60000000-0000-0000-0000-000000000001','category',1250,18,'INR',CURRENT_DATE,NULL,NULL);
SELECT public.update_grievance(:'grievance_id','in_progress','high',:'admin_user','Assigned for investigation');
SELECT (public.create_campaign('Phase 2 test','system','customers','Test campaign','Test body',NULL)).id AS campaign_id \gset
SELECT public.queue_campaign(:'campaign_id');
SELECT public.get_admin_analytics();

RESET ROLE;
ROLLBACK;
\echo 'PASS: Phase 2 platform RLS and transactional tests completed'
