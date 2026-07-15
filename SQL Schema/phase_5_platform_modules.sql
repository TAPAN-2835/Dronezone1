-- DroneZone Phase 2: production platform modules
-- Forward-only migration. Run after phase_4_storage_buckets_and_policies.sql.

BEGIN;

CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_assignment_id UUID NOT NULL UNIQUE REFERENCES public.job_assignments(id) ON DELETE CASCADE,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.feedback_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.feedback_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp','application/pdf')),
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'request_submitted','under_review','request_approved','request_rejected','assigned',
    'provider_accepted','provider_rejected','timeline_updated','job_started','job_completed',
    'feedback_received','provider_approved','provider_rejected_verification',
    'additional_documents_required','verification_approved','verification_rejected',
    'campaign_sent','system'
  )),
  title TEXT NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 160),
  body TEXT NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 2000),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  icon TEXT,
  deep_link TEXT,
  group_key TEXT,
  entity_type TEXT,
  entity_id UUID,
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.service_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
  provider_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  pricing_type TEXT NOT NULL DEFAULT 'category' CHECK (pricing_type IN ('repair','maintenance','category','provider_override')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  tax_percent NUMERIC(5,2) NOT NULL DEFAULT 18 CHECK (tax_percent BETWEEN 0 AND 100),
  currency CHAR(3) NOT NULL DEFAULT 'INR' CHECK (currency ~ '^[A-Z]{3}$'),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  updated_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (effective_to IS NULL OR effective_to >= effective_from),
  CHECK ((pricing_type = 'provider_override' AND provider_id IS NOT NULL) OR (pricing_type <> 'provider_override' AND provider_id IS NULL))
);

CREATE TABLE public.service_pricing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricing_id UUID NOT NULL REFERENCES public.service_pricing(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  tax_percent NUMERIC(5,2) NOT NULL,
  currency CHAR(3) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS fixed_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS tax_percent NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS currency CHAR(3),
  ADD COLUMN IF NOT EXISTS pricing_id UUID REFERENCES public.service_pricing(id) ON DELETE SET NULL;

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_1_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_2_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_3_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_4_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_5_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE public.grievances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grievance_number TEXT NOT NULL UNIQUE DEFAULT ('GRV-' || upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 10))),
  raised_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  against_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (length(btrim(category)) BETWEEN 1 AND 100),
  subject TEXT NOT NULL CHECK (length(btrim(subject)) BETWEEN 1 AND 200),
  description TEXT NOT NULL CHECK (length(btrim(description)) BETWEEN 1 AND 10000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','assigned','in_progress','waiting_user','resolved','closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  assigned_admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.grievance_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 10000),
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.grievance_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.grievance_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp','application/pdf')),
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.amc_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  tax_percent NUMERIC(5,2) NOT NULL DEFAULT 18 CHECK (tax_percent BETWEEN 0 AND 100),
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  duration_months INTEGER NOT NULL CHECK (duration_months BETWEEN 1 AND 60),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.amc_plan_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.amc_plans(id) ON DELETE CASCADE,
  benefit TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE public.amc_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.amc_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','active','expired','cancelled')),
  starts_on DATE,
  expires_on DATE,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expires_on IS NULL OR starts_on IS NULL OR expires_on >= starts_on)
);

CREATE UNIQUE INDEX amc_one_live_subscription_per_customer
  ON public.amc_subscriptions(customer_id)
  WHERE status IN ('pending_payment','active');

