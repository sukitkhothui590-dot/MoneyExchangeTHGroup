import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { AppRole } from "@/lib/server/profileRole";

export type BranchOption = { id: string; name_th: string };

/** Branches the user may use in POS: all active branches for admin; assigned only for staff. */
export async function getAllowedBranchesForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: AppRole,
): Promise<BranchOption[]> {
  if (role === "admin") {
    const { data, error } = await supabase
      .from("branches")
      .select("id, name_th")
      .eq("status", "active")
      .order("name_th", { ascending: true });
    if (error) return [];
    return (data ?? []).map((b) => ({ id: b.id, name_th: b.name_th }));
  }
  if (role === "staff") {
    const { data: rows, error } = await supabase
      .from("staff_branch_assignments")
      .select("branch_id")
      .eq("user_id", userId);
    if (error || !rows?.length) return [];
    const ids = rows.map((r) => r.branch_id);
    const { data: br } = await supabase
      .from("branches")
      .select("id, name_th")
      .in("id", ids)
      .eq("status", "active")
      .order("name_th", { ascending: true });
    return (br ?? []).map((b) => ({ id: b.id, name_th: b.name_th }));
  }
  return [];
}

export async function staffCanUseBranch(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: AppRole,
  branchId: string,
): Promise<boolean> {
  if (!branchId.trim()) return false;
  if (role === "admin") {
    const { data } = await supabase
      .from("branches")
      .select("id")
      .eq("id", branchId.trim())
      .maybeSingle();
    return !!data;
  }
  if (role === "staff") {
    const { data } = await supabase
      .from("staff_branch_assignments")
      .select("branch_id")
      .eq("user_id", userId)
      .eq("branch_id", branchId.trim())
      .maybeSingle();
    return !!data;
  }
  return false;
}
