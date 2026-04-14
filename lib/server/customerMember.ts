import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type CustomerMemberRow = Pick<
  Database["public"]["Tables"]["members"]["Row"],
  "id" | "name" | "email" | "phone"
>;

/**
 * Find or create a `members` row for the logged-in website customer (auth user).
 * Bookings reference `members.id`, not `profiles.id`.
 */
export async function getOrCreateMemberForUser(
  service: SupabaseClient<Database>,
  params: {
    email: string;
    displayName: string;
    phone?: string;
  },
): Promise<CustomerMemberRow> {
  const email = params.email.trim().toLowerCase();
  if (!email) {
    throw new Error("Email required");
  }

  const { data: rows } = await service
    .from("members")
    .select("id, name, email, phone")
    .eq("email", email)
    .limit(1);

  const existing = rows?.[0];
  if (existing) {
    return existing;
  }

  const name =
    params.displayName.trim() ||
    email.split("@")[0] ||
    "ลูกค้า";

  const { data: created, error } = await service
    .from("members")
    .insert({
      name,
      email,
      phone: (params.phone ?? "").trim() || "0000000000",
      status: "active",
      wallet_balance: 0,
      verified: false,
    })
    .select("id, name, email, phone")
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  if (!created) {
    throw new Error("Failed to create member");
  }

  return created;
}
