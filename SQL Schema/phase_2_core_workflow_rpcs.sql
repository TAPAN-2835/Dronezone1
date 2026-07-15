-- ============================================================================
-- DroneZone Phase 2: Core Transactional Workflow RPCs
-- Requires phase_1_rls_hardening.sql.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.require_current_role(p_required_role TEXT)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_role TEXT;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_role := public.get_current_user_role();
  IF v_role IS DISTINCT FROM LOWER(p_required_role) THEN
    RAISE EXCEPTION 'Forbidden: % role required', LOWER(p_required_role);
  END IF;

  RETURN v_actor;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_job_status_history(
  p_assignment_id UUID,
  p_from_status TEXT,
  p_to_status TEXT,
  p_change_trigger TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_role TEXT := public.get_current_user_role();
BEGIN
  IF v_actor IS NULL OR v_role IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.job_status_history (
    job_assignment_id,
    from_status,
    to_status,
    changed_by,
    changed_by_role,
    change_source,
    change_trigger,
    notes,
    duration_in_previous_status_mins
  ) VALUES (
    p_assignment_id,
    p_from_status,
    p_to_status,
    v_actor,
    v_role,
    'rpc',
    p_change_trigger,
    NULLIF(TRIM(p_notes), ''),
    NULL
  );
END;
$$;

REVOKE ALL ON FUNCTION public.require_current_role(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_job_status_history(UUID, TEXT, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;

-- Customer creates and immediately submits a request because the existing UI
-- has one "Submit Request" action rather than a separate save-draft action.
CREATE OR REPLACE FUNCTION public.submit_service_request(
  p_drone_id UUID,
  p_category_id UUID,
  p_service_address_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_priority public.priority_enum DEFAULT 'medium',
  p_urgency_level public.urgency_enum DEFAULT NULL,
  p_requested_completion_date DATE DEFAULT NULL,
  p_requires_onsite_visit BOOLEAN DEFAULT TRUE
)
RETURNS public.service_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_customer UUID;
  v_request public.service_requests;
BEGIN
  v_customer := public.require_current_role('customer');

  IF NULLIF(TRIM(p_title), '') IS NULL THEN
    RAISE EXCEPTION 'Request title is required';
  END IF;
  IF NULLIF(TRIM(p_description), '') IS NULL THEN
    RAISE EXCEPTION 'Request description is required';
  END IF;
  IF p_requested_completion_date IS NOT NULL AND p_requested_completion_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Requested completion date cannot be in the past';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.customer_profiles WHERE user_id = v_customer
  ) THEN
    RAISE EXCEPTION 'Customer profile is not provisioned';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.drones
    WHERE id = p_drone_id AND owner_id = v_customer AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Drone not found or not owned by the current customer';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.addresses
    WHERE id = p_service_address_id AND user_id = v_customer
  ) THEN
    RAISE EXCEPTION 'Service address not found or not owned by the current customer';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.service_categories
    WHERE id = p_category_id AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Service category is unavailable';
  END IF;

  INSERT INTO public.service_requests (
    customer_id,
    drone_id,
    category_id,
    service_address_id,
    title,
    description,
    priority,
    status,
    urgency_level,
    requested_completion_date,
    requires_onsite_visit,
    submitted_at
  ) VALUES (
    v_customer,
    p_drone_id,
    p_category_id,
    p_service_address_id,
    TRIM(p_title),
    TRIM(p_description),
    p_priority,
    'in_approval',
    p_urgency_level,
    p_requested_completion_date,
    p_requires_onsite_visit,
    NOW()
  )
  RETURNING * INTO v_request;

  UPDATE public.customer_profiles
  SET total_requests_created = total_requests_created + 1
  WHERE user_id = v_customer;

  UPDATE public.service_categories
  SET total_requests = total_requests + 1
  WHERE id = p_category_id;

  RETURN v_request;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_service_request(p_request_id UUID)
RETURNS public.service_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin UUID;
  v_request public.service_requests;
BEGIN
  v_admin := public.require_current_role('admin');

  SELECT * INTO v_request
  FROM public.service_requests
  WHERE id = p_request_id AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Service request not found'; END IF;
  IF v_request.status <> 'in_approval' THEN
    RAISE EXCEPTION 'Request must be in_approval before review';
  END IF;

  UPDATE public.service_requests
  SET status = 'review', reviewed_by = v_admin, reviewed_at = NOW()
  WHERE id = p_request_id
  RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_service_request(p_request_id UUID)
RETURNS public.service_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin UUID;
  v_request public.service_requests;
BEGIN
  v_admin := public.require_current_role('admin');

  SELECT * INTO v_request
  FROM public.service_requests
  WHERE id = p_request_id AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Service request not found'; END IF;
  IF v_request.status <> 'review' THEN
    RAISE EXCEPTION 'Only a request in review can be approved';
  END IF;

  UPDATE public.service_requests
  SET status = 'approved', reviewed_by = v_admin, reviewed_at = COALESCE(reviewed_at, NOW())
  WHERE id = p_request_id
  RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_service_request(
  p_request_id UUID,
  p_rejection_reason TEXT
)
RETURNS public.service_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin UUID;
  v_request public.service_requests;
  v_reason TEXT := NULLIF(TRIM(p_rejection_reason), '');
BEGIN
  v_admin := public.require_current_role('admin');
  IF v_reason IS NULL THEN RAISE EXCEPTION 'Rejection reason is required'; END IF;

  SELECT * INTO v_request
  FROM public.service_requests
  WHERE id = p_request_id AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Service request not found'; END IF;
  IF v_request.status NOT IN ('in_approval', 'review') THEN
    RAISE EXCEPTION 'Only an in_approval or review request can be rejected';
  END IF;

  UPDATE public.service_requests
  SET
    status = 'rejected',
    reviewed_by = v_admin,
    reviewed_at = COALESCE(reviewed_at, NOW()),
    admin_notes = v_reason
  WHERE id = p_request_id
  RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_provider(
  p_request_id UUID,
  p_provider_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS public.job_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin UUID;
  v_request public.service_requests;
  v_existing public.job_assignments;
  v_sequence INTEGER;
  v_assignment public.job_assignments;
BEGIN
  v_admin := public.require_current_role('admin');

  SELECT * INTO v_request
  FROM public.service_requests
  WHERE id = p_request_id AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Service request not found'; END IF;
  IF v_request.status <> 'approved' THEN
    RAISE EXCEPTION 'Only an approved request can be assigned';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.provider_profiles
    WHERE user_id = p_provider_id
      AND status = 'approved'
      AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Provider is not approved or active';
  END IF;

  SELECT * INTO v_existing
  FROM public.job_assignments
  WHERE service_request_id = p_request_id
    AND is_active_assignment = TRUE
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing.status IN ('rejected', 'cancelled', 'completed') THEN
      UPDATE public.job_assignments
      SET is_active_assignment = FALSE
      WHERE id = v_existing.id;
    ELSE
      RAISE EXCEPTION 'Request already has an active assignment';
    END IF;
  END IF;

  SELECT COALESCE(MAX(assignment_sequence), 0) + 1 INTO v_sequence
  FROM public.job_assignments
  WHERE service_request_id = p_request_id;

  INSERT INTO public.job_assignments (
    service_request_id,
    provider_id,
    assigned_by,
    status,
    assignment_sequence,
    is_active_assignment,
    admin_assignment_notes
  ) VALUES (
    p_request_id,
    p_provider_id,
    v_admin,
    'pending',
    v_sequence,
    TRUE,
    NULLIF(TRIM(p_admin_notes), '')
  )
  RETURNING * INTO v_assignment;

  UPDATE public.service_requests
  SET assigned_at = NOW()
  WHERE id = p_request_id;

  UPDATE public.provider_profiles
  SET total_jobs_assigned = total_jobs_assigned + 1, updated_by = v_admin
  WHERE user_id = p_provider_id;

  PERFORM public.record_job_status_history(
    v_assignment.id, 'unassigned', 'pending', 'admin_assigned_provider', p_admin_notes
  );

  RETURN v_assignment;
END;
$$;

CREATE OR REPLACE FUNCTION public.provider_accept_assignment(
  p_assignment_id UUID,
  p_provider_notes TEXT DEFAULT NULL
)
RETURNS public.job_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_provider UUID;
  v_assignment public.job_assignments;
BEGIN
  v_provider := public.require_current_role('provider');

  SELECT * INTO v_assignment
  FROM public.job_assignments
  WHERE id = p_assignment_id
  FOR UPDATE;

  IF NOT FOUND OR v_assignment.provider_id <> v_provider THEN
    RAISE EXCEPTION 'Assignment not found or access denied';
  END IF;
  IF v_assignment.status <> 'pending' OR NOT v_assignment.is_active_assignment THEN
    RAISE EXCEPTION 'Only an active pending assignment can be accepted';
  END IF;

  UPDATE public.job_assignments
  SET status = 'accepted', responded_at = NOW(), provider_notes = NULLIF(TRIM(p_provider_notes), '')
  WHERE id = p_assignment_id
  RETURNING * INTO v_assignment;

  PERFORM public.record_job_status_history(
    p_assignment_id, 'pending', 'accepted', 'provider_accepted_assignment', p_provider_notes
  );

  RETURN v_assignment;
END;
$$;

CREATE OR REPLACE FUNCTION public.provider_reject_assignment(
  p_assignment_id UUID,
  p_rejection_reason TEXT
)
RETURNS public.job_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_provider UUID;
  v_assignment public.job_assignments;
  v_reason TEXT := NULLIF(TRIM(p_rejection_reason), '');
BEGIN
  v_provider := public.require_current_role('provider');
  IF v_reason IS NULL THEN RAISE EXCEPTION 'Rejection reason is required'; END IF;

  SELECT * INTO v_assignment
  FROM public.job_assignments
  WHERE id = p_assignment_id
  FOR UPDATE;

  IF NOT FOUND OR v_assignment.provider_id <> v_provider THEN
    RAISE EXCEPTION 'Assignment not found or access denied';
  END IF;
  IF v_assignment.status <> 'pending' OR NOT v_assignment.is_active_assignment THEN
    RAISE EXCEPTION 'Only an active pending assignment can be rejected';
  END IF;

  UPDATE public.job_assignments
  SET
    status = 'rejected',
    responded_at = NOW(),
    rejection_reason = v_reason,
    is_active_assignment = FALSE
  WHERE id = p_assignment_id
  RETURNING * INTO v_assignment;

  UPDATE public.service_requests
  SET status = 'approved', assigned_at = NULL
  WHERE id = v_assignment.service_request_id;

  UPDATE public.provider_profiles
  SET total_jobs_rejected = total_jobs_rejected + 1
  WHERE user_id = v_provider;

  PERFORM public.record_job_status_history(
    p_assignment_id, 'pending', 'rejected', 'provider_rejected_assignment', v_reason
  );

  RETURN v_assignment;
END;
$$;

CREATE OR REPLACE FUNCTION public.start_job(p_assignment_id UUID)
RETURNS public.job_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_provider UUID;
  v_assignment public.job_assignments;
BEGIN
  v_provider := public.require_current_role('provider');

  SELECT * INTO v_assignment
  FROM public.job_assignments
  WHERE id = p_assignment_id
  FOR UPDATE;

  IF NOT FOUND OR v_assignment.provider_id <> v_provider THEN
    RAISE EXCEPTION 'Assignment not found or access denied';
  END IF;
  IF v_assignment.status <> 'accepted' OR NOT v_assignment.is_active_assignment THEN
    RAISE EXCEPTION 'Only an active accepted assignment can be started';
  END IF;

  UPDATE public.job_assignments
  SET status = 'in_progress', started_at = NOW()
  WHERE id = p_assignment_id
  RETURNING * INTO v_assignment;

  UPDATE public.service_requests
  SET status = 'in_progress'
  WHERE id = v_assignment.service_request_id AND status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Related request is not in an approved state';
  END IF;

  PERFORM public.record_job_status_history(
    p_assignment_id, 'accepted', 'in_progress', 'provider_started_job', NULL
  );

  RETURN v_assignment;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_job_timeline(
  p_assignment_id UUID,
  p_proposed_completion_date DATE,
  p_additional_days_requested INTEGER DEFAULT 0,
  p_additional_days_reason TEXT DEFAULT NULL,
  p_provider_notes TEXT DEFAULT NULL
)
RETURNS public.job_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_provider UUID;
  v_assignment public.job_assignments;
  v_reason TEXT := NULLIF(TRIM(p_additional_days_reason), '');
BEGIN
  v_provider := public.require_current_role('provider');

  IF p_proposed_completion_date IS NULL OR p_proposed_completion_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Proposed completion date must be today or later';
  END IF;
  IF p_additional_days_requested < 0 THEN
    RAISE EXCEPTION 'Additional days cannot be negative';
  END IF;
  IF p_additional_days_requested > 0 AND v_reason IS NULL THEN
    RAISE EXCEPTION 'Reason is required when requesting additional days';
  END IF;

  SELECT * INTO v_assignment
  FROM public.job_assignments
  WHERE id = p_assignment_id
  FOR UPDATE;

  IF NOT FOUND OR v_assignment.provider_id <> v_provider THEN
    RAISE EXCEPTION 'Assignment not found or access denied';
  END IF;
  IF v_assignment.status NOT IN ('accepted', 'in_progress') OR NOT v_assignment.is_active_assignment THEN
    RAISE EXCEPTION 'Timeline can only be updated for an active accepted or in-progress job';
  END IF;

  UPDATE public.job_assignments
  SET
    proposed_completion_date = p_proposed_completion_date,
    additional_days_requested = p_additional_days_requested,
    additional_days_reason = v_reason,
    provider_notes = COALESCE(NULLIF(TRIM(p_provider_notes), ''), provider_notes)
  WHERE id = p_assignment_id
  RETURNING * INTO v_assignment;

  PERFORM public.record_job_status_history(
    p_assignment_id,
    v_assignment.status::TEXT,
    v_assignment.status::TEXT,
    'provider_updated_timeline',
    CONCAT_WS('; ', v_reason, NULLIF(TRIM(p_provider_notes), ''))
  );

  RETURN v_assignment;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_job(
  p_assignment_id UUID,
  p_completion_summary TEXT
)
RETURNS public.job_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_provider UUID;
  v_assignment public.job_assignments;
  v_summary TEXT := NULLIF(TRIM(p_completion_summary), '');
BEGIN
  v_provider := public.require_current_role('provider');
  IF v_summary IS NULL THEN RAISE EXCEPTION 'Completion summary is required'; END IF;

  SELECT * INTO v_assignment
  FROM public.job_assignments
  WHERE id = p_assignment_id
  FOR UPDATE;

  IF NOT FOUND OR v_assignment.provider_id <> v_provider THEN
    RAISE EXCEPTION 'Assignment not found or access denied';
  END IF;
  IF v_assignment.status <> 'in_progress' OR NOT v_assignment.is_active_assignment THEN
    RAISE EXCEPTION 'Only an active in-progress assignment can be completed';
  END IF;

  UPDATE public.job_assignments
  SET
    status = 'completed',
    completion_summary = v_summary,
    completed_at = NOW(),
    is_active_assignment = FALSE
  WHERE id = p_assignment_id
  RETURNING * INTO v_assignment;

  UPDATE public.service_requests
  SET status = 'completed', actual_completion_date = CURRENT_DATE, completed_at = NOW()
  WHERE id = v_assignment.service_request_id AND status = 'in_progress';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Related request is not in progress';
  END IF;

  UPDATE public.provider_profiles
  SET total_jobs_completed = total_jobs_completed + 1
  WHERE user_id = v_provider;

  UPDATE public.customer_profiles AS cp
  SET total_requests_completed = total_requests_completed + 1
  FROM public.service_requests AS sr
  WHERE sr.id = v_assignment.service_request_id
    AND cp.user_id = sr.customer_id;

  PERFORM public.record_job_status_history(
    p_assignment_id, 'in_progress', 'completed', 'provider_completed_job', v_summary
  );

  RETURN v_assignment;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_provider(p_provider_profile_id UUID)
RETURNS public.provider_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin UUID;
  v_provider public.provider_profiles;
BEGIN
  v_admin := public.require_current_role('admin');

  SELECT * INTO v_provider
  FROM public.provider_profiles
  WHERE id = p_provider_profile_id AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Provider profile not found'; END IF;
  IF v_provider.status NOT IN ('pending', 'in_review', 'rejected') THEN
    RAISE EXCEPTION 'Provider cannot be approved from the current status';
  END IF;

  UPDATE public.provider_profiles
  SET
    status = 'approved',
    rejection_reason = NULL,
    verified_by = v_admin,
    verified_at = NOW(),
    updated_by = v_admin
  WHERE id = p_provider_profile_id
  RETURNING * INTO v_provider;

  RETURN v_provider;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_provider(
  p_provider_profile_id UUID,
  p_rejection_reason TEXT
)
RETURNS public.provider_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin UUID;
  v_provider public.provider_profiles;
  v_reason TEXT := NULLIF(TRIM(p_rejection_reason), '');
BEGIN
  v_admin := public.require_current_role('admin');
  IF v_reason IS NULL THEN RAISE EXCEPTION 'Rejection reason is required'; END IF;

  SELECT * INTO v_provider
  FROM public.provider_profiles
  WHERE id = p_provider_profile_id AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Provider profile not found'; END IF;
  IF v_provider.status NOT IN ('pending', 'in_review') THEN
    RAISE EXCEPTION 'Provider cannot be rejected from the current status';
  END IF;

  UPDATE public.provider_profiles
  SET
    status = 'rejected',
    rejection_reason = v_reason,
    verified_by = v_admin,
    verified_at = NULL,
    updated_by = v_admin
  WHERE id = p_provider_profile_id
  RETURNING * INTO v_provider;

  RETURN v_provider;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_provider_class(
  p_provider_profile_id UUID,
  p_equipment_class INTEGER
)
RETURNS public.provider_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin UUID;
  v_provider public.provider_profiles;
BEGIN
  v_admin := public.require_current_role('admin');
  IF p_equipment_class NOT BETWEEN 1 AND 3 THEN
    RAISE EXCEPTION 'Provider class must be between 1 and 3';
  END IF;

  UPDATE public.provider_profiles
  SET equipment_class = p_equipment_class, updated_by = v_admin
  WHERE id = p_provider_profile_id AND deleted_at IS NULL
  RETURNING * INTO v_provider;

  IF NOT FOUND THEN RAISE EXCEPTION 'Provider profile not found'; END IF;
  RETURN v_provider;
END;
$$;

-- Safe customer-only provider projection. Customers cannot query provider_profiles
-- or provider users directly under Phase 1 RLS.
CREATE OR REPLACE FUNCTION public.get_assigned_provider_for_request(p_request_id UUID)
RETURNS TABLE(
  assignment_id UUID,
  assignment_status public.job_assignment_status_enum,
  provider_user_id UUID,
  business_name VARCHAR,
  equipment_class INTEGER,
  average_rating NUMERIC,
  first_name VARCHAR,
  last_name VARCHAR,
  phone VARCHAR,
  provider_notes TEXT,
  proposed_completion_date DATE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_customer UUID;
BEGIN
  v_customer := public.require_current_role('customer');
  IF NOT EXISTS (
    SELECT 1 FROM public.service_requests
    WHERE id = p_request_id AND customer_id = v_customer AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Service request not found or access denied';
  END IF;

  RETURN QUERY
  SELECT
    ja.id,
    ja.status,
    pp.user_id,
    pp.business_name,
    pp.equipment_class,
    pp.average_rating,
    u.first_name,
    u.last_name,
    u.phone,
    ja.provider_notes,
    ja.proposed_completion_date
  FROM public.job_assignments AS ja
  JOIN public.provider_profiles AS pp ON pp.user_id = ja.provider_id
  JOIN public.users AS u ON u.id = ja.provider_id
  WHERE ja.service_request_id = p_request_id
    AND ja.status NOT IN ('rejected', 'cancelled')
  ORDER BY ja.assignment_sequence DESC
  LIMIT 1;
END;
$$;

-- Only the public RPC entrypoints are executable by browser sessions.
REVOKE ALL ON FUNCTION public.submit_service_request(UUID, UUID, UUID, TEXT, TEXT, public.priority_enum, public.urgency_enum, DATE, BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_service_request(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.approve_service_request(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reject_service_request(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.assign_provider(UUID, UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.provider_accept_assignment(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.provider_reject_assignment(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.start_job(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_job_timeline(UUID, DATE, INTEGER, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.complete_job(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.approve_provider(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reject_provider(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.assign_provider_class(UUID, INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_assigned_provider_for_request(UUID) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.submit_service_request(UUID, UUID, UUID, TEXT, TEXT, public.priority_enum, public.urgency_enum, DATE, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_service_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_service_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_service_request(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_provider(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.provider_accept_assignment(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.provider_reject_assignment(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_job(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_job_timeline(UUID, DATE, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_job(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_provider(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_provider(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_provider_class(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_assigned_provider_for_request(UUID) TO authenticated;

COMMIT;
