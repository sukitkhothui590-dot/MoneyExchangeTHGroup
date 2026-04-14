"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminPageHelp from "../components/AdminPageHelp";
import StatCard from "../components/StatCard";
import TwemojiFlag from "../components/TwemojiFlag";
import Link from "next/link";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { USE_MOCK_DATA } from "@/lib/config";
import { getMockDashboardStats } from "@/lib/mock/dashboardStats";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";

interface DashboardStats {
  currencyCount: number;
  branchCount: number;
  articleCount: number;
  adminUserCount: number;
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

export default function AdminDashboardPage() {
  const { t, locale } = useAdminLanguage();
  const pg = t.pages.dashboard;
  const d = t.dashboard;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      const d = getMockDashboardStats();
      setStats({
        currencyCount: d.stats.currencies,
        branchCount: d.stats.branches,
        articleCount: d.stats.articles,
        adminUserCount: d.stats.adminUsers,
        topCurrencies: d.topCurrencies,
        recentArticles: d.recentArticles,
        branches: d.branches,
      });
      setLoading(false);
      return;
    }
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((json) => {
        const d = json.data;
        if (d) {
          setStats({
            currencyCount: d.stats?.currencies ?? 0,
            branchCount: d.stats?.branches ?? 0,
            articleCount: d.stats?.articles ?? 0,
            adminUserCount: d.stats?.adminUsers ?? 0,
            topCurrencies: d.topCurrencies ?? [],
            recentArticles: d.recentArticles ?? [],
            branches: d.branches ?? [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header title={pg.title} subtitle={pg.subtitle} />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-8 max-w-[1600px] w-full mx-auto">
        <AdminPageHelp
          idPrefix="dashboard"
          title={pg.helpTitle}
          expandLabel={t.common.helpExpand}
          collapseLabel={t.common.helpCollapse}
          sections={pg.helpSections}
        />
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted">{t.common.loadingData}</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label={d.statCurrencies}
                value={String(stats?.currencyCount ?? 0)}
                icon={<CurrencyDollarIcon className="w-5 h-5" />}
              />
              <StatCard
                label={d.statBranches}
                value={String(stats?.branchCount ?? 0)}
                icon={<BuildingStorefrontIcon className="w-5 h-5" />}
              />
              <StatCard
                label={d.statArticles}
                value={String(stats?.articleCount ?? 0)}
                icon={<DocumentTextIcon className="w-5 h-5" />}
              />
              <StatCard
                label={d.statAdmins}
                value={String(stats?.adminUserCount ?? 0)}
                icon={<ShieldCheckIcon className="w-5 h-5" />}
              />
            </div>

            {/* Exchange Rates Table */}
            <div className="bg-white/95 border border-border/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-gradient-to-r from-white to-surface-50/80">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-brand shrink-0" aria-hidden />
                  {d.ratesLatest}
                </h2>
                <Link
                  href="/admin/dashboard/rates"
                  className="text-xs font-medium text-brand hover:text-brand-dark transition-colors flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-brand-subtle/50"
                >
                  {d.manageAll}
                  <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
              {(stats?.topCurrencies || []).length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-muted">
                  {d.noCurrencies}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/80 bg-surface/50">
                        <th className="text-left px-5 py-2.5 text-xs font-medium text-muted">
                          {d.colCurrency}
                        </th>
                        <th className="text-right px-5 py-2.5 text-xs font-medium text-muted">
                          {d.colBuy}
                        </th>
                        <th className="text-right px-5 py-2.5 text-xs font-medium text-muted">
                          {d.colSell}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(stats?.topCurrencies || []).map((c) => (
                        <tr
                          key={c.code}
                          className="hover:bg-surface/30 transition-colors"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <TwemojiFlag emoji={c.flag} />
                              <span className="font-semibold text-foreground">
                                {c.code}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-foreground">
                            {c.buy_rate.toFixed(4)}
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-foreground">
                            {c.sell_rate.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Articles + Branches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Articles */}
              <div className="bg-white/95 border border-border/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-gradient-to-r from-white to-surface-50/80">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-brand shrink-0" aria-hidden />
                    {d.articlesLatest}
                  </h2>
                  <Link
                    href="/admin/dashboard/articles"
                    className="text-xs font-medium text-brand hover:text-brand-dark transition-colors flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-brand-subtle/50"
                  >
                    {d.viewAll}
                    <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {(stats?.recentArticles || []).length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-muted">
                      {d.noArticles}
                    </div>
                  ) : (
                    (stats?.recentArticles || []).map((a) => (
                      <div
                        key={a.id}
                        className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface/30 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
                          <DocumentTextIcon className="w-4 h-4 text-muted" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate font-medium">
                            {a.title}
                          </p>
                          <p className="text-xs text-muted mt-0.5">
                            {a.article_type === "ข่าว" ? d.news : d.article} ·{" "}
                            {new Date(a.created_at).toLocaleDateString(
                              locale === "en" ? "en-US" : "th-TH",
                              {
                                day: "numeric",
                                month: "short",
                              },
                            )}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                            a.status === "published"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-amber-50 text-amber-600 border-amber-200"
                          }`}
                        >
                          {a.status === "published" ? d.statusPublished : d.statusDraft}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Branches */}
              <div className="bg-white/95 border border-border/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-gradient-to-r from-white to-surface-50/80">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-brand shrink-0" aria-hidden />
                    {d.branchesAll}
                  </h2>
                  <Link
                    href="/admin/dashboard/branches"
                    className="text-xs font-medium text-brand hover:text-brand-dark transition-colors flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-brand-subtle/50"
                  >
                    {d.manage}
                    <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {(stats?.branches || []).length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-muted">
                      {d.noBranches}
                    </div>
                  ) : (
                    (stats?.branches || []).slice(0, 6).map((b) => (
                      <div
                        key={b.id}
                        className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface/30 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
                          <BuildingStorefrontIcon className="w-4 h-4 text-muted" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate font-medium">
                            {b.name_th || b.name}
                          </p>
                          {b.hours && (
                            <p className="text-xs text-muted mt-0.5 truncate">
                              {b.hours}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                            b.status === "active"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-red-50 text-red-500 border-red-200"
                          }`}
                        >
                          {b.status === "active" ? d.branchOpen : d.branchClosed}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white/95 border border-border/80 rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-foreground px-1 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-brand shrink-0" aria-hidden />
                {d.quickLinks}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    labelKey: "rates" as const,
                    href: "/admin/dashboard/rates",
                    icon: ChartBarIcon,
                  },
                  {
                    labelKey: "branches" as const,
                    href: "/admin/dashboard/branches",
                    icon: BuildingStorefrontIcon,
                  },
                  {
                    labelKey: "articles" as const,
                    href: "/admin/dashboard/articles",
                    icon: DocumentTextIcon,
                  },
                  {
                    labelKey: "adminUsers" as const,
                    href: "/admin/dashboard/admin-users",
                    icon: ShieldCheckIcon,
                  },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-border/80 hover:border-brand/35 hover:bg-brand-subtle/40 hover:shadow-sm transition-all duration-200 group"
                  >
                    <link.icon className="w-4 h-4 text-muted group-hover:text-brand transition-colors" />
                    <span className="text-sm text-foreground group-hover:text-brand transition-colors">
                      {t.sidebar.nav[link.labelKey]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
