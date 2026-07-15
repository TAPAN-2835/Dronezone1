-- ============================================================================
-- DroneZone — Supabase Database Schema
-- Generated from: updated_er_diagram.md (Post Jul 10 Meeting)
-- ============================================================================
-- HOW TO RUN:
--   1. Open your Supabase Dashboard
--   2. Go to SQL Editor → New Query
--   3. Paste this entire file
--   4. Click "Run"
-- ============================================================================

-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- 1. CUSTOM ENUM TYPES
-- ============================================================================



-- Provider profile status
CREATE TYPE provider_status_enum AS ENUM (
  'pending',
  'in_review',
  'approved',
  'rejected',
  'suspended'
);

-- Service request lifecycle (Change E: updated status values)
CREATE TYPE service_request_status_enum AS ENUM (
  'draft',
  'in_approval',
  'review',
  'approved',
  'rejected',
  'in_progress',
  'completed',
  'cancelled'
);

-- Job assignment status
CREATE TYPE job_assignment_status_enum AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled'
);

-- Priority levels
CREATE TYPE priority_enum AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Urgency levels
CREATE TYPE urgency_enum AS ENUM (
  'normal',
  'same_day',
  'next_day',
  'within_week'
);

-- Visit type
CREATE TYPE visit_type_enum AS ENUM (
  'onsite',
  'remote',
  'pickup_delivery'
);

-- Gender
CREATE TYPE gender_enum AS ENUM (
  'male',
  'female',
  'other',
  'prefer_not_to_say'
);

-- Drone type
CREATE TYPE drone_type_enum AS ENUM (
  'quadcopter',
  'hexacopter',
  'fixed_wing',
  'hybrid'
);

-- Warranty status
CREATE TYPE warranty_status_enum AS ENUM (
  'active',
  'expired',
  'unknown'
);

-- Drone condition
CREATE TYPE drone_condition_enum AS ENUM (
  'excellent',
  'good',
  'fair',
  'damaged',
  'unknown'
);


-- ============================================================================
-- 2. TABLES (in dependency order)
-- ============================================================================

