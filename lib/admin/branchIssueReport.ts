export type BranchIssueRow = {
  id: string;
  branch_id: string;
  summary: string;
  detail: string;
  severity: "low" | "medium" | "high";
  reported_at: string;
  created_by?: string | null;
  /** ชื่อหรืออีเมลผู้บันทึก (จาก API) */
  reporter_name?: string | null;
};
