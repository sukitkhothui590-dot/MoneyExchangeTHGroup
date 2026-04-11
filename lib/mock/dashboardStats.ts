import { getMembers } from "@/lib/mock/store";
import type { MockMember } from "@/lib/mock/memberKyc";

export interface MockDashboardStats {
  stats: {
    currencies: number;
    branches: number;
    articles: number;
    adminUsers: number;
  };
  topCurrencies: {
    code: string;
    flag: string;
    buy_rate: number;
    sell_rate: number;
  }[];
  recentArticles: {
    id: string;
    title: string;
    status: string;
    article_type: string;
    created_at: string;
  }[];
  branches: {
    id: string;
    name: string;
    name_th: string;
    address: string;
    hours: string;
    status: "active" | "inactive";
  }[];
}

export function getMockDashboardStats(): MockDashboardStats {
  return {
    stats: {
      currencies: 12,
      branches: 3,
      articles: 8,
      adminUsers: 2,
    },
    topCurrencies: [
      { code: "USD", flag: "🇺🇸", buy_rate: 35.2, sell_rate: 35.55 },
      { code: "EUR", flag: "🇪🇺", buy_rate: 38.1, sell_rate: 38.45 },
      { code: "JPY", flag: "🇯🇵", buy_rate: 0.23, sell_rate: 0.235 },
    ],
    recentArticles: [
      {
        id: "1",
        title: "อัตราแลกเปลี่ยนประจำวัน",
        status: "published",
        article_type: "ข่าว",
        created_at: new Date().toISOString(),
      },
    ],
    branches: [
      {
        id: "hq",
        name: "Head Office",
        name_th: "สำนักงานใหญ่",
        address: "Bangkok",
        hours: "10:00–19:00",
        status: "active",
      },
    ],
  };
}

export function getMockMembersList(): MockMember[] {
  return getMembers();
}
