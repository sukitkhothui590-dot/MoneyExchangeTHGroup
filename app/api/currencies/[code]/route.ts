import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("currencies")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Currency not found" },
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

// PATCH /api/currencies/[code] — Update currency
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const codeUpper = code.toUpperCase();
    const { data: currentCurrency, error: currentCurrencyError } =
      await supabase
        .from("currencies")
        .select("buy_rate, sell_rate, buy_margin_percent, sell_margin_percent")
        .eq("code", codeUpper)
        .single();

    if (currentCurrencyError || !currentCurrency) {
      return NextResponse.json(
        { error: "Currency not found" },
        { status: 404 },
      );
    }

    // Build update object, mapping camelCase to snake_case
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.flag !== undefined) {
      const flag = String(body.flag ?? "").trim();
      if (!flag) {
        return NextResponse.json(
          { error: "flag is required" },
          { status: 400 },
        );
      }
      updateData.flag = flag;
    }
    if (body.buy_rate !== undefined || body.buyRate !== undefined)
      updateData.buy_rate = body.buy_rate ?? body.buyRate;
    if (body.sell_rate !== undefined || body.sellRate !== undefined)
      updateData.sell_rate = body.sell_rate ?? body.sellRate;
    if (
      body.buy_margin_percent !== undefined ||
      body.buyMarginPercent !== undefined
    )
      updateData.buy_margin_percent =
        body.buy_margin_percent ?? body.buyMarginPercent;
    if (
      body.sell_margin_percent !== undefined ||
      body.sellMarginPercent !== undefined
    )
      updateData.sell_margin_percent =
        body.sell_margin_percent ?? body.sellMarginPercent;
    if (body.last_updated !== undefined || body.lastUpdated !== undefined)
      updateData.last_updated = body.last_updated ?? body.lastUpdated;

    if (
      updateData.buy_rate !== undefined ||
      updateData.sell_rate !== undefined ||
      updateData.buy_margin_percent !== undefined ||
      updateData.sell_margin_percent !== undefined
    ) {
      updateData.last_updated ??= new Date().toISOString();
    }

    const toNumber = (value: unknown, fallback: number) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const parseProvidedNumber = (value: unknown) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const providedBuyRate =
      updateData.buy_rate !== undefined
        ? parseProvidedNumber(updateData.buy_rate)
        : null;
    const providedSellRate =
      updateData.sell_rate !== undefined
        ? parseProvidedNumber(updateData.sell_rate)
        : null;
    const providedBuyMargin =
      updateData.buy_margin_percent !== undefined
        ? parseProvidedNumber(updateData.buy_margin_percent)
        : null;
    const providedSellMargin =
      updateData.sell_margin_percent !== undefined
        ? parseProvidedNumber(updateData.sell_margin_percent)
        : null;

    if (
      (updateData.buy_rate !== undefined && providedBuyRate === null) ||
      (updateData.sell_rate !== undefined && providedSellRate === null) ||
      (updateData.buy_margin_percent !== undefined &&
        providedBuyMargin === null) ||
      (updateData.sell_margin_percent !== undefined &&
        providedSellMargin === null)
    ) {
      return NextResponse.json(
        { error: "Invalid numeric values" },
        { status: 400 },
      );
    }

    const precision = 1_000_000;
    const nextBuyMargin = toNumber(
      providedBuyMargin,
      currentCurrency.buy_margin_percent,
    );
    const nextSellMargin = toNumber(
      providedSellMargin,
      currentCurrency.sell_margin_percent,
    );

    const hasExplicitBuyRate =
      providedBuyRate !== null &&
      Math.abs(providedBuyRate - currentCurrency.buy_rate) > 1e-9;
    const hasExplicitSellRate =
      providedSellRate !== null &&
      Math.abs(providedSellRate - currentCurrency.sell_rate) > 1e-9;
    const buyMarginChanged =
      providedBuyMargin !== null &&
      Math.abs(providedBuyMargin - currentCurrency.buy_margin_percent) > 1e-9;
    const sellMarginChanged =
      providedSellMargin !== null &&
      Math.abs(providedSellMargin - currentCurrency.sell_margin_percent) > 1e-9;

    if (!hasExplicitBuyRate && buyMarginChanged) {
      updateData.buy_rate =
        Math.round(
          currentCurrency.buy_rate *
            (1 + (nextBuyMargin - currentCurrency.buy_margin_percent) / 100) *
            precision,
        ) / precision;
    }
    if (!hasExplicitSellRate && sellMarginChanged) {
      updateData.sell_rate =
        Math.round(
          currentCurrency.sell_rate *
            (1 +
              (nextSellMargin - currentCurrency.sell_margin_percent) / 100) *
            precision,
        ) / precision;
    }

    const finalBuyRate = toNumber(
      updateData.buy_rate,
      currentCurrency.buy_rate,
    );
    const finalSellRate = toNumber(
      updateData.sell_rate,
      currentCurrency.sell_rate,
    );

    if (finalBuyRate >= finalSellRate) {
      return NextResponse.json(
        { error: "Invalid rates: buy_rate must be lower than sell_rate" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("currencies")
      .update(updateData)
      .eq("code", codeUpper)
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

// DELETE /api/currencies/[code] — Delete currency
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("currencies")
      .delete()
      .eq("code", code.toUpperCase());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Currency deleted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
