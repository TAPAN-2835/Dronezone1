-- ============================================================================
-- DroneZone Phase 1: Auth and Row-Level Security Hardening
-- Forward-only migration. Apply after the three previously executed SQL files.
-- ============================================================================

BEGIN;

-- Fail safely if the data violates the one-active-role and one-active-assignment
-- assumptions used by authorization and workflow functions.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE revoked_at IS NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Phase 1 preflight failed: a user has multiple active roles';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.job_assignments
    WHERE is_active_assignment = TRUE
    GROUP BY service_request_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Phase 1 preflight failed: a request has multiple active assignments';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.users AS u
    LEFT JOIN auth.users AS au ON au.id = u.id
    WHERE au.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Phase 1 preflight failed: public.users contains IDs not present in auth.users';
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_roles_one_active_role
  ON public.user_roles(user_id)
  WHERE revoked_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_job_assignments_one_active_per_request
  ON public.job_assignments(service_request_id)
  WHERE is_active_assignment = TRUE;

CREATE INDEX IF NOT EXISTS idx_job_assignments_provider_active
  ON public.job_assignments(provider_id, is_active_assignment, status);

CREATE INDEX IF NOT EXISTS idx_service_requests_address
  ON public.service_requests(service_address_id);

-- Make the Auth/public identity relationship explicit after orphan validation.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_users_auth_user'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT fk_users_auth_user
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
    ALTER TABLE public.users VALIDATE CONSTRAINT fk_users_auth_user;
  END IF;
END;
$$;

-- Self-service signup may provision customer/provider accounts only. Admin roles
-- must be assigned by a privileged backend operation, never mutable metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role_id UUID;
  v_requested_role TEXT;
  v_role_name TEXT;
  v_phone TEXT;
  v_email TEXT;
BEGIN
  v_requested_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'customer'));
  v_role_name := CASE
    WHEN v_requested_role IN ('customer', 'provider') THEN v_requested_role
    ELSE 'customer'
  END;

  v_phone := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.phone, ''),
    LEFT('p-' || REPLACE(NEW.id::TEXT, '-', ''), 20)
  );
  v_email := COALESCE(NULLIF(NEW.email, ''), NEW.id::TEXT || '@pending.invalid');

  INSERT INTO public.users (
    id, email, phone, password_hash, first_name, last_name,
    is_active, email_verified, phone_verified
  ) VALUES (
    NEW.id,
    v_email,
    v_phone,
    'supabase-auth',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), 'Unknown'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name', ''), 'Unknown'),
    TRUE,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.phone_confirmed_at IS NOT NULL
  );

  SELECT id INTO v_role_id
  FROM public.roles
  WHERE LOWER(name) = v_role_name
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Account provisioning is unavailable for the requested role';
  END IF;

  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (NEW.id, v_role_id);

  IF v_role_name = 'customer' THEN
    INSERT INTO public.customer_profiles (user_id, display_name)
    VALUES (
      NEW.id,
      TRIM(
        COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' ||
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      )
    );
  ELSE
    INSERT INTO public.provider_profiles (user_id, business_name, status)
    VALUES (
      NEW.id,
      COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'business_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'businessName', ''),
        'Pending Business Name'
      ),
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Authoritative role helper: auth.uid() -> active user_roles -> roles.
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT LOWER(r.name)::TEXT
  FROM public.user_roles AS ur
  JOIN public.roles AS r ON r.id = ur.role_id
  JOIN public.users AS u ON u.id = ur.user_id
  WHERE ur.user_id = auth.uid()
    AND ur.revoked_at IS NULL
    AND u.is_active = TRUE
    AND u.deleted_at IS NULL
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS TABLE(role_name TEXT, profile_provisioned BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH role_context AS (
    SELECT public.get_current_user_role() AS name
  )
  SELECT
    role_context.name,
    CASE role_context.name
      WHEN 'customer' THEN EXISTS (
        SELECT 1 FROM public.customer_profiles WHERE user_id = auth.uid()
      )
      WHEN 'provider' THEN EXISTS (
        SELECT 1 FROM public.provider_profiles WHERE user_id = auth.uid()
      )
      WHEN 'admin' THEN EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid()
      )
      ELSE FALSE
    END
  FROM role_context
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(public.get_current_user_role() = 'admin', FALSE)
$$;

-- SECURITY DEFINER predicates keep cross-table policy checks from recursively
-- invoking the service_requests/job_assignments policies they protect.
CREATE OR REPLACE FUNCTION public.provider_has_request_assignment(
  p_request_id UUID,
  p_active_only BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_assignments AS ja
    WHERE ja.service_request_id = p_request_id
      AND ja.provider_id = auth.uid()
      AND (NOT p_active_only OR ja.is_active_assignment = TRUE)
  )
