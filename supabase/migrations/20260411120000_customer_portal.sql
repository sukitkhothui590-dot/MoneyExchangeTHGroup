-- Customer portal: distinguish admin vs customer in profiles, fix is_staff(), optional terms timestamp, avatars bucket.
-- Run after base schema.sql in Supabase SQL Editor if not using CLI migrate.

-- ---------------------------------------------------------------------------
-- 1) profiles.role: allow 'customer'
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'customer'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_email text;

-- ---------------------------------------------------------------------------
-- 2) is_staff() = admin only (was: any row in profiles — wrongly included customers)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 3) New user trigger: role from raw_user_meta_data.app_role (default customer)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r text;
BEGIN
  r := COALESCE(new.raw_user_meta_data->>'app_role', 'customer');
  IF r NOT IN ('admin', 'customer') THEN
    r := 'customer';
  END IF;

  INSERT INTO public.profiles (id, name, email, role, phone, terms_accepted_at)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      split_part(COALESCE(new.email, 'user@local'), '@', 1)
    ),
    COALESCE(new.email, ''),
    r,
    NULLIF(TRIM(COALESCE(new.raw_user_meta_data->>'phone', '')), ''),
    CASE
      WHEN new.raw_user_meta_data->>'terms_accepted_at' IS NOT NULL
         AND new.raw_user_meta_data->>'terms_accepted_at' != ''
      THEN (new.raw_user_meta_data->>'terms_accepted_at')::timestamptz
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4) Avatars bucket (public read; user uploads own file under auth uid)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', true, 2097152)
ON CONFLICT (id) DO NOTHING;

-- Idempotent: safe to re-run if policies were created in a previous attempt
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;

CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND name LIKE auth.uid()::text || '/%'
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND name LIKE auth.uid()::text || '/%'
  );

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND name LIKE auth.uid()::text || '/%'
  );

-- Allow authenticated users to insert their own profile if trigger missed (edge cases)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid() AND role = 'customer');
