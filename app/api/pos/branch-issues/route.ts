import { createClient } from "@/lib/supabase/server";
import { attachReporterNamesToBranchIssues } from "@/lib/server/branchIssueReporterNames";
import { getSessionProfile, isOperatorRole } from "@/lib/server/profileRole";
import { staffCanUseBranch } from "@/lib/server/staffBranches";
import { NextResponse } from "next/server";

// GET /api/pos/branch-issues?branchId= — รายการแจ้งปัญหาของสาขา (operator + สาขาที่ใช้ได้)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const branchId = new URL(request.url).searchParams.get("branchId")?.trim() ?? "";
    if (!branchId) {
      return NextResponse.json({ error: "branchId required" }, { status: 400 });
    }

    const allowed = await staffCanUseBranch(
      supabase,
      session.userId,
      session.role,
      branchId,
    );
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("branch_issue_reports")
      .select(
        "id, branch_id, summary, detail, severity, reported_at, created_by",
      )
      .eq("branch_id", branchId)
      .order("reported_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const enriched = await attachReporterNamesToBranchIssues(
      supabase,
      data ?? [],
    );
    return NextResponse.json({ data: enriched });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/pos/branch-issues — แจ้งปัญหาจาก POS (สาขาที่ใช้ได้เท่านั้น)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || !isOperatorRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const branch_id = String(body.branch_id ?? "").trim();
    const summary = String(body.summary ?? "").trim();
    const detail = String(body.detail ?? "").trim();
    const severity = String(body.severity ?? "medium").trim() as
      | "low"
      | "medium"
      | "high";

    if (!branch_id || !summary) {
      return NextResponse.json(
        { error: "branch_id and summary are required" },
        { status: 400 },
      );
    }

    if (!["low", "medium", "high"].includes(severity)) {
      return NextResponse.json({ error: "Invalid severity" }, { status: 400 });
    }

    const allowed = await staffCanUseBranch(
      supabase,
      session.userId,
      session.role,
      branch_id,
    );
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("branch_issue_reports")
      .insert({
        branch_id,
        summary,
        detail,
        severity,
        created_by: user?.id ?? null,
      })
      .select(
        "id, branch_id, summary, detail, severity, reported_at, created_by",
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const [withName] = await attachReporterNamesToBranchIssues(supabase, [data]);
    return NextResponse.json({ data: withName }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
