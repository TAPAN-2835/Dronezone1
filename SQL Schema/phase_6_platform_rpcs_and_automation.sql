-- DroneZone Phase 2: transactional APIs, automation, audit, and private storage.
-- Forward-only migration. Run after phase_5_platform_modules.sql.

BEGIN;

CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_action TEXT, p_entity_type TEXT, p_entity_id UUID,
  p_before JSONB DEFAULT NULL, p_after JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.audit_logs(actor_id, actor_role, action, entity_type, entity_id, before_data, after_data)
  VALUES (auth.uid(), public.get_current_user_role(), p_action, p_entity_type, p_entity_id, p_before, p_after);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_user_notification(
  p_recipient UUID, p_type TEXT, p_title TEXT, p_body TEXT,
  p_link TEXT DEFAULT NULL, p_priority TEXT DEFAULT 'normal',
  p_entity_type TEXT DEFAULT NULL, p_entity_id UUID DEFAULT NULL,
  p_group_key TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE v_id UUID;
BEGIN
  IF p_recipient IS NULL THEN RETURN NULL; END IF;
  INSERT INTO public.notifications(recipient_id, notification_type, title, body, deep_link, priority, entity_type, entity_id, group_key)
  VALUES (p_recipient, p_type, p_title, p_body, p_link, p_priority, p_entity_type, p_entity_id, p_group_key)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_feedback(
  p_assignment_id UUID, p_rating SMALLINT, p_comments TEXT DEFAULT NULL, p_tags TEXT[] DEFAULT '{}'
) RETURNS public.feedback
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE v_assignment public.job_assignments; v_request public.service_requests; v_feedback public.feedback;
BEGIN
  PERFORM public.require_current_role('customer');
  IF p_rating NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'Rating must be between 1 and 5'; END IF;
  SELECT * INTO v_assignment FROM public.job_assignments WHERE id = p_assignment_id FOR UPDATE;
  IF NOT FOUND OR v_assignment.status <> 'completed' THEN RAISE EXCEPTION 'Feedback is allowed only for a completed job'; END IF;
  SELECT * INTO v_request FROM public.service_requests WHERE id = v_assignment.service_request_id;
  IF v_request.customer_id <> auth.uid() THEN RAISE EXCEPTION 'This job does not belong to the current customer'; END IF;
  INSERT INTO public.feedback(job_assignment_id, service_request_id, customer_id, provider_id, rating, comments, tags)
  VALUES (v_assignment.id, v_request.id, auth.uid(), v_assignment.provider_id, p_rating, nullif(btrim(p_comments), ''), coalesce(p_tags, '{}'))
  RETURNING * INTO v_feedback;

  UPDATE public.provider_profiles p SET
    average_rating = s.avg_rating,
    total_reviews = s.total_reviews,
    rating_1_count = s.r1, rating_2_count = s.r2, rating_3_count = s.r3,
    rating_4_count = s.r4, rating_5_count = s.r5,
    updated_at = now()
  FROM (
    SELECT round(avg(rating)::numeric, 2) avg_rating, count(*)::int total_reviews,
      count(*) FILTER (WHERE rating=1)::int r1, count(*) FILTER (WHERE rating=2)::int r2,
      count(*) FILTER (WHERE rating=3)::int r3, count(*) FILTER (WHERE rating=4)::int r4,
      count(*) FILTER (WHERE rating=5)::int r5
    FROM public.feedback WHERE provider_id = v_assignment.provider_id
  ) s WHERE p.user_id = v_assignment.provider_id;

  PERFORM public.create_user_notification(v_assignment.provider_id, 'feedback_received', 'New feedback received',
    'A customer rated a completed job.', '/app/history', 'normal', 'feedback', v_feedback.id, 'feedback');
  PERFORM public.write_audit_log('create', 'feedback', v_feedback.id, NULL, to_jsonb(v_feedback));
  RETURN v_feedback;
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'Feedback has already been submitted for this job';
END;
$$;

CREATE OR REPLACE FUNCTION public.add_feedback_comment(p_feedback_id UUID, p_body TEXT)
RETURNS public.feedback_comments
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE v_feedback public.feedback; v_row public.feedback_comments;
BEGIN
  SELECT * INTO v_feedback FROM public.feedback WHERE id = p_feedback_id;
  IF NOT FOUND OR (auth.uid() NOT IN (v_feedback.customer_id, v_feedback.provider_id) AND NOT public.is_current_user_admin())
    THEN RAISE EXCEPTION 'Feedback is not accessible'; END IF;
  IF length(btrim(p_body)) NOT BETWEEN 1 AND 4000 THEN RAISE EXCEPTION 'Comment must be between 1 and 4000 characters'; END IF;
  INSERT INTO public.feedback_comments(feedback_id, author_id, body) VALUES (p_feedback_id, auth.uid(), btrim(p_body)) RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID, p_read BOOLEAN DEFAULT true)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  UPDATE public.notifications SET read_at = CASE WHEN p_read THEN coalesce(read_at, now()) ELSE NULL END
  WHERE id = p_notification_id AND recipient_id = auth.uid() AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Notification not found'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE public.notifications SET read_at = now() WHERE recipient_id = auth.uid() AND read_at IS NULL AND deleted_at IS NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT; RETURN v_count;
