"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import AdminPageHelp from "../../components/AdminPageHelp";
import StatCard from "../../components/StatCard";
import Link from "next/link";
import TransactionDetailModal from "../../components/TransactionDetailModal";
import type { AdminPosTransactionRow } from "@/lib/types/adminPos";
import type { Branch } from "@/lib/types/database";
import type { MockTxn } from "@/lib/mock/store";
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import type { AdminTranslations } from "@/lib/admin/translations";
import { transactionDisplayReference } from "@/lib/book/bookingReference";

function mapLiveToMockTxn(
  r: AdminPosTransactionRow,
): MockTxn & { pos_status: "active" | "voided" } {
  return {
    id: r.id,
    created_at: r.created_at,
    member_id: r.member_id,
    member_name: r.member_name,
    currency_code: r.currency_code,
    amount: r.amount,
    rate: r.rate,
    total_thb: r.total_thb,
    staff_label: r.staff_display_name,
    branch_id: r.branch_id,
    pos_status: r.status,
  };
}

function kycLiveShort(
  st: AdminPosTransactionRow["kyc_latest_status"],
  t: AdminTranslations,
): string {
  const km = t.screens.kycMock;
  if (!st) return "—";
  if (st === "verified") return km.st_approved;
  if (st === "pending") return km.st_pending;
  return km.st_rejected;
}

function kycLatestModal(
  st: AdminPosTransactionRow["kyc_latest_status"],
  locale: string,
): string | null {
  if (!st) return null;
  if (st === "verified")
    return locale === "th" ? "ยืนยันแล้ว (KYC POS)" : "Verified (KYC)";
  if (st === "pending")
    return locale === "th" ? "รอตรวจ (KYC POS)" : "Pending (KYC)";
  return locale === "th" ? "ไม่ผ่าน (KYC POS)" : "Rejected (KYC)";
}

