"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePosSession } from "@/lib/context/PosSessionContext";
import type { Booking, BookingStatus } from "@/lib/types/database";
import PosBookingDetailModal from "@/components/pos/PosBookingDetailModal";

const statusTh: Record<BookingStatus, string> = {
  pending_payment: "รอชำระเงิน",
  pending_review: "รอตรวจสอบ",
  approved: "อนุมัติแล้ว",
  completed: "สำเร็จ",
};

const statusClass: Record<BookingStatus, string> = {
  pending_payment: "bg-amber-50 text-amber-800 border-amber-200",
  pending_review: "bg-sky-50 text-sky-800 border-sky-200",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function PosQueuePage() {
  const { branch, userEmail, ready } = usePosSession();
  const router = useRouter();
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"all" | "today">("today");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [detail, setDetail] = useState<Booking | null>(null);
  const [incomingCount, setIncomingCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  /** กันเขียน localStorage ก่อนอ่านค่าเดิม (จะทับ sound เป็น 0 ตอนรีเฟรช) */
  const [soundPrefsHydrated, setSoundPrefsHydrated] = useState(false);
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const knownBookingIdsRef = useRef<Set<string>>(new Set());
  const bootstrappedRef = useRef(false);
  const pollingRef = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (!userEmail) router.replace("/pos/login");
  }, [ready, userEmail, router]);

  const playFallbackBeep = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.24);
      window.setTimeout(() => void ctx.close(), 260);
    } catch {
      /* ignore notify sound errors */
    }
  }, []);

  const playIncomingTone = useCallback(() => {
    if (!soundEnabled) return;
    const alertAudio = alertAudioRef.current;
    if (alertAudio) {
      alertAudio.currentTime = 0;
      void alertAudio.play().catch(() => {
        playFallbackBeep();
      });
      return;
    }
    playFallbackBeep();
  }, [soundEnabled, playFallbackBeep]);

  useEffect(() => {
    const audio = new Audio("/sounds/booking-alert.mp3");
    audio.preload = "auto";
    alertAudioRef.current = audio;
    return () => {
      alertAudioRef.current = null;
    };
  }, []);

  const enableSound = useCallback(() => {
    setSoundEnabled(true);
    // play immediate test tone after user gesture
    window.setTimeout(() => {
      const alertAudio = alertAudioRef.current;
      if (alertAudio) {
        alertAudio.currentTime = 0;
        void alertAudio.play().catch(() => {
          playFallbackBeep();
        });
      } else {
        playFallbackBeep();
      }
    }, 0);
  }, [playFallbackBeep]);

  const loadBookings = useCallback(
    async (silent = false) => {
      if (!ready || !userEmail || !branch?.id) {
        setLoading(false);
        return;
      }
      if (pollingRef.current) return;
      pollingRef.current = true;
      if (!silent) setLoading(true);
      try {
        const res = await fetch(
          `/api/bookings?branchId=${encodeURIComponent(branch.id)}`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          setRows([]);
          return;
        }
        const json = await res.json();
        const nextRows = (json.data ?? []) as Booking[];
        const nextIds = new Set(nextRows.map((b) => b.id));

        if (!bootstrappedRef.current) {
          knownBookingIdsRef.current = nextIds;
          bootstrappedRef.current = true;
        } else {
          const newItems = nextRows.filter(
            (b) => !knownBookingIdsRef.current.has(b.id),
          );
          if (newItems.length > 0) {
            setIncomingCount((prev) => prev + newItems.length);
            playIncomingTone();
          }
          knownBookingIdsRef.current = nextIds;
        }
        setRows(nextRows);
      } finally {
        pollingRef.current = false;
        if (!silent) setLoading(false);
      }
    },
    [ready, userEmail, branch?.id, playIncomingTone],
  );

  useEffect(() => {
    if (!ready || !userEmail || !branch?.id) {
      setLoading(false);
      return;
    }
    bootstrappedRef.current = false;
    knownBookingIdsRef.current = new Set();
    setIncomingCount(0);
    void loadBookings(false);

    const id = window.setInterval(() => {
      void loadBookings(true);
    }, 12000);
    return () => window.clearInterval(id);
  }, [ready, userEmail, branch?.id, loadBookings]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("pos_queue_sound_enabled");
      setSoundEnabled(saved === "1");
    } catch {
      /* ignore */
    }
    setSoundPrefsHydrated(true);
  }, []);

  useEffect(() => {
    if (!soundPrefsHydrated) return;
    try {
      window.localStorage.setItem(
        "pos_queue_sound_enabled",
        soundEnabled ? "1" : "0",
      );
    } catch {
      /* ignore */
    }
  }, [soundPrefsHydrated, soundEnabled]);

  const filtered = useMemo(() => {
    let r = rows;
    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      r = r.filter((b) => new Date(b.created_at) >= start);
    }
    if (statusFilter !== "all") {
      r = r.filter((b) => b.status === statusFilter);
    }
    return r;
  }, [rows, range, statusFilter]);

  if (!ready || !userEmail) return null;

  return (
    <div className="space-y-4 min-w-0">
      <div className="space-y-1">
        <p className="text-xs text-slate-500">
          เฉพาะสาขา{" "}
          <span className="font-medium text-slate-800">{branch?.name_th ?? "—"}</span>{" "}
          — เรียงเวลาล่าสุดก่อน
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          รายการนี้คือคำขอจองจากลูกค้าในสาขานี้ กด{" "}
          <span className="font-medium text-slate-800">ดูรายละเอียด · QR</span>{" "}
          เพื่อเทียบรหัส/สแกนกับลูกค้า แล้วใช้ปุ่ม{" "}
          <span className="font-medium text-slate-800">ดำเนินการถัดไป</span>{" "}
          ในกล่องเพื่อเปลี่ยนสถานะ (รับชำระ → อนุมัติ → สำเร็จ)
        </p>
      </div>

      {incomingCount > 0 ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-blue-900">
            มีการจองใหม่เข้า {incomingCount} รายการ
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIncomingCount(0);
                void loadBookings(true);
              }}
              className="h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              ดูรายการใหม่
            </button>
            <button
              type="button"
              onClick={() => setIncomingCount(0)}
              className="h-8 px-3 rounded-lg border border-blue-200 text-blue-800 text-xs font-semibold hover:bg-white"
            >
              ปิดแจ้งเตือน
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-end pos-card-saas rounded-xl p-3">
        <div className="flex rounded-lg border border-blue-100 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setRange("today")}
            className={`px-3 py-2 font-medium ${
              range === "today"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600"
            }`}
          >
            วันนี้
          </button>
          <button
            type="button"
            onClick={() => setRange("all")}
            className={`px-3 py-2 font-medium border-l border-blue-100 ${
              range === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600"
            }`}
          >
            ทั้งหมด
          </button>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-blue-600/80 mb-1">
            สถานะ
          </label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as BookingStatus | "all")
            }
            className="h-9 px-2 rounded-lg border border-blue-100 text-sm bg-white"
          >
            <option value="all">ทุกสถานะ</option>
            {(Object.keys(statusTh) as BookingStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusTh[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:ml-auto">
          {soundEnabled ? (
            <button
              type="button"
              onClick={() => setSoundEnabled(false)}
              className="h-9 px-3 rounded-lg border border-blue-200 text-xs font-semibold text-blue-800 hover:bg-blue-50"
            >
              ปิดเสียงแจ้งเตือน
            </button>
          ) : (
            <button
              type="button"
              onClick={enableSound}
              className="h-9 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              เปิดเสียงแจ้งเตือน
            </button>
          )}
        </div>
      </div>

      {!branch?.id ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          ยังไม่มีสาขาในเซสชัน — ออกจากระบบแล้วเข้าใหม่พร้อมเลือกสาขา
        </p>
      ) : null}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl pos-card-saas" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((b) => (
            <li
              key={b.id}
              className="rounded-2xl pos-card-saas p-4 text-sm min-w-0 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between gap-2 flex-wrap items-start">
                <div className="min-w-0 flex-1">
                  {b.confirmation_code ? (
                    <p className="font-mono text-sm font-bold text-emerald-700 tracking-tight">
                      {b.confirmation_code}
                    </p>
                  ) : (
                    <span className="font-mono text-xs break-all text-slate-400">
                      {b.id.slice(0, 8)}…
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${statusClass[b.status]}`}
                >
                  {statusTh[b.status]}
                </span>
              </div>
              <p className="text-sm font-medium mt-2 text-slate-900">{b.member_name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                จองเมื่อ{" "}
                <span className="tabular-nums font-medium text-slate-800">
                  {new Date(b.created_at).toLocaleString("th-TH")}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {b.currency_code} · ฿{b.total_thb.toLocaleString()}
                {b.note ? ` · ${b.note}` : ""}
              </p>
              <button
                type="button"
                onClick={() => setDetail(b)}
                className="mt-3 w-full sm:w-auto h-9 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm shadow-blue-600/15"
              >
                ดูรายละเอียด · QR
              </button>
            </li>
          ))}
        </ul>
      )}
      {!loading && filtered.length === 0 && branch?.id ? (
        <p className="text-sm text-slate-500 text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-white/80 pos-card-saas">
          {rows.length === 0
            ? "ยังไม่มีคำขอในสาขานี้"
            : "ไม่มีรายการตามตัวกรองนี้"}
        </p>
      ) : null}

      <PosBookingDetailModal
        booking={detail}
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        onBookingUpdated={(b) => {
          setRows((prev) => prev.map((x) => (x.id === b.id ? b : x)));
          setDetail((d) => (d?.id === b.id ? b : d));
        }}
      />
    </div>
  );
}