END; $$;

CREATE OR REPLACE FUNCTION public.archive_notification(p_notification_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  UPDATE public.notifications SET archived_at = now() WHERE id = p_notification_id AND recipient_id = auth.uid() AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Notification not found'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.set_service_pricing(
  p_category_id UUID, p_pricing_type TEXT, p_amount NUMERIC, p_tax_percent NUMERIC DEFAULT 18,
  p_currency TEXT DEFAULT 'INR', p_effective_from DATE DEFAULT CURRENT_DATE,
  p_provider_id UUID DEFAULT NULL, p_effective_to DATE DEFAULT NULL
) RETURNS public.service_pricing
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE v_old public.service_pricing; v_row public.service_pricing;
BEGIN
  PERFORM public.require_current_role('admin');
  IF p_amount < 0 OR p_tax_percent NOT BETWEEN 0 AND 100 THEN RAISE EXCEPTION 'Invalid pricing values'; END IF;
  SELECT * INTO v_old FROM public.service_pricing
    WHERE category_id=p_category_id AND pricing_type=p_pricing_type AND provider_id IS NOT DISTINCT FROM p_provider_id AND is_active
    ORDER BY effective_from DESC LIMIT 1 FOR UPDATE;
  IF FOUND THEN
    INSERT INTO public.service_pricing_history(pricing_id,amount,tax_percent,currency,effective_from,effective_to,changed_by)
    VALUES(v_old.id,v_old.amount,v_old.tax_percent,v_old.currency,v_old.effective_from,v_old.effective_to,auth.uid());
    UPDATE public.service_pricing SET amount=p_amount,tax_percent=p_tax_percent,currency=upper(p_currency),
      effective_from=p_effective_from,effective_to=p_effective_to,updated_by=auth.uid(),updated_at=now()
      WHERE id=v_old.id RETURNING * INTO v_row;
  ELSE
    INSERT INTO public.service_pricing(category_id,provider_id,pricing_type,amount,tax_percent,currency,effective_from,effective_to,created_by,updated_by)
    VALUES(p_category_id,p_provider_id,p_pricing_type,p_amount,p_tax_percent,upper(p_currency),p_effective_from,p_effective_to,auth.uid(),auth.uid())
    RETURNING * INTO v_row;
  END IF;
  RETURN v_row;
END; $$;

