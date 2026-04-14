"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Header from "../../components/Header";
import AdminPageHelp from "../../components/AdminPageHelp";
import ReportSectionCard from "../../components/ReportSectionCard";
import ReportsChartsPanel from "../../components/reports/ReportsChartsPanel";
import ReportsMetricCard from "../../components/ReportsMetricCard";
import type { BranchAgg, CurrencyAgg, DailyAgg } from "@/lib/mock/reports";
import type { Branch } from "@/lib/types/database";
import type { KycStatus } from "@/lib/mock/memberKyc";
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import type { AdminTranslations } from "@/lib/admin/translations";

function kycStatusLabel(s: KycStatus, t: AdminTranslations): string {
  const km = t.screens.kycMock;
  const map: Record<KycStatus, string> = {
    draft: km.st_draft,
    pending_review: km.st_pending,
    approved: km.st_approved,
    rejected: km.st_rejected,
    expired: km.st_expired,
  };
  return map[s];
}

function ThbHero({
  amount,
  numLocale,
}: {
  amount: number;
  numLocale: string;
}) {
  const fixed = amount.toFixed(2);
  const [whole, frac] = fixed.split(".");
  const wholeFmt = Number(whole).toLocaleString(numLocale);
  return (
    <p className="flex flex-wrap items-baseline gap-x-1 gap-y-0">
      <span className="text-lg font-semibold text-muted">฿</span>
      <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums sm:text-[2rem] sm:leading-none">
        {wholeFmt}
      </span>
      <span className="text-lg font-medium text-muted tabular-nums">.{frac}</span>
    </p>
  );
}

function CountHero({ value }: { value: number }) {
  return (
    <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums sm:text-[2rem] sm:leading-none">
      {value.toLocaleString()}
    </p>
  );
}

type AggregateData = {
  daily: DailyAgg[];
  byBranch: BranchAgg[];
  byCurrency: CurrencyAgg[];
  totalThb: number;
  txnCount: number;
  uniqueMembers: number;
  avgThb: number;
  memberTotal: number;
  txnActiveCount: number;
  kycBreakdown: { status: KycStatus; count: number }[];
};

