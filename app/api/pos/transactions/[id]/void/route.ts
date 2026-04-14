import { createClient, createServiceClient } from "@/lib/supabase/server";
import { insertAuditLog } from "@/lib/server/auditLog";
import {
  getSessionProfile,
  isOperatorRole,
} from "@/lib/server/profileRole";
import { staffCanUseBranch } from "@/lib/server/staffBranches";
import { NextResponse } from "next/server";

// POST /api/pos/transactions/[id]/void — soft-void a transaction
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = String(body.reason ?? "").trim().slice(0, 2000);

    const service = await createServiceClient();
    const { data: txn, error: fetchErr } = await service
      .from("pos_transactions")
      .select("id, branch_id, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !txn) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    if (txn.status !== "active") {
      return NextResponse.json(
        { error: "Transaction is not active" },
        { status: 400 },
      );
    }

    const can = await staffCanUseBranch(
      supabase,
      session.userId,
      session.role,
      txn.branch_id,
    );
    if (!can) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date().toISOString();
    const { error: updErr } = await service
      .from("pos_transactions")
      .update({
        status: "voided",
        voided_at: now,
        void_reason: reason,
        voided_by: session.userId,
      })
      .eq("id", id)
      .eq("status", "active");

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    await insertAuditLog(service, {
      actor_id: session.userId,
      action: "void",
      entity: "pos_transaction",
      entity_id: id,
      payload: { branch_id: txn.branch_id, reason },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