CREATE OR REPLACE FUNCTION public.snapshot_request_price()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_price public.service_pricing;
BEGIN
  IF NEW.status <> 'draft' AND NEW.fixed_price IS NULL THEN
    SELECT * INTO v_price FROM public.service_pricing
    WHERE category_id=NEW.category_id AND provider_id IS NULL AND is_active
      AND effective_from <= CURRENT_DATE AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
    ORDER BY CASE pricing_type WHEN 'category' THEN 0 WHEN 'repair' THEN 1 ELSE 2 END, effective_from DESC LIMIT 1;
    IF FOUND THEN NEW.fixed_price=v_price.amount; NEW.tax_percent=v_price.tax_percent; NEW.currency=v_price.currency; NEW.pricing_id=v_price.id; END IF;
  END IF;
  IF TG_OP='UPDATE' AND OLD.status <> 'draft' AND (NEW.fixed_price,NEW.tax_percent,NEW.currency,NEW.pricing_id)
    IS DISTINCT FROM (OLD.fixed_price,OLD.tax_percent,OLD.currency,OLD.pricing_id) AND NOT public.is_current_user_admin()
    THEN RAISE EXCEPTION 'Submitted request pricing is immutable'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER service_request_price_snapshot BEFORE INSERT OR UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_request_price();

CREATE OR REPLACE FUNCTION public.create_grievance(
  p_category TEXT, p_subject TEXT, p_description TEXT, p_priority TEXT DEFAULT 'medium',
  p_against_user_id UUID DEFAULT NULL, p_service_request_id UUID DEFAULT NULL
) RETURNS public.grievances
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE v_row public.grievances;
BEGIN
  IF auth.uid() IS NULL OR public.get_current_user_role() NOT IN ('customer','provider','admin') THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_service_request_id IS NOT NULL AND NOT (public.customer_owns_request(p_service_request_id) OR public.provider_has_request_assignment(p_service_request_id) OR public.is_current_user_admin())
    THEN RAISE EXCEPTION 'Related request is not accessible'; END IF;
  INSERT INTO public.grievances(raised_by,against_user_id,service_request_id,category,subject,description,priority)
  VALUES(auth.uid(),p_against_user_id,p_service_request_id,btrim(p_category),btrim(p_subject),btrim(p_description),lower(p_priority)) RETURNING * INTO v_row;
  PERFORM public.write_audit_log('create','grievance',v_row.id,NULL,to_jsonb(v_row)); RETURN v_row;
END; $$;

CREATE OR REPLACE FUNCTION public.reply_to_grievance(p_grievance_id UUID, p_body TEXT, p_internal BOOLEAN DEFAULT false)
RETURNS public.grievance_replies LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_g public.grievances; v_row public.grievance_replies;
BEGIN
  SELECT * INTO v_g FROM public.grievances WHERE id=p_grievance_id;
  IF NOT FOUND OR (v_g.raised_by<>auth.uid() AND v_g.against_user_id IS DISTINCT FROM auth.uid() AND NOT public.is_current_user_admin()) THEN RAISE EXCEPTION 'Grievance not accessible'; END IF;
  IF p_internal AND NOT public.is_current_user_admin() THEN RAISE EXCEPTION 'Internal replies are admin only'; END IF;
  INSERT INTO public.grievance_replies(grievance_id,author_id,body,is_internal) VALUES(p_grievance_id,auth.uid(),btrim(p_body),p_internal) RETURNING * INTO v_row;
  RETURN v_row;
END; $$;

CREATE OR REPLACE FUNCTION public.update_grievance(
  p_grievance_id UUID, p_status TEXT, p_priority TEXT DEFAULT NULL,
  p_assigned_admin UUID DEFAULT NULL, p_notes TEXT DEFAULT NULL
) RETURNS public.grievances LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_old public.grievances; v_row public.grievances;
BEGIN
  PERFORM public.require_current_role('admin');
  SELECT * INTO v_old FROM public.grievances WHERE id=p_grievance_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Grievance not found'; END IF;
  IF p_status NOT IN ('open','assigned','in_progress','waiting_user','resolved','closed') THEN RAISE EXCEPTION 'Invalid grievance status'; END IF;
  UPDATE public.grievances SET status=p_status,priority=coalesce(lower(p_priority),priority),assigned_admin_id=coalesce(p_assigned_admin,assigned_admin_id),
    resolved_at=CASE WHEN p_status='resolved' THEN now() ELSE resolved_at END, closed_at=CASE WHEN p_status='closed' THEN now() ELSE closed_at END,
    updated_at=now() WHERE id=p_grievance_id RETURNING * INTO v_row;
  INSERT INTO public.grievance_status_history(grievance_id,from_status,to_status,changed_by,notes) VALUES(v_row.id,v_old.status,v_row.status,auth.uid(),p_notes);
  PERFORM public.create_user_notification(v_row.raised_by,'system','Grievance updated','Your grievance '||v_row.grievance_number||' is now '||replace(v_row.status,'_',' '),
    '/customer/grievances/new','normal','grievance',v_row.id,'grievance:'||v_row.id);
  PERFORM public.write_audit_log('status_change','grievance',v_row.id,to_jsonb(v_old),to_jsonb(v_row)); RETURN v_row;