$$;

CREATE OR REPLACE FUNCTION public.provider_has_active_customer(p_customer_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_assignments AS ja
    JOIN public.service_requests AS sr ON sr.id = ja.service_request_id
    WHERE ja.provider_id = auth.uid()
      AND ja.is_active_assignment = TRUE
      AND sr.customer_id = p_customer_id
  )
$$;

CREATE OR REPLACE FUNCTION public.provider_has_active_address(p_address_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_assignments AS ja
    JOIN public.service_requests AS sr ON sr.id = ja.service_request_id
    WHERE ja.provider_id = auth.uid()
      AND ja.is_active_assignment = TRUE
      AND sr.service_address_id = p_address_id
  )
$$;

CREATE OR REPLACE FUNCTION public.provider_has_active_drone(p_drone_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_assignments AS ja
    JOIN public.service_requests AS sr ON sr.id = ja.service_request_id
    WHERE ja.provider_id = auth.uid()
      AND ja.is_active_assignment = TRUE
      AND sr.drone_id = p_drone_id
  )
$$;

CREATE OR REPLACE FUNCTION public.customer_owns_request(p_request_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.service_requests
    WHERE id = p_request_id AND customer_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.can_read_assignment(p_assignment_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.job_assignments AS ja
    JOIN public.service_requests AS sr ON sr.id = ja.service_request_id
    WHERE ja.id = p_assignment_id
      AND (ja.provider_id = auth.uid() OR sr.customer_id = auth.uid())
  )
$$;

REVOKE ALL ON FUNCTION public.get_current_user_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_auth_context() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.provider_has_request_assignment(UUID, BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.provider_has_active_customer(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.provider_has_active_address(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.provider_has_active_drone(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.customer_owns_request(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_read_assignment(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.provider_has_request_assignment(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.provider_has_active_customer(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.provider_has_active_address(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.provider_has_active_drone(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.customer_owns_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_assignment(UUID) TO authenticated;

-- Remove every starter policy on the 11 application tables before applying the
-- restrictive policy set. Table names are a fixed allowlist.
DO $$
DECLARE
  v_policy RECORD;
BEGIN
  FOR v_policy IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (ARRAY[
        'users', 'roles', 'user_roles', 'addresses', 'customer_profiles',
        'drones', 'provider_profiles', 'service_categories',
        'service_requests', 'job_assignments', 'job_status_history'
      ])
  LOOP
    EXECUTE FORMAT('DROP POLICY IF EXISTS %I ON public.%I', v_policy.policyname, v_policy.tablename);
  END LOOP;
END;
$$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_status_history ENABLE ROW LEVEL SECURITY;

-- Explicit browser grants. The legacy password hash and login-security fields
-- are not selectable by authenticated browser sessions.
REVOKE ALL PRIVILEGES ON TABLE
  public.users, public.roles, public.user_roles, public.addresses,
  public.customer_profiles, public.drones, public.provider_profiles,
  public.service_categories, public.service_requests,
  public.job_assignments, public.job_status_history
FROM anon, authenticated;

GRANT SELECT (id, email, phone, first_name, last_name, is_active,
  email_verified, phone_verified, created_at, updated_at)
ON public.users TO authenticated;
GRANT UPDATE (email, phone, first_name, last_name)
ON public.users TO authenticated;

GRANT SELECT ON public.roles, public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT SELECT ON public.customer_profiles TO authenticated;
GRANT UPDATE (display_name, date_of_birth, gender, default_address_id,
  preferred_language, preferred_contact_method)
ON public.customer_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drones TO authenticated;
GRANT SELECT ON public.provider_profiles TO authenticated;
GRANT UPDATE (business_name, business_registration_number, business_type,
  service_area_city, service_area_state, service_area_pincode,
  service_radius_km, bio, specializations, years_of_experience)
ON public.provider_profiles TO authenticated;
GRANT SELECT ON public.service_categories TO authenticated;
GRANT SELECT ON public.service_requests TO authenticated;
GRANT INSERT (customer_id, drone_id, category_id, service_address_id, title,
  description, priority, status, urgency_level, requested_completion_date,
  requires_onsite_visit)
ON public.service_requests TO authenticated;
GRANT UPDATE (drone_id, category_id, service_address_id, title, description,
  priority, urgency_level, requested_completion_date, requires_onsite_visit)
ON public.service_requests TO authenticated;
GRANT SELECT ON public.job_assignments, public.job_status_history TO authenticated;

-- users
CREATE POLICY users_select_authorized
ON public.users FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR public.is_current_user_admin()
  OR (public.get_current_user_role() = 'provider' AND public.provider_has_active_customer(users.id))
);

CREATE POLICY users_update_own
ON public.users FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- roles and active mappings
CREATE POLICY roles_select_authenticated
ON public.roles FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY user_roles_select_own_or_admin
ON public.user_roles FOR SELECT TO authenticated
USING (
  (user_id = auth.uid() AND revoked_at IS NULL)
  OR public.is_current_user_admin()
);

-- customer-owned addresses, with limited provider access for active assignments
CREATE POLICY addresses_select_authorized
ON public.addresses FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_current_user_admin()
  OR public.provider_has_active_address(addresses.id)
);

CREATE POLICY addresses_insert_own
ON public.addresses FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND public.get_current_user_role() = 'customer');

CREATE POLICY addresses_update_own
ON public.addresses FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND public.get_current_user_role() = 'customer')
WITH CHECK (user_id = auth.uid() AND public.get_current_user_role() = 'customer');

CREATE POLICY addresses_delete_own
ON public.addresses FOR DELETE TO authenticated
USING (user_id = auth.uid() AND public.get_current_user_role() = 'customer');

-- customer profiles
CREATE POLICY customer_profiles_select_authorized
ON public.customer_profiles FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_current_user_admin()
  OR public.provider_has_active_customer(customer_profiles.user_id)
);

CREATE POLICY customer_profiles_update_own
ON public.customer_profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND public.get_current_user_role() = 'customer')
WITH CHECK (user_id = auth.uid() AND public.get_current_user_role() = 'customer');

-- drones
CREATE POLICY drones_select_authorized
ON public.drones FOR SELECT TO authenticated
USING (
  owner_id = auth.uid()
  OR public.is_current_user_admin()
  OR public.provider_has_active_drone(drones.id)
);

CREATE POLICY drones_insert_own
ON public.drones FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid() AND public.get_current_user_role() = 'customer');

CREATE POLICY drones_update_own
ON public.drones FOR UPDATE TO authenticated
USING (owner_id = auth.uid() AND public.get_current_user_role() = 'customer')
WITH CHECK (owner_id = auth.uid() AND public.get_current_user_role() = 'customer');

CREATE POLICY drones_delete_own
ON public.drones FOR DELETE TO authenticated
USING (owner_id = auth.uid() AND public.get_current_user_role() = 'customer');

-- provider profiles: customers use the safe assigned-provider RPC instead of
-- direct table access.
CREATE POLICY provider_profiles_select_self_or_admin
ON public.provider_profiles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_current_user_admin());

CREATE POLICY provider_profiles_update_self
ON public.provider_profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND public.get_current_user_role() = 'provider')
WITH CHECK (user_id = auth.uid() AND public.get_current_user_role() = 'provider');

-- categories
CREATE POLICY service_categories_select_authorized
ON public.service_categories FOR SELECT TO authenticated
USING (is_active = TRUE OR public.is_current_user_admin());

-- requests
CREATE POLICY service_requests_select_authorized
ON public.service_requests FOR SELECT TO authenticated
USING (
  customer_id = auth.uid()
  OR public.is_current_user_admin()
  OR public.provider_has_request_assignment(service_requests.id, FALSE)
);

CREATE POLICY service_requests_insert_own_draft
ON public.service_requests FOR INSERT TO authenticated
WITH CHECK (
  public.get_current_user_role() = 'customer'
  AND customer_id = auth.uid()
  AND status = 'draft'
  AND EXISTS (SELECT 1 FROM public.drones WHERE id = drone_id AND owner_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.addresses WHERE id = service_address_id AND user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.service_categories WHERE id = category_id AND is_active = TRUE)
);

CREATE POLICY service_requests_update_own_draft
ON public.service_requests FOR UPDATE TO authenticated
USING (
  public.get_current_user_role() = 'customer'
  AND customer_id = auth.uid()
  AND status = 'draft'
)
WITH CHECK (
  customer_id = auth.uid()
  AND status = 'draft'
  AND EXISTS (SELECT 1 FROM public.drones WHERE id = drone_id AND owner_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.addresses WHERE id = service_address_id AND user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.service_categories WHERE id = category_id AND is_active = TRUE)
);

-- assignments and immutable history are read-only to browser sessions.
CREATE POLICY job_assignments_select_authorized
ON public.job_assignments FOR SELECT TO authenticated
USING (
  provider_id = auth.uid()
  OR public.is_current_user_admin()
  OR public.customer_owns_request(job_assignments.service_request_id)
);

CREATE POLICY job_status_history_select_authorized
ON public.job_status_history FOR SELECT TO authenticated
USING (
  public.is_current_user_admin()
  OR public.can_read_assignment(job_status_history.job_assignment_id)
);

COMMIT;
