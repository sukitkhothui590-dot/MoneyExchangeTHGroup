-- Optional rate provenance + KYC submissions (run after void migration if separate)

ALTER TABLE public.pos_transactions
  ADD COLUMN IF NOT EXISTS rate_source text NOT NULL DEFAULT '';

ALTER TABLE public.pos_transactions
  ADD COLUMN IF NOT EXISTS margin_applied_percent double precision;

CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  member_id uuid NOT NULL REFERENCES public.members (id) ON DELETE CASCADE,
  staff_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  session_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  full_name text NOT NULL DEFAULT '',
  id_number text NOT NULL DEFAULT '',
  document_storage_path text,
  note text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_kyc_member ON public.kyc_submissions (member_id);
CREATE INDEX IF NOT EXISTS idx_kyc_session ON public.kyc_submissions (session_key);

ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kyc_submissions_select_operator" ON public.kyc_submissions;
CREATE POLICY "kyc_submissions_select_operator"
  ON public.kyc_submissions FOR SELECT
  USING (public.is_operator());

DROP POLICY IF EXISTS "kyc_submissions_insert_operator" ON public.kyc_submissions;
CREATE POLICY "kyc_submissions_insert_operator"
  ON public.kyc_submissions FOR INSERT
  WITH CHECK (public.is_operator());

DROP POLICY IF EXISTS "kyc_submissions_update_operator" ON public.kyc_submissions;
CREATE POLICY "kyc_submissions_update_operator"
  ON public.kyc_submissions FOR UPDATE
  USING (public.is_operator());

GRANT ALL ON TABLE public.kyc_submissions TO postgres, anon, authenticated, service_role;
