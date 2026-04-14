-- POS staff: profiles.role staff, is_admin / is_operator, pos_transactions, bookings.branch_id, RLS split

-- ---------------------------------------------------------------------------
-- 1) profiles.role includes staff
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'customer', 'staff'));

-- ---------------------------------------------------------------------------
-- 2) Auth helper functions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
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

CREATE OR REPLACE FUNCTION public.is_operator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
  );
$$;

-- Backwards compat: is_staff() = admin only (same as before customer_portal semantics)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin();
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_operator() TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3) handle_new_user: allow app_role staff (set only via trusted Admin API)
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
  IF r NOT IN ('admin', 'customer', 'staff') THEN
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
-- 4) bookings.branch_id (text FK → branches.id)
-- ---------------------------------------------------------------------------
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS branch_id text REFERENCES public.branches (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_branch_id ON public.bookings (branch_id);

UPDATE public.bookings b
SET branch_id = br.id
FROM public.branches br
WHERE b.branch_id IS NULL
  AND b.branch_name IS NOT NULL
  AND TRIM(b.branch_name) != ''
  AND (
    br.id = b.branch_name
    OR br.name_th = b.branch_name
    OR br.name = b.branch_name
  );

-- ---------------------------------------------------------------------------
-- 5) pos_transactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  member_id uuid NOT NULL REFERENCES public.members (id) ON DELETE CASCADE,
  branch_id text NOT NULL REFERENCES public.branches (id) ON DELETE RESTRICT,
  staff_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  currency_code text NOT NULL,
  amount double precision NOT NULL,
  rate double precision NOT NULL,
  total_thb double precision NOT NULL,
  note text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_pos_txn_member ON public.pos_transactions (member_id);
CREATE INDEX IF NOT EXISTS idx_pos_txn_branch_created ON public.pos_transactions (branch_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pos_txn_staff ON public.pos_transactions (staff_user_id);

ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pos_transactions_select_operator" ON public.pos_transactions;
CREATE POLICY "pos_transactions_select_operator"
  ON public.pos_transactions FOR SELECT
  USING (public.is_operator());

DROP POLICY IF EXISTS "pos_transactions_insert_operator" ON public.pos_transactions;
CREATE POLICY "pos_transactions_insert_operator"
  ON public.pos_transactions FOR INSERT
  WITH CHECK (public.is_operator());

-- ---------------------------------------------------------------------------
-- 6) RLS policies — drop & recreate
-- ---------------------------------------------------------------------------

-- profiles
DROP POLICY IF EXISTS "profiles_select_own_or_staff" ON public.profiles;
CREATE POLICY "profiles_select_own_or_staff"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own_or_staff" ON public.profiles;
CREATE POLICY "profiles_update_own_or_staff"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_staff" ON public.profiles;
CREATE POLICY "profiles_insert_staff"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin());

-- articles (admin only for mutate; read published or admin)
DROP POLICY IF EXISTS "articles_select_public_or_staff" ON public.articles;
CREATE POLICY "articles_select_public_or_staff"
  ON public.articles FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "articles_insert_staff" ON public.articles;
CREATE POLICY "articles_insert_staff"
  ON public.articles FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "articles_update_staff" ON public.articles;
CREATE POLICY "articles_update_staff"
  ON public.articles FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "articles_delete_staff" ON public.articles;
CREATE POLICY "articles_delete_staff"
  ON public.articles FOR DELETE
  USING (public.is_admin());

-- currencies
DROP POLICY IF EXISTS "currencies_insert_staff" ON public.currencies;
CREATE POLICY "currencies_insert_staff"
  ON public.currencies FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "currencies_update_staff" ON public.currencies;
CREATE POLICY "currencies_update_staff"
  ON public.currencies FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "currencies_delete_staff" ON public.currencies;
CREATE POLICY "currencies_delete_staff"
  ON public.currencies FOR DELETE
  USING (public.is_admin());

-- members: operators read/update; admin insert/delete
DROP POLICY IF EXISTS "members_select_staff" ON public.members;
CREATE POLICY "members_select_staff"
  ON public.members FOR SELECT
  USING (public.is_operator());

DROP POLICY IF EXISTS "members_insert_staff" ON public.members;
CREATE POLICY "members_insert_staff"
  ON public.members FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "members_update_staff" ON public.members;
CREATE POLICY "members_update_staff"
  ON public.members FOR UPDATE
  USING (public.is_operator());

DROP POLICY IF EXISTS "members_delete_staff" ON public.members;
CREATE POLICY "members_delete_staff"
  ON public.members FOR DELETE
  USING (public.is_admin());

-- bookings
DROP POLICY IF EXISTS "bookings_all_staff" ON public.bookings;
CREATE POLICY "bookings_all_staff"
  ON public.bookings FOR ALL
  USING (public.is_operator())
  WITH CHECK (public.is_operator());

-- topup_requests: admin only
DROP POLICY IF EXISTS "topups_all_staff" ON public.topup_requests;
CREATE POLICY "topups_all_staff"
  ON public.topup_requests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- exchange_rate_cache: admin only
DROP POLICY IF EXISTS "exchange_cache_select_staff" ON public.exchange_rate_cache;
CREATE POLICY "exchange_cache_select_staff"
  ON public.exchange_rate_cache FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "exchange_cache_insert_staff" ON public.exchange_rate_cache;
CREATE POLICY "exchange_cache_insert_staff"
  ON public.exchange_rate_cache FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "exchange_cache_update_staff" ON public.exchange_rate_cache;
CREATE POLICY "exchange_cache_update_staff"
  ON public.exchange_rate_cache FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "exchange_cache_delete_staff" ON public.exchange_rate_cache;
CREATE POLICY "exchange_cache_delete_staff"
  ON public.exchange_rate_cache FOR DELETE
  USING (public.is_admin());

-- contact_messages: admin only
DROP POLICY IF EXISTS "contact_select_staff" ON public.contact_messages;
CREATE POLICY "contact_select_staff"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "contact_update_staff" ON public.contact_messages;
CREATE POLICY "contact_update_staff"
  ON public.contact_messages FOR UPDATE
  USING (public.is_admin());

-- branches / margins: admin only for writes
DROP POLICY IF EXISTS "branches_insert_staff" ON public.branches;
CREATE POLICY "branches_insert_staff"
  ON public.branches FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "branches_update_staff" ON public.branches;
CREATE POLICY "branches_update_staff"
  ON public.branches FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "branches_delete_staff" ON public.branches;
CREATE POLICY "branches_delete_staff"
  ON public.branches FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "margins_insert_staff" ON public.branch_currency_margins;
CREATE POLICY "margins_insert_staff"
  ON public.branch_currency_margins FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "margins_update_staff" ON public.branch_currency_margins;
CREATE POLICY "margins_update_staff"
  ON public.branch_currency_margins FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "margins_delete_staff" ON public.branch_currency_margins;
CREATE POLICY "margins_delete_staff"
  ON public.branch_currency_margins FOR DELETE
  USING (public.is_admin());

GRANT ALL ON TABLE public.pos_transactions TO postgres, anon, authenticated, service_role;
