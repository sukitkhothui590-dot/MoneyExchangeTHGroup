import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/branches/[id]/margins — Get all margin overrides for a branch
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify branch exists
    const { data: branch, error: branchError } = await supabase
      .from("branches")
      .select("id, name, name_th")
      .eq("id", id)
      .single();

    if (branchError || !branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    // Get all currencies with their global margins
    const { data: currencies } = await supabase
      .from("currencies")
      .select(
        "code, name, flag, buy_margin_percent, sell_margin_percent, buy_rate, sell_rate",
      )
      .order("code", { ascending: true });

    // Get branch-specific margin overrides
    const { data: branchMargins } = await supabase
      .from("branch_currency_margins")
      .select("*")
      .eq("branch_id", id);

    // Build a map of branch overrides
    const overrideMap = new Map(
      (branchMargins || []).map((m) => [m.currency_code, m]),
    );

    // Merge: for each currency, return branch margin if exists, else global
    const merged = (currencies || []).map((c) => {
      const override = overrideMap.get(c.code);
      return {
        currency_code: c.code,
        currency_name: c.name,
        currency_flag: c.flag,
        buy_margin_percent: override
          ? override.buy_margin_percent
          : c.buy_margin_percent,
        sell_margin_percent: override
          ? override.sell_margin_percent
          : c.sell_margin_percent,
        is_override: !!override,
        global_buy_margin: c.buy_margin_percent,
        global_sell_margin: c.sell_margin_percent,
        global_buy_rate: c.buy_rate,
        global_sell_rate: c.sell_rate,
      };
    });

    return NextResponse.json({
      data: {
        branch,
        margins: merged,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/branches/[id]/margins — Set margin overrides for a branch
// Body: { margins: [{ currency_code, buy_margin_percent, sell_margin_percent }] }
export async function PUT(
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

    // Verify branch exists
    const { data: branch, error: branchError } = await supabase
      .from("branches")
      .select("id")
      .eq("id", id)
      .single();

    if (branchError || !branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const body = await request.json();
    const margins = body.margins;

    if (!Array.isArray(margins)) {
      return NextResponse.json(
        { error: "margins must be an array" },
        { status: 400 },
      );
    }

    // Upsert each margin override
    const upsertData = margins.map(
      (m: {
        currency_code: string;
        buy_margin_percent: number;
        sell_margin_percent: number;
      }) => ({
        branch_id: id,
        currency_code: m.currency_code,
        buy_margin_percent: m.buy_margin_percent,
        sell_margin_percent: m.sell_margin_percent,
      }),
    );

    const { data, error } = await supabase
      .from("branch_currency_margins")
      .upsert(upsertData, {
        onConflict: "branch_id,currency_code",
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/branches/[id]/margins — Update a single currency margin for a branch
// Body: { currency_code, buy_margin_percent, sell_margin_percent }
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

    if (!body.currency_code) {
      return NextResponse.json(
        { error: "currency_code is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("branch_currency_margins")
      .upsert(
        {
          branch_id: id,
          currency_code: body.currency_code,
          buy_margin_percent: body.buy_margin_percent,
          sell_margin_percent: body.sell_margin_percent,
        },
        { onConflict: "branch_id,currency_code" },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
