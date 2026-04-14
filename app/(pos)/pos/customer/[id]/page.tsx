"use client";

import {
  ArrowLeftIcon,
  BanknotesIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  EnvelopeIcon,
  IdentificationIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePosSession } from "@/lib/context/PosSessionContext";
import type { Member } from "@/lib/types/database";
import { newMockId } from "@/lib/mock/store";

type MemberWithVisits = Member & { visit_count?: number };

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0] ?? "";
    const b = parts[parts.length - 1][0] ?? "";
    return (a + b).toUpperCase() || "?";
  }
  const s = name.trim();
  return (s.slice(0, 2) || "?").toUpperCase();
}

function formatThaiDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function accountStatusPill(
  status: Member["status"],
): { label: string; className: string } {
  switch (status) {
    case "active":
      return {
        label: "ใช้งานปกติ",
        className:
          "border-emerald-400/40 bg-emerald-500/25 text-emerald-50",
      };
    case "suspended":
      return {
        label: "ระงับชั่วคราว",
        className: "border-amber-400/40 bg-amber-500/25 text-amber-50",
      };
    case "banned":
      return {
        label: "ระงับถาวร",
        className: "border-red-400/40 bg-red-500/25 text-red-50",
      };
    default:
      return {
        label: status,
        className: "border-white/25 bg-white/10 text-white/90",
      };
  }
}

