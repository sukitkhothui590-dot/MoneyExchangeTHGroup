"use client";

import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  CubeIcon,
  QueueListIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePosSession } from "@/lib/context/PosSessionContext";

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatThb(n: number): string {
  return n.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "สวัสดีตอนเช้า";
  if (h < 17) return "สวัสดีตอนบ่าย";
  return "สวัสดีตอนเย็น";
}

type PosTxn = {
  id: string;
  created_at: string;
  currency_code: string;
  amount: number;
  rate: number;
  total_thb: number;
  note?: string | null;
  status?: string | null;
};

type SummaryPayload = {
  total_count: number;
  total_thb: number;
  by_currency: {
    currency_code: string;
    count: number;
    sum_thb: number;
    sum_amount: number;
  }[];
};

type BookingRow = { status: string };

export default function PosDashboardPage() {
  const { branch, userEmail, userDisplayName, ready } = usePosSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dash, setDash] = useState<{
    bookings: BookingRow[];
    pendingQueue: number;
    recent: PosTxn[];
    summaryAll: SummaryPayload | null;
    summaryToday: SummaryPayload | null;
  } | null>(null);

  const greetName =
    userDisplayName?.trim() || userEmail?.split("@")[0] || "พนักงาน";

  const todayStr = useMemo(() => ymdLocal(new Date()), []);

  useEffect(() => {
    if (!ready) return;
    if (!userEmail) router.replace("/pos/login");
  }, [ready, userEmail, router]);

  useEffect(() => {
    if (!branch?.id) {
      setDash(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      const bid = encodeURIComponent(branch.id);
      const q = [
        fetch(`/api/bookings?branchId=${bid}`),
        fetch(`/api/pos/transactions?branchId=${bid}`),
        fetch(`/api/pos/reports/summary?branchId=${bid}`),
        fetch(
          `/api/pos/reports/summary?branchId=${bid}&from=${todayStr}&to=${todayStr}`,
        ),
      ];

      const results = await Promise.allSettled(q.map((p) => p.then((r) => r.json())));

      if (cancelled) return;

      const bookingsJson =
        results[0].status === "fulfilled" ? results[0].value : null;
      const txJson = results[1].status === "fulfilled" ? results[1].value : null;
      const sumAllJson = results[2].status === "fulfilled" ? results[2].value : null;
      const sumTodayJson =
        results[3].status === "fulfilled" ? results[3].value : null;

      const bookings: BookingRow[] = Array.isArray(bookingsJson?.data)
        ? bookingsJson.data
        : [];
      const txs: PosTxn[] = Array.isArray(txJson?.data) ? txJson.data : [];

      const pendingQueue = bookings.filter((b) =>
        ["pending_payment", "pending_review"].includes(b.status),
      ).length;

      const summaryAll: SummaryPayload | null =
        sumAllJson?.data?.total_count != null ? sumAllJson.data : null;
      const summaryToday: SummaryPayload | null =
        sumTodayJson?.data?.total_count != null ? sumTodayJson.data : null;

      setDash({
        bookings,
        pendingQueue,
        recent: txs.slice(0, 6),
        summaryAll,
        summaryToday,
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [branch?.id, todayStr]);

  if (!ready || !userEmail) return null;

  const cards = [
    {
      href: "/pos/exchange",
      title: "แลกเงินหน้าเคาน์เตอร์",
      desc: "ค้นหาสมาชิก บันทึกเรทและยอด THB",
      icon: BanknotesIcon,
      accent: "from-emerald-500/15 to-teal-500/10",
    },
    {
      href: "/pos/queue",
      title: "คิว / การจอง",
      desc: "ดูคำขอที่รอชำระหรือรอตรวจ",
      icon: QueueListIcon,
      accent: "from-sky-500/15 to-indigo-500/10",
    },
    {
      href: "/pos/history",
      title: "ประวัติธุรกรรม",
      desc: "กรองตามวันที่ ยกเลิกรายการ",
      icon: ClockIcon,
      accent: "from-violet-500/15 to-fuchsia-500/10",
    },
    {
      href: "/pos/reports",
      title: "รายงานสรุป",
      desc: "ยอดรวมตามสกุลเงิน ส่งออก CSV",
      icon: ChartBarIcon,
      accent: "from-amber-500/15 to-orange-500/10",
    },
  ] as const;

  const maxCcyThb =
    dash?.summaryToday?.by_currency?.length ?
      Math.max(...dash.summaryToday.by_currency.map((c) => c.sum_thb), 1)
    : 1;

  return (
    <div className="space-y-8 min-w-0">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-6 sm:px-7 sm:py-7 text-white shadow-lg shadow-slate-900/20">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--site-accent)]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-white/60">
              <SparklesIcon className="h-3.5 w-3.5 text-amber-300/90" />
              {timeGreeting()}
            </p>
            <h2 className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight truncate">
              {greetName}
            </h2>
            <p className="mt-1 text-sm text-white/75 max-w-xl">
              {branch?.name_th ? (
                <>
                  กำลังทำงานที่{" "}
                  <span className="font-medium text-white">{branch.name_th}</span>
                  {" — "}
                  สรุปยอดและคิวด้านล่างอัปเดตจากสาขานี้
                </>
              ) : (
                "ยังไม่ได้เลือกสาขา — ออกจากระบบแล้วเข้าใหม่เพื่อเลือกสาขา"
              )}
            </p>
          </div>
          {branch?.id ? (
            <Link
              href="/pos/exchange"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-md hover:bg-slate-100 transition-colors"
            >
              <BanknotesIcon className="h-5 w-5 text-emerald-600" />
              เริ่มแลกเงิน
            </Link>
          ) : null}
        </div>
      </section>

      {!branch?.id ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl px-4 py-3">
          เลือกสาขาจากเมนูด้านซ้าย (หรือเข้าสู่ระบบใหม่) เพื่อโหลดตัวเลขแดชบอร์ด
        </p>
      ) : loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="pos-card-saas rounded-2xl h-24 bg-slate-100/80" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="pos-card-saas rounded-2xl p-4 min-w-0 border-t-2 border-t-sky-500/60">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                คำขอจองทั้งหมด
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
                {dash?.bookings.length ?? "—"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">สาขานี้</p>
            </div>
            <div className="pos-card-saas rounded-2xl p-4 min-w-0 border-t-2 border-t-amber-500/60">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                คิวที่รอดำเนินการ
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
                {dash?.pendingQueue ?? "—"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">รอชำระ / รอตรวจ</p>
            </div>
            <div className="pos-card-saas rounded-2xl p-4 min-w-0 border-t-2 border-t-emerald-500/60">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                ยอด THB วันนี้
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
                {dash?.summaryToday != null ?
                  formatThb(dash.summaryToday.total_thb)
                : "—"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {dash?.summaryToday != null ?
                  `${dash.summaryToday.total_count} รายการ`
                : ""}
              </p>
            </div>
            <div className="pos-card-saas rounded-2xl p-4 min-w-0 border-t-2 border-t-violet-500/60">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                ยอด THB สะสม (ใช้ได้)
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
                {dash?.summaryAll != null ?
                  formatThb(dash.summaryAll.total_thb)
                : "—"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">ธุรกรรม active</p>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* สกุลเงินวันนี้ */}
            <section className="xl:col-span-1 pos-card-saas rounded-2xl p-5 min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    สรุปตามสกุล — วันนี้
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {new Date().toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {dash?.summaryToday?.by_currency?.length ? (
                <ul className="space-y-3">
                  {dash.summaryToday.by_currency.map((row) => (
                    <li key={row.currency_code}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-800">
                          {row.currency_code}
                        </span>
                        <span className="tabular-nums text-slate-600">
                          ฿{formatThb(row.sum_thb)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500/90 transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (row.sum_thb / maxCcyThb) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {row.count} รายการ · รวม {formatThb(row.sum_amount)} หน่วย
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                  ยังไม่มีธุรกรรมวันนี้ในสาขานี้
                </p>
              )}
              <Link
                href="/pos/reports"
                className="mt-4 block text-center text-xs font-medium text-[var(--site-accent)] hover:underline"
              >
                ดูรายงานเต็ม →
              </Link>
            </section>

            {/* ธุรกรรมล่าสุด */}
            <section className="xl:col-span-2 pos-card-saas rounded-2xl p-5 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <CubeIcon className="h-5 w-5 text-slate-600 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">
                      ธุรกรรมล่าสุด
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      เรียงจากเวลาล่าสุด (สูงสุด 6 รายการ)
                    </p>
                  </div>
                </div>
                <Link
                  href="/pos/history"
                  className="text-xs font-medium text-[var(--site-accent)] hover:underline shrink-0"
                >
                  ทั้งหมด
                </Link>
              </div>
              {dash?.recent?.length ? (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-xs min-w-[520px]">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-100">
                        <th className="pb-2 pr-2 font-medium">เวลา</th>
                        <th className="pb-2 pr-2 font-medium">CCY</th>
                        <th className="pb-2 pr-2 font-medium text-right">จำนวน</th>
                        <th className="pb-2 pr-2 font-medium text-right">เรท</th>
                        <th className="pb-2 font-medium text-right">THB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {dash.recent.map((t) => (
                        <tr key={t.id} className="text-slate-800">
                          <td className="py-2.5 pr-2 tabular-nums text-slate-600 whitespace-nowrap">
                            {new Date(t.created_at).toLocaleString("th-TH", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5 pr-2 font-medium">{t.currency_code}</td>
                          <td className="py-2.5 pr-2 text-right tabular-nums">
                            {formatThb(t.amount)}
                          </td>
                          <td className="py-2.5 pr-2 text-right tabular-nums text-slate-600">
                            {formatThb(t.rate)}
                          </td>
                          <td className="py-2.5 text-right font-medium tabular-nums">
                            ฿{formatThb(t.total_thb)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-8 text-center border border-dashed border-slate-200 rounded-xl">
                  ยังไม่มีประวัติธุรกรรมในสาขานี้
                </p>
              )}
            </section>
          </div>
        </>
      )}

      {/* Quick actions */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          ทางลัด
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`group relative overflow-hidden flex gap-4 pos-card-saas rounded-2xl p-4 hover:shadow-md hover:border-slate-300/80 transition-all duration-200 bg-gradient-to-br ${c.accent}`}
            >
              <div className="shrink-0 h-11 w-11 rounded-xl bg-white/90 border border-slate-200/80 flex items-center justify-center shadow-sm group-hover:scale-[1.03] transition-transform">
                <c.icon className="h-6 w-6 text-slate-700" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-[var(--site-accent)] transition-colors">
                  {c.title}
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
