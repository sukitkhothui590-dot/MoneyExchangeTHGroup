import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("currencies")
      .select("*")
      .order("sort_order", { ascending: true });

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

// POST /api/currencies — Add new currency
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

    const buyRate = Number(body.buy_rate ?? body.buyRate ?? 0);
    const sellRate = Number(body.sell_rate ?? body.sellRate ?? 0);
    const flag = String(body.flag ?? "").trim();
    const buyMarginPercent = Number(
      body.buy_margin_percent ?? body.buyMarginPercent ?? 0,
    );
    const sellMarginPercent = Number(
      body.sell_margin_percent ?? body.sellMarginPercent ?? 0,
    );

    if (
      !Number.isFinite(buyRate) ||
      !Number.isFinite(sellRate) ||
      !Number.isFinite(buyMarginPercent) ||
      !Number.isFinite(sellMarginPercent)
    ) {
      return NextResponse.json(
        { error: "Invalid numeric values" },
        { status: 400 },
      );
    }

    if (!flag) {
      return NextResponse.json({ error: "flag is required" }, { status: 400 });
    }

    if (buyRate >= sellRate) {
      return NextResponse.json(
        { error: "Invalid rates: buy_rate must be lower than sell_rate" },
        { status: 400 },
      );
    }

    // Get the next sort_order value
    const { data: maxRow } = await supabase
      .from("currencies")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();
    const nextSortOrder = (maxRow?.sort_order ?? 0) + 1;

    const { data, error } = await supabase
      .from("currencies")
      .insert({
        code: body.code,
        name: body.name,
        flag,
        buy_rate: buyRate,
        sell_rate: sellRate,
        buy_margin_percent: buyMarginPercent,
        sell_margin_percent: sellMarginPercent,
        sort_order: nextSortOrder,
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
