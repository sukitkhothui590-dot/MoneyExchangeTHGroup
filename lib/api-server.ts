import "server-only";

import { createClient } from "@/lib/supabase/server";
import { RateData } from "@/lib/types/rate";
import { NewsItem } from "@/lib/types/news";
import { mapCurrency, mapArticle, formatDateTime, ApiArticle } from "@/lib/api";

export async function fetchCurrenciesServer(): Promise<RateData> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("currencies")
      .select("*")
      .order("code", { ascending: true });

    if (error || !data || data.length === 0) {
      return { rates: [], lastUpdated: "", branch: "" };
    }

    return {
      rates: data.map(mapCurrency),
      lastUpdated: data[0]?.last_updated
        ? formatDateTime(data[0].last_updated)
        : formatDateTime(new Date().toISOString()),
      branch: "Online",
    };
  } catch {
    return { rates: [], lastUpdated: "", branch: "" };
  }
}

export async function fetchArticleBySlug(
  slug: string,
): Promise<NewsItem | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) return null;
    return mapArticle(data as ApiArticle);
  } catch {
    return null;
  }
}

export async function fetchArticlesServer(): Promise<NewsItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as ApiArticle[]).map((a) => mapArticle(a));
  } catch {
    return [];
  }
}
