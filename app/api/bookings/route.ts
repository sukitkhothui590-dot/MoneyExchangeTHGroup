import { newBookingReference } from "@/lib/book/bookingReference";
import { createClient } from "@/lib/supabase/server";
import {
  getSessionProfile,
  isOperatorRole,
} from "@/lib/server/profileRole";
import { staffCanUseBranch } from "@/lib/server/staffBranches";
import { NextResponse } from "next/server";

// GET /api/bookings — List bookings (admin: all or filtered; staff: branchId required)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const branchId = searchParams.get("branchId");

    if (session.role === "staff" && !branchId?.trim()) {
      return NextResponse.json(
        { error: "branchId is required for staff" },
        { status: 400 },
      );
    }

    if (session.role === "staff" && branchId?.trim()) {
      const ok = await staffCanUseBranch(
        supabase,
        session.userId,
        session.role,
        branchId.trim(),
      );
      if (!ok) {
        return NextResponse.json({ error: "Forbidden branch" }, { status: 403 });
      }
    }

    let query = supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (branchId?.trim()) {
      query = query.eq("branch_id", branchId.trim());
    }

    if (status) {
      query = query.eq(
        "status",
        status as
          | "pending_payment"
          | "pending_review"
          | "approved"
          | "completed",
      );
    }

    const { data, error } = await query;

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

// POST /api/bookings — Create new booking
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const branchId = body.branch_id ?? body.branchId ?? null;
    const branchName = body.branch_name ?? body.branchName ?? null;

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        member_id: body.member_id || body.memberId,
        member_name: body.member_name || body.memberName,
        currency_code: body.currency_code || body.currencyCode,
        currency_flag: body.currency_flag || body.currencyFlag || "",
        amount: body.amount,
        rate: body.rate,
        total_thb: body.total_thb || body.totalThb,
        pickup_method: body.pickup_method || body.pickupMethod || "branch",
        branch_name: branchName,
        branch_id: branchId,
        pickup_date: body.pickup_date || body.pickupDate || null,
        status: body.status || "pending_payment",
        slip_url: body.slip_url || body.slipUrl || "",
        note: body.note || "",
        confirmation_code:
          String(body.confirmation_code ?? body.confirmationCode ?? "").trim() ||
          newBookingReference(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
