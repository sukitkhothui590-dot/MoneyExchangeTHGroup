"use client";

import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePosSession } from "@/lib/context/PosSessionContext";
import type { Currency, PosTransaction } from "@/lib/types/database";

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function escapeCsvField(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadCsv(rows: PosTransaction[], branchName: string) {
  const headers = [
    "created_at",
    "status",
    "currency_code",
    "amount",
    "rate",
    "total_thb",
    "note",
    "member_id",
  ];
  const lines = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((r) =>
      [
        r.created_at,
        r.status,
        r.currency_code,
        String(r.amount),
        String(r.rate),
        String(r.total_thb),
        r.note ?? "",
        r.member_id,
      ]
        .map((v) => escapeCsvField(String(v)))
        .join(","),
    ),
  ];
  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safe = branchName.replace(/[^\w\s-]/g, "").trim() || "branch";
  a.download = `pos-history-${safe}-${ymdLocal(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type StatusFilter = "all" | "active" | "voided";

function PosHistoryPageInner() {
  const { branch, userEmail, ready, posAccess } = usePosSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberIdFilter = searchParams.get("memberId")?.trim() ?? "";
  const [rows, setRows] = useState<PosTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [includeVoided, setIncludeVoided] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [voidTarget, setVoidTarget] = useState<PosTransaction | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidLoading, setVoidLoading] = useState(false);
  const [voidError, setVoidError] = useState("");

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
    if (!ready || !userEmail || !branch?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("branchId", branch.id);
      if (from) q.set("from", from);
      if (to) q.set("to", to);
      if (includeVoided) q.set("includeVoided", "1");
      if (currencyCode) q.set("currencyCode", currencyCode);
      if (memberIdFilter) q.set("memberId", memberIdFilter);
      const res = await fetch(`/api/pos/transactions?${q.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setRows(json.data ?? []);
      } else {
        setRows([]);
      }
    } finally {
      setLoading(false);
    }
  }, [
    ready,
    userEmail,
    branch?.id,
    from,
    to,
    includeVoided,
    currencyCode,
    memberIdFilter,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayRows = useMemo(() => {
    if (statusFilter === "all") return rows;
    if (statusFilter === "active") {
      return rows.filter((r) => r.status === "active");
    }
    return rows.filter((r) => r.status === "voided");
  }, [rows, statusFilter]);

  const kpi = useMemo(() => {
    const totalCount = displayRows.length;
    const voidedCount = displayRows.filter((r) => r.status === "voided").length;
    const activeList = displayRows.filter((r) => r.status === "active");
    const sumThbActive = activeList.reduce((s, r) => s + r.total_thb, 0);
    const voidPct =
      totalCount > 0 ? Math.round((voidedCount / totalCount) * 1000) / 10 : 0;
    return { totalCount, voidedCount, sumThbActive, voidPct };
  }, [displayRows]);

  const submitVoid = async () => {
    if (!voidTarget) return;
    setVoidLoading(true);
    setVoidError("");
    try {
      const res = await fetch(
        `/api/pos/transactions/${voidTarget.id}/void`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: voidReason }),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        setVoidError(json.error ?? "ยกเลิกไม่สำเร็จ");
        return;
      }
      setVoidTarget(null);
      setVoidReason("");
      void load();
    } catch {
      setVoidError("เกิดข้อผิดพลาด");
    } finally {
      setVoidLoading(false);
    }
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

  return (
    <div className="space-y-4 min-w-0">
      <section className="relative overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 px-5 py-5 sm:px-6 text-white shadow-lg shadow-blue-950/30">
        <div className="pointer-events-none absolute -right-20 -top-16 h-48 w-48 rounded-full bg-blue-400/15 blur-3xl" />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/90">
            POS
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            ประวัติธุรกรรมแลกเงิน
          </h1>
          <p className="mt-2 max-w-xl text-sm text-blue-100/90">
            สาขา{" "}
            <span className="font-medium text-white">{branchLabel}</span>
            {" — "}
            ดูยอดสรุป กรอง และส่งออก CSV ตามช่วงที่เลือก
          </p>
        </div>
      </section>

      {memberIdFilter ? (
        <div className="flex flex-col gap-2 rounded-xl border border-violet-200/90 bg-violet-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-violet-950">
            กำลังกรองเฉพาะธุรกรรมของลูกค้ารายนี้ในสาขาที่เลือก
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/pos/customer/${memberIdFilter}`}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-violet-700 px-3 text-xs font-medium text-white hover:bg-violet-800"
            >
              โปรไฟล์ลูกค้า
            </Link>
            <Link
              href="/pos/history"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-violet-300 bg-white px-3 text-xs font-medium text-violet-900 hover:bg-violet-100/80"
            >
              ล้างการกรอง
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="pos-card-saas rounded-xl border border-blue-100/80 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            จำนวนรายการ (ที่แสดง)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {loading ? "—" : kpi.totalCount.toLocaleString("th-TH")}
          </p>
        </div>
        <div className="pos-card-saas rounded-xl border border-emerald-100/90 bg-emerald-50/40 p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800/80">
            ยอดรวม THB (เฉพาะใช้งาน)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-900">
            {loading
              ? "—"
              : `฿${kpi.sumThbActive.toLocaleString("th-TH", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}`}
          </p>
        </div>
        <div className="pos-card-saas rounded-xl border border-red-100/90 bg-red-50/35 p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-red-800/80">
            ยกเลิก / สัดส่วน
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-red-900 sm:text-xl">
            {loading
              ? "—"
              : `${kpi.voidedCount.toLocaleString("th-TH")} รายการ (${kpi.voidPct}% )`}
          </p>
        </div>
      </div>

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
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
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
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-500">
              สกุลเงิน
            </label>
            <select
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="h-9 min-w-[8rem] rounded-lg border border-slate-200 bg-white px-2 text-sm"
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
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-500">
              สถานะ (หน้าจอ)
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="h-9 min-w-[8rem] rounded-lg border border-slate-200 bg-white px-2 text-sm"
            >
              <option value="all">ทั้งหมดที่โหลด</option>
              <option value="active">ใช้งานอย่างเดียว</option>
              <option value="voided">ยกเลิกอย่างเดียว</option>
            </select>
          </div>
          <label className="flex items-center gap-2 pb-1 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={includeVoided}
              onChange={(e) => setIncludeVoided(e.target.checked)}
            />
            โหลดรวมรายการที่ยกเลิก
          </label>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => void load()}
              className="h-9 rounded-lg bg-blue-900 px-3 text-xs font-medium text-white hover:bg-blue-950"
            >
              ใช้ตัวกรอง
            </button>
            <button
              type="button"
              disabled={loading || displayRows.length === 0}
              onClick={() =>
                downloadCsv(displayRows, branch?.name_th ?? "branch")
              }
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              ส่งออก CSV
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl pos-card-saas" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 pos-card-saas shadow-sm">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-slate-200/90 bg-slate-50/95 text-left text-xs text-slate-500 backdrop-blur-sm">
                <th className="px-3 py-2">เวลา</th>
                <th className="px-3 py-2">สถานะ</th>
                <th className="px-3 py-2">ลูกค้า</th>
                <th className="px-3 py-2">CCY</th>
                <th className="px-3 py-2 text-right">จำนวน</th>
                <th className="px-3 py-2 text-right">THB</th>
                <th className="w-24 px-3 py-2"> </th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((t) => (
                <tr
                  key={t.id}
                  className={`border-b border-slate-100 transition-colors last:border-0 ${
                    t.status === "voided"
                      ? "bg-red-50/40 text-slate-500"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="whitespace-nowrap px-3 py-2 text-xs">
                    {new Date(t.created_at).toLocaleString("th-TH")}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {t.status === "voided" ? (
                      <span className="text-red-700">ยกเลิก</span>
                    ) : (
                      <span className="text-emerald-700">ใช้งาน</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <Link
                      href={`/pos/customer/${t.member_id}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      ดูลูกค้า
                    </Link>
                  </td>
                  <td className="px-3 py-2">{t.currency_code}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {t.amount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">
                    ฿{t.total_thb.toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    {t.status === "active" && posAccess ? (
                      <button
                        type="button"
                        onClick={() => {
                          setVoidTarget(t);
                          setVoidReason("");
                          setVoidError("");
                        }}
                        className="text-xs text-red-700 hover:underline"
                      >
                        ยกเลิกรายการ
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && displayRows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-blue-200/90 bg-blue-50/30 px-6 py-12 text-center pos-card-saas">
          <p className="text-sm font-medium text-slate-800">
            ยังไม่มีรายการตามตัวกรอง
          </p>
          <p className="mt-2 text-xs text-slate-500">
            ลองขยายช่วงวันที่ หรือเปิด &quot;โหลดรวมรายการที่ยกเลิก&quot; หากต้องการดูครบ
          </p>
          <Link
            href="/pos/exchange"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-blue-900 px-5 text-sm font-medium text-white hover:bg-blue-950"
          >
            ไปหน้าแลกเงิน POS
          </Link>
        </div>
      )}

      {voidTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 pos-card-saas shadow-lg">
            <h3 className="text-sm font-semibold text-slate-900">ยกเลิกธุรกรรม</h3>
            <p className="mt-1 text-xs text-slate-500">
              ใส่เหตุผล (บันทึกในระบบ)
            </p>
            <textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="เหตุผลการยกเลิก…"
            />
            {voidError ? (
              <p className="mt-2 text-xs text-red-600">{voidError}</p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setVoidTarget(null)}
                className="h-10 flex-1 rounded-xl border border-slate-200 text-sm"
              >
                ปิด
              </button>
              <button
                type="button"
                disabled={voidLoading}
                onClick={() => void submitVoid()}
                className="h-10 flex-1 rounded-xl bg-red-700 text-sm font-medium text-white disabled:opacity-50"
              >
                {voidLoading ? "กำลังดำเนินการ…" : "ยืนยันยกเลิก"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function PosHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-w-0 space-y-4 animate-pulse">
          <div className="h-28 rounded-2xl bg-slate-200" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="h-24 rounded-xl bg-slate-200" />
            <div className="h-24 rounded-xl bg-slate-200" />
            <div className="h-24 rounded-xl bg-slate-200" />
          </div>
          <div className="h-48 rounded-2xl bg-slate-200" />
        </div>
      }
    >
      <PosHistoryPageInner />
    </Suspense>
  );
}
