import { createClient } from "@/lib/supabase/server";
import {
  getSessionProfile,
  isAdminRole,
  isOperatorRole,
} from "@/lib/server/profileRole";
import {
  getAllowedBranchesForUser,
  staffCanUseBranch,
} from "@/lib/server/staffBranches";
import { insertAuditLog } from "@/lib/server/auditLog";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/pos/transactions — list POS counter transactions (operators)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const memberId = searchParams.get("memberId");
    const staffUserId = searchParams.get("staffUserId");
    const includeVoided = searchParams.get("includeVoided") === "1";
    const fromDate = searchParams.get("from")?.trim();
    const toDate = searchParams.get("to")?.trim();
    const currencyCode = searchParams.get("currencyCode")?.trim();

    const allowed = await getAllowedBranchesForUser(
      supabase,
      session.userId,
      session.role,
    );
    const allowedIds = allowed.map((b) => b.id);

    if (session.role === "staff") {
      if (!allowedIds.length) {
        return NextResponse.json(
          { error: "No branch assignment for this account" },
          { status: 403 },
        );
      }
      if (branchId && !allowedIds.includes(branchId)) {
        return NextResponse.json({ error: "Forbidden branch" }, { status: 403 });
      }
    }

    let query = supabase
      .from("pos_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (branchId) {
      query = query.eq("branch_id", branchId);
    } else if (session.role === "staff") {
      query = query.in("branch_id", allowedIds);
    }
    if (memberId) query = query.eq("member_id", memberId);
    if (staffUserId && isAdminRole(session.role)) {
      query = query.eq("staff_user_id", staffUserId);
    }
    if (currencyCode) {
      query = query.eq("currency_code", currencyCode);
    }

    if (!includeVoided) {
      query = query.eq("status", "active");
    }
    if (fromDate) {
      query = query.gte("created_at", `${fromDate}T00:00:00.000Z`);
    }
    if (toDate) {
      query = query.lte("created_at", `${toDate}T23:59:59.999Z`);
    }

    const { data, error } = await query.limit(500);

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

// POST /api/pos/transactions — record exchange at counter
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const memberId = body.member_id ?? body.memberId;
    const branchId = body.branch_id ?? body.branchId;
    const currencyCode = body.currency_code ?? body.currencyCode;
    const amount = Number(body.amount);
    const rate = Number(body.rate);
    const totalThb = Number(body.total_thb ?? body.totalThb);
    const note = String(body.note ?? "");

    if (!memberId || !branchId || !currencyCode) {
      return NextResponse.json(
        { error: "member_id, branch_id, and currency_code are required" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(amount) || !Number.isFinite(rate) || !Number.isFinite(totalThb)) {
      return NextResponse.json(
        { error: "amount, rate, and total_thb must be numbers" },
        { status: 400 },
      );
    }

    const canBranch = await staffCanUseBranch(
      supabase,
      session.userId,
      session.role,
      branchId,
    );
    if (!canBranch) {
      return NextResponse.json(
        { error: "Branch not allowed for this account" },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("pos_transactions")
      .insert({
        member_id: memberId,
        branch_id: branchId,
        staff_user_id: session.userId,
        currency_code: currencyCode,
        amount,
        rate,
        total_thb: totalThb,
        note,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
      const service = await createServiceClient();
      await insertAuditLog(service, {
        actor_id: session.userId,
        action: "create",
        entity: "pos_transaction",
        entity_id: data.id,
        payload: {
          branch_id: branchId,
          currency_code: currencyCode,
          total_thb: totalThb,
        },
      });
    } catch {
      /* audit non-fatal */
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
