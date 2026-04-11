import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FREECURRENCY_API_BASE = "https://api.freecurrencyapi.com/v1/latest";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

function toRatesRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const rates: Record<string, number> = {};
  for (const [code, rate] of Object.entries(value)) {
    if (typeof rate === "number" && Number.isFinite(rate)) {
      rates[code] = rate;
    }
  }

  return rates;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "1";

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: cached } = await supabase
      .from("exchange_rate_cache")
      .select("*")
      .eq("base_currency", "THB")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      const cachedTime = new Date(cached.fetched_at).getTime();
      const now = Date.now();
      if (now - cachedTime < CACHE_DURATION_MS || forceRefresh) {
        const cachedRates = toRatesRecord(cached.rates);
        return NextResponse.json({
          data: {
            base: cached.base_currency,
            rates: cachedRates,
            fetched_at: cached.fetched_at,
            source: forceRefresh ? "cache-refresh" : "cache",
          },
        });
      }
    }

    // Fetch from freecurrencyapi.com
    const apiKey = process.env.FREECURRENCY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "FreeCurrencyAPI key not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `${FREECURRENCY_API_BASE}?apikey=${apiKey}&base_currency=THB`,
      { next: { revalidate: 0 } },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch exchange rates from external API" },
        { status: 502 },
      );
    }

    const apiData = await response.json();

    if (!apiData.data) {
      return NextResponse.json(
        { error: apiData.message || "API returned an error" },
        { status: 502 },
      );
    }

    const rates = toRatesRecord(apiData.data);
    const fetchedAt = new Date().toISOString();

    // Store in cache
    await supabase.from("exchange_rate_cache").insert({
      base_currency: "THB",
      rates,
      fetched_at: fetchedAt,
    });

    return NextResponse.json({
      data: {
        base: "THB",
        rates,
        fetched_at: fetchedAt,
        source: "api",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
