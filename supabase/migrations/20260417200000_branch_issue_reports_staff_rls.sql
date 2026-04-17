-- POS staff: แจ้งปัญหาสาขาได้เอง (เฉพาะสาขาที่ถูก assign)

DROP POLICY IF EXISTS "branch_issue_reports_select_admin" ON public.branch_issue_reports;
CREATE POLICY "branch_issue_reports_select_admin_or_staff_branch"
  ON public.branch_issue_reports FOR SELECT
  USING (
    public.is_admin()
    OR (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'staff'
      )
      AND EXISTS (
        SELECT 1 FROM public.staff_branch_assignments s
        WHERE s.user_id = auth.uid()
          AND s.branch_id = branch_issue_reports.branch_id
      )
    )
  );

DROP POLICY IF EXISTS "branch_issue_reports_insert_admin" ON public.branch_issue_reports;
CREATE POLICY "branch_issue_reports_insert_admin_or_staff_branch"
  ON public.branch_issue_reports FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'staff'
      )
      AND EXISTS (
        SELECT 1 FROM public.staff_branch_assignments s
        WHERE s.user_id = auth.uid()
          AND s.branch_id = branch_id
      )
    )
  );
