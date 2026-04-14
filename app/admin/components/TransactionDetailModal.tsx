"use client";

import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { MockTxn } from "@/lib/mock/store";
import type {
  IdDocType,
  KycStatus,
  MockMember,
  PepStatus,
  RiskTier,
} from "@/lib/mock/memberKyc";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import type { AdminTranslations } from "@/lib/admin/translations";

export type LiveMemberBasics = {
  email: string;
  phone: string;
  wallet_balance: number;
  verified: boolean;
  kycLatest?: string | null;
};

type Props = {
  txn: (MockTxn & { pos_status?: "active" | "voided" }) | null;
  member: MockMember | undefined;
  /** ข้อมูลจริงจาก API เมื่อไม่ได้ใช้ mock member */
  liveMember?: LiveMemberBasics | null;
  branchName: string;
  isOpen: boolean;
  onClose: () => void;
};

function kycStatusLabel(s: KycStatus, t: AdminTranslations): string {
  const km = t.screens.kycMock;
  const map: Record<KycStatus, string> = {
    draft: km.st_draft,
    pending_review: km.st_pending,
    approved: km.st_approved,
    rejected: km.st_rejected,
    expired: km.st_expired,
  };
  return map[s];
}

function riskLabel(tier: RiskTier, t: AdminTranslations): string {
  const km = t.screens.kycMock;
  if (tier === "low") return km.riskLow;
  if (tier === "medium") return km.riskMed;
  return km.riskHigh;
}

function docTypeLabel(d: IdDocType, t: AdminTranslations): string {
  const km = t.screens.kycMock;
  if (d === "national_id") return km.optNationalId;
  if (d === "passport") return km.optPassport;
  return km.optOther;
}

function pepLabel(p: PepStatus, t: AdminTranslations): string {
  const km = t.screens.kycMock;
  if (p === "yes") return km.pep_yes;
  if (p === "no") return km.pep_no;
  return km.pep_unknown;
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,140px)_1fr] gap-x-4 gap-y-0.5 py-2 border-b border-border/70 last:border-0 text-sm">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="text-foreground min-w-0 break-words">{children}</dd>
    </div>
  );
}

