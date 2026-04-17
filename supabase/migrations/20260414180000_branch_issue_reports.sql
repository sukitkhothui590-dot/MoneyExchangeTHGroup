-- Admin reports: per-branch issue log (problems encountered at a branch)

CREATE TABLE IF NOT EXISTS public.branch_issue_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id text NOT NULL REFERENCES public.branches (id) ON DELETE CASCADE,
  summary text NOT NULL,
  detail text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  reported_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_branch_issue_branch_reported
  ON public.branch_issue_reports (branch_id, reported_at DESC);

ALTER TABLE public.branch_issue_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "branch_issue_reports_select_admin" ON public.branch_issue_reports;
CREATE POLICY "branch_issue_reports_select_admin"
  ON public.branch_issue_reports FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "branch_issue_reports_insert_admin" ON public.branch_issue_reports;
CREATE POLICY "branch_issue_reports_insert_admin"
  ON public.branch_issue_reports FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "branch_issue_reports_update_admin" ON public.branch_issue_reports;
CREATE POLICY "branch_issue_reports_update_admin"
  ON public.branch_issue_reports FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "branch_issue_reports_delete_admin" ON public.branch_issue_reports;
CREATE POLICY "branch_issue_reports_delete_admin"
  ON public.branch_issue_reports FOR DELETE
  USING (public.is_admin());

GRANT ALL ON TABLE public.branch_issue_reports TO postgres, anon, authenticated, service_role;
