"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import Header from "../../components/Header";
import ReportSectionCard from "../../components/ReportSectionCard";
import ReportsChartsPanel from "../../components/reports/ReportsChartsPanel";
import ReportsMetricCard from "../../components/ReportsMetricCard";
import { USE_MOCK_DATA } from "@/lib/config";
import { MOCK_BRANCHES } from "@/lib/mock/branches";
import type { KycStatus } from "@/lib/mock/memberKyc";
import {
  aggregateTransactionsByBranch,
  aggregateTransactionsByCurrency,
  aggregateTransactionsByDay,
  avgThbPerTransaction,
  sumThb,
  uniqueMemberCount,
} from "@/lib/mock/reports";
import { getMembers, getTransactions, getVisitCount } from "@/lib/mock/store";
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

export default function AdminReportsPage() {
  const { t, locale } = useAdminLanguage();
  const p = t.pages.reports;
  const r = t.screens.reports;
  const sh = t.screens.shared;
  const numLocale = locale === "th" ? "th-TH" : "en-US";
  const dateLocale = numLocale;
  const [refresh, setRefresh] = useState(0);

  const refreshData = useCallback(() => setRefresh((x) => x + 1), []);

  const txns = useMemo(() => getTransactions(), [refresh]);
  const members = useMemo(() => getMembers(), [refresh]);

  const daily = useMemo(() => aggregateTransactionsByDay(txns), [txns]);
  const byBranch = useMemo(() => aggregateTransactionsByBranch(txns), [txns]);
  const byCurrency = useMemo(
    () => aggregateTransactionsByCurrency(txns),
    [txns],
  );
  const totalThb = useMemo(() => sumThb(txns), [txns]);
  const visitSum = useMemo(() => {
    return members.reduce((s, m) => s + getVisitCount(m.id), 0);
  }, [members]);
  const uniqMembers = useMemo(() => uniqueMemberCount(txns), [txns]);
  const avgTxn = useMemo(() => avgThbPerTransaction(txns), [txns]);

  const kycBreakdown = useMemo(() => {
    const acc: Record<KycStatus, number> = {
      draft: 0,
      pending_review: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
    };
    for (const m of members) {
      acc[m.kyc.kyc_status] += 1;
    }
    return (Object.keys(acc) as KycStatus[]).map((status) => ({
      status,
      count: acc[status],
    }));
  }, [members]);

  const branchLabel = (branchId: string) => {
    const b = MOCK_BRANCHES.find((x) => x.id === branchId);
    if (!b) return "—";
    return locale === "th" ? b.name_th : b.name_en;
  };

  const exportCsv = () => {
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
    a.download = "reports-summary-mock.csv";
    a.click();
  };

  const tableWrapClass =
    "overflow-x-auto [&_thead_tr]:border-b [&_thead_tr]:border-border/60 [&_tbody_tr]:border-b [&_tbody_tr]:border-border/40 [&_tbody_tr:last-child]:border-0";

  if (!USE_MOCK_DATA) {
    return (
      <>
        <Header title={p.titleDisabled} subtitle={p.subtitleDisabled} />
        <div className="flex-1 p-6 text-sm text-muted">{r.disabledHint}</div>
      </>
    );
  }

  return (
    <>
      <Header title={p.title} subtitle={p.subtitle} />
      <div className="flex-1 space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
          {/* Toolbar — สไตล์แดชบอร์ดอ้างอิง */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-md shadow-black/[0.06] ring-1 ring-black/[0.05]">
                <CalendarDaysIcon className="h-5 w-5 shrink-0 text-brand" />
                {r.scopePill}
              </span>
              <span className="hidden text-xs text-muted md:inline lg:max-w-md">
                {r.cardHintMock}
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
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-dark"
              >
                {r.exportCsv}
              </button>
              <button
                type="button"
                onClick={refreshData}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border/70 bg-white px-4 text-sm font-medium shadow-sm transition hover:bg-surface-50"
              >
                <ArrowPathIcon className="h-4 w-4" />
                {sh.refresh}
              </button>
            </div>
          </div>

          {/* แถวมิตริก */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <ReportsMetricCard
              label={r.statTxn}
              icon={<ArrowsRightLeftIcon className="h-6 w-6" />}
              detailHref="/admin/dashboard/transactions"
              detailAriaLabel={r.seeAllTransactions}
            >
              <CountHero value={txns.length} />
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
              label={r.statVisit}
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
                      <th className="px-5 py-3.5 sm:px-6">
                        {r.colKycStatus}
                      </th>
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
                            className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${
                              status === "approved"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : status === "pending_review"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : status === "rejected"
                                    ? "bg-red-50 text-red-800 border-red-200"
                                    : "bg-surface text-muted border-border"
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
                      <th className="px-5 py-3.5 sm:px-6">
                        {r.colCurrency}
                      </th>
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