export default function TransactionDetailModal({
  txn,
  member,
  liveMember,
  branchName,
  isOpen,
  onClose,
}: Props) {
  const { t, locale } = useAdminLanguage();
  const s = t.screens.transactions;
  const km = t.screens.kycMock;
  const sh = t.screens.shared;
  const dateLocale = locale === "th" ? "th-TH" : "en-US";
  const numLocale = dateLocale;

  if (!isOpen || !txn) return null;

  const kyc = member?.kyc;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label={locale === "th" ? "ปิด" : "Close dialog"}
        onClick={onClose}
      />
      <div
        className="relative bg-white/95 backdrop-blur-sm rounded-2xl border border-border/80 w-full max-w-lg max-h-[92vh] overflow-hidden shadow-2xl shadow-black/10 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="txn-detail-title"
      >
        <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b border-border/80 bg-gradient-to-r from-white via-surface-50/90 to-brand-subtle/30">
          <div>
            <h2
              id="txn-detail-title"
              className="font-semibold text-foreground text-base tracking-tight"
            >
              {s.detailTitle}
            </h2>
            <p className="text-xs text-amber-800/95 mt-1 leading-relaxed">
              {s.detailBanner}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-white/80 shrink-0 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-6">
          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-brand shrink-0" aria-hidden />
              {s.sectionTxn}
            </h3>
            <div className="rounded-xl border border-border/80 bg-surface/40 px-3 shadow-inner">
              <Row label={s.colId}>
                <span className="font-mono text-xs">{txn.id}</span>
              </Row>
              <Row label={s.colTime}>
                {new Date(txn.created_at).toLocaleString(dateLocale, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Row>
              <Row label={s.colCcy}>{txn.currency_code}</Row>
              <Row label={s.colAmount}>
                <span className="tabular-nums font-medium">
                  {txn.amount.toLocaleString(numLocale)} {txn.currency_code}
                </span>
              </Row>
              <Row label={s.colRate}>
                <span className="tabular-nums">
                  {txn.rate.toLocaleString(numLocale)}
                </span>
              </Row>
              <Row label={s.colThb}>
                <span className="tabular-nums font-semibold text-brand">
                  ฿{txn.total_thb.toLocaleString(numLocale)}
                </span>
              </Row>
              <Row label={s.colBranch}>{branchName}</Row>
              <Row label={s.colStaff}>{txn.staff_label}</Row>
              {txn.pos_status ? (
                <Row label={locale === "th" ? "สถานะรายการ" : "Txn status"}>
                  <span
                    className={
                      txn.pos_status === "voided"
                        ? "font-medium text-red-700"
                        : "font-medium text-emerald-700"
                    }
                  >
                    {txn.pos_status === "voided"
                      ? locale === "th"
                        ? "ยกเลิก"
                        : "Voided"
                      : locale === "th"
                        ? "ใช้งาน"
                        : "Active"}
                  </span>
                </Row>
              ) : null}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-brand shrink-0" aria-hidden />
              {s.sectionMember}
            </h3>
            {member && kyc ? (
              <div className="rounded-xl border border-border/80 bg-white/90 px-3 shadow-sm">
                <Row label={s.colMember}>
                  <span className="font-medium">{txn.member_name}</span>
                  <span className="block font-mono text-[11px] text-muted mt-0.5">
                    {txn.member_id}
                  </span>
                </Row>
                <Row label={s.memberEmail}>{member.email}</Row>
                <Row label={s.memberPhone}>{member.phone}</Row>
                <Row label={s.memberWallet}>
                  <span className="tabular-nums">
                    ฿{member.wallet_balance.toLocaleString(numLocale)}
                  </span>
                </Row>
                <Row label={km.legalName}>{kyc.legal_name}</Row>
                <Row label={km.idDocType}>{docTypeLabel(kyc.id_doc_type, t)}</Row>
                <Row label={km.idNumber}>
                  <span className="font-mono text-xs">{kyc.id_doc_number}</span>
                </Row>
                <Row label={s.colKyc}>
                  <span className="inline-flex items-center gap-2 flex-wrap">
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium tabular-nums">
                      {s.kycTierPrefix} {kyc.kyc_tier}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        kyc.kyc_status === "approved"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : kyc.kyc_status === "pending_review"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : kyc.kyc_status === "rejected"
                              ? "bg-red-50 text-red-800 border-red-200"
                              : "bg-surface text-muted border-border"
                      }`}
                    >
                      {kycStatusLabel(kyc.kyc_status, t)}
                    </span>
                  </span>
                </Row>
                <Row label={km.riskTier}>{riskLabel(kyc.risk_tier, t)}</Row>
                <Row label={km.pep}>{pepLabel(kyc.pep_status, t)}</Row>
                {kyc.risk_note ? (
                  <Row label={km.riskNote}>{kyc.risk_note}</Row>
                ) : null}
                <Row label={km.servicePurpose}>{kyc.service_purpose}</Row>
              </div>
            ) : liveMember ? (
              <div className="rounded-xl border border-border/80 bg-white/90 px-3 shadow-sm">
                <Row label={s.colMember}>
                  <span className="font-medium">{txn.member_name}</span>
                  <span className="block font-mono text-[11px] text-muted mt-0.5">
                    {txn.member_id}
                  </span>
                </Row>
                <Row label={s.memberEmail}>{liveMember.email || "—"}</Row>
                <Row label={s.memberPhone}>{liveMember.phone || "—"}</Row>
                <Row label={s.memberWallet}>
                  <span className="tabular-nums">
                    ฿{liveMember.wallet_balance.toLocaleString(numLocale)}
                  </span>
                </Row>
                <Row label={km.legalName}>
                  {liveMember.verified
                    ? locale === "th"
                      ? "ยืนยันตัวตนแล้ว (ระบบ)"
                      : "Verified (account)"
                    : locale === "th"
                      ? "ยังไม่ยืนยันตัวตน (ระบบ)"
                      : "Not verified (account)"}
                </Row>
                {liveMember.kycLatest ? (
                  <Row label={s.colKyc}>
                    <span className="text-sm font-medium text-foreground">
                      {liveMember.kycLatest}
                    </span>
                  </Row>
                ) : null}
                <p className="text-[11px] text-muted py-2 border-t border-border/60">
                  {locale === "th"
                    ? "รายละเอียด KYC แบบเต็มมีในโหมดจำลองหรือระบบ KYC"
                    : "Full KYC narrative is available in mock mode or the KYC system."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted rounded-xl border border-dashed border-border/80 px-3 py-4 bg-surface/30">
                {s.memberMissing}
              </p>
            )}
          </section>

          {member ? (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Link
                href={`/admin/dashboard/customers?q=${encodeURIComponent(member.id)}`}
                className="inline-flex justify-center items-center h-10 px-4 rounded-xl bg-brand text-white text-sm font-medium shadow-md shadow-brand/20 hover:opacity-95 transition-opacity"
              >
                {s.linkCustomerProfile}
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center items-center h-10 px-4 rounded-xl border border-border/80 text-sm hover:bg-surface transition-colors"
              >
                {sh.cancel}
              </button>
            </div>
          ) : liveMember ? (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Link
                href={`/admin/dashboard/customers?q=${encodeURIComponent(txn.member_id)}`}
                className="inline-flex justify-center items-center h-10 px-4 rounded-xl bg-brand text-white text-sm font-medium shadow-md shadow-brand/20 hover:opacity-95 transition-opacity"
              >
                {s.linkCustomerProfile}
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center items-center h-10 px-4 rounded-xl border border-border/80 text-sm hover:bg-surface transition-colors"
              >
                {sh.cancel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full h-10 rounded-xl border border-border/80 text-sm hover:bg-surface transition-colors"
            >
              {sh.cancel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