CREATE TABLE public.amc_renewals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES public.amc_subscriptions(id) ON DELETE CASCADE,
  previous_expiry DATE,
  new_expiry DATE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.amc_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES public.amc_subscriptions(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  payment_reference TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('promotion','discount','offer','announcement','system')),
  audience_type TEXT NOT NULL CHECK (audience_type IN ('all','active','customers','providers','csv')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','queued','sending','sent','cancelled','failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'queued' CHECK (delivery_status IN ('queued','sent','delivered','opened','clicked','failed','unsubscribed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failure_reason TEXT,
  UNIQUE(campaign_id, email)
);

CREATE TABLE public.campaign_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.campaign_recipients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('queued','sent','delivered','opened','clicked','failed','cancelled')),
  provider_event_id TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_data JSONB,
  after_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX feedback_provider_idx ON public.feedback(provider_id, submitted_at DESC);
CREATE INDEX feedback_customer_idx ON public.feedback(customer_id, submitted_at DESC);
CREATE INDEX notifications_recipient_idx ON public.notifications(recipient_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX notifications_unread_idx ON public.notifications(recipient_id, created_at DESC) WHERE read_at IS NULL AND archived_at IS NULL AND deleted_at IS NULL;
CREATE INDEX pricing_lookup_idx ON public.service_pricing(category_id, provider_id, effective_from DESC) WHERE is_active;
CREATE INDEX grievances_raiser_idx ON public.grievances(raised_by, created_at DESC);
CREATE INDEX grievances_admin_queue_idx ON public.grievances(status, priority, created_at DESC);
CREATE INDEX grievance_replies_idx ON public.grievance_replies(grievance_id, created_at);
CREATE INDEX amc_subscriptions_customer_idx ON public.amc_subscriptions(customer_id, created_at DESC);
CREATE INDEX campaign_status_idx ON public.campaigns(status, created_at DESC);
CREATE INDEX campaign_recipients_status_idx ON public.campaign_recipients(campaign_id, delivery_status);
CREATE INDEX audit_entity_idx ON public.audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX audit_actor_idx ON public.audit_logs(actor_id, created_at DESC);

CREATE TRIGGER feedback_updated_at BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER feedback_comments_updated_at BEFORE UPDATE ON public.feedback_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER service_pricing_updated_at BEFORE UPDATE ON public.service_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER grievances_updated_at BEFORE UPDATE ON public.grievances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER amc_plans_updated_at BEFORE UPDATE ON public.amc_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER amc_subscriptions_updated_at BEFORE UPDATE ON public.amc_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amc_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amc_plan_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amc_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amc_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amc_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY feedback_participants_read ON public.feedback FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR provider_id = auth.uid() OR public.is_current_user_admin());
CREATE POLICY feedback_comments_participants_read ON public.feedback_comments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.feedback f WHERE f.id = feedback_id AND (f.customer_id = auth.uid() OR f.provider_id = auth.uid())) OR public.is_current_user_admin());
CREATE POLICY feedback_attachments_participants_read ON public.feedback_attachments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.feedback f WHERE f.id = feedback_id AND (f.customer_id = auth.uid() OR f.provider_id = auth.uid())) OR public.is_current_user_admin());
CREATE POLICY feedback_attachments_customer_insert ON public.feedback_attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by=auth.uid() AND (storage.foldername(storage_path))[1]=auth.uid()::text AND EXISTS (SELECT 1 FROM public.feedback f WHERE f.id=feedback_id AND f.customer_id=auth.uid()));
CREATE POLICY feedback_attachments_customer_delete ON public.feedback_attachments FOR DELETE TO authenticated
  USING ((uploaded_by=auth.uid() AND EXISTS (SELECT 1 FROM public.feedback f WHERE f.id=feedback_id AND f.customer_id=auth.uid())) OR public.is_current_user_admin());
CREATE POLICY notification_owner_read ON public.notifications FOR SELECT TO authenticated USING (recipient_id = auth.uid());
CREATE POLICY pricing_authenticated_read ON public.service_pricing FOR SELECT TO authenticated USING (is_active OR public.is_current_user_admin());
CREATE POLICY pricing_history_admin_read ON public.service_pricing_history FOR SELECT TO authenticated USING (public.is_current_user_admin());
CREATE POLICY grievances_participant_read ON public.grievances FOR SELECT TO authenticated
  USING (raised_by = auth.uid() OR against_user_id = auth.uid() OR public.is_current_user_admin());
