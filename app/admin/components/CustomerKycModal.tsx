"use client";

import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type {
  IdDocType,
  KycStatus,
  MemberKycProfile,
  MockMember,
  PepStatus,
  RiskTier,
} from "@/lib/mock/memberKyc";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";

type Props = {
  member: MockMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (kyc: MemberKycProfile) => void;
};

export default function CustomerKycModal({
  member,
  isOpen,
  onClose,
  onSave,
}: Props) {
  const { t } = useAdminLanguage();
  const km = t.screens.kycMock;
  const [form, setForm] = useState<MemberKycProfile | null>(null);

  useEffect(() => {
    if (member) {
      setForm({ ...member.kyc });
    } else {
      setForm(null);
    }
  }, [member]);

  if (!isOpen || !member || !form) return null;

  const set = (patch: Partial<MemberKycProfile>) =>
    setForm((f) => (f ? { ...f, ...patch } : f));

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border bg-surface/80">
          <div>
            <h2 className="font-semibold text-foreground">{km.modalTitle}</h2>
            <p className="text-xs text-amber-700 mt-1">{km.banner}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-5 text-sm">
          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              {km.sectionIdentity}
            </h3>
            <div className="grid gap-2">
              <label className="block">
                <span className="text-xs text-muted">{km.legalName}</span>
                <input
                  value={form.legal_name}
                  onChange={(e) => set({ legal_name: e.target.value })}
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted">{km.dob}</span>
                <input
                  type="date"
                  value={
                    form.date_of_birth ? form.date_of_birth.slice(0, 10) : ""
                  }
                  onChange={(e) => set({ date_of_birth: e.target.value })}
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs text-muted">{km.nationality}</span>
                  <input
                    value={form.nationality}
                    onChange={(e) => set({ nationality: e.target.value })}
                    className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-muted">{km.residence}</span>
                  <input
                    value={form.residence_country}
                    onChange={(e) =>
                      set({ residence_country: e.target.value })
                    }
                    className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs text-muted">{km.idDocType}</span>
                <select
                  value={form.id_doc_type}
                  onChange={(e) =>
                    set({ id_doc_type: e.target.value as IdDocType })
                  }
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                >
                  <option value="national_id">{km.optNationalId}</option>
                  <option value="passport">{km.optPassport}</option>
                  <option value="other">{km.optOther}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted">{km.idNumber}</span>
                <input
                  value={form.id_doc_number}
                  onChange={(e) => set({ id_doc_number: e.target.value })}
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm font-mono"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted">{km.idExpires}</span>
                <input
                  type="date"
                  value={
                    form.id_doc_expires_at
                      ? form.id_doc_expires_at.slice(0, 10)
                      : ""
                  }
                  onChange={(e) => set({ id_doc_expires_at: e.target.value })}
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted">{km.kycStatus}</span>
                <select
                  value={form.kyc_status}
                  onChange={(e) =>
                    set({ kyc_status: e.target.value as KycStatus })
                  }
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                >
                  <option value="draft">{km.st_draft}</option>
                  <option value="pending_review">{km.st_pending}</option>
                  <option value="approved">{km.st_approved}</option>
                  <option value="rejected">{km.st_rejected}</option>
                  <option value="expired">{km.st_expired}</option>
                </select>
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              {km.sectionAddress}
            </h3>
            <textarea
              value={form.address_line}
              onChange={(e) => set({ address_line: e.target.value })}
              rows={2}
              className="w-full px-2 py-1.5 rounded-lg border border-border text-sm"
            />
          </section>

          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              {km.sectionRisk}
            </h3>
            <div className="grid gap-2">
              <label className="block">
                <span className="text-xs text-muted">{km.pep}</span>
                <select
                  value={form.pep_status}
                  onChange={(e) =>
                    set({ pep_status: e.target.value as PepStatus })
                  }
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                >
                  <option value="unknown">{km.pep_unknown}</option>
                  <option value="yes">{km.pep_yes}</option>
                  <option value="no">{km.pep_no}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted">{km.sanctionsChecked}</span>
                <input
                  type="datetime-local"
                  value={
                    form.sanctions_checked_at
                      ? form.sanctions_checked_at.slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    set({
                      sanctions_checked_at: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.sanctions_clear === true}
                  onChange={(e) =>
                    set({
                      sanctions_clear: e.target.checked ? true : null,
                    })
                  }
                />
                <span className="text-xs">{km.sanctionsClear}</span>
              </label>
              <label className="block">
                <span className="text-xs text-muted">{km.riskTier}</span>
                <select
                  value={form.risk_tier}
                  onChange={(e) =>
                    set({ risk_tier: e.target.value as RiskTier })
                  }
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                >
                  <option value="low">{km.riskLow}</option>
                  <option value="medium">{km.riskMed}</option>
                  <option value="high">{km.riskHigh}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted">{km.riskNote}</span>
                <textarea
                  value={form.risk_note}
                  onChange={(e) => set({ risk_note: e.target.value })}
                  rows={2}
                  className="mt-0.5 w-full px-2 py-1.5 rounded-lg border border-border text-sm"
                />
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              {km.sectionFunds}
            </h3>
            <div className="grid gap-2">
              <label className="block">
                <span className="text-xs text-muted">{km.servicePurpose}</span>
                <input
                  value={form.service_purpose}
                  onChange={(e) => set({ service_purpose: e.target.value })}
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted">{km.sof}</span>
                <input
                  value={form.source_of_funds_note}
                  onChange={(e) =>
                    set({ source_of_funds_note: e.target.value })
                  }
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted">{km.kycTier}</span>
                <select
                  value={form.kyc_tier}
                  onChange={(e) =>
                    set({
                      kyc_tier: Number(e.target.value) as 0 | 1 | 2 | 3,
                    })
                  }
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted">{km.termsConsent}</span>
                <input
                  type="datetime-local"
                  value={
                    form.terms_consent_at
                      ? form.terms_consent_at.slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    set({
                      terms_consent_at: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                  className="mt-0.5 w-full h-9 px-2 rounded-lg border border-border text-sm"
                />
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              {km.sectionDocs}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border px-2 py-1">
                {km.docFront}: {docLabel(form.doc_front_placeholder, km)}
              </span>
              <span className="rounded-full border border-border px-2 py-1">
                {km.docBack}: {docLabel(form.doc_back_placeholder, km)}
              </span>
            </div>
            <p className="text-[11px] text-muted mt-2">
              {km.banner}
            </p>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              {km.sectionInternal}
            </h3>
            <textarea
              value={form.internal_note}
              onChange={(e) => set({ internal_note: e.target.value })}
              rows={2}
              className="w-full px-2 py-1.5 rounded-lg border border-border text-sm"
            />
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted">
              <span>
                {km.lastReview}:{" "}
                {form.last_reviewed_at
                  ? new Date(form.last_reviewed_at).toLocaleString()
                  : "—"}
              </span>
              <span>
                {km.reviewedBy}: {form.last_reviewed_by || "—"}
              </span>
            </div>
          </section>
        </div>

        <div className="flex gap-2 justify-end px-4 py-3 border-t border-border bg-surface/50">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border text-sm"
          >
            {t.screens.shared.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-4 rounded-lg bg-brand text-white text-sm font-medium"
          >
            {t.screens.shared.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function docLabel(
  s: MemberKycProfile["doc_front_placeholder"],
  km: Record<string, string>,
): string {
  if (s === "uploaded") return km.doc_uploaded;
  if (s === "pending") return km.doc_pending;
  return km.doc_none;
}
