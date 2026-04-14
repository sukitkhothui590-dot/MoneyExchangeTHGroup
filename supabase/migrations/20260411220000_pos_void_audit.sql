-- POS: soft-void transactions + audit log (API uses service client for controlled updates)

ALTER TABLE public.pos_transactions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'voided'));

ALTER TABLE public.pos_transactions
  ADD COLUMN IF NOT EXISTS voided_at timestamptz;

ALTER TABLE public.pos_transactions
  ADD COLUMN IF NOT EXISTS void_reason text NOT NULL DEFAULT '';

ALTER TABLE public.pos_transactions
  ADD COLUMN IF NOT EXISTS voided_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

UPDATE public.pos_transactions SET status = 'active' WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_pos_txn_status_branch ON public.pos_transactions (branch_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text NOT NULL,
  payload jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_log (entity, entity_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_select_admin" ON public.audit_log;
CREATE POLICY "audit_log_select_admin"
  ON public.audit_log FOR SELECT
  USING (public.is_admin());

-- No INSERT/UPDATE for authenticated via anon key — API uses service_role only
DROP POLICY IF EXISTS "audit_log_no_mutate" ON public.audit_log;

GRANT ALL ON TABLE public.audit_log TO postgres, anon, authenticated, service_role;
