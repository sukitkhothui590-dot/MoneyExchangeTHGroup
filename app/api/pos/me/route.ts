import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/server/profileRole";
import { getAllowedBranchesForUser } from "@/lib/server/staffBranches";
import { NextResponse } from "next/server";

// GET /api/pos/me — session role + allowed branches for POS (operators only)
export async function GET() {
  try {
    const supabase = await createClient();
    const session = await getSessionProfile(supabase);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role === "customer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", session.userId)
      .maybeSingle();

    const allowedBranches = await getAllowedBranchesForUser(
      supabase,
      session.userId,
      session.role,
    );

    return NextResponse.json({
      data: {
        userId: session.userId,
        role: session.role,
        name: prof?.name?.trim() ?? null,
        allowedBranches,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
