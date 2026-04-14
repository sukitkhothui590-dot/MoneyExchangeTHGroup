import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getOrCreateMemberForUser } from "@/lib/server/customerMember";
import { newBookingReference } from "@/lib/book/bookingReference";
import { NextResponse } from "next/server";

/**
 * GET /api/customer/bookings — List bookings for the logged-in customer (by member email).
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = await createServiceClient();
    const email = user.email.trim().toLowerCase();
    const { data: memberRows } = await service
      .from("members")
      .select("id")
      .eq("email", email)
      .limit(1);

    const memberId = memberRows?.[0]?.id;
    if (!memberId) {
      return NextResponse.json({ data: [] });
    }

    const { data, error } = await service
      .from("bookings")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/customer/bookings — Create a booking (bypasses RLS via service role; scoped to caller's member).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    const branchId = String(body.branch_id ?? body.branchId ?? "").trim();
    const branchName =
      String(body.branch_name ?? body.branchName ?? "").trim() || null;
    const currencyCode = String(
      body.currency_code ?? body.currencyCode ?? "",
    )
      .trim()
      .toUpperCase();
    const currencyFlag = String(
      body.currency_flag ?? body.currencyFlag ?? "",
    ).trim();
    const amount = Number(body.amount);
    const rate = Number(body.rate);
    const totalThb = Number(body.total_thb ?? body.totalThb);
    const pickupMethod = (body.pickup_method ?? body.pickupMethod ?? "branch") as
      | "branch"
      | "wallet";
    const pickupDate = body.pickup_date ?? body.pickupDate;
    const note = String(body.note ?? "").trim();
    const status = (body.status ?? "pending_payment") as
      | "pending_payment"
      | "pending_review";

    if (!branchId || !currencyCode) {
      return NextResponse.json(
        { error: "branch_id and currency_code are required" },
        { status: 400 },
      );
    }
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isFinite(rate) ||
      rate <= 0 ||
      !Number.isFinite(totalThb) ||
      totalThb <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid amount, rate, or total_thb" },
        { status: 400 },
      );
    }

    const service = await createServiceClient();
    const member = await getOrCreateMemberForUser(service, {
      email: user.email,
      displayName:
        (user.user_metadata?.full_name as string) ||
        user.email.split("@")[0] ||
        "ลูกค้า",
      phone: user.user_metadata?.phone as string | undefined,
    });

    let resolvedBranchId: string | null = branchId || null;
    if (resolvedBranchId) {
      const { data: br } = await service
        .from("branches")
        .select("id")
        .eq("id", resolvedBranchId)
        .maybeSingle();
      if (!br) {
        resolvedBranchId = null;
      }
    }

    const confirmationCode = newBookingReference();

    const { data, error } = await service
      .from("bookings")
      .insert({
        member_id: member.id,
        member_name: member.name,
        currency_code: currencyCode,
        currency_flag: currencyFlag,
        amount,
        rate,
        total_thb: totalThb,
        pickup_method: pickupMethod,
        branch_id: resolvedBranchId,
        branch_name: branchName,
        pickup_date: pickupDate ? String(pickupDate) : null,
        status,
        slip_url: "",
        note,
        confirmation_code: confirmationCode,
      })
      .select()
      .single();

    if (error) {
      console.error("[customer/bookings] insert:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