export function AdminReportsLive() {
  const { t, locale } = useAdminLanguage();
  const p = t.pages.reports;
  const r = t.screens.reports;
  const sh = t.screens.shared;
  const numLocale = locale === "th" ? "th-TH" : "en-US";
  const dateLocale = numLocale;

  const [data, setData] = useState<AggregateData | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/reports/aggregate");
      const json = await res.json();
      if (!res.ok) {
        setErr((json.error as string) ?? "Error");
        setData(null);
        return;
      }
      setData(json.data as AggregateData);
    } catch {
      setErr("Network error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/branches");
        if (!res.ok) return;
        const json = await res.json();
        setBranches(json.data ?? []);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const branchLabel = useCallback(
    (branchId: string) => {
      const b = branches.find((x) => x.id === branchId);
      if (!b) return "—";
      return locale === "th" ? b.name_th : b.name;
    },
    [branches, locale],
  );

  const txns = data?.txnCount ?? 0;
  const totalThb = data?.totalThb ?? 0;
  const visitSum = data?.memberTotal ?? 0;
  const uniqMembers = data?.uniqueMembers ?? 0;
  const avgTxn = data?.avgThb ?? 0;
  const daily = data?.daily ?? [];
  const byBranch = data?.byBranch ?? [];
  const byCurrency = data?.byCurrency ?? [];
  const kycBreakdown = data?.kycBreakdown ?? [];

  const exportCsv = () => {
    if (!data) return;
    const header = "section,key,count,total_thb";
    const lines: string[] = [header];
    for (const d of daily) {
      lines.push(`daily,${d.date},${d.count},${d.total_thb}`);
    }
    for (const b of byBranch) {
      lines.push(`branch,${b.branch_id},${b.count},${b.total_thb}`);
    }
    for (const c of byCurrency) {
      lines.push(`currency,${c.currency_code},${c.count},${c.total_thb}`);
    }
    for (const { status, count } of kycBreakdown) {
      lines.push(`kyc_status,${status},${count},`);
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "reports-summary-live.csv";
    a.click();
  };

  const tableWrapClass =
    "overflow-x-auto [&_thead_tr]:border-b [&_thead_tr]:border-border/60 [&_tbody_tr]:border-b [&_tbody_tr]:border-border/40 [&_tbody_tr:last-child]:border-0";

  if (loading && !data) {
    return (
      <>
        <Header title={p.title} subtitle={p.subtitle} />
        <div className="flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-[1600px]">
            <AdminPageHelp
              idPrefix="reports"
              title={p.helpTitle}
              expandLabel={t.common.helpExpand}
              collapseLabel={t.common.helpCollapse}
              sections={p.helpSections}
            />
          </div>
          <div className="flex-1 p-6 text-sm text-muted text-center">
            {sh.loading}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={p.title} subtitle={p.subtitle} />
      <div className="flex-1 space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
          <AdminPageHelp
            idPrefix="reports"
            title={p.helpTitle}
            expandLabel={t.common.helpExpand}
            collapseLabel={t.common.helpCollapse}
            sections={p.helpSections}
          />
          {err ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {err}
            </p>
          ) : null}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-md shadow-black/[0.06] ring-1 ring-black/[0.05]">
                <CalendarDaysIcon className="h-5 w-5 shrink-0 text-brand" />
                {locale === "th"
                  ? "ข้อมูลจริงจากฐานข้อมูล"
                  : "Live database scope"}
              </span>
              <span className="hidden text-xs text-muted md:inline lg:max-w-md">
                {locale === "th"
                  ? "สรุปจากธุรกรรม POS สถานะใช้งาน — สถิติสมาชิกจากตาราง members + KYC ล่าสุด"
                  : "POS active transactions; member & KYC rollups from live tables."}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Link
                href="/admin/dashboard/transactions"
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-border/70 bg-white px-4 text-sm font-medium text-foreground shadow-sm transition-all hover:border-brand/30 hover:bg-brand-subtle/40"
              >
                {r.linkTransactions}
              </Link>
              <button
                type="button"
                onClick={exportCsv}
                disabled={!data}
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-50"
              >
                {r.exportCsv}
              </button>
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border/70 bg-white px-4 text-sm font-medium shadow-sm transition hover:bg-surface-50"
              >
                <ArrowPathIcon className="h-4 w-4" />
                {sh.refresh}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <ReportsMetricCard
              label={r.statTxn}
              icon={<ArrowsRightLeftIcon className="h-6 w-6" />}
              detailHref="/admin/dashboard/transactions"
              detailAriaLabel={r.seeAllTransactions}
            >
              <CountHero value={txns} />
            </ReportsMetricCard>
            <ReportsMetricCard
              label={r.statTotal}
              icon={<BanknotesIcon className="h-6 w-6" />}
              detailHref="/admin/dashboard/transactions"
              detailAriaLabel={r.seeAllTransactions}
            >
              <ThbHero amount={totalThb} numLocale={numLocale} />
            </ReportsMetricCard>
            <ReportsMetricCard
              label={
                locale === "th"
                  ? "สมาชิกในฐานข้อมูล"
                  : "Members (database)"
              }
              icon={<CursorArrowRaysIcon className="h-6 w-6" />}
            >
              <CountHero value={visitSum} />
            </ReportsMetricCard>
            <ReportsMetricCard
              label={r.statUniqueMembers}
              icon={<UserGroupIcon className="h-6 w-6" />}
            >
              <CountHero value={uniqMembers} />
            </ReportsMetricCard>
            <ReportsMetricCard
              label={r.statAvgTxn}
              icon={<ChartBarIcon className="h-6 w-6" />}
              className="sm:col-span-2 xl:col-span-1"
            >
              <ThbHero amount={avgTxn} numLocale={numLocale} />
            </ReportsMetricCard>
          </div>

          <ReportsChartsPanel
            daily={daily}
            byBranch={byBranch}
            byCurrency={byCurrency}
            kycRows={kycBreakdown}
            branchLabel={branchLabel}
            kycLabel={(status) => kycStatusLabel(status, t)}
            dateLocale={dateLocale}
            numLocale={numLocale}
            labels={{
              sectionTitle: r.chartSectionTitle,
              dailyThb: r.chartDailyThb,
              currencyShare: r.chartCurrencyShare,
              branchThb: r.chartBranchThb,
              kycMembers: r.chartKycMembers,
              legendThb: r.chartLegendThb,
              legendCount: r.chartLegendCount,
              empty: r.chartEmpty,
            }}
          />

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <ReportSectionCard
              title={r.sectionDaily}
              action={
                <Link
                  href="/admin/dashboard/transactions"
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {r.seeAllTransactions} →
                </Link>
              }
            >
              <div className={tableWrapClass}>
                <table className="w-full min-w-[320px] text-sm">
                  <thead>
                    <tr className="bg-surface-50/90 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      <th className="px-5 py-3.5 sm:px-6">{r.colDate}</th>
                      <th className="px-5 py-3.5 text-right sm:px-6">
                        {r.colCount}
                      </th>
                      <th className="px-5 py-3.5 text-right sm:px-6">
                        {r.colThbSum}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[15px]">
                    {daily.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-14 text-center text-muted"
                        >
                          {r.emptyData}
                        </td>
                      </tr>
                    ) : (
                      daily.map((d) => (
                        <tr
                          key={d.date}
                          className="transition-colors hover:bg-brand-subtle/25"
                        >
                          <td className="px-5 py-3.5 tabular-nums sm:px-6">
                            {new Date(d.date + "T12:00:00").toLocaleDateString(
                              dateLocale,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right tabular-nums text-foreground sm:px-6">
                            {d.count}
                          </td>
                          <td className="px-5 py-3.5 text-right text-base font-semibold tabular-nums text-foreground sm:px-6">
                            ฿{d.total_thb.toLocaleString(numLocale)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ReportSectionCard>

            <ReportSectionCard title={r.sectionKyc}>
              <div className={tableWrapClass}>
                <table className="w-full min-w-[280px] text-sm">
                  <thead>
                    <tr className="bg-surface-50/90 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      <th className="px-5 py-3.5 sm:px-6">{r.colKycStatus}</th>
                      <th className="px-5 py-3.5 text-right sm:px-6">
                        {r.colMemberCount}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[15px]">
                    {kycBreakdown.map(({ status, count }) => (
                      <tr
                        key={status}
                        className="transition-colors hover:bg-brand-subtle/25"
                      >
                        <td className="px-5 py-3.5 sm:px-6">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                              status === "approved"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : status === "pending_review"
                                  ? "border-amber-200 bg-amber-50 text-amber-800"
                                  : status === "rejected"
                                    ? "border-red-200 bg-red-50 text-red-800"
                                    : "border-border bg-surface text-muted"
                            }`}
                          >
                            {kycStatusLabel(status, t)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-base font-semibold tabular-nums sm:px-6">
                          {count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportSectionCard>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ReportSectionCard title={r.sectionBranch}>
              <div className={tableWrapClass}>
                <table className="w-full min-w-[360px] text-sm">
                  <thead>
                    <tr className="bg-surface-50/90 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      <th className="px-5 py-3.5 sm:px-6">{r.colBranch}</th>
                      <th className="px-5 py-3.5 text-right sm:px-6">
                        {r.colCount}
                      </th>
                      <th className="px-5 py-3.5 text-right sm:px-6">
                        {r.colThbSum}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[15px]">
                    {byBranch.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-14 text-center text-muted"
                        >
                          {r.emptyData}
                        </td>
                      </tr>
                    ) : (
                      byBranch.map((b) => (
                        <tr
                          key={b.branch_id}
                          className="transition-colors hover:bg-brand-subtle/25"
                        >
                          <td className="px-5 py-3.5 sm:px-6">
                            <span className="font-semibold text-foreground">
                              {branchLabel(b.branch_id)}
                            </span>
                            <span className="mt-0.5 block font-mono text-xs text-muted">
                              {b.branch_id}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right tabular-nums sm:px-6">
                            {b.count}
                          </td>
                          <td className="px-5 py-3.5 text-right text-base font-semibold tabular-nums sm:px-6">
                            ฿{b.total_thb.toLocaleString(numLocale)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ReportSectionCard>

            <ReportSectionCard title={r.sectionCurrency}>
              <div className={tableWrapClass}>
                <table className="w-full min-w-[320px] text-sm">
                  <thead>
                    <tr className="bg-surface-50/90 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      <th className="px-5 py-3.5 sm:px-6">{r.colCurrency}</th>
                      <th className="px-5 py-3.5 text-right sm:px-6">
                        {r.colCount}
                      </th>
                      <th className="px-5 py-3.5 text-right sm:px-6">
                        {r.colThbSum}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[15px]">
                    {byCurrency.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-14 text-center text-muted"
                        >
                          {r.emptyData}
                        </td>
                      </tr>
                    ) : (
                      byCurrency.map((c) => (
                        <tr
                          key={c.currency_code}
                          className="transition-colors hover:bg-brand-subtle/25"
                        >
                          <td className="px-5 py-3.5 text-base font-bold text-foreground sm:px-6">
                            {c.currency_code}
                          </td>
                          <td className="px-5 py-3.5 text-right tabular-nums sm:px-6">
                            {c.count}
                          </td>
                          <td className="px-5 py-3.5 text-right text-base font-semibold tabular-nums sm:px-6">
                            ฿{c.total_thb.toLocaleString(numLocale)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ReportSectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
