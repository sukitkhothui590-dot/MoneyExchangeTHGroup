import { createClient } from "@/lib/supabase/server";
import {
  getSessionProfile,
  isOperatorRole,
} from "@/lib/server/profileRole";
import { staffCanUseBranch } from "@/lib/server/staffBranches";
import { NextResponse } from "next/server";

type Row = {
  currency_code: string;
  count: number;
  sum_thb: number;
  sum_amount: number;
};

// GET /api/pos/reports/summary — aggregates active POS transactions
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId")?.trim() ?? "";
    const fromDate = searchParams.get("from")?.trim() ?? "";
    const toDate = searchParams.get("to")?.trim() ?? "";
    const currencyCode = searchParams.get("currencyCode")?.trim() ?? "";

    if (!branchId) {
      return NextResponse.json(
        { error: "branchId is required" },
        { status: 400 },
      );
    }

    const ok = await staffCanUseBranch(
      supabase,
      session.userId,
      session.role,
      branchId,
    );
    if (!ok) {
      return NextResponse.json({ error: "Forbidden branch" }, { status: 403 });
    }

    let q = supabase
      .from("pos_transactions")
      .select("currency_code, amount, total_thb")
      .eq("branch_id", branchId)
      .eq("status", "active");

    if (fromDate) {
      q = q.gte("created_at", `${fromDate}T00:00:00.000Z`);
    }
    if (toDate) {
      q = q.lte("created_at", `${toDate}T23:59:59.999Z`);
    }
    if (currencyCode) {
      q = q.eq("currency_code", currencyCode);
    }

    let qVoid = supabase
      .from("pos_transactions")
      .select("total_thb")
      .eq("branch_id", branchId)
      .eq("status", "voided");
    if (fromDate) {
      qVoid = qVoid.gte("created_at", `${fromDate}T00:00:00.000Z`);
    }
    if (toDate) {
      qVoid = qVoid.lte("created_at", `${toDate}T23:59:59.999Z`);
    }
    if (currencyCode) {
      qVoid = qVoid.eq("currency_code", currencyCode);
    }

    const [{ data: rows, error }, { data: voidRows, error: voidErr }] =
      await Promise.all([q, qVoid]);

    if (error || voidErr) {
      return NextResponse.json(
        { error: (error ?? voidErr)?.message ?? "Query failed" },
        { status: 500 },
      );
    }

    const voidCount = voidRows?.length ?? 0;
    const voidThbSum =
      Math.round(
        (voidRows ?? []).reduce((s, r) => s + r.total_thb, 0) * 100,
      ) / 100;

    const byCcy = new Map<string, { count: number; sum_thb: number; sum_amount: number }>();
    for (const r of rows ?? []) {
      const c = r.currency_code;
      const cur = byCcy.get(c) ?? { count: 0, sum_thb: 0, sum_amount: 0 };
      cur.count += 1;
      cur.sum_thb += r.total_thb;
      cur.sum_amount += r.amount;
      byCcy.set(c, cur);
    }

    const breakdown: Row[] = Array.from(byCcy.entries()).map(([currency_code, v]) => ({
      currency_code,
      count: v.count,
      sum_thb: Math.round(v.sum_thb * 100) / 100,
      sum_amount: Math.round(v.sum_amount * 100) / 100,
    }));

    const totalThb = breakdown.reduce((s, r) => s + r.sum_thb, 0);
    const totalCount = breakdown.reduce((s, r) => s + r.count, 0);

    const voidSharePct =
      voidCount + totalCount > 0
        ? Math.round((voidCount / (voidCount + totalCount)) * 1000) / 10
        : 0;

    return NextResponse.json({
      data: {
        branchId,
        from: fromDate || null,
        to: toDate || null,
        currencyCode: currencyCode || null,
        total_count: totalCount,
        total_thb: Math.round(totalThb * 100) / 100,
        void_count: voidCount,
        void_thb: voidThbSum,
        void_share_pct: voidSharePct,
        by_currency: breakdown.sort((a, b) =>
          a.currency_code.localeCompare(b.currency_code),
        ),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
