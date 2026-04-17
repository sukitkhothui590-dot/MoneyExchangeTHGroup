import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/server/profileRole";
import { NextResponse } from "next/server";

type DailyAgg = { date: string; total_thb: number; count: number };
type BranchAgg = { branch_id: string; total_thb: number; count: number };
type VoidBranchAgg = { branch_id: string; count: number };
type CurrencyAgg = { currency_code: string; total_thb: number; count: number };

type KycAggRow = {
  status: "draft" | "pending_review" | "approved" | "rejected" | "expired";
  count: number;
};

function aggFromTxns(
  rows: {
    created_at: string;
    branch_id: string;
    currency_code: string;
    total_thb: number;
    member_id: string;
  }[],
) {
  const daily = new Map<string, { total: number; count: number }>();
  const byBranch = new Map<string, { total: number; count: number }>();
  const byCcy = new Map<string, { total: number; count: number }>();

  for (const t of rows) {
    const d = t.created_at.slice(0, 10);
    const day = daily.get(d) ?? { total: 0, count: 0 };
    day.total += t.total_thb;
    day.count += 1;
    daily.set(d, day);

    const bb = byBranch.get(t.branch_id) ?? { total: 0, count: 0 };
    bb.total += t.total_thb;
    bb.count += 1;
    byBranch.set(t.branch_id, bb);

    const bc = byCcy.get(t.currency_code) ?? { total: 0, count: 0 };
    bc.total += t.total_thb;
    bc.count += 1;
    byCcy.set(t.currency_code, bc);
  }

  const dailyArr: DailyAgg[] = [...daily.entries()]
    .map(([date, v]) => ({
      date,
      total_thb: Math.round(v.total * 100) / 100,
      count: v.count,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const branchArr: BranchAgg[] = [...byBranch.entries()]
    .map(([branch_id, v]) => ({
      branch_id,
      total_thb: Math.round(v.total * 100) / 100,
      count: v.count,
    }))
    .sort((a, b) => b.total_thb - a.total_thb);

  const curArr: CurrencyAgg[] = [...byCcy.entries()]
    .map(([currency_code, v]) => ({
      currency_code,
      total_thb: Math.round(v.total * 100) / 100,
      count: v.count,
    }))
    .sort((a, b) => b.total_thb - a.total_thb);

  const totalThb = Math.round(rows.reduce((s, t) => s + t.total_thb, 0) * 100) / 100;
  const uniq = new Set(rows.map((t) => t.member_id)).size;
  const avgThb =
    rows.length > 0
      ? Math.round((totalThb / rows.length) * 100) / 100
      : 0;

  return {
    daily: dailyArr,
    byBranch: branchArr,
    byCurrency: curArr,
    totalThb,
    txnCount: rows.length,
    uniqueMembers: uniq,
    avgThb,
  };
}

// GET /api/admin/reports/aggregate — สรุปจาก pos_transactions + KYC + จำนวนสมาชิก (admin เท่านั้น)
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
    const maxRows = Math.min(
      Math.max(Number(searchParams.get("limit") ?? 25000) || 25000, 100),
      50000,
    );

    let q = supabase
      .from("pos_transactions")
      .select(
        "created_at, branch_id, currency_code, total_thb, member_id, status",
      )
      .order("created_at", { ascending: false })
      .limit(maxRows);

    if (fromDate) {
      q = q.gte("created_at", `${fromDate}T00:00:00.000Z`);
    }
    if (toDate) {
      q = q.lte("created_at", `${toDate}T23:59:59.999Z`);
    }

    const { data: txRows, error: txErr } = await q;

    if (txErr) {
      return NextResponse.json({ error: txErr.message }, { status: 500 });
    }

    let voidQ = supabase
      .from("pos_transactions")
      .select("branch_id")
      .eq("status", "voided")
      .limit(maxRows);

    if (fromDate) {
      voidQ = voidQ.gte("created_at", `${fromDate}T00:00:00.000Z`);
    }
    if (toDate) {
      voidQ = voidQ.lte("created_at", `${toDate}T23:59:59.999Z`);
    }

    const { data: voidRows, error: voidErr } = await voidQ;

    if (voidErr) {
      return NextResponse.json({ error: voidErr.message }, { status: 500 });
    }

    const voidMap = new Map<string, number>();
    for (const v of voidRows ?? []) {
      const bid = v.branch_id;
      voidMap.set(bid, (voidMap.get(bid) ?? 0) + 1);
    }
    const voidByBranch: VoidBranchAgg[] = [...voidMap.entries()]
      .map(([branch_id, count]) => ({ branch_id, count }))
      .sort((a, b) => b.count - a.count);

    const rows = (txRows ?? []).filter((r) => r.status === "active");
    const agg = aggFromTxns(
      rows.map((r) => ({
        created_at: r.created_at,
        branch_id: r.branch_id,
        currency_code: r.currency_code,
        total_thb: r.total_thb,
        member_id: r.member_id,
      })),
    );

    const { count: memberTotal } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });

    const { data: subs } = await supabase
      .from("kyc_submissions")
      .select("member_id,status,updated_at")
      .order("updated_at", { ascending: false });

    const latestKyc = new Map<string, "pending" | "verified" | "rejected">();
    for (const s of subs ?? []) {
      if (!latestKyc.has(s.member_id)) {
        latestKyc.set(
          s.member_id,
          s.status as "pending" | "verified" | "rejected",
        );
      }
    }

    const { data: allMembers } = await supabase.from("members").select("id");

    const kycAcc: Record<KycAggRow["status"], number> = {
      draft: 0,
      pending_review: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
    };

    for (const m of allMembers ?? []) {
      const st = latestKyc.get(m.id);
      if (!st) {
        kycAcc.draft += 1;
      } else if (st === "pending") {
        kycAcc.pending_review += 1;
      } else if (st === "verified") {
        kycAcc.approved += 1;
      } else {
        kycAcc.rejected += 1;
      }
    }

    const kycBreakdown: KycAggRow[] = (
      Object.keys(kycAcc) as KycAggRow["status"][]
    ).map((status) => ({ status, count: kycAcc[status] }));

    return NextResponse.json({
      data: {
        ...agg,
        /** จำนวนสมาชิกทั้งหมดในฐานข้อมูล */
        memberTotal: memberTotal ?? 0,
        /** ใช้แทน mock “visit” — จำนวนธุรกรรมที่ใช้งานในช่วงที่ดึงมา */
        txnActiveCount: agg.txnCount,
        kycBreakdown,
        /** รายการยกเลิก (void) ต่อสาขา — ช่วยดูความเสี่ยง/ปัญหาเชิงปฏิบัติการ */
        voidByBranch,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
