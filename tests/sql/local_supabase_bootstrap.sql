-- Minimal Supabase-compatible primitives for disposable PostgreSQL validation.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE service_role NOLOGIN BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  phone TEXT,
  raw_user_meta_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  email_confirmed_at TIMESTAMPTZ,
  phone_confirmed_at TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', TRUE), '')::UUID
$$;