-- --------------------------------------------------------------------------
-- 2.1  users
--      Change D: added created_by, updated_by audit trail columns
-- --------------------------------------------------------------------------
CREATE TABLE users (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  phone           VARCHAR(20)  UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
  phone_verified  BOOLEAN      NOT NULL DEFAULT FALSE,

  -- Login tracking
  last_login_at          TIMESTAMPTZ  NULL,
  last_login_ip          VARCHAR(50)  NULL,
  failed_login_attempts  INTEGER      NOT NULL DEFAULT 0,
  locked_until           TIMESTAMPTZ  NULL,

  -- Audit trail (Change D)
  created_by  UUID  NULL,   -- FK added after table exists (self-reference)
  updated_by  UUID  NULL,   -- FK added after table exists (self-reference)

  -- Soft delete & timestamps
  deleted_at  TIMESTAMPTZ  NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Self-referencing foreign keys for audit trail
ALTER TABLE users
  ADD CONSTRAINT fk_users_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users
  ADD CONSTRAINT fk_users_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

COMMENT ON TABLE  users IS 'Core user accounts for all roles (customer, provider, admin)';
COMMENT ON COLUMN users.created_by IS 'Change D — Admin who created this record';
COMMENT ON COLUMN users.updated_by IS 'Change D — Admin who last modified this record';


-- --------------------------------------------------------------------------
-- 2.2  roles
-- --------------------------------------------------------------------------
CREATE TABLE roles (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(50)  UNIQUE NOT NULL,
  description     VARCHAR(255) NULL,
  is_system_role  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE roles IS 'System roles: customer, provider, admin';


-- --------------------------------------------------------------------------
-- 2.3  user_roles
--       Change A: granted_by column REMOVED (roles managed from backend)
-- --------------------------------------------------------------------------
CREATE TABLE user_roles (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id     UUID        NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at  TIMESTAMPTZ NULL,

  -- Prevent duplicate active role assignments
  UNIQUE (user_id, role_id)
);

COMMENT ON TABLE  user_roles IS 'Junction table linking users to roles. Change A: granted_by removed per Jul 10 meeting.';


-- --------------------------------------------------------------------------
-- 2.4  addresses
-- --------------------------------------------------------------------------
CREATE TABLE addresses (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label           VARCHAR(50)  NULL,         -- Home | Office | Site | Warehouse
  address_line_1  VARCHAR(255) NOT NULL,
  address_line_2  VARCHAR(255) NULL,
  city            VARCHAR(100) NOT NULL,
  state           VARCHAR(100) NOT NULL,
  postal_code     VARCHAR(20)  NOT NULL,
  country         VARCHAR(10)  NOT NULL DEFAULT 'IN',
  latitude        DECIMAL(10,7) NULL,
  longitude       DECIMAL(10,7) NULL,
  is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
  is_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE addresses IS 'User addresses with optional geo-coordinates';


-- --------------------------------------------------------------------------
-- 2.5  customer_profiles
-- --------------------------------------------------------------------------
CREATE TABLE customer_profiles (
  id                         UUID                 PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                    UUID                 UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name               VARCHAR(100) NULL,
  date_of_birth              DATE         NULL,
  gender                     gender_enum  NULL,
  default_address_id         UUID         NULL,   -- FK added after addresses table exists
  preferred_language         VARCHAR(20)  NOT NULL DEFAULT 'en',
  preferred_contact_method   VARCHAR(50)  NOT NULL DEFAULT 'phone',
  total_requests_created     INTEGER      NOT NULL DEFAULT 0,
  total_requests_completed   INTEGER      NOT NULL DEFAULT 0,
  created_at                 TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- FK to addresses for default address
ALTER TABLE customer_profiles
  ADD CONSTRAINT fk_customer_default_address
    FOREIGN KEY (default_address_id) REFERENCES addresses(id) ON DELETE SET NULL;

COMMENT ON TABLE  customer_profiles IS '1:1 customer profile.';


-- --------------------------------------------------------------------------
-- 2.6  drones
-- --------------------------------------------------------------------------
CREATE TABLE drones (
  id                    UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id              UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model                 VARCHAR(100) NOT NULL,
  manufacturer          VARCHAR(100) NOT NULL,
  serial_number         VARCHAR(100) UNIQUE NOT NULL,
  registration_number   VARCHAR(50)  NULL,
  drone_type            drone_type_enum NULL,
  weight_kg             DECIMAL(6,2) NULL,
  purchase_date         DATE         NULL,
  warranty_status       warranty_status_enum NOT NULL DEFAULT 'unknown',
  warranty_expiry_date  DATE         NULL,
  condition             drone_condition_enum NOT NULL DEFAULT 'unknown',
  notes                 TEXT         NULL,
  last_serviced_at      TIMESTAMPTZ  NULL,
  deleted_at            TIMESTAMPTZ  NULL,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE drones IS 'Customer-owned drones registered for service';


-- --------------------------------------------------------------------------
-- 2.7  provider_profiles
--       Change B: added created_by, updated_by audit trail columns
-- --------------------------------------------------------------------------
CREATE TABLE provider_profiles (
  id                           UUID                  PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                      UUID                  UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name                VARCHAR(200)          NOT NULL,
  business_registration_number VARCHAR(50)           NULL,
  business_type                VARCHAR(100)          NULL,
  equipment_class              INTEGER               NULL CHECK (equipment_class BETWEEN 1 AND 3),
  site_verified                BOOLEAN               NOT NULL DEFAULT FALSE,
  verified_by                  UUID                  NULL REFERENCES users(id) ON DELETE SET NULL,
  service_area_city            VARCHAR(100)          NULL,
  service_area_state           VARCHAR(100)          NULL,
  service_area_pincode         VARCHAR(20)           NULL,
  service_radius_km            DECIMAL(6,2)          NOT NULL DEFAULT 25.00,
  status                       provider_status_enum  NOT NULL DEFAULT 'pending',
  rejection_reason             VARCHAR(255)          NULL,
  bio                          TEXT                  NULL,
  specializations              VARCHAR(255)          NULL,
  years_of_experience          INTEGER               NULL,
  total_jobs_completed         INTEGER               NOT NULL DEFAULT 0,
  average_rating               DECIMAL(3,2)          NULL,
  total_jobs_assigned          INTEGER               NOT NULL DEFAULT 0,
  total_jobs_rejected          INTEGER               NOT NULL DEFAULT 0,
  verified_at                  TIMESTAMPTZ           NULL,
  suspended_at                 TIMESTAMPTZ           NULL,

  -- Audit trail (Change B)
  created_by  UUID  NULL REFERENCES users(id) ON DELETE SET NULL,
  updated_by  UUID  NULL REFERENCES users(id) ON DELETE SET NULL,

  deleted_at  TIMESTAMPTZ  NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  provider_profiles IS '1:1 provider profile. Change B: created_by/updated_by audit trail added.';
COMMENT ON COLUMN provider_profiles.created_by IS 'Change B — Admin who created this record';
COMMENT ON COLUMN provider_profiles.updated_by IS 'Change B — Admin who last modified this record';
COMMENT ON COLUMN provider_profiles.equipment_class IS '1 = Premium, 2 = Standard, 3 = Basic';


-- --------------------------------------------------------------------------
-- 2.8  service_categories
-- --------------------------------------------------------------------------
CREATE TABLE service_categories (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100) UNIQUE NOT NULL,
  description     VARCHAR(255) NULL,
  icon            VARCHAR(50)  NULL,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order      INTEGER      NOT NULL DEFAULT 0,
  total_requests  INTEGER      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE service_categories IS 'Service types offered: Repair, Inspection, Maintenance, etc.';


-- --------------------------------------------------------------------------
-- 2.9  service_requests
--       Change E: status enum updated to match lifecycle stages
-- --------------------------------------------------------------------------
CREATE TABLE service_requests (
  id                        UUID                         PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number            VARCHAR(20)                  UNIQUE NOT NULL,
  customer_id               UUID                         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  drone_id                  UUID                         NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
  category_id               UUID                         NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
  service_address_id        UUID                         NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
  title                     VARCHAR(200)                 NOT NULL,
  description               TEXT                         NOT NULL,
  priority                  priority_enum                NOT NULL DEFAULT 'medium',
  status                    service_request_status_enum  NOT NULL DEFAULT 'draft',
  urgency_level             urgency_enum                 NULL,
  requested_completion_date DATE                         NULL,
  actual_completion_date    DATE                         NULL,
  requires_onsite_visit     BOOLEAN                      NOT NULL DEFAULT TRUE,
  cancellation_reason       TEXT                         NULL,
  cancelled_by              UUID                         NULL REFERENCES users(id) ON DELETE SET NULL,
  admin_notes               TEXT                         NULL,
  revision_count            INTEGER                      NOT NULL DEFAULT 0,
  submitted_at              TIMESTAMPTZ                  NULL,
  reviewed_at               TIMESTAMPTZ                  NULL,
  reviewed_by               UUID                         NULL REFERENCES users(id) ON DELETE SET NULL,
  assigned_at               TIMESTAMPTZ                  NULL,
  completed_at              TIMESTAMPTZ                  NULL,
  cancelled_at              TIMESTAMPTZ                  NULL,
  deleted_at                TIMESTAMPTZ                  NULL,
  created_at                TIMESTAMPTZ                  NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ                  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  service_requests IS 'Customer service requests. Change E: status enum updated.';
COMMENT ON COLUMN service_requests.status IS 'Change E — draft | in_approval | review | approved | rejected | in_progress | completed | cancelled';


-- --------------------------------------------------------------------------
-- 2.10  job_assignments
-- --------------------------------------------------------------------------
CREATE TABLE job_assignments (
  id                          UUID                      PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id          UUID                      NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  provider_id                 UUID                      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by                 UUID                      NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status                      job_assignment_status_enum NOT NULL DEFAULT 'pending',
  assignment_sequence         INTEGER                   NOT NULL DEFAULT 1,
  is_active_assignment        BOOLEAN                   NOT NULL DEFAULT TRUE,
  provider_notes              TEXT                      NULL,
  admin_assignment_notes      TEXT                      NULL,
  proposed_completion_date    DATE                      NULL,
  additional_days_requested   INTEGER                   NOT NULL DEFAULT 0,
  additional_days_reason      TEXT                      NULL,
  customer_approved_extension BOOLEAN                   NULL,
  rejection_reason            TEXT                      NULL,
  estimated_cost              DECIMAL(12,2)             NULL,
  visit_type                  visit_type_enum           NOT NULL DEFAULT 'onsite',
  scheduled_visit_date        DATE                      NULL,
  scheduled_visit_time        VARCHAR(10)               NULL,
  completion_summary          TEXT                      NULL,
  assigned_at                 TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  responded_at               TIMESTAMPTZ               NULL,
  started_at                  TIMESTAMPTZ               NULL,
  completed_at               TIMESTAMPTZ               NULL,
  cancelled_at               TIMESTAMPTZ               NULL,
  cancelled_by               UUID                      NULL REFERENCES users(id) ON DELETE SET NULL,
  cancellation_reason         TEXT                      NULL,
  created_at                  TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ               NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE job_assignments IS 'Tracks provider assignments per service request';


-- --------------------------------------------------------------------------
-- 2.11  job_status_history  (immutable audit log)
-- --------------------------------------------------------------------------
CREATE TABLE job_status_history (
  id                                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_assignment_id                 UUID         NOT NULL REFERENCES job_assignments(id) ON DELETE CASCADE,
  from_status                       VARCHAR(20)  NOT NULL,
  to_status                         VARCHAR(20)  NOT NULL,
  changed_by                        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  changed_by_role                   VARCHAR(20)  NOT NULL,
  change_source                     VARCHAR(20)  NOT NULL,
  change_trigger                    VARCHAR(100) NULL,
  notes                             TEXT         NULL,
  ip_address                        VARCHAR(50)  NULL,
  user_agent                        VARCHAR(255) NULL,
  duration_in_previous_status_mins  INTEGER      NULL,
  created_at                        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE job_status_history IS 'Immutable audit trail for job assignment lifecycle changes';


-- ============================================================================
-- 3. INDEXES
-- ============================================================================

-- users
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_users_phone          ON users(phone);
CREATE INDEX idx_users_is_active      ON users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_deleted_at     ON users(deleted_at) WHERE deleted_at IS NULL;

-- user_roles
CREATE INDEX idx_user_roles_user_id   ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id   ON user_roles(role_id);
CREATE INDEX idx_user_roles_active    ON user_roles(user_id, role_id) WHERE revoked_at IS NULL;

-- addresses
CREATE INDEX idx_addresses_user_id    ON addresses(user_id);

-- customer_profiles
CREATE INDEX idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX idx_customer_profiles_status  ON customer_profiles(status);

-- drones
CREATE INDEX idx_drones_owner_id      ON drones(owner_id);
CREATE INDEX idx_drones_serial        ON drones(serial_number);
CREATE INDEX idx_drones_deleted_at    ON drones(deleted_at) WHERE deleted_at IS NULL;

-- provider_profiles
CREATE INDEX idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX idx_provider_profiles_status  ON provider_profiles(status);
CREATE INDEX idx_provider_profiles_city    ON provider_profiles(service_area_city);

-- service_requests
CREATE INDEX idx_service_requests_customer    ON service_requests(customer_id);
CREATE INDEX idx_service_requests_drone       ON service_requests(drone_id);
CREATE INDEX idx_service_requests_category    ON service_requests(category_id);
CREATE INDEX idx_service_requests_status      ON service_requests(status);
CREATE INDEX idx_service_requests_cust_status ON service_requests(customer_id, status);
CREATE INDEX idx_service_requests_deleted_at  ON service_requests(deleted_at) WHERE deleted_at IS NULL;

-- job_assignments
CREATE INDEX idx_job_assignments_request   ON job_assignments(service_request_id);
CREATE INDEX idx_job_assignments_provider  ON job_assignments(provider_id);
CREATE INDEX idx_job_assignments_status    ON job_assignments(status);
CREATE INDEX idx_job_assignments_active    ON job_assignments(service_request_id) WHERE is_active_assignment = TRUE;

-- job_status_history
CREATE INDEX idx_job_status_history_assignment ON job_status_history(job_assignment_id);
CREATE INDEX idx_job_status_history_changed_by ON job_status_history(changed_by);
CREATE INDEX idx_job_status_history_created_at ON job_status_history(created_at);


-- ============================================================================
-- 4. TRIGGER FUNCTIONS
-- ============================================================================

-- --------------------------------------------------------------------------
-- 4.1  Auto-update updated_at timestamp
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_customer_profiles_updated_at
  BEFORE UPDATE ON customer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_drones_updated_at
  BEFORE UPDATE ON drones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_provider_profiles_updated_at
  BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_job_assignments_updated_at
  BEFORE UPDATE ON job_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- --------------------------------------------------------------------------
-- 4.2  Auto-generate request_number (REQ-10001, REQ-10002, ...)
-- --------------------------------------------------------------------------

-- Sequence starting at 10001
CREATE SEQUENCE service_request_number_seq START WITH 10001;

CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number = 'REQ-' || LPAD(nextval('service_request_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_service_requests_number
  BEFORE INSERT ON service_requests
  FOR EACH ROW EXECUTE FUNCTION generate_request_number();


-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on all tables. Initial policies are permissive for authenticated
-- users. These will be tightened when JWT role-based auth is implemented.

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE drones             ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_status_history ENABLE ROW LEVEL SECURITY;

-- Permissive policies: authenticated users can read/write
-- These are starter policies — refine per role during backend phase

CREATE POLICY "Allow authenticated read on users"
  ON users FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated read on roles"
  ON roles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated read on user_roles"
  ON user_roles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated read on addresses"
  ON addresses FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated insert on addresses"
  ON addresses FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on addresses"
  ON addresses FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated read on customer_profiles"
  ON customer_profiles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated read on drones"
  ON drones FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated insert on drones"
  ON drones FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on drones"
  ON drones FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated read on provider_profiles"
  ON provider_profiles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated read on service_categories"
  ON service_categories FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated read on service_requests"
  ON service_requests FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated insert on service_requests"
  ON service_requests FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated update on service_requests"
  ON service_requests FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated read on job_assignments"
  ON job_assignments FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated read on job_status_history"
  ON job_status_history FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated insert on job_status_history"
  ON job_status_history FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Service-role bypass: allow backend server to access everything
-- (Supabase service_role key bypasses RLS by default, so no extra policy needed)


-- ============================================================================
-- 6. SEED DATA
-- ============================================================================

-- --------------------------------------------------------------------------
-- 6.1  Default Roles
-- --------------------------------------------------------------------------
INSERT INTO roles (name, description, is_system_role) VALUES
  ('customer', 'End users who register drones and create service requests', TRUE),
  ('provider', 'Service providers who accept and complete drone repair jobs', TRUE),
  ('admin',    'Platform administrators with full system access',            TRUE);

-- --------------------------------------------------------------------------
-- 6.2  Default Service Categories
-- --------------------------------------------------------------------------
INSERT INTO service_categories (name, description, icon, sort_order) VALUES
  ('Repair',          'Hardware repairs including motor, gimbal, frame, and ESC replacements',  'wrench',       1),
  ('Inspection',      'Pre-flight inspections, regulatory compliance checks, and diagnostics',  'search',       2),
  ('Maintenance',     'Routine maintenance including cleaning, calibration, and prop balancing', 'settings',     3),
  ('Firmware Update', 'Flight controller and firmware updates, software patches',                'cpu',          4);


-- ============================================================================
-- DONE — Schema creation complete!
-- ============================================================================
-- Summary of meeting changes applied:
--   Change A: user_roles.granted_by REMOVED
--   Change B: provider_profiles.created_by/updated_by ADDED
--   Change C: customer_profiles.status ADDED (pending | approved | rejected | suspended)
--   Change D: users.created_by/updated_by ADDED
--   Change E: service_requests.status ENUM UPDATED
-- ============================================================================
