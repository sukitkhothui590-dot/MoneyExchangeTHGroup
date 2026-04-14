import { createClient } from "@/lib/supabase/server";
import { currencyMetaForSync } from "@/lib/server/currencySeedMeta";
import {
  getSessionProfile,
  isAdminRole,
} from "@/lib/server/profileRole";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FRANKFURTER_API_BASE = "https://api.frankfurter.app/latest";
const BUSINESS_TZ = "Asia/Bangkok";

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

function businessDateYmd(input: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(input);
}

async function fetchFrankfurterThbRates(): Promise<{
  rates: Record<string, number>;
  apiDate: string | null;
}> {
  const response = await fetch(`${FRANKFURTER_API_BASE}?from=THB`, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error("Frankfurter HTTP error");
  }

  const apiData = (await response.json()) as {
    rates?: Record<string, number>;
    date?: string;
    message?: string;
  };

  if (!apiData.rates) {
    throw new Error(apiData.message || "API returned no rates");
  }

  return {
    rates: toRatesRecord(apiData.rates),
    apiDate: apiData.date ?? null,
  };
}

/** เพิ่มเฉพาะสกุลที่ยังไม่มีในตาราง (ไม่ทับ buy/sell ที่แก้แล้ว) */
async function syncMissingCurrenciesFromRates(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rates: Record<string, number>,
): Promise<{ added: string[] }> {
  const { data: existingRows } = await supabase
    .from("currencies")
    .select("code");
  const existing = new Set((existingRows ?? []).map((r) => r.code));

  const { data: maxRow } = await supabase
    .from("currencies")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sortOrder = maxRow?.sort_order ?? 0;
  const added: string[] = [];

  for (const [code, rate] of Object.entries(rates)) {
    if (!Number.isFinite(rate) || rate <= 0) continue;
    if (existing.has(code)) continue;

    const mid = 1 / rate;
    const spread = 0.005;
    const buy_rate = Math.round(mid * (1 - spread) * 10000) / 10000;
    const sell_rate = Math.round(mid * (1 + spread) * 10000) / 10000;
    if (buy_rate >= sell_rate) continue;

    sortOrder += 1;
    const { name, flag } = currencyMetaForSync(code);

    const { error } = await supabase.from("currencies").insert({
      code,
      name,
      flag,
      buy_rate,
      sell_rate,
      buy_margin_percent: 0,
      sell_margin_percent: 0,
      sort_order: sortOrder,
    });

    if (!error) {
      added.push(code);
      existing.add(code);
    }
  }

  return { added };
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "1";
    const force = searchParams.get("force") === "1";
    const syncCurrencies = searchParams.get("syncCurrencies") === "1";

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (force || syncCurrencies) {
      const session = await getSessionProfile(supabase);
      if (!session || !isAdminRole(session.role)) {
        return NextResponse.json(
          { error: "Forbidden — admin only" },
          { status: 403 },
        );
      }
    }

    const { data: cached } = await supabase
      .from("exchange_rate_cache")
      .select("*")
      .eq("base_currency", "THB")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    let rates: Record<string, number>;
    let fetchedAt: string;
    let source: string;
    let apiDate: string | null = null;
    let synced: { added: string[] } | undefined;

    if (!force && cached) {
      const now = new Date();
      const todayYmd = businessDateYmd(now);
      const cachedYmd = businessDateYmd(new Date(cached.fetched_at));
      if (cachedYmd === todayYmd) {
        rates = toRatesRecord(cached.rates);
        fetchedAt = cached.fetched_at;
        source = forceRefresh ? "cache-daily-lock" : "cache";

        if (syncCurrencies) {
          synced = await syncMissingCurrenciesFromRates(supabase, rates);
        }

        return NextResponse.json({
          data: {
            base: cached.base_currency,
            rates,
            fetched_at: fetchedAt,
            source,
            api_date: apiDate,
            synced_currencies: synced,
          },
        });
      }
    }

    try {
      const fetched = await fetchFrankfurterThbRates();
      rates = fetched.rates;
      apiDate = fetched.apiDate;
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch exchange rates from Frankfurter API" },
        { status: 502 },
      );
    }

    fetchedAt = new Date().toISOString();

    await supabase.from("exchange_rate_cache").insert({
      base_currency: "THB",
      rates,
      fetched_at: fetchedAt,
    });

    source = force ? "api-forced" : "api";

    if (syncCurrencies) {
      synced = await syncMissingCurrenciesFromRates(supabase, rates);
    }

    return NextResponse.json({
      data: {
        base: "THB",
        rates,
        fetched_at: fetchedAt,
        source,
        api_date: apiDate,
        synced_currencies: synced,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
