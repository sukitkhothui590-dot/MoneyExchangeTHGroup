"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import Link from "next/link";
import TransactionDetailModal from "../../components/TransactionDetailModal";
import { USE_MOCK_DATA } from "@/lib/config";
import { MOCK_BRANCHES } from "@/lib/mock/branches";
import type { KycStatus, MockMember } from "@/lib/mock/memberKyc";
import { getMembers, getTransactions, type MockTxn } from "@/lib/mock/store";
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import type { AdminTranslations } from "@/lib/admin/translations";
import { fillTemplate } from "@/lib/admin/screenCopy";

function kycStatusShort(s: KycStatus, t: AdminTranslations): string {
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

export default function AdminTransactionsPage() {
  const { t, locale } = useAdminLanguage();
  const p = t.pages.transactions;
  const s = t.screens.transactions;
  const sh = t.screens.shared;
  const dateLocale = locale === "th" ? "th-TH" : "en-US";
  const numLocale = dateLocale;
  const [rows, setRows] = useState<MockTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState<string>("all");
  const [detailTxn, setDetailTxn] = useState<MockTxn | null>(null);

  const load = useCallback(() => {
    if (!USE_MOCK_DATA) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setRows(getTransactions());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const branchLabel = useCallback(
    (branchId: string) => {
      const b = MOCK_BRANCHES.find((x) => x.id === branchId);
      if (!b) return s.branchUnknown;
      return locale === "th" ? b.name_th : b.name_en;
    },
    [locale, s.branchUnknown],
  );

  const memberById = new Map<string, MockMember>();
  for (const m of getMembers()) {
    memberById.set(m.id, m);
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const memMap = new Map<string, MockMember>();
    for (const m of getMembers()) {
      memMap.set(m.id, m);
    }
    return rows.filter((row) => {
      const matchB = branch === "all" || row.branch_id === branch;
      if (!query) return matchB;
      const mem = memMap.get(row.member_id);
      const matchQ =
        row.id.toLowerCase().includes(query) ||
        row.member_name.toLowerCase().includes(query) ||
        row.currency_code.toLowerCase().includes(query) ||
        row.member_id.toLowerCase().includes(query) ||
        branchLabel(row.branch_id).toLowerCase().includes(query) ||
        String(row.rate).includes(query) ||
        (mem &&
          (mem.kyc.legal_name.toLowerCase().includes(query) ||
            mem.kyc.id_doc_number.toLowerCase().includes(query) ||
            String(mem.kyc.kyc_tier).includes(query) ||
            kycStatusShort(mem.kyc.kyc_status, t)
              .toLowerCase()
              .includes(query)));
      return matchB && matchQ;
    });
  }, [rows, branch, q, branchLabel, t]);

  const stats = useMemo(() => {
    const sumThb = filtered.reduce((acc, r) => acc + r.total_thb, 0);
    const uniq = new Set(filtered.map((r) => r.member_id)).size;
    return { sumThb, uniq };
  }, [filtered]);

  const members = getMembers();

  const exportCsv = () => {
    const header = [
      "created_at",
      "id",
      "member_id",
      "member_name",
      "kyc_tier",
      "kyc_status",
      "currency",
      "amount",
      "rate",
      "total_thb",
      "staff",
      "branch",
    ];
    const lines = filtered.map((row) => {
      const mem = memberById.get(row.member_id);
      return [
        row.created_at,
        row.id,
        row.member_id,
        row.member_name,
        mem?.kyc.kyc_tier ?? "",
        mem?.kyc.kyc_status ?? "",
        row.currency_code,
        row.amount,
        row.rate,
        row.total_thb,
        row.staff_label,
        row.branch_id,
      ].join(",");
    });
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "transactions-mock.csv";
    a.click();
  };

  const detailMember = detailTxn
    ? memberById.get(detailTxn.member_id)
    : undefined;

  if (!USE_MOCK_DATA) {
    return (
      <>
        <Header title={p.titleDisabled} subtitle={p.subtitleDisabled} />
        <div className="flex-1 p-6 text-sm text-muted">{s.disabledHint}</div>
      </>
    );
  }

  return (
    <>
      <Header
        title={p.title}
        subtitle={p.subtitle}
        actions={
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border/80 text-sm hover:border-brand/50 hover:bg-white/90 hover:shadow-sm transition-all"
            >
              <ArrowPathIcon className="w-4 h-4" />
              {sh.refresh}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="h-9 px-4 rounded-xl border border-border/80 text-sm hover:border-brand/50 hover:bg-white/90 hover:shadow-sm transition-all"
            >
              {sh.exportCsv}
            </button>
          </div>
        }
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label={s.statSumThb}
            value={`฿${stats.sumThb.toLocaleString(numLocale)}`}
            icon={<BanknotesIcon className="w-5 h-5" />}
            className="[&_.text-xl]:text-brand"
          />
          <StatCard
            label={s.statTxnCount}
            value={filtered.length}
            icon={<ArrowsRightLeftIcon className="w-5 h-5" />}
          />
          <StatCard
            label={s.statMembers}
            value={stats.uniq}
            icon={<UserGroupIcon className="w-5 h-5" />}
          />
        </div>

        <div className="rounded-2xl border border-border/80 bg-white/95 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-3 flex-wrap items-stretch sm:items-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={s.searchPh}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-border/80 bg-white/80 text-sm min-w-0 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand"
            />
          </div>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="h-10 min-w-[160px] px-3 rounded-xl border border-border/80 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/25"
          >
            <option value="all">{sh.allBranches}</option>
            {MOCK_BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {locale === "th" ? b.name_th : b.name_en}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-muted">{sh.loading}</p>
        ) : (
          <div className="rounded-2xl border border-border/80 bg-white/95 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[1200px]">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="border-b border-border/80 bg-surface/50 backdrop-blur-sm text-left">
                  <th className="px-3 sm:px-4 py-3 text-muted font-medium whitespace-nowrap">
                    {s.colTime}
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-muted font-medium whitespace-nowrap">
                    {s.colId}
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-muted font-medium">
                    {s.colMember}
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-muted font-medium whitespace-nowrap">
                    {s.colKyc}
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-muted font-medium whitespace-nowrap">
                    {s.colCcy}
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-muted font-medium text-right whitespace-nowrap">
                    {s.colAmount}
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-muted font-medium text-right whitespace-nowrap">
                    {s.colRate}
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-muted font-medium text-right whitespace-nowrap">
                    {s.colThb}
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-muted font-medium">
                    {s.colBranch}
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-muted font-medium">
                    {s.colStaff}
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-muted font-medium text-center w-[120px] whitespace-nowrap">
                    {s.colActions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const mem = memberById.get(row.member_id);
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-surface/90"
                    >
                      <td className="px-3 sm:px-4 py-2.5 text-xs whitespace-nowrap align-top">
                        {new Date(row.created_at).toLocaleString(dateLocale, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 font-mono text-xs align-top">
                        {row.id}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 align-top min-w-[140px]">
                        <span className="font-medium text-foreground line-clamp-2">
                          {row.member_name}
                        </span>
                        <span className="text-[10px] text-muted font-mono block mt-0.5">
                          {row.member_id}
                        </span>
                        <Link
                          href={`/admin/dashboard/customers?q=${encodeURIComponent(row.member_id)}`}
                          className="text-[11px] text-brand hover:underline inline-block mt-1"
                        >
                          {s.linkIdentity}
                        </Link>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-xs align-top">
                        {mem ? (
                          <div className="space-y-1">
                            <span className="inline-flex rounded-full border border-border px-1.5 py-0.5 font-medium tabular-nums text-[11px]">
                              {s.kycTierPrefix} {mem.kyc.kyc_tier}
                            </span>
                            <span className="block text-muted text-[11px] leading-tight">
                              {kycStatusShort(mem.kyc.kyc_status, t)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">{sh.dash}</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 font-medium align-top">
                        {row.currency_code}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-right tabular-nums align-top">
                        {row.amount.toLocaleString(numLocale)}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-right tabular-nums text-muted align-top">
                        {row.rate.toLocaleString(numLocale)}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-right tabular-nums font-semibold text-brand align-top">
                        ฿{row.total_thb.toLocaleString(numLocale)}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-xs max-w-[140px] align-top">
                        <span className="line-clamp-2 leading-snug">
                          {branchLabel(row.branch_id)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-xs align-top">
                        {row.staff_label}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 text-center align-top">
                        <button
                          type="button"
                          onClick={() => setDetailTxn(row)}
                          className="inline-flex items-center justify-center min-h-[32px] px-2.5 py-1 rounded-xl border border-brand/35 text-xs font-medium text-brand bg-brand-subtle/50 hover:bg-brand-subtle hover:shadow-sm transition-all"
                        >
                          {sh.viewDetails}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-12 text-center text-muted text-sm"
                    >
                      {sh.noRows}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted pt-1">
          <p>
            {fillTemplate(sh.showingOf, {
              shown: filtered.length,
              total: rows.length,
            })}
          </p>
          <p>{fillTemplate(s.mockMemberCount, { count: members.length })}</p>
        </div>
      </div>

      <TransactionDetailModal
        txn={detailTxn}
        member={detailMember}
        branchName={
          detailTxn ? branchLabel(detailTxn.branch_id) : s.branchUnknown
        }
        isOpen={!!detailTxn}
        onClose={() => setDetailTxn(null)}
      />
    </>
  );
}
