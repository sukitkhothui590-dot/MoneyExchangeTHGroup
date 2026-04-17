"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Header from "../../components/Header";
import AdminPageHelp from "../../components/AdminPageHelp";
import BookingDetailModal from "../../components/BookingDetailModal";
import TwemojiFlag from "../../components/TwemojiFlag";
import type { Booking, BookingStatus } from "@/lib/types/database";
import { USE_MOCK_DATA } from "@/lib/config";
import {
  customerBookingToBooking,
} from "@/lib/mock/bookingAdapter";
import {
  getAdminBookings,
  patchCustomerBooking,
} from "@/lib/mock/store";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import { fillTemplate } from "@/lib/admin/screenCopy";
import { bookingDisplayReference } from "@/lib/book/bookingReference";

type StatusFilter = "all" | BookingStatus;

const statusStyles: Record<BookingStatus, string> = {
  pending_payment: "bg-gray-50 text-gray-600 border-gray-200",
  pending_review: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-blue-50 text-blue-600 border-blue-200",
  completed: "bg-emerald-50 text-success border-emerald-200",
};

export default function BookingsPage() {
  const { t, locale } = useAdminLanguage();
  const p = t.pages.bookings;
  const b = t.screens.bookings;
  const sh = t.screens.shared;
  const dateLocale = locale === "th" ? "th-TH" : "en-US";

  const statusFilters = useMemo(
    () =>
      [
        { label: b.statusAll, value: "all" as const },
        { label: b.statusPendingPay, value: "pending_payment" as const },
        { label: b.statusPendingReview, value: "pending_review" as const },
        { label: b.statusApproved, value: "approved" as const },
        { label: b.statusCompleted, value: "completed" as const },
      ] as const,
    [b],
  );

  const statusLabels = useMemo(
    (): Record<BookingStatus, string> => ({
      pending_payment: b.statusPendingPay,
      pending_review: b.statusPendingReview,
      approved: b.statusApproved,
      completed: b.statusCompleted,
    }),
    [b],
  );
  const pathname = usePathname();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const json = await res.json();
        const rows = (json.data ?? []) as Booking[];
        if (rows.length > 0 || !USE_MOCK_DATA) {
          setBookings(rows);
          setLoading(false);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    if (USE_MOCK_DATA) {
      setBookings(
        getAdminBookings().map((c) => customerBookingToBooking(c)),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, pathname]);

  const pendingReviewCount = bookings.filter(
    (b) => b.status === "pending_review",
  ).length;

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const ref = bookingDisplayReference(b);
    const matchSearch =
      ref.toLowerCase().includes(q) ||
      (b.confirmation_code?.toLowerCase().includes(q) ?? false) ||
      b.id.toLowerCase().includes(q) ||
      b.member_name.toLowerCase().includes(q) ||
      b.member_id.toLowerCase().includes(q) ||
      b.currency_code.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

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

  const handleUpdateStatus = async (
    id: string,
    newStatus: BookingStatus,
    note: string,
  ) => {
    const prev = [...bookings];
    setBookings((cur) =>
      cur.map((b) =>
        b.id === id ? { ...b, status: newStatus, note: note || b.note } : b,
      ),
    );
    setSelectedBooking(null);

    if (USE_MOCK_DATA) {
      patchCustomerBooking(id, { status: newStatus, note: note || undefined });
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note }),
      });
      if (!res.ok) setBookings(prev);
    } catch {
      setBookings(prev);
    }
  };

  return (
    <>
      <Header
        title={p.title}
        subtitle={p.subtitle}
        actions={
          pendingReviewCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 h-8 px-3 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {fillTemplate(b.pendingReview, { n: pendingReviewCount })}
            </span>
          ) : null
        }
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <AdminPageHelp
          idPrefix="bookings"
          title={p.helpTitle}
          expandLabel={t.common.helpExpand}
          collapseLabel={t.common.helpCollapse}
          sections={p.helpSections}
        />
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="relative w-full max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder={b.searchPh}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
            />
          </div>
          <div className="flex gap-1 bg-surface rounded-lg p-1">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  statusFilter === f.value
                    ? "bg-white text-brand border border-border"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1120px]">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    {b.colBookingId}
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted whitespace-nowrap min-w-[9rem]">
                    {b.colBookedAt}
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    {b.colMemberName}
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    {b.colMemberId}
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    {b.colCurrency}
                  </th>
                  <th className="text-right px-5 py-3 font-medium text-muted">
                    {b.colAmount}
                  </th>
                  <th className="text-right px-5 py-3 font-medium text-muted">
                    {b.colTotalThb}
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    {b.colChannel}
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-muted">
                    {b.colStatus}
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-muted">
                    {sh.manage}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface/60 transition-colors"
                  >
                    <td className="px-5 py-3.5 align-top">
                      <span
                        className="font-mono text-xs font-semibold text-foreground tracking-tight"
                        title={booking.id}
                      >
                        {bookingDisplayReference(booking)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 align-top text-[11px] text-muted tabular-nums whitespace-nowrap">
                      {formatDate(booking.created_at)}
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <p className="font-medium text-foreground">
                        {booking.member_name || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 align-top max-w-[220px]">
                      <p
                        className="font-mono text-[11px] text-muted break-all leading-snug"
                        title={booking.member_id}
                      >
                        {booking.member_id}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <TwemojiFlag emoji={booking.currency_flag} />
                        <span className="font-medium text-foreground">
                          {booking.currency_code}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-foreground">
                      {booking.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                      ฿{booking.total_thb.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-foreground inline-flex items-center gap-1">
                        {booking.pickup_method === "branch" ? (
                          <>
                            <MapPinIcon className="w-3.5 h-3.5 text-muted" />
                            {booking.branch_name}
                          </>
                        ) : (
                          <>
                            <WalletIcon className="w-3.5 h-3.5 text-muted" />
                            {b.wallet}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyles[booking.status]}`}
                      >
                        {statusLabels[booking.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className={`h-7 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          booking.status === "pending_review"
                            ? "bg-brand text-white hover:bg-brand-dark"
                            : "border border-border text-muted hover:text-brand hover:border-brand"
                        }`}
                      >
                        {booking.status === "pending_review"
                          ? b.btnReview
                          : b.btnView}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-12 text-center text-muted"
                    >
                      {b.emptyBookings}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted mt-3">
          {fillTemplate(sh.showingOf, {
            shown: filtered.length,
            total: bookings.length,
          })}
        </p>
      </div>

      <BookingDetailModal
        isOpen={!!selectedBooking}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </>
  );
}