CREATE POLICY grievance_replies_participant_read ON public.grievance_replies FOR SELECT TO authenticated
  USING ((NOT is_internal AND EXISTS (SELECT 1 FROM public.grievances g WHERE g.id = grievance_id AND (g.raised_by = auth.uid() OR g.against_user_id = auth.uid()))) OR public.is_current_user_admin());
CREATE POLICY grievance_history_participant_read ON public.grievance_status_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.grievances g WHERE g.id = grievance_id AND (g.raised_by = auth.uid() OR g.against_user_id = auth.uid())) OR public.is_current_user_admin());
CREATE POLICY grievance_attachments_participant_read ON public.grievance_attachments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.grievances g WHERE g.id = grievance_id AND (g.raised_by = auth.uid() OR g.against_user_id = auth.uid())) OR public.is_current_user_admin());
CREATE POLICY grievance_attachments_participant_insert ON public.grievance_attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by=auth.uid() AND (storage.foldername(storage_path))[1]=auth.uid()::text AND EXISTS (SELECT 1 FROM public.grievances g WHERE g.id=grievance_id AND (g.raised_by=auth.uid() OR g.against_user_id=auth.uid())));
CREATE POLICY grievance_attachments_owner_delete ON public.grievance_attachments FOR DELETE TO authenticated
  USING (uploaded_by=auth.uid() OR public.is_current_user_admin());
CREATE POLICY amc_plans_read ON public.amc_plans FOR SELECT TO authenticated USING (is_active OR public.is_current_user_admin());
CREATE POLICY amc_benefits_read ON public.amc_plan_benefits FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.amc_plans p WHERE p.id = plan_id AND (p.is_active OR public.is_current_user_admin())));
CREATE POLICY amc_subscription_owner_read ON public.amc_subscriptions FOR SELECT TO authenticated USING (customer_id = auth.uid() OR public.is_current_user_admin());
CREATE POLICY amc_renewal_owner_read ON public.amc_renewals FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.amc_subscriptions s WHERE s.id = subscription_id AND s.customer_id = auth.uid()) OR public.is_current_user_admin());
CREATE POLICY amc_transaction_owner_read ON public.amc_transactions FOR SELECT TO authenticated USING (customer_id = auth.uid() OR public.is_current_user_admin());
CREATE POLICY campaigns_admin_read ON public.campaigns FOR SELECT TO authenticated USING (public.is_current_user_admin());
CREATE POLICY campaign_recipients_admin_read ON public.campaign_recipients FOR SELECT TO authenticated USING (public.is_current_user_admin());
CREATE POLICY campaign_logs_admin_read ON public.campaign_logs FOR SELECT TO authenticated USING (public.is_current_user_admin());
CREATE POLICY campaign_attachments_admin_read ON public.campaign_attachments FOR SELECT TO authenticated USING (public.is_current_user_admin());
CREATE POLICY campaign_attachments_admin_write ON public.campaign_attachments FOR ALL TO authenticated USING (public.is_current_user_admin()) WITH CHECK (public.is_current_user_admin());
CREATE POLICY audit_admin_read ON public.audit_logs FOR SELECT TO authenticated USING (public.is_current_user_admin());

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON public.feedback, public.feedback_comments, public.feedback_attachments, public.notifications, public.service_pricing,
  public.service_pricing_history, public.grievances, public.grievance_replies, public.grievance_status_history,
  public.grievance_attachments, public.amc_plans, public.amc_plan_benefits, public.amc_subscriptions,
  public.amc_renewals, public.amc_transactions, public.campaigns, public.campaign_recipients,
  public.campaign_logs, public.campaign_attachments, public.audit_logs TO authenticated;
GRANT INSERT, DELETE ON public.feedback_attachments, public.grievance_attachments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.campaign_attachments TO authenticated;

COMMIT;
