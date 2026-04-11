import { CurrencyRate, RateData } from "@/lib/types/rate";
import { NewsItem } from "@/lib/types/news";

interface ApiCurrency {
  id: number;
  code: string;
  name: string;
  flag: string;
  buy_rate: number;
  sell_rate: number;
  buy_margin_percent: number;
  sell_margin_percent: number;
  last_updated: string;
}

export interface ApiArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  status: string;
  article_type?: string;
  created_at: string;
  title_en?: string | null;
  excerpt_en?: string | null;
  content_en?: string | null;
  image_alt_text_en?: string | null;
  title_cn?: string | null;
  excerpt_cn?: string | null;
  content_cn?: string | null;
  image_alt_text_cn?: string | null;
}

export function mapCurrency(c: ApiCurrency): CurrencyRate {
  return {
    code: c.code,
    name: c.name,
    flag: c.flag,
    buy: c.buy_rate,
    sell: c.sell_rate,
  };
}

function localeToIntl(locale: Locale): string {
  if (locale === "cn") return "zh-CN";
  if (locale === "en") return "en-GB";
  return "th-TH";
}

export function formatDateTime(iso: string, locale: Locale = "th"): string {
  try {
    return new Date(iso).toLocaleString(localeToIntl(locale), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function formatShortDate(iso: string, locale: Locale = "th"): string {
  try {
    return new Date(iso).toLocaleDateString(localeToIntl(locale), {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export type Locale = "th" | "en" | "cn";

export function mapArticle(a: ApiArticle, locale: Locale = "th"): NewsItem {
  const title =
    locale === "en"
      ? a.title_en || a.title
      : locale === "cn"
        ? a.title_cn || a.title
        : a.title;

  const excerpt =
    locale === "en"
      ? a.excerpt_en || a.excerpt
      : locale === "cn"
        ? a.excerpt_cn || a.excerpt
        : a.excerpt;

  const content =
    locale === "en"
      ? a.content_en || a.content
      : locale === "cn"
        ? a.content_cn || a.content
        : a.content;

  const categoryMap: Record<Locale, string> = {
    th: a.article_type === "ข่าว" ? "ข่าวสาร" : "บทความ",
    en: a.article_type === "ข่าว" ? "News" : "Article",
    cn: a.article_type === "ข่าว" ? "新闻" : "文章",
  };

  return {
    id: a.id,
    title,
    date: formatShortDate(a.created_at, locale),
    excerpt: excerpt || "",
    image: a.thumbnail || "",
    slug: a.slug,
    category: categoryMap[locale] as NewsItem["category"],
    content,
  };
}

export async function fetchCurrencies(
  locale: Locale = "th",
): Promise<RateData> {
  try {
    const res = await fetch("/api/currencies");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const currencies: ApiCurrency[] = json.data;
    if (!currencies || currencies.length === 0) {
      return { rates: [], lastUpdated: "", branch: "" };
    }

    const onlineLabel =
      locale === "th" ? "ออนไลน์" : locale === "cn" ? "线上" : "Online";

    return {
      rates: currencies.map(mapCurrency),
      lastUpdated: currencies[0]?.last_updated
        ? formatDateTime(currencies[0].last_updated, locale)
        : formatDateTime(new Date().toISOString(), locale),
      branch: onlineLabel,
    };
  } catch {
    return { rates: [], lastUpdated: "", branch: "" };
  }
}

export interface BranchInfo {
  id: string;
  name: string;
  name_th: string;
  address: string;
  address_th: string;
  address_cn: string;
  hours: string;
  hours_th: string;
  hours_cn: string;
  status: "active" | "inactive";
}

export interface BranchMarginData {
  currency_code: string;
  buy_margin_percent: number;
  sell_margin_percent: number;
}

export async function fetchBranches(): Promise<BranchInfo[]> {
  try {
    const res = await fetch("/api/branches");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const branches: BranchInfo[] = json.data;
    if (!branches) return [];
    return branches.filter((b) => b.status === "active");
  } catch {
    return [];
  }
}

export async function fetchBranchMargins(
  branchId: string,
): Promise<BranchMarginData[]> {
  try {
    const res = await fetch(`/api/branches/${branchId}/margins`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data?.margins ?? [];
  } catch {
    return [];
  }
}

export function applyMarginsToRates(
  rates: CurrencyRate[],
  margins: BranchMarginData[],
): CurrencyRate[] {
  const marginMap = new Map(margins.map((m) => [m.currency_code, m]));
  return rates.map((r) => {
    const m = marginMap.get(r.code);
    if (!m) return r;
    const raw = m as BranchMarginData & {
      global_buy_margin?: number;
      global_sell_margin?: number;
    };
    const globalBuy = raw.global_buy_margin ?? m.buy_margin_percent;
    const globalSell = raw.global_sell_margin ?? m.sell_margin_percent;

    return {
      ...r,
      buy:
        Math.round(
          r.buy * (1 + (m.buy_margin_percent - globalBuy) / 100) * 1_000_000,
        ) / 1_000_000,
      sell:
        Math.round(
          r.sell * (1 + (m.sell_margin_percent - globalSell) / 100) * 1_000_000,
        ) / 1_000_000,
    };
  });
}

export async function fetchArticlesPublic(
  locale: Locale = "th",
): Promise<NewsItem[]> {
  try {
    const res = await fetch("/api/articles?public=true");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const articles: ApiArticle[] = json.data;
    if (!articles || articles.length === 0) return getSeedArticles(locale);
    return articles.map((a) => mapArticle(a, locale));
  } catch {
    return getSeedArticles(locale);
  }
}

function getSeedArticles(locale: Locale): NewsItem[] {
  try {
    const { seedArticles } = require("@/lib/mock/articles-seed");
    return seedArticles.map((a: ApiArticle) => mapArticle(a, locale));
  } catch {
    return [];
  }
}
