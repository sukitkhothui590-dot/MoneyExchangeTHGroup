import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { createServiceClient } from "@/lib/supabase/server";

export type BranchIssueDbRow = {
  id: string;
  branch_id: string;
  summary: string;
  detail: string;
  severity: "low" | "medium" | "high";
  reported_at: string;
  created_by: string | null;
};

export type BranchIssueWithReporter = BranchIssueDbRow & {
  reporter_name: string | null;
};

function buildLabel(
  p: { id: string; name: string | null; email: string | null } | undefined,
): string | null {
  if (!p) return null;
  const n = p.name && String(p.name).trim();
  const e = p.email && String(p.email).trim();
  return n || e || null;
}

/**
 * แนบชื่อผู้ส่ง (profiles) — session ก่อน แล้วเติมด้วย service role ถ้า RLS ไม่ครบ
 */
export async function attachReporterNamesToBranchIssues(
  supabase: SupabaseClient<Database>,
  rows: BranchIssueDbRow[],
): Promise<BranchIssueWithReporter[]> {
  const ids = [
    ...new Set(rows.map((r) => r.created_by).filter(Boolean)),
  ] as string[];
  if (ids.length === 0) {
    return rows.map((r) => ({ ...r, reporter_name: null }));
  }

  const { data: profsSession } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in("id", ids);

  const map = new Map<string, string | null>();
  for (const p of profsSession ?? []) {
    map.set(p.id, buildLabel(p));
  }

  const foundIds = new Set((profsSession ?? []).map((p) => p.id));
  const missingIds = ids.filter((id) => !foundIds.has(id));

  if (
    missingIds.length > 0 &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    try {
      const service = await createServiceClient();
      const { data: profsSvc } = await service
        .from("profiles")
        .select("id, name, email")
        .in("id", missingIds);
      for (const p of profsSvc ?? []) {
        map.set(p.id, buildLabel(p));
      }
    } catch {
      /* ignore */
    }
  }

  return rows.map((r) => ({
    ...r,
    reporter_name: r.created_by ? map.get(r.created_by) ?? null : null,
  }));
}
