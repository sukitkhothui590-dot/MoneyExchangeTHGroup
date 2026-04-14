import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/server/profileRole";
import { NextResponse } from "next/server";

// GET /api/admin/members — fetch all members from Supabase (admin only)
export async function GET() {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const service = await createServiceClient();
    const { data, error } = await service
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/members — delete a member and all related records (admin only)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await request.json().catch(() => ({ id: "" }));
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const service = await createServiceClient();

    // Delete related records first to avoid foreign key violations
    const tryDelete = async (table: "pos_transactions" | "bookings" | "kyc_submissions" | "topup_requests") => {
      try { await service.from(table).delete().eq("member_id", id); } catch { /* table might not exist */ }
    };
    await tryDelete("pos_transactions");
    await tryDelete("bookings");
    await tryDelete("kyc_submissions");
    await tryDelete("topup_requests");

    // Now delete the member
    const { error } = await service
      .from("members")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[admin/members] delete error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
