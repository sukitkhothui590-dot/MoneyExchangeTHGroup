import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/server/profileRole";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const service = await createServiceClient();

    const [memberRes, txRes, bookingRes, kycRes, topupRes] = await Promise.all([
      service.from("members").select("*").eq("id", id).limit(1),
      service
        .from("pos_transactions")
        .select("*")
        .eq("member_id", id)
        .order("created_at", { ascending: false })
        .limit(200),
      service
        .from("bookings")
        .select("*")
        .eq("member_id", id)
        .order("created_at", { ascending: false })
        .limit(100),
      service
        .from("kyc_submissions")
        .select("*")
        .eq("member_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      service
        .from("topup_requests")
        .select("*")
        .eq("member_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const member = memberRes.data?.[0] ?? null;
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({
      member,
      transactions: txRes.data ?? [],
      bookings: bookingRes.data ?? [],
      kyc_submissions: kycRes.data ?? [],
      topup_requests: topupRes.data ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