END; $$;

CREATE OR REPLACE FUNCTION public.subscribe_amc(p_plan_id UUID, p_auto_renew BOOLEAN DEFAULT false)
RETURNS public.amc_subscriptions LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_plan public.amc_plans; v_row public.amc_subscriptions;
BEGIN
  PERFORM public.require_current_role('customer');
  SELECT * INTO v_plan FROM public.amc_plans WHERE id=p_plan_id AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'AMC plan is unavailable'; END IF;
  INSERT INTO public.amc_subscriptions(customer_id,plan_id,auto_renew) VALUES(auth.uid(),p_plan_id,p_auto_renew) RETURNING * INTO v_row;
  INSERT INTO public.amc_transactions(subscription_id,customer_id,amount,currency) VALUES(v_row.id,auth.uid(),v_plan.price,v_plan.currency);
  RETURN v_row;
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'An active or pending AMC subscription already exists';
END; $$;

CREATE OR REPLACE FUNCTION public.set_amc_auto_renew(p_subscription_id UUID, p_enabled BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  UPDATE public.amc_subscriptions SET auto_renew=p_enabled,updated_at=now() WHERE id=p_subscription_id AND customer_id=auth.uid() AND status IN ('pending_payment','active');
  IF NOT FOUND THEN RAISE EXCEPTION 'Subscription not found'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.create_campaign(
  p_name TEXT,p_type TEXT,p_audience TEXT,p_subject TEXT,p_body TEXT,p_scheduled_at TIMESTAMPTZ DEFAULT NULL
) RETURNS public.campaigns LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_row public.campaigns;
BEGIN
  PERFORM public.require_current_role('admin');
  INSERT INTO public.campaigns(name,campaign_type,audience_type,subject,body,scheduled_at,created_by)
  VALUES(btrim(p_name),lower(p_type),lower(p_audience),btrim(p_subject),p_body,p_scheduled_at,auth.uid()) RETURNING * INTO v_row;
  RETURN v_row;
END; $$;

CREATE OR REPLACE FUNCTION public.queue_campaign(p_campaign_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_campaign public.campaigns; v_count INTEGER;
BEGIN
  PERFORM public.require_current_role('admin');
  SELECT * INTO v_campaign FROM public.campaigns WHERE id=p_campaign_id FOR UPDATE;
  IF NOT FOUND OR v_campaign.status<>'draft' THEN RAISE EXCEPTION 'Only a draft campaign can be queued'; END IF;
  IF v_campaign.audience_type='csv' THEN
    SELECT count(*) INTO v_count FROM public.campaign_recipients WHERE campaign_id=p_campaign_id;
  ELSE
    INSERT INTO public.campaign_recipients(campaign_id,user_id,email)
    SELECT p_campaign_id,u.id,u.email FROM public.users u
    WHERE u.deleted_at IS NULL AND u.is_active
      AND (v_campaign.audience_type IN ('all','active') OR public.get_current_user_role() IS NOT NULL)
      AND (v_campaign.audience_type NOT IN ('customers','providers') OR EXISTS (
        SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id=ur.role_id
        WHERE ur.user_id=u.id AND ur.revoked_at IS NULL AND r.name=CASE v_campaign.audience_type WHEN 'customers' THEN 'customer' WHEN 'providers' THEN 'provider' END
      )) ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS v_count=ROW_COUNT;
  END IF;
  IF v_count=0 THEN RAISE EXCEPTION 'Campaign has no eligible recipients'; END IF;
  UPDATE public.campaigns SET status='queued',updated_at=now() WHERE id=p_campaign_id;
  INSERT INTO public.campaign_logs(campaign_id,event_type,details) VALUES(p_campaign_id,'queued',jsonb_build_object('recipients',v_count));
  INSERT INTO public.notifications(recipient_id,notification_type,title,body,deep_link,group_key)
    SELECT cr.user_id,'campaign_sent',v_campaign.subject,v_campaign.body,NULL,'campaign:'||p_campaign_id
    FROM public.campaign_recipients cr WHERE cr.campaign_id=p_campaign_id AND cr.user_id IS NOT NULL;
  RETURN v_count;
END; $$;

CREATE OR REPLACE FUNCTION public.import_campaign_recipients(p_campaign_id UUID,p_emails TEXT[])
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
DECLARE v_campaign public.campaigns; v_count INTEGER;
BEGIN
  PERFORM public.require_current_role('admin');
  SELECT * INTO v_campaign FROM public.campaigns WHERE id=p_campaign_id AND status='draft' AND audience_type='csv';
  IF NOT FOUND THEN RAISE EXCEPTION 'CSV recipients require a draft CSV campaign'; END IF;
  INSERT INTO public.campaign_recipients(campaign_id,email)
    SELECT p_campaign_id,lower(btrim(value)) FROM unnest(p_emails) value
    WHERE lower(btrim(value)) ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS v_count=ROW_COUNT;
  IF v_count=0 THEN RAISE EXCEPTION 'No valid new email recipients were found'; END IF;
  RETURN v_count;
END; $$;

CREATE OR REPLACE FUNCTION public.set_service_category(
  p_id UUID, p_name TEXT, p_description TEXT DEFAULT NULL, p_active BOOLEAN DEFAULT true
) RETURNS public.service_categories LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_row public.service_categories;
BEGIN
  PERFORM public.require_current_role('admin');
  IF p_id IS NULL THEN
    INSERT INTO public.service_categories(name,description,is_active) VALUES(btrim(p_name),nullif(btrim(p_description),''),p_active) RETURNING * INTO v_row;
  ELSE
    UPDATE public.service_categories SET name=btrim(p_name),description=nullif(btrim(p_description),''),is_active=p_active,updated_at=now() WHERE id=p_id RETURNING * INTO v_row;
    IF NOT FOUND THEN RAISE EXCEPTION 'Service category not found'; END IF;
  END IF;
  PERFORM public.write_audit_log('upsert','service_category',v_row.id,NULL,to_jsonb(v_row)); RETURN v_row;
END; $$;

CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth STABLE AS $$
DECLARE v_result JSONB;
BEGIN
  PERFORM public.require_current_role('admin');
  SELECT jsonb_build_object(
    'users',(SELECT count(*) FROM public.users WHERE deleted_at IS NULL),
    'customers',(SELECT count(*) FROM public.user_roles ur JOIN public.roles r ON r.id=ur.role_id WHERE ur.revoked_at IS NULL AND r.name='customer'),
    'providers',(SELECT count(*) FROM public.provider_profiles WHERE deleted_at IS NULL),
    'requests',(SELECT count(*) FROM public.service_requests WHERE deleted_at IS NULL),
    'completed',(SELECT count(*) FROM public.service_requests WHERE status='completed'),
    'rejected',(SELECT count(*) FROM public.service_requests WHERE status='rejected'),
    'pending',(SELECT count(*) FROM public.service_requests WHERE status IN ('in_approval','review','approved')),
    'revenue',(SELECT coalesce(sum(fixed_price*(1+coalesce(tax_percent,0)/100)),0) FROM public.service_requests WHERE status='completed'),
    'average_rating',(SELECT coalesce(round(avg(rating)::numeric,2),0) FROM public.feedback),
    'request_status',(SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT status::text name,count(*) value FROM public.service_requests GROUP BY status ORDER BY status) x),
    'provider_status',(SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT status::text name,count(*) value FROM public.provider_profiles WHERE deleted_at IS NULL GROUP BY status ORDER BY status) x),
    'categories',(SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT c.name,count(r.id) value FROM public.service_categories c LEFT JOIN public.service_requests r ON r.category_id=c.id GROUP BY c.id,c.name ORDER BY value DESC LIMIT 10) x),
    'regions',(SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT a.state name,count(r.id) value FROM public.service_requests r JOIN public.addresses a ON a.id=r.service_address_id GROUP BY a.state ORDER BY value DESC LIMIT 10) x),
    'cities',(SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT a.city name,count(r.id) value FROM public.service_requests r JOIN public.addresses a ON a.id=r.service_address_id GROUP BY a.city ORDER BY value DESC LIMIT 10) x),
    'models',(SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT d.model name,count(r.id) value FROM public.service_requests r JOIN public.drones d ON d.id=r.drone_id GROUP BY d.model ORDER BY value DESC LIMIT 10) x),
    'monthly',(SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT to_char(date_trunc('month',created_at),'Mon YYYY') name,count(*) value FROM public.service_requests WHERE created_at>=now()-interval '12 months' GROUP BY date_trunc('month',created_at) ORDER BY date_trunc('month',created_at)) x),
    'average_completion_days',(SELECT coalesce(round(avg(extract(epoch FROM (completed_at-submitted_at))/86400)::numeric,1),0) FROM public.service_requests WHERE completed_at IS NOT NULL AND submitted_at IS NOT NULL)
  ) INTO v_result;
  RETURN v_result;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_request_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_type TEXT; v_title TEXT;
