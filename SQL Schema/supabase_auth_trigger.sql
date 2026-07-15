-- ============================================================================
-- Supabase Auth Synchronization Trigger
-- Automatically creates records in `public.users` and either `customer_profiles`
-- or `provider_profiles` when a new user signs up via Supabase Auth.
-- ============================================================================
-- HOW TO RUN:
--   1. Open your Supabase Dashboard -> SQL Editor
--   2. Paste this entire file and run it.
-- ============================================================================

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  role_id_var UUID;
  user_role_name VARCHAR(50);
BEGIN
  -- 1. Insert into public.users
  INSERT INTO public.users (
    id,
    email,
    phone,
    password_hash,
    first_name,
    last_name,
    is_active,
    email_verified,
    phone_verified
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', 'pending-' || NEW.id), -- Phone must be unique, provide fallback
    'supabase-auth', -- Password hash is managed by Supabase
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Unknown'),
    TRUE,
    FALSE,
    FALSE
  );

  -- 2. Determine Role (from metadata passed during sign up)
  user_role_name := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');

  -- Get Role ID
  SELECT id INTO role_id_var FROM public.roles WHERE name = user_role_name;

  -- 3. Assign Role in user_roles table
  IF role_id_var IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, role_id_var);
  END IF;

  -- 4. Create appropriate Profile
  IF user_role_name = 'customer' THEN
    INSERT INTO public.customer_profiles (
      user_id,
      display_name
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
  ELSIF user_role_name = 'provider' THEN
    INSERT INTO public.provider_profiles (
      user_id,
      business_name,
      status
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', 'Pending Business Name'),
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
