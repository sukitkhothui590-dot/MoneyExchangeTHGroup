import { createClient } from "@/lib/supabase/server";
import { attachReporterNamesToBranchIssues } from "@/lib/server/branchIssueReporterNames";
import { getSessionProfile } from "@/lib/server/profileRole";
import { NextResponse } from "next/server";

// GET /api/admin/reports/branch-issues — logged branch issues (admin only)
export async function GET() {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("branch_issue_reports")
      .select(
        "id, branch_id, summary, detail, severity, reported_at, created_by",
      )
      .order("reported_at", { ascending: false })
      .limit(500);

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

// POST /api/admin/reports/branch-issues — record a branch issue (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session || session.role !== "admin") {
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
