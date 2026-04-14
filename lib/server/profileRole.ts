import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type AppRole = "admin" | "staff" | "customer";

export async function getSessionProfile(
  supabase: SupabaseClient<Database>,
): Promise<{ userId: string; role: AppRole } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (row?.role ?? "customer") as AppRole;
  return { userId: user.id, role };
}

export function isOperatorRole(role: AppRole): boolean {
  return role === "admin" || role === "staff";
}

export function isAdminRole(role: AppRole): boolean {
  return role === "admin";
}