BEGIN
  IF TG_OP='INSERT' OR OLD.status IS DISTINCT FROM NEW.status THEN
    v_type := CASE NEW.status WHEN 'in_approval' THEN 'request_submitted' WHEN 'review' THEN 'under_review' WHEN 'approved' THEN 'request_approved' WHEN 'rejected' THEN 'request_rejected' WHEN 'in_progress' THEN 'job_started' WHEN 'completed' THEN 'job_completed' ELSE 'system' END;
    v_title := 'Request '||replace(NEW.status::text,'_',' ');
    PERFORM public.create_user_notification(NEW.customer_id,v_type,v_title,'Request '||NEW.request_number||' status was updated.','/customer/requests/'||NEW.id,'normal','service_request',NEW.id,'request:'||NEW.id);
  END IF; RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_assignment_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_customer UUID; v_number TEXT; v_type TEXT;
BEGIN
  SELECT customer_id,request_number INTO v_customer,v_number FROM public.service_requests WHERE id=NEW.service_request_id;
  IF TG_OP='INSERT' THEN
    PERFORM public.create_user_notification(NEW.provider_id,'assigned','New job assignment','You were assigned request '||v_number||'.','/app/requests/'||NEW.id,'high','job_assignment',NEW.id,'assignment:'||NEW.id);
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    v_type:=CASE NEW.status WHEN 'accepted' THEN 'provider_accepted' WHEN 'rejected' THEN 'provider_rejected' WHEN 'in_progress' THEN 'job_started' WHEN 'completed' THEN 'job_completed' ELSE 'timeline_updated' END;
    PERFORM public.create_user_notification(v_customer,v_type,'Job update','Provider updated request '||v_number||' to '||replace(NEW.status::text,'_',' '),'/customer/requests/'||NEW.service_request_id,'normal','job_assignment',NEW.id,'assignment:'||NEW.id);
  ELSIF OLD.proposed_completion_date IS DISTINCT FROM NEW.proposed_completion_date OR OLD.additional_days_requested IS DISTINCT FROM NEW.additional_days_requested THEN
    PERFORM public.create_user_notification(v_customer,'timeline_updated','Timeline updated','The provider updated the expected completion date.','/customer/requests/'||NEW.service_request_id,'normal','job_assignment',NEW.id,'assignment:'||NEW.id);
  END IF; RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_provider_verification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.create_user_notification(NEW.user_id,CASE WHEN NEW.status='approved' THEN 'provider_approved' ELSE 'provider_rejected_verification' END,
      'Verification '||NEW.status::text,'Your provider verification status is now '||NEW.status::text,'/app/verification','high','provider_profile',NEW.id,'verification');
  END IF; RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_id UUID;
