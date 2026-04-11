import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PUT /api/currencies/reorder — Update sort_order for all currencies
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const order: string[] = body.order; // array of currency codes in desired order

    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json(
        { error: "order must be a non-empty array of currency codes" },
        { status: 400 },
      );
    }

    // Update sort_order for each currency
    const updates = order.map((code, index) =>
      supabase
        .from("currencies")
        .update({ sort_order: index + 1 })
        .eq("code", code),
    );

    const results = await Promise.all(updates);
    const failed = results.filter((r) => r.error);

    if (failed.length > 0) {
      return NextResponse.json(
        { error: "Some updates failed", details: failed.map((f) => f.error) },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Order updated", count: order.length });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
