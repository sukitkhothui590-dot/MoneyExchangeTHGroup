"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePosSession } from "@/lib/context/PosSessionContext";
import type { Currency } from "@/lib/types/database";

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Summary = {
  total_count: number;
  total_thb: number;
  void_count: number;
  void_thb: number;
  void_share_pct: number;
  by_currency: {
    currency_code: string;
    count: number;
    sum_thb: number;
    sum_amount: number;
  }[];
};

export default function PosReportsPage() {
  const { branch, userEmail, ready } = usePosSession();
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!userEmail) router.replace("/pos/login");
  }, [ready, userEmail, router]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/currencies");
        if (!res.ok) return;
        const json = await res.json();
        setCurrencies(json.data ?? []);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!branch?.id) return;
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams({ branchId: branch.id });
      if (from) q.set("from", from);
      if (to) q.set("to", to);
      if (currencyCode) q.set("currencyCode", currencyCode);
      const res = await fetch(`/api/pos/reports/summary?${q.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "โหลดไม่สำเร็จ");
        setSummary(null);
        return;
      }
      setSummary(json.data);
    } catch {
      setError("เกิดข้อผิดพลาด");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [branch?.id, from, to, currencyCode]);

  useEffect(() => {
    if (ready && userEmail && branch?.id) void load();
  }, [ready, userEmail, branch?.id, load]);

  const downloadCsv = () => {
    if (!branch?.id) return;
    const q = new URLSearchParams({ branchId: branch.id });
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    if (currencyCode) q.set("currencyCode", currencyCode);
    window.open(`/api/pos/reports/summary/export?${q.toString()}`, "_blank");
  };

  const setPresetToday = () => {
    const t = ymdLocal(new Date());
    setFrom(t);
    setTo(t);
  };

  const setPresetLast7Days = () => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    setFrom(ymdLocal(start));
    setTo(ymdLocal(end));
  };

  const setPresetThisMonth = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    setFrom(ymdLocal(start));
    setTo(ymdLocal(end));
  };

  const clearDateFilters = () => {
    setFrom("");
    setTo("");
  };

  if (!ready || !userEmail) return null;

  const branchLabel = branch?.name_th ?? "—";
  const hasRows = summary && summary.by_currency.length > 0;
  const noData =
    !loading && summary && summary.total_count === 0 && summary.void_count === 0;

  return (
    <div className="min-w-0 space-y-4">
      <section className="relative overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 px-5 py-5 sm:px-6 text-white shadow-lg shadow-blue-950/30">
        <div className="pointer-events-none absolute -right-20 -top-16 h-48 w-48 rounded-full bg-blue-400/15 blur-3xl" />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/90">
            POS · รายงาน
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            สรุปธุรกรรมแลกเงิน
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100/90">
            สาขา <span className="font-medium text-white">{branchLabel}</span>
            {" — "}
            ยอด THB และแบ่งตามสกุลเงินจากรายการที่ยังใช้งาน; แยกแสดงจำนวนที่ยกเลิกในช่วงเดียวกัน
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 pos-card-saas rounded-xl border border-blue-100/70 p-3 sm:p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPresetToday()}
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            วันนี้
          </button>
          <button
            type="button"
            onClick={() => setPresetLast7Days()}
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            7 วันล่าสุด
          </button>
          <button
            type="button"
            onClick={() => setPresetThisMonth()}
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            เดือนนี้
          </button>
          <button
            type="button"
            onClick={() => clearDateFilters()}
            className="h-8 rounded-lg border border-dashed border-slate-300 bg-slate-50/80 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            ล้างวันที่
          </button>
        </div>

        <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-end">
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-500">
              ตั้งแต่
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-500">
              ถึง
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-500">
              สกุลเงิน
            </label>
            <select
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="h-10 min-w-[10rem] rounded-lg border border-slate-200 bg-white px-2 text-sm"
            >
              <option value="">ทั้งหมด</option>
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                  {c.name ? ` — ${c.name}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading || !branch?.id}
              className="h-10 rounded-lg bg-blue-900 px-4 text-sm font-medium text-white hover:bg-blue-950 disabled:opacity-40"
            >
              {loading ? "กำลังโหลด…" : "อัปเดต"}
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={!branch?.id}
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 disabled:opacity-40"
            >
              ส่งออก CSV
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading && !summary ? (
        <div className="space-y-3 animate-pulse">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl pos-card-saas" />
            ))}
          </div>
          <div className="h-48 rounded-2xl pos-card-saas" />
        </div>
      ) : null}

      {summary ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="pos-card-saas rounded-xl border border-blue-100/80 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                รายการใช้งาน
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {summary.total_count.toLocaleString("th-TH")}
              </p>
            </div>
            <div className="pos-card-saas rounded-xl border border-emerald-100/90 bg-emerald-50/40 p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800/80">
                รวม THB (ใช้งาน)
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-900">
                ฿
                {summary.total_thb.toLocaleString("th-TH", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="pos-card-saas rounded-xl border border-red-100/90 bg-red-50/35 p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-800/80">
                ยกเลิก / THB (ยกเลิก)
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-red-900 sm:text-xl">
                {summary.void_count.toLocaleString("th-TH")} รายการ · ฿
                {summary.void_thb.toLocaleString("th-TH", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="pos-card-saas rounded-xl border border-amber-100/90 bg-amber-50/40 p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/80">
                สัดส่วนรายการยกเลิก
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-900">
                {summary.void_share_pct}%
              </p>
              <p className="mt-1 text-[10px] text-amber-800/70">
                ของยอด (ใช้งาน + ยกเลิก) ในช่วงนี้
              </p>
            </div>
          </div>

          {hasRows ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 pos-card-saas shadow-sm">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="sticky top-0 z-10 border-b border-slate-200/90 bg-slate-50/95 text-left text-xs text-slate-500 backdrop-blur-sm">
                    <th className="px-4 py-2">สกุลเงิน</th>
                    <th className="px-4 py-2 text-right">จำนวนรายการ</th>
                    <th className="px-4 py-2 text-right">รวมจำนวนเงินต่างประเทศ</th>
                    <th className="px-4 py-2 text-right">รวม THB</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.by_currency.map((r) => (
                    <tr
                      key={r.currency_code}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-2 font-medium">{r.currency_code}</td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {r.count.toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {r.sum_amount.toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-2 text-right font-medium tabular-nums">
                        ฿{r.sum_thb.toLocaleString("th-TH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      {noData ? (
        <div className="rounded-2xl border border-dashed border-blue-200/90 bg-blue-50/30 px-6 py-12 text-center pos-card-saas">
          <p className="text-sm font-medium text-slate-800">
            ไม่มีธุรกรรมในช่วงหรือตัวกรองนี้
          </p>
          <p className="mt-2 text-xs text-slate-500">
            ลองขยายช่วงวันที่ หรือตรวจที่หน้าประวัติหากต้องการดูทีละรายการ
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pos/exchange"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-900 px-5 text-sm font-medium text-white hover:bg-blue-950"
            >
              ไปหน้าแลกเงิน POS
            </Link>
            <Link
              href="/pos/history"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              ประวัติธุรกรรม
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
