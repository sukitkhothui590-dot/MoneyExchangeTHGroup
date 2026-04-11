import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/topups/[id] — Get single topup request
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("topup_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Topup request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/topups/[id] — Update topup request (approve/reject)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.note !== undefined) updateData.note = body.note;
    if (body.slip_url !== undefined || body.slipUrl !== undefined)
      updateData.slip_url = body.slip_url ?? body.slipUrl;

    const { data, error } = await supabase
      .from("topup_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If approved, update member's wallet balance
    if (body.status === "approved") {
      const topup = data;
      if (topup) {
        const { data: member } = await supabase
          .from("members")
          .select("wallet_balance")
          .eq("id", topup.member_id)
          .single();

        if (member) {
          await supabase
            .from("members")
            .update({
              wallet_balance:
                Number(member.wallet_balance) + Number(topup.amount),
            })
            .eq("id", topup.member_id);
        }
      }
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
