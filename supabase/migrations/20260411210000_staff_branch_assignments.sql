-- Staff ↔ branch assignments (POS): server-enforced; admin manages rows.

CREATE TABLE IF NOT EXISTS public.staff_branch_assignments (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  branch_id text NOT NULL REFERENCES public.branches (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_branch_user ON public.staff_branch_assignments (user_id);
CREATE INDEX IF NOT EXISTS idx_staff_branch_branch ON public.staff_branch_assignments (branch_id);

ALTER TABLE public.staff_branch_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_branch_assignments_select_own_or_admin"
  ON public.staff_branch_assignments;
CREATE POLICY "staff_branch_assignments_select_own_or_admin"
  ON public.staff_branch_assignments FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "staff_branch_assignments_mutate_admin"
  ON public.staff_branch_assignments;
CREATE POLICY "staff_branch_assignments_mutate_admin"
  ON public.staff_branch_assignments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT ALL ON TABLE public.staff_branch_assignments TO postgres, anon, authenticated, service_role;
