import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/server/profileRole";
import type { AdminPosTransactionRow } from "@/lib/types/adminPos";
import { NextResponse } from "next/server";

// GET /api/admin/pos-transactions — รายการแลกเงิน POS ทั้งระบบ (admin เท่านั้น)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("from")?.trim() ?? "";
    const toDate = searchParams.get("to")?.trim() ?? "";
    const branchId = searchParams.get("branchId")?.trim() ?? "";
    const q = searchParams.get("q")?.trim() ?? "";
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") ?? 2000) || 2000, 1),
      5000,
    );

    const uuidLike =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    let query = supabase
      .from("pos_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (fromDate) {
      query = query.gte("created_at", `${fromDate}T00:00:00.000Z`);
    }
    if (toDate) {
      query = query.lte("created_at", `${toDate}T23:59:59.999Z`);
    }
    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    if (q) {
      if (uuidLike.test(q)) {
        query = query.or(`id.eq.${q},member_id.eq.${q}`);
      } else {
        const esc = q.replace(/%/g, "\\%").replace(/,/g, "");
        const { data: memMatch } = await supabase
          .from("members")
          .select("id")
          .or(
            `name.ilike.%${esc}%,email.ilike.%${esc}%,phone.ilike.%${esc}%`,
          )
          .limit(400);
        const ids = memMatch?.map((m) => m.id) ?? [];
        if (ids.length === 0) {
          return NextResponse.json({ data: [] satisfies AdminPosTransactionRow[] });
        }
        query = query.in("member_id", ids);
      }
    }

    const { data: rows, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = rows ?? [];
    if (list.length === 0) {
      return NextResponse.json({ data: [] satisfies AdminPosTransactionRow[] });
    }

    const memIds = [...new Set(list.map((r) => r.member_id))];
    const brIds = [...new Set(list.map((r) => r.branch_id))];
    const staffIds = [...new Set(list.map((r) => r.staff_user_id).filter(Boolean))];

    const [{ data: members }, { data: branches }, { data: profiles }, { data: kycSubs }] =
      await Promise.all([
        supabase
          .from("members")
          .select("id,name,email,phone,wallet_balance,verified")
          .in("id", memIds),
        supabase.from("branches").select("id,name_th").in("id", brIds),
        staffIds.length
          ? supabase.from("profiles").select("id,name,email").in("id", staffIds)
          : Promise.resolve({ data: [] as { id: string; name: string; email: string }[] | null }),
        supabase
          .from("kyc_submissions")
          .select("member_id,status,updated_at")
          .in("member_id", memIds)
          .order("updated_at", { ascending: false }),
      ]);

    const memberMap = new Map(
      (members ?? []).map((m) => [
        m.id,
        {
          name: m.name,
          email: m.email ?? "",
          phone: m.phone ?? "",
          wallet_balance: m.wallet_balance ?? 0,
          verified: m.verified ?? false,
        },
      ]),
    );

    const branchMap = new Map(
      (branches ?? []).map((b) => [b.id, b.name_th ?? "—"]),
    );

    const profileMap = new Map(
      (profiles ?? []).map((p) => [
        p.id,
        p.name?.trim() || p.email?.split("@")[0] || "—",
      ]),
    );

    const kycLatest = new Map<string, "pending" | "verified" | "rejected">();
    for (const s of kycSubs ?? []) {
      if (!kycLatest.has(s.member_id) && s.status) {
        kycLatest.set(
          s.member_id,
          s.status as "pending" | "verified" | "rejected",
        );
      }
    }

    const enriched: AdminPosTransactionRow[] = list.map((r) => {
      const m = memberMap.get(r.member_id);
      return {
        id: r.id,
        created_at: r.created_at,
        member_id: r.member_id,
        member_name: m?.name ?? "(ไม่พบสมาชิก)",
        member_email: m?.email ?? "",
        member_phone: m?.phone ?? "",
        member_wallet_balance: m?.wallet_balance ?? 0,
        member_verified: m?.verified ?? false,
        currency_code: r.currency_code,
        amount: r.amount,
        rate: r.rate,
        total_thb: r.total_thb,
        status: r.status,
        branch_id: r.branch_id,
        branch_name_th: branchMap.get(r.branch_id) ?? "—",
        staff_user_id: r.staff_user_id,
        staff_display_name: profileMap.get(r.staff_user_id) ?? "—",
        kyc_latest_status: kycLatest.get(r.member_id) ?? null,
      };
    });

    return NextResponse.json({ data: enriched });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
