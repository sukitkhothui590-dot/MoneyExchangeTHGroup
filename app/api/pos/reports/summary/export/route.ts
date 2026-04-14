import { createClient } from "@/lib/supabase/server";
import {
  getSessionProfile,
  isOperatorRole,
} from "@/lib/server/profileRole";
import { staffCanUseBranch } from "@/lib/server/staffBranches";
import { NextResponse } from "next/server";

// GET /api/pos/reports/summary/export — CSV of active transactions in range
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
      .select(
        "created_at, currency_code, amount, rate, total_thb, note, status, member_id",
      )
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false });

    if (fromDate) {
      q = q.gte("created_at", `${fromDate}T00:00:00.000Z`);
    }
    if (toDate) {
      q = q.lte("created_at", `${toDate}T23:59:59.999Z`);
    }
    if (currencyCode) {
      q = q.eq("currency_code", currencyCode);
    }

    const { data: rows, error } = await q.limit(5000);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const header = [
      "created_at",
      "status",
      "currency_code",
      "amount",
      "rate",
      "total_thb",
      "member_id",
      "note",
    ].join(",");

    const lines = (rows ?? []).map((r) =>
      [
        r.created_at,
        (r as { status?: string }).status ?? "active",
        r.currency_code,
        r.amount,
        r.rate,
        r.total_thb,
        r.member_id,
        JSON.stringify((r as { note?: string }).note ?? ""),
      ].join(","),
    );

    const csv = [header, ...lines].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pos-export-${branchId}.csv"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
