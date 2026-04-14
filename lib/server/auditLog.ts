import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/types/database";

export async function insertAuditLog(
  service: SupabaseClient<Database>,
  row: {
    actor_id: string;
    action: string;
    entity: string;
    entity_id: string;
    payload?: Record<string, unknown> | null;
  },
): Promise<void> {
  await service.from("audit_log").insert({
    actor_id: row.actor_id,
    action: row.action,
    entity: row.entity,
    entity_id: row.entity_id,
    payload: (row.payload ?? null) as Json,
  });
}