export function AdminTransactionsLive() {
  const { t, locale } = useAdminLanguage();
  const p = t.pages.transactions;
  const s = t.screens.transactions;
  const sh = t.screens.shared;
  const dateLocale = locale === "th" ? "th-TH" : "en-US";
  const numLocale = dateLocale;

  const [rows, setRows] = useState<AdminPosTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [qInput, setQInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [branch, setBranch] = useState<string>("all");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [detail, setDetail] = useState<AdminPosTransactionRow | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQ(qInput.trim()), 380);
    return () => window.clearTimeout(id);
  }, [qInput]);

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

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      if (branch !== "all") params.set("branchId", branch);
      if (debouncedQ) params.set("q", debouncedQ);
      const res = await fetch(`/api/admin/pos-transactions?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setErr((json.error as string) ?? "โหลดไม่สำเร็จ");
        setRows([]);
        return;
      }
      setRows(json.data ?? []);
    } catch {
      setErr("เกิดข้อผิดพลาด");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [branch, debouncedQ]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const activeOnly = rows.filter((r) => r.status === "active");
    const sumThb = activeOnly.reduce((acc, r) => acc + r.total_thb, 0);
    const uniq = new Set(rows.map((r) => r.member_id)).size;
    return {
      sumThb: Math.round(sumThb * 100) / 100,
      txnCount: rows.length,
      uniq,
    };
  }, [rows]);

  const exportCsv = () => {
    const header = [
      "txn_ref",
      "created_at",
      "id",
      "status",
      "member_id",
      "member_name",
      "kyc_latest",
      "currency",
      "amount",
      "rate",
      "total_thb",
      "staff",
      "branch",
    ];
    const lines = rows.map((row) =>
      [
        transactionDisplayReference(row),
        row.created_at,
        row.id,
        row.status,
        row.member_id,
        row.member_name,
        row.kyc_latest_status ?? "",
        row.currency_code,
        row.amount,
        row.rate,
        row.total_thb,
        row.staff_display_name,
        row.branch_name_th,
      ].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pos-transactions.csv";
    a.click();
  };

  return (
    <>
      <Header
        title={p.title}
        subtitle={
          locale === "th"
            ? "ข้อมูลจากฐานข้อมูล (pos_transactions)"
            : "Live data from pos_transactions"
        }
        actions={
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 px-3 text-sm transition-all hover:border-brand/50 hover:bg-white/90 hover:shadow-sm"
            >
              <ArrowPathIcon className="h-4 w-4" />
              {sh.refresh}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="h-9 rounded-xl border border-border/80 px-4 text-sm transition-all hover:border-brand/50 hover:bg-white/90 hover:shadow-sm"
            >
              {sh.exportCsv}
            </button>
          </div>
        }
      />
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col space-y-8 p-4 sm:p-6 lg:p-8">
        <AdminPageHelp
          idPrefix="transactions"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label={s.statSumThb}
            value={`฿${stats.sumThb.toLocaleString(numLocale)}`}
            icon={<BanknotesIcon className="w-5 h-5" />}
            className="[&_.text-xl]:text-brand"
          />
          <StatCard
            label={s.statTxnCount}
            value={stats.txnCount}
            icon={<ArrowsRightLeftIcon className="w-5 h-5" />}
          />
          <StatCard
            label={s.statMembers}
            value={stats.uniq}
            icon={<UserGroupIcon className="w-5 h-5" />}
          />
        </div>

        <div className="flex flex-col flex-wrap items-stretch gap-3 rounded-2xl border border-border/80 bg-white/95 p-3 shadow-sm sm:flex-row sm:items-center">
          <div className="relative min-w-[200px] max-w-md flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder={s.searchPh}
              className="h-10 w-full min-w-0 rounded-xl border border-border/80 bg-white/80 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
          </div>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="h-10 min-w-[160px] rounded-xl border border-border/80 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/25"
          >
            <option value="all">{sh.allBranches}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name_th}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-muted">{sh.loading}</p>
        ) : (
          <div className="overflow-hidden overflow-x-auto rounded-2xl border border-border/80 bg-white/95 shadow-sm">
            <table className="w-full min-w-[1360px] text-sm">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="border-b border-border/80 bg-surface/50 text-left backdrop-blur-sm">
                  <th className="whitespace-nowrap px-3 py-3 font-medium text-muted sm:px-4 min-w-[9.5rem]">
                    {s.colTime}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium text-muted sm:px-4 min-w-[10.5rem]">
                    {s.colId}
                  </th>
                  <th className="px-3 py-3 font-medium text-muted sm:px-4 min-w-[8rem]">
                    {s.colMemberName}
                  </th>
                  <th className="px-3 py-3 font-medium text-muted sm:px-4 min-w-[11rem]">
                    {s.colMemberId}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium text-muted sm:px-4">
                    {s.colKyc}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium text-muted sm:px-4">
                    {s.colCcy}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-right font-medium text-muted sm:px-4">
                    {s.colAmount}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-right font-medium text-muted sm:px-4">
                    {s.colRate}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-right font-medium text-muted sm:px-4">
                    {s.colThb}
                  </th>
                  <th className="px-3 py-3 font-medium text-muted sm:px-4">
                    {s.colBranch}
                  </th>
                  <th className="px-3 py-3 font-medium text-muted sm:px-4">
                    {s.colStaff}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-center font-medium text-muted sm:px-4">
                    {s.colStatus}
                  </th>
                  <th className="w-[120px] whitespace-nowrap px-3 py-3 text-center font-medium text-muted sm:px-4">
                    {s.colActions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-border transition-colors last:border-0 hover:bg-surface/90 ${
                      row.status === "voided" ? "bg-red-50/40" : ""
                    }`}
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 align-top text-[11px] text-muted tabular-nums sm:px-4">
                      {new Date(row.created_at).toLocaleString(dateLocale, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-3 py-2.5 align-top sm:px-4">
                      <span
                        className="inline-block font-mono text-xs font-semibold tracking-tight text-foreground"
                        title={row.id}
                      >
                        {transactionDisplayReference(row)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-top sm:px-4">
                      <span className="line-clamp-2 font-medium text-foreground">
                        {row.member_name}
                      </span>
                    </td>
                    <td className="max-w-[240px] px-3 py-2.5 align-top sm:px-4">
                      <div className="rounded-lg border border-border/70 bg-surface/50 px-2 py-1.5">
                        <p
                          className="font-mono text-[11px] text-foreground/90 break-all leading-snug"
                          title={row.member_id}
                        >
                          {row.member_id}
                        </p>
                        <Link
                          href={`/admin/dashboard/customers?q=${encodeURIComponent(row.member_id)}`}
                          className="mt-1.5 inline-block text-[11px] font-medium text-brand hover:underline"
                        >
                          {s.linkIdentity}
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-top text-xs sm:px-4">
                      <span className="text-[11px] leading-tight text-muted">
                        {kycLiveShort(row.kyc_latest_status, t)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-top font-medium sm:px-4">
                      {row.currency_code}
                    </td>
                    <td className="px-3 py-2.5 text-right align-top tabular-nums sm:px-4">
                      {row.amount.toLocaleString(numLocale)}
                    </td>
                    <td className="px-3 py-2.5 text-right align-top tabular-nums text-muted sm:px-4">
                      {row.rate.toLocaleString(numLocale)}
                    </td>
                    <td className="px-3 py-2.5 text-right align-top font-semibold tabular-nums text-brand sm:px-4">
                      ฿{row.total_thb.toLocaleString(numLocale)}
                    </td>
                    <td className="max-w-[140px] px-3 py-2.5 align-top text-xs sm:px-4">
                      <span className="line-clamp-2 leading-snug">
                        {row.branch_name_th}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-top text-xs sm:px-4">
                      {row.staff_display_name}
                    </td>
                    <td className="px-3 py-2.5 text-center align-top sm:px-4">
                      {row.status === "voided" ? (
                        <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-800">
                          {locale === "th" ? "ยกเลิก" : "Voided"}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                          {locale === "th" ? "ใช้งาน" : "Active"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center align-top sm:px-4">
                      <button
                        type="button"
                        onClick={() => setDetail(row)}
                        className="inline-flex min-h-[32px] items-center justify-center rounded-xl border border-brand/35 bg-brand-subtle/50 px-2.5 py-1 text-xs font-medium text-brand transition-all hover:bg-brand-subtle hover:shadow-sm"
                      >
                        {sh.viewDetails}
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-4 py-12 text-center text-sm text-muted"
                    >
                      {sh.noRows}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <p className="pt-1 text-xs text-muted">
          {locale === "th"
            ? "ดึงล่าสุดสูงสุด 2,000 รายการต่อคำขอ — ใช้การค้นเพื่อระบุรายการ"
            : "Loads up to 2,000 rows per request — use search to narrow."}
        </p>
      </div>

      <TransactionDetailModal
        txn={detail ? mapLiveToMockTxn(detail) : null}
        member={undefined}
        liveMember={
          detail
            ? {
                email: detail.member_email,
                phone: detail.member_phone,
                wallet_balance: detail.member_wallet_balance,
                verified: detail.member_verified,
                kycLatest: kycLatestModal(
                  detail.kyc_latest_status,
                  locale,
                ),
              }
            : null
        }
        branchName={detail?.branch_name_th ?? s.branchUnknown}
        isOpen={!!detail}
        onClose={() => setDetail(null)}
      />
    </>
  );
}