export default function PosCustomerPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const { userEmail, ready, posAccess } = usePosSession();
  const [member, setMember] = useState<MemberWithVisits | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycLabel, setKycLabel] = useState<string | null>(null);
  const [kycTone, setKycTone] = useState<"ok" | "warn" | "bad" | "muted">(
    "muted",
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!userEmail) router.replace("/pos/login");
  }, [ready, userEmail, router]);

  useEffect(() => {
    if (!ready || !userEmail || !id) return;
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/members/${id}`);
        if (res.ok) {
          const json = await res.json();
          setMember(json.data ?? null);
        } else {
          setMember(null);
        }
        const kRes = await fetch(
          `/api/kyc/submissions?memberId=${encodeURIComponent(id)}`,
        );
        if (kRes.ok) {
          const kJson = await kRes.json();
          const rows = (kJson.data ?? []) as { status: string }[];
          const st = rows[0]?.status;
          if (st === "verified") {
            setKycLabel("ยืนยันแล้ว (KYC)");
            setKycTone("ok");
          } else if (st === "rejected") {
            setKycLabel("ไม่ผ่าน (KYC)");
            setKycTone("bad");
          } else if (st === "pending") {
            setKycLabel("รอตรวจ (KYC)");
            setKycTone("warn");
          } else {
            setKycLabel(null);
            setKycTone("muted");
          }
        } else {
          setKycLabel(null);
          setKycTone("muted");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, userEmail, id]);

  const statusPill = useMemo(
    () => (member ? accountStatusPill(member.status) : null),
    [member],
  );

  const kycPillClass = useMemo(() => {
    switch (kycTone) {
      case "ok":
        return "border-emerald-400/40 bg-emerald-500/20 text-emerald-50";
      case "warn":
        return "border-amber-400/40 bg-amber-500/20 text-amber-50";
      case "bad":
        return "border-red-400/40 bg-red-500/20 text-red-50";
      default:
        return "border-white/20 bg-white/10 text-blue-100/90";
    }
  }, [kycTone]);

  const startKyc = () => {
    const sid = newMockId();
    router.push(`/pos/kyc/${sid}?memberId=${encodeURIComponent(id)}`);
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!ready || !userEmail) return null;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-24 rounded-2xl bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-200" />
        </div>
        <div className="h-48 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 shadow-sm pos-card-saas">
          <p className="text-base font-semibold text-slate-900">
            ไม่พบลูกค้า
          </p>
          <p className="mt-2 text-sm text-slate-500">
            ตรวจสอบลิงก์หรือค้นหาใหม่จากหน้าแลกเงิน / รายชื่อลูกค้า
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/pos/exchange"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-900 px-5 text-sm font-medium text-white hover:bg-blue-950"
            >
              ค้นหาที่แลกเงิน
            </Link>
            {posAccess?.role === "admin" ? (
              <Link
                href="/pos/customer"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                ค้นหาลูกค้า (แอดมิน)
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const visits = member.visit_count ?? 0;
  const joinLabel = formatThaiDate(member.join_date || member.created_at);

  return (
    <div className="min-w-0 space-y-5 pb-4">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 text-white shadow-xl shadow-blue-950/35">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.35),transparent_55%)]" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-bold tracking-tight shadow-inner shadow-black/20 ring-1 ring-white/10 sm:h-24 sm:w-24 sm:text-3xl"
                aria-hidden
              >
                {memberInitials(member.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-200/90">
                  ลูกค้า POS
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {member.name}
                </h1>
                {member.email ? (
                  <p className="mt-2 flex items-center gap-2 text-sm text-blue-100/95">
                    <EnvelopeIcon className="h-4 w-4 shrink-0 opacity-80" />
                    <span className="truncate">{member.email}</span>
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {statusPill ? (
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${statusPill.className}`}
                    >
                      {statusPill.label}
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                      member.verified
                        ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-50"
                        : "border-white/25 bg-white/10 text-blue-100"
                    }`}
                  >
                    <ShieldCheckIcon className="mr-1.5 h-3.5 w-3.5 opacity-90" />
                    {member.verified
                      ? "ยืนยันตัวตนแล้ว"
                      : "ยังไม่ยืนยันตัวตน"}
                  </span>
                  {kycLabel ? (
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${kycPillClass}`}
                    >
                      <IdentificationIcon className="mr-1.5 h-3.5 w-3.5 opacity-90" />
                      {kycLabel}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-blue-100/85">
                      KYC: ไม่มีรายการล่าสุด
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              <button
                type="button"
                onClick={() => void copyId()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/15"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                {copied ? "คัดลอก Member ID แล้ว" : "คัดลอก Member ID"}
              </button>
              <p
                className="max-w-[min(100%,20rem)] break-all text-[11px] text-blue-200/80 font-mono sm:text-right"
                title={member.id}
              >
                {member.id}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="pos-card-saas rounded-2xl border border-emerald-100/90 bg-gradient-to-br from-emerald-50/90 to-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800/80">
            Wallet
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-emerald-950">
            ฿
            {member.wallet_balance.toLocaleString("th-TH", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="pos-card-saas rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-800/85">
            เข้าใช้บริการ (POS)
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-blue-950">
            {visits.toLocaleString("th-TH")}
            <span className="ml-1.5 text-base font-semibold text-blue-800/90">
              ครั้ง
            </span>
          </p>
        </div>
        <div className="pos-card-saas rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            วันที่สมัคร / บันทึก
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{joinLabel}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="pos-card-saas rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            ข้อมูลติดต่อ
          </h2>
          <ul className="mt-4 space-y-4">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <EnvelopeIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  อีเมล
                </p>
                <p className="mt-0.5 break-all text-sm font-medium text-slate-900">
                  {member.email || "—"}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <PhoneIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  โทรศัพท์
                </p>
                <p className="mt-0.5 text-sm font-medium tabular-nums text-slate-900">
                  {member.phone || "—"}
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="pos-card-saas rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">บัญชี &amp; KYC</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3">
              <dt className="text-xs text-slate-500">สถานะบัญชี</dt>
              <dd className="font-medium capitalize text-slate-900">
                {member.status}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3">
              <dt className="text-xs text-slate-500">ยืนยันตัวตน (ระบบ)</dt>
              <dd className="font-medium text-slate-900">
                {member.verified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
              </dd>
            </div>
            {member.identity_lookup_key ? (
              <div>
                <dt className="text-xs text-slate-500">Identity lookup</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                  {member.identity_lookup_key}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>

      {/* Actions */}
      <section className="pos-card-saas rounded-2xl border border-blue-100/80 bg-blue-50/40 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-900/80">
          การทำงาน
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={`/pos/exchange?memberId=${encodeURIComponent(member.id)}`}
            className="inline-flex flex-1 min-w-[10rem] items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-950 sm:flex-none"
          >
            <BanknotesIcon className="h-5 w-5" />
            แลกเงิน (เลือกลูกค้ารายนี้)
          </Link>
          <Link
            href={`/pos/history?memberId=${encodeURIComponent(member.id)}`}
            className="inline-flex flex-1 min-w-[10rem] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 sm:flex-none"
          >
            <ClockIcon className="h-5 w-5 text-slate-600" />
            ประวัติธุรกรรม (สาขานี้)
          </Link>
          <button
            type="button"
            onClick={startKyc}
            className="inline-flex flex-1 min-w-[10rem] items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-950 hover:bg-violet-100 sm:flex-none"
          >
            <IdentificationIcon className="h-5 w-5" />
            เริ่มขั้นตอน KYC (จำลอง)
          </button>
          {posAccess?.role === "admin" ? (
            <Link
              href="/pos/customer"
              className="inline-flex flex-1 min-w-[10rem] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-none"
            >
              <UserGroupIcon className="h-5 w-5 text-slate-500" />
              รายชื่อลูกค้า
            </Link>
          ) : null}
        </div>
      </section>

      <div className="flex justify-center pt-1">
        <Link
          href="/pos/exchange"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-800 hover:text-blue-950"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          กลับหน้าแลกเงิน
        </Link>
      </div>
    </div>
  );
}
