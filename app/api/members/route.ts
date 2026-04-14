import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/members — List all members
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim();

    let query = supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status as "active" | "suspended" | "banned");
    }

    if (q && q.length > 0) {
      const esc = q.replace(/%/g, "\\%").replace(/,/g, "");
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRe.test(q)) {
        query = query.eq("id", q);
      } else {
        query = query.or(
          `phone.ilike.%${esc}%,email.ilike.%${esc}%,name.ilike.%${esc}%,identity_lookup_key.ilike.%${esc}%`,
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/members — Create new member
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from("members")
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone || "",
        status: body.status || "active",
        wallet_balance: body.wallet_balance || body.walletBalance || 0,
        verified: body.verified || false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
