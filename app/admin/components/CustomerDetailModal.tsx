"use client";

import { useCallback, useEffect, useState } from "react";
import {
  XMarkIcon,
  UserCircleIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import type {
  Member,
  PosTransaction,
  Booking,
  TopupRequest,
} from "@/lib/types/database";

type KycSubmission = {
  id: string;
  created_at: string;
  updated_at: string;
  member_id: string;
  staff_user_id: string | null;
  session_key: string;
  status: "pending" | "verified" | "rejected";
  full_name: string;
  id_number: string;
  document_storage_path: string | null;
  note: string;
};

type TabKey = "overview" | "transactions" | "bookings" | "kyc" | "topup";

interface Props {
  memberId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerDetailModal({
  memberId,
  isOpen,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const [transactions, setTransactions] = useState<PosTransaction[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>([]);
  const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
  const [tab, setTab] = useState<TabKey>("overview");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/members/${memberId}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Unknown error" }));
        setError(j.error ?? "Failed to load");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setMember(data.member);
      setTransactions(data.transactions ?? []);
      setBookings(data.bookings ?? []);
      setKycSubmissions(data.kyc_submissions ?? []);
      setTopupRequests(data.topup_requests ?? []);
    } catch {
      setError("ไม่สามารถเชื่อมต่อ server");
    }
    setLoading(false);
  }, [memberId]);

  useEffect(() => {
    if (isOpen && memberId) {
      setTab("overview");
      load();
    } else {
      setMember(null);
      setTransactions([]);
      setBookings([]);
      setKycSubmissions([]);
      setTopupRequests([]);
    }
  }, [isOpen, memberId, load]);

  if (!isOpen) return null;

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "overview", label: "ข้อมูลทั่วไป" },
    { key: "transactions", label: "ธุรกรรม", count: transactions.length },
    { key: "bookings", label: "การจอง", count: bookings.length },
    { key: "kyc", label: "KYC", count: kycSubmissions.length },
    { key: "topup", label: "เติมเงิน", count: topupRequests.length },
  ];

  const activeTxCount = transactions.filter((t) => t.status === "active").length;
  const totalThb = transactions
    .filter((t) => t.status === "active")
    .reduce((s, t) => s + t.total_thb, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl border border-border w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface/60">
          <h2 className="text-lg font-semibold text-foreground">
            รายละเอียดลูกค้า
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <ArrowPathIcon className="w-6 h-6 text-muted animate-spin" />
            <span className="ml-2 text-sm text-muted">กำลังโหลด...</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <ExclamationTriangleIcon className="w-6 h-6 text-danger" />
            <span className="ml-2 text-sm text-danger">{error}</span>
          </div>
        ) : member ? (
          <>
            {/* Profile banner */}
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-brand-subtle/40 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-lg truncate">
                    {member.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <EnvelopeIcon className="w-3.5 h-3.5" />
                      {member.email}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <PhoneIcon className="w-3.5 h-3.5" />
                      {member.phone}
                    </span>
                  </div>
                </div>
                <StatusBadge status={member.status} />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border px-5 gap-1 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`relative px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    tab === t.key
                      ? "text-brand"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span className="ml-1.5 text-[10px] bg-surface border border-border rounded-full px-1.5 py-0.5 tabular-nums">
                      {t.count}
                    </span>
                  )}
                  {tab === t.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {tab === "overview" && (
                <OverviewTab
                  member={member}
                  txCount={activeTxCount}
                  totalThb={totalThb}
                  bookingCount={bookings.length}
                  kycCount={kycSubmissions.length}
                />
              )}
              {tab === "transactions" && (
                <TransactionsTab transactions={transactions} />
              )}
              {tab === "bookings" && <BookingsTab bookings={bookings} />}
              {tab === "kyc" && <KycTab submissions={kycSubmissions} />}
              {tab === "topup" && <TopupTab requests={topupRequests} />}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* ─── Small components ─── */

function StatusBadge({ status }: { status: Member["status"] }) {
  const map = {
    active: {
      label: "ใช้งาน",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    suspended: {
      label: "ระงับ",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    banned: {
      label: "แบน",
      cls: "bg-red-50 text-red-700 border-red-200",
    },
  };
  const m = map[status];
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface rounded-xl p-3.5 flex items-start gap-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? "bg-brand text-white" : "bg-white border border-border text-muted"}`}
      >
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fmtThb(n: number) {
  return `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-12 text-center text-sm text-muted">{text}</div>
  );
}

/* ─── Tabs ─── */

function OverviewTab({
  member,
  txCount,
  totalThb,
  bookingCount,
  kycCount,
}: {
  member: Member;
  txCount: number;
  totalThb: number;
  bookingCount: number;
  kycCount: number;
}) {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard
          icon={BanknotesIcon}
          label="ยอดแลกเปลี่ยนรวม"
          value={fmtThb(totalThb)}
          accent
        />
        <InfoCard
          icon={ArrowPathIcon}
          label="จำนวนธุรกรรม"
          value={txCount}
        />
        <InfoCard
          icon={ClipboardDocumentCheckIcon}
          label="การจอง"
          value={bookingCount}
        />
        <InfoCard icon={IdentificationIcon} label="KYC" value={kycCount} />
      </div>

      {/* Detail grid */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
          ข้อมูลบัญชี
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailRow icon={UserCircleIcon} label="ชื่อ" value={member.name} />
          <DetailRow icon={EnvelopeIcon} label="อีเมล" value={member.email} />
          <DetailRow icon={PhoneIcon} label="โทรศัพท์" value={member.phone} />
          <DetailRow
            icon={CalendarDaysIcon}
            label="วันที่สมัคร"
            value={fmtDate(member.join_date)}
          />
          <DetailRow
            icon={CreditCardIcon}
            label="วอลเล็ต"
            value={fmtThb(member.wallet_balance)}
          />
          <DetailRow
            icon={CheckBadgeIcon}
            label="ยืนยันตัวตน"
            value={member.verified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
          />
          <DetailRow
            icon={IdentificationIcon}
            label="รหัสตัวตน"
            value={member.identity_lookup_key ?? "—"}
          />
          <DetailRow
            label="สถานะ"
            icon={UserCircleIcon}
            value={
              member.status === "active"
                ? "ใช้งาน"
                : member.status === "suspended"
                  ? "ระงับ"
                  : "แบน"
            }
          />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
          ข้อมูลระบบ
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailRow
            icon={CalendarDaysIcon}
            label="สร้างเมื่อ"
            value={fmtDateTime(member.created_at)}
          />
          <DetailRow
            icon={IdentificationIcon}
            label="Member ID"
            value={member.id}
            mono
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 bg-surface/60 rounded-lg px-3 py-2.5">
      <Icon className="w-4 h-4 text-muted flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted">{label}</p>
        <p
          className={`text-sm text-foreground truncate ${mono ? "font-mono text-xs" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function TransactionsTab({
  transactions,
}: {
  transactions: PosTransaction[];
}) {
  if (transactions.length === 0) {
    return <EmptyState text="ไม่มีประวัติธุรกรรม" />;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted mb-3">
        ทั้งหมด {transactions.length} รายการ
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 px-2 text-xs text-muted font-medium">
                วันเวลา
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium">
                สกุลเงิน
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium text-right">
                จำนวน
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium text-right">
                อัตรา
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium text-right">
                THB
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium">
                สถานะ
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium">
                หมายเหตุ
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-border/50 last:border-0 hover:bg-surface/40"
              >
                <td className="py-2 px-2 text-xs text-muted whitespace-nowrap">
                  {fmtDateTime(tx.created_at)}
                </td>
                <td className="py-2 px-2 font-medium">{tx.currency_code}</td>
                <td className="py-2 px-2 text-right tabular-nums">
                  {tx.amount.toLocaleString("th-TH")}
                </td>
                <td className="py-2 px-2 text-right tabular-nums text-muted">
                  {tx.rate.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </td>
                <td className="py-2 px-2 text-right tabular-nums font-medium">
                  {fmtThb(tx.total_thb)}
                </td>
                <td className="py-2 px-2">
                  <TxStatusBadge status={tx.status} />
                </td>
                <td className="py-2 px-2 text-xs text-muted max-w-[120px] truncate">
                  {tx.note || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TxStatusBadge({ status }: { status: PosTransaction["status"] }) {
  if (status === "voided") {
    return (
      <span className="inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
        ยกเลิก
      </span>
    );
  }
  return (
    <span className="inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      สำเร็จ
    </span>
  );
}

function BookingsTab({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return <EmptyState text="ไม่มีประวัติการจอง" />;
  }

  const statusMap: Record<string, { label: string; cls: string }> = {
    pending_payment: {
      label: "รอชำระ",
      cls: "bg-gray-100 text-gray-600 border-gray-200",
    },
    pending_review: {
      label: "รอตรวจ",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    approved: {
      label: "อนุมัติ",
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
    completed: {
      label: "สำเร็จ",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted mb-3">
        ทั้งหมด {bookings.length} รายการ
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 px-2 text-xs text-muted font-medium">
                วันที่
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium">
                สกุลเงิน
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium text-right">
                จำนวน
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium text-right">
                THB
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium">
                ช่องทาง
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium">
                สถานะ
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const st = statusMap[b.status] ?? {
                label: b.status,
                cls: "bg-gray-100 text-gray-600 border-gray-200",
              };
              return (
                <tr
                  key={b.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface/40"
                >
                  <td className="py-2 px-2 text-xs text-muted whitespace-nowrap">
                    {fmtDateTime(b.created_at)}
                  </td>
                  <td className="py-2 px-2">
                    <span className="inline-flex items-center gap-1">
                      <span>{b.currency_flag}</span>
                      <span className="font-medium">{b.currency_code}</span>
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums">
                    {b.amount.toLocaleString("th-TH")}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums font-medium">
                    {fmtThb(b.total_thb)}
                  </td>
                  <td className="py-2 px-2 text-xs">
                    {b.pickup_method === "wallet" ? "Wallet" : b.branch_name ?? "สาขา"}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${st.cls}`}
                    >
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KycTab({ submissions }: { submissions: KycSubmission[] }) {
  if (submissions.length === 0) {
    return <EmptyState text="ไม่มีประวัติ KYC" />;
  }

  const statusMap: Record<string, { label: string; cls: string }> = {
    pending: {
      label: "รอตรวจ",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    verified: {
      label: "ยืนยันแล้ว",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    rejected: {
      label: "ปฏิเสธ",
      cls: "bg-red-50 text-red-700 border-red-200",
    },
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted mb-3">
        ทั้งหมด {submissions.length} รายการ
      </p>
      {submissions.map((s) => {
        const st = statusMap[s.status] ?? {
          label: s.status,
          cls: "bg-gray-100 text-gray-600 border-gray-200",
        };
        return (
          <div
            key={s.id}
            className="border border-border rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${st.cls}`}
              >
                {st.label}
              </span>
              <span className="text-xs text-muted">
                {fmtDateTime(s.created_at)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[11px] text-muted">ชื่อเต็ม</p>
                <p className="font-medium">{s.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">เลขเอกสาร</p>
                <p className="font-mono text-xs">{s.id_number || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Session Key</p>
                <p className="font-mono text-xs truncate">{s.session_key}</p>
              </div>
              {s.note && (
                <div>
                  <p className="text-[11px] text-muted">หมายเหตุ</p>
                  <p className="text-xs">{s.note}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopupTab({ requests }: { requests: TopupRequest[] }) {
  if (requests.length === 0) {
    return <EmptyState text="ไม่มีประวัติเติมเงิน" />;
  }

  const statusMap: Record<string, { label: string; cls: string }> = {
    pending: {
      label: "รอดำเนินการ",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    approved: {
      label: "อนุมัติ",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    rejected: {
      label: "ปฏิเสธ",
      cls: "bg-red-50 text-red-700 border-red-200",
    },
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted mb-3">
        ทั้งหมด {requests.length} รายการ
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 px-2 text-xs text-muted font-medium">
                วันที่โอน
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium text-right">
                จำนวนเงิน
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium">
                สถานะ
              </th>
              <th className="py-2 px-2 text-xs text-muted font-medium">
                หมายเหตุ
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const st = statusMap[r.status] ?? {
                label: r.status,
                cls: "bg-gray-100 text-gray-600 border-gray-200",
              };
              return (
                <tr
                  key={r.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface/40"
                >
                  <td className="py-2 px-2 text-xs text-muted whitespace-nowrap">
                    {fmtDate(r.transfer_date)}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums font-medium">
                    {fmtThb(r.amount)}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${st.cls}`}
                    >
                      {st.label}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-xs text-muted max-w-[150px] truncate">
                    {r.note || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