BEGIN
  v_id:=coalesce(NEW.id,OLD.id);
  PERFORM public.write_audit_log(lower(TG_OP),TG_TABLE_NAME,v_id,CASE WHEN TG_OP='INSERT' THEN NULL ELSE to_jsonb(OLD) END,CASE WHEN TG_OP='DELETE' THEN NULL ELSE to_jsonb(NEW) END);
  RETURN coalesce(NEW,OLD);
END; $$;

CREATE TRIGGER notify_service_request AFTER INSERT OR UPDATE OF status ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.notify_request_change();
CREATE TRIGGER notify_job_assignment AFTER INSERT OR UPDATE OF status,proposed_completion_date,additional_days_requested ON public.job_assignments FOR EACH ROW EXECUTE FUNCTION public.notify_assignment_change();
CREATE TRIGGER notify_provider_profile AFTER UPDATE OF status ON public.provider_profiles FOR EACH ROW EXECUTE FUNCTION public.notify_provider_verification();
CREATE TRIGGER audit_service_pricing AFTER INSERT OR UPDATE OR DELETE ON public.service_pricing FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER audit_provider_documents AFTER UPDATE ON public.provider_documents FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER audit_provider_equipment AFTER UPDATE ON public.provider_equipment FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER audit_campaigns AFTER INSERT OR UPDATE OR DELETE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES
 ('feedback-attachments','feedback-attachments',false,10485760,ARRAY['image/jpeg','image/png','image/webp','application/pdf']),
 ('grievance-attachments','grievance-attachments',false,10485760,ARRAY['image/jpeg','image/png','image/webp','application/pdf']),
 ('campaign-assets','campaign-assets',false,10485760,ARRAY['image/jpeg','image/png','image/webp','application/pdf','text/csv'])
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;

