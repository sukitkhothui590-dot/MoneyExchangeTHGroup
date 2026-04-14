"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { XMarkIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import type { Booking, BookingStatus } from "@/lib/types/database";

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

/** ปุ่มดำเนินการถัดไปจากสถานะปัจจุบัน (POS หน้าคิว) */
const statusActions: Partial<
  Record<BookingStatus, { label: string; next: BookingStatus }[]>
> = {
  pending_payment: [
    { label: "รับชำระแล้ว → รอตรวจสอบ", next: "pending_review" },
    { label: "อนุมัติทันที", next: "approved" },
  ],
  pending_review: [{ label: "อนุมัติการจอง", next: "approved" }],
  approved: [{ label: "ให้บริการครบ (สำเร็จ)", next: "completed" }],
};

type Props = {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  /** หลัง PATCH สถานะสำเร็จ — ให้หน้าคิวอัปเดตรายการ */
  onBookingUpdated?: (booking: Booking) => void;
};

export default function PosBookingDetailModal({
  booking,
  isOpen,
  onClose,
  onBookingUpdated,
}: Props) {
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");

  const refCode =
    booking?.confirmation_code?.trim() ||
    booking?.id ||
    "";

  const copyRef = useCallback(async () => {
    if (!refCode) return;
    try {
      await navigator.clipboard.writeText(refCode);
    } catch {
      /* ignore */
    }
  }, [refCode]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setStatusError("");
      setStatusSaving(false);
    }
  }, [isOpen]);

  const applyStatus = async (next: BookingStatus) => {
    if (!booking) return;
    setStatusError("");
    setStatusSaving(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusError(
          typeof json.error === "string" ? json.error : "อัปเดตสถานะไม่สำเร็จ",
        );
        return;
      }
      const updated = json.data as Booking;
      onBookingUpdated?.(updated);
    } catch {
      setStatusError("เชื่อมต่อไม่สำเร็จ");
    } finally {
      setStatusSaving(false);
    }
  };

  if (!isOpen || !booking) return null;

  const actions = statusActions[booking.status] ?? [];

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="ปิด"
        onClick={onClose}
      />
      <div
        data-scroll-no-scrollbar="true"
        className="relative bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-xl w-full max-w-md max-h-[92vh] overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-hide touch-pan-y"
      >
        <div className="sticky top-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-white/95 backdrop-blur-sm z-10">
          <h2 className="text-base font-semibold text-slate-900">
            รายละเอียดการจอง
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="rounded-xl border-2 border-slate-200 bg-white p-3 shadow-sm">
              <QRCode
                value={refCode}
                size={160}
                level="M"
                fgColor="#0f172a"
                bgColor="#ffffff"
                className="h-auto max-w-full"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center max-w-xs">
              สแกนเพื่อยืนยันรหัสกับลูกค้า หรือเทียบกับรหัสบนมือถือลูกค้า
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
              {booking.confirmation_code?.trim()
                ? "รหัสยืนยัน (แสดงให้พนักงาน)"
                : "รหัสใน QR (ใช้ UUID ถ้ายังไม่มีรหัสสั้น)"}
            </p>
            <div className="flex items-start justify-between gap-2 mt-1">
              <p className="font-mono text-lg font-bold text-emerald-700 break-all leading-tight">
                {booking.confirmation_code?.trim() || refCode}
              </p>
              <button
                type="button"
                onClick={copyRef}
                className="shrink-0 p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                title="คัดลอกรหัสเดียวกับ QR"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 mb-0.5">รหัสการจอง (UUID)</p>
            <p className="font-mono text-xs text-slate-600 break-all">{booking.id}</p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-900">
              {booking.member_name}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusClass[booking.status]}`}
            >
              {statusTh[booking.status]}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <div className="col-span-2">
              <dt className="text-[10px] text-slate-500">สกุลเงิน / จำนวน</dt>
              <dd className="font-medium text-slate-900">
                {booking.currency_code}{" "}
                {booking.amount.toLocaleString("th-TH", {
                  maximumFractionDigits: 4,
                })}{" "}
                · อัตรา {booking.rate.toLocaleString("th-TH")}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[10px] text-slate-500">ยอดรวม (THB)</dt>
              <dd className="text-lg font-bold text-emerald-800 tabular-nums">
                ฿{booking.total_thb.toLocaleString("th-TH")}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[10px] text-slate-500">สาขา / รับเงิน</dt>
              <dd className="text-slate-800">
                {booking.pickup_method === "wallet"
                  ? "โอนเข้า Wallet"
                  : (booking.branch_name ?? "—")}
                {booking.branch_id ? (
                  <span className="text-slate-400 text-xs ml-1">
                    ({booking.branch_id})
                  </span>
                ) : null}
              </dd>
            </div>
            {booking.pickup_date ? (
              <div className="col-span-2">
                <dt className="text-[10px] text-slate-500">นัดรับ / เข้าใช้บริการ</dt>
                <dd className="text-slate-800 tabular-nums">
                  {new Date(booking.pickup_date).toLocaleString("th-TH")}
                </dd>
              </div>
            ) : null}
            <div className="col-span-2">
              <dt className="text-[10px] text-slate-500">จองเมื่อ</dt>
              <dd className="text-slate-700 tabular-nums text-xs">
                {new Date(booking.created_at).toLocaleString("th-TH")}
              </dd>
            </div>
          </dl>

          {booking.note ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
              <p className="text-[10px] text-slate-500 mb-0.5">หมายเหตุ</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {booking.note}
              </p>
            </div>
          ) : null}

          {actions.length > 0 ? (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-700">
                ดำเนินการถัดไป
              </p>
              <div className="flex flex-col gap-2">
                {actions.map((a) => (
                  <button
                    key={a.next}
                    type="button"
                    disabled={statusSaving}
                    onClick={() => void applyStatus(a.next)}
                    className="w-full h-10 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 text-sm font-semibold hover:bg-blue-100 disabled:opacity-50"
                  >
                    {statusSaving ? "กำลังบันทึก…" : a.label}
                  </button>
                ))}
              </div>
              {statusError ? (
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5">
                  {statusError}
                </p>
              ) : null}
            </div>
          ) : booking.status === "completed" ? (
            <p className="text-xs text-slate-500 text-center py-1">
              รายการนี้ปิดแล้ว (สำเร็จ)
            </p>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-600/20"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
