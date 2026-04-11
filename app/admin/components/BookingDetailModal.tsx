"use client";

import { useState } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  QrCodeIcon,
  MapPinIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import type { Booking, BookingStatus } from "@/lib/types/database";
import TwemojiFlag from "./TwemojiFlag";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";

interface BookingDetailModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: BookingStatus, note: string) => void;
}

const statusStyles: Record<BookingStatus, string> = {
  pending_payment: "bg-gray-50 text-gray-600 border-gray-200",
  pending_review: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-blue-50 text-blue-600 border-blue-200",
  completed: "bg-emerald-50 text-success border-emerald-200",
};

const nextStatus: Partial<Record<BookingStatus, BookingStatus>> = {
  pending_review: "approved",
  approved: "completed",
};

export default function BookingDetailModal({
  isOpen,
  booking,
  onClose,
  onUpdateStatus,
}: BookingDetailModalProps) {
  const [note, setNote] = useState("");
  const { locale, t } = useAdminLanguage();
  const m = t.screens.bookingModal;
  const dateLocale = locale === "th" ? "th-TH" : "en-US";

  const statusLabels: Record<BookingStatus, string> = {
    pending_payment: m.statusPendingPay,
    pending_review: m.statusPendingReview,
    approved: m.statusApproved,
    completed: m.statusCompleted,
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen || !booking) return null;

  const next = nextStatus[booking.status];

  const handleAdvance = () => {
    if (next) {
      onUpdateStatus(booking.id, next, note);
      setNote("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white border border-border rounded-2xl w-full max-w-[540px] mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            {m.title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Status Progress */}
        <div className="flex items-center gap-1 mb-6">
          {(
            [
              "pending_payment",
              "pending_review",
              "approved",
              "completed",
            ] as BookingStatus[]
          ).map((s, i) => {
            const statusOrder = [
              "pending_payment",
              "pending_review",
              "approved",
              "completed",
            ];
            const currentIdx = statusOrder.indexOf(booking.status);
            const isReached = i <= currentIdx;
            return (
              <div
                key={s}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-full h-1.5 rounded-full ${isReached ? "bg-brand" : "bg-border"}`}
                />
                <span
                  className={`text-[10px] font-medium ${isReached ? "text-brand" : "text-muted"}`}
                >
                  {statusLabels[s]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-surface rounded-lg p-3">
            <p className="text-xs text-muted mb-0.5">{m.lblBookingId}</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              {booking.id}
            </p>
          </div>
          <div className="bg-surface rounded-lg p-3">
            <p className="text-xs text-muted mb-0.5">{m.lblStatus}</p>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyles[booking.status]}`}
            >
              {statusLabels[booking.status]}
            </span>
          </div>
          <div className="bg-surface rounded-lg p-3">
            <p className="text-xs text-muted mb-0.5">{m.lblMember}</p>
            <p className="text-sm text-foreground">{booking.member_name}</p>
          </div>
          <div className="bg-surface rounded-lg p-3">
            <p className="text-xs text-muted mb-0.5">{m.lblBookedAt}</p>
            <p className="text-sm text-foreground">
              {formatDate(booking.created_at)}
            </p>
          </div>
          <div className="bg-surface rounded-lg p-3">
            <p className="text-xs text-muted mb-0.5">{m.lblCurrency}</p>
            <div className="flex items-center gap-2">
              <TwemojiFlag emoji={booking.currency_flag} />
              <span className="text-sm font-medium text-foreground">
                {booking.currency_code}
              </span>
            </div>
          </div>
          <div className="bg-surface rounded-lg p-3">
            <p className="text-xs text-muted mb-0.5">{m.lblAmount}</p>
            <p className="text-sm font-semibold text-foreground">
              {booking.amount.toLocaleString()} {booking.currency_code}
            </p>
          </div>
          <div className="bg-surface rounded-lg p-3">
            <p className="text-xs text-muted mb-0.5">{m.lblRate}</p>
            <p className="text-sm font-mono text-foreground">
              {booking.rate.toFixed(4)}
            </p>
          </div>
          <div className="bg-surface rounded-lg p-3">
            <p className="text-xs text-muted mb-0.5">{m.lblTotalThb}</p>
            <p className="text-sm font-bold text-brand">
              ฿{booking.total_thb.toLocaleString()}
            </p>
          </div>
          <div className="bg-surface rounded-lg p-3 col-span-2">
            <p className="text-xs text-muted mb-0.5">{m.lblPickup}</p>
            <p className="text-sm text-foreground inline-flex items-center gap-1.5">
              {booking.pickup_method === "branch" ? (
                <>
                  <MapPinIcon className="w-4 h-4 text-muted" />
                  {booking.branch_name} — {booking.pickup_date}
                </>
              ) : (
                <>
                  <WalletIcon className="w-4 h-4 text-muted" />
                  {m.walletTransfer}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Slip placeholder */}
        {booking.status === "pending_review" && (
          <div className="border border-dashed border-border rounded-xl h-36 flex items-center justify-center mb-5 bg-surface/50">
            <div className="text-center">
              <p className="text-sm text-muted">{m.slipPayment}</p>
              <p className="text-xs text-muted/60 mt-1">{m.slipPlaceholder}</p>
            </div>
          </div>
        )}

        {/* QR Code for approved bookings */}
        {(booking.status === "approved" || booking.status === "completed") && (
          <div className="border border-border rounded-xl p-4 mb-5 flex items-center gap-4 bg-brand-subtle/30">
            <div className="w-16 h-16 bg-white border border-border rounded-lg flex items-center justify-center flex-shrink-0">
              <QrCodeIcon className="w-10 h-10 text-brand" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {m.qrTitle}
              </p>
              <p className="text-xs text-muted mt-0.5">{m.qrHint}</p>
              <p className="text-xs font-mono text-brand mt-1">{booking.id}</p>
            </div>
          </div>
        )}

        {/* Note */}
        {next && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {m.note}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={m.notePh}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong resize-none"
            />
          </div>
        )}

        {/* Existing note */}
        {booking.note && !next && (
          <div className="bg-surface rounded-lg p-3 mb-5">
            <p className="text-xs text-muted mb-0.5">หมายเหตุ</p>
            <p className="text-sm text-foreground">{booking.note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            {m.close}
          </button>
          {next && (
            <button
              onClick={handleAdvance}
              className="flex-1 h-10 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
            >
              {next === "approved" ? (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  {m.approveBooking}
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4" />
                  {m.markComplete}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
