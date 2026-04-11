import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/branches — List all branches
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .order("name", { ascending: true });

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

// POST /api/branches — Create new branch
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

    if (!body.id || !body.name || !body.name_th) {
      return NextResponse.json(
        { error: "id, name, and name_th are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("branches")
      .insert({
        id: body.id,
        name: body.name,
        name_th: body.name_th,
        address: body.address || "",
        address_th: body.address_th || "",
        address_cn: body.address_cn || "",
        hours: body.hours || "",
        hours_th: body.hours_th || "",
        hours_cn: body.hours_cn || "",
        status: body.status || "active",
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