CREATE POLICY grievance_object_read ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id='grievance-attachments' AND EXISTS (SELECT 1 FROM public.grievance_attachments a JOIN public.grievances g ON g.id=a.grievance_id WHERE a.storage_path=name AND (g.raised_by=auth.uid() OR g.against_user_id=auth.uid() OR public.is_current_user_admin())));
CREATE POLICY grievance_object_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id='grievance-attachments' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY grievance_object_delete ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id='grievance-attachments' AND ((storage.foldername(name))[1]=auth.uid()::text OR public.is_current_user_admin()));
CREATE POLICY feedback_object_read ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id='feedback-attachments' AND EXISTS (SELECT 1 FROM public.feedback_attachments a JOIN public.feedback f ON f.id=a.feedback_id WHERE a.storage_path=name AND (f.customer_id=auth.uid() OR f.provider_id=auth.uid() OR public.is_current_user_admin())));
CREATE POLICY feedback_object_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id='feedback-attachments' AND (storage.foldername(name))[1]=auth.uid()::text AND public.get_current_user_role()='customer');
CREATE POLICY feedback_object_delete ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id='feedback-attachments' AND ((storage.foldername(name))[1]=auth.uid()::text OR public.is_current_user_admin()));
CREATE POLICY campaign_object_admin ON storage.objects FOR ALL TO authenticated USING (bucket_id='campaign-assets' AND public.is_current_user_admin()) WITH CHECK (bucket_id='campaign-assets' AND public.is_current_user_admin());

REVOKE ALL ON FUNCTION public.create_user_notification(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,UUID,TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.write_audit_log(TEXT,TEXT,UUID,JSONB,JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_feedback(UUID,SMALLINT,TEXT,TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_feedback_comment(UUID,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(UUID,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read() TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_notification(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_service_pricing(UUID,TEXT,NUMERIC,NUMERIC,TEXT,DATE,UUID,DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_grievance(TEXT,TEXT,TEXT,TEXT,UUID,UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reply_to_grievance(UUID,TEXT,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_grievance(UUID,TEXT,TEXT,UUID,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.subscribe_amc(UUID,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_amc_auto_renew(UUID,BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_campaign(TEXT,TEXT,TEXT,TEXT,TEXT,TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.queue_campaign(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.import_campaign_recipients(UUID,TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_service_category(UUID,TEXT,TEXT,BOOLEAN) TO authenticated;

COMMIT;
