import { createClient } from "@/lib/supabase/server";
import {
  getSessionProfile,
  isAdminRole,
} from "@/lib/server/profileRole";
import { NextResponse } from "next/server";

/** GET /api/pos/members — search/list members (admin only; สำหรับหน้า POS ลูกค้า) */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim();
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") ?? 80) || 80, 1),
      200,
    );

    let query = supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status as "active" | "suspended" | "banned");
    }

    if (q && q.length > 0) {
      const esc = q.replace(/%/g, "\\%").replace(/,/g, "");
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRe.test(q)) {
        query = query.eq("id", q);
      } else {
        query = query.or(
          `phone.ilike.%${esc}%,email.ilike.%${esc}%,name.ilike.%${esc}%,identity_lookup_key.ilike.%${esc}%`,
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
