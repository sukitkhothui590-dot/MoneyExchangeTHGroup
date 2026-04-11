import type { Member } from "@/lib/types/database";

/** Mock-only KYC profile (not in Supabase schema yet) */
export type IdDocType = "national_id" | "passport" | "other";

export type KycStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "expired";

export type PepStatus = "unknown" | "yes" | "no";

export type RiskTier = "low" | "medium" | "high";

export type DocPlaceholderStatus = "none" | "pending" | "uploaded";

export type MemberKycProfile = {
  legal_name: string;
  date_of_birth: string;
  nationality: string;
  residence_country: string;
  id_doc_type: IdDocType;
  /** Mock-only — ไม่ใช่ข้อมูลจริง */
  id_doc_number: string;
  id_doc_expires_at: string;
  kyc_status: KycStatus;
  address_line: string;
  pep_status: PepStatus;
  sanctions_checked_at: string | null;
  sanctions_clear: boolean | null;
  risk_tier: RiskTier;
  risk_note: string;
  service_purpose: string;
  source_of_funds_note: string;
  /** 0 = ยังไม่ยืนยัน, 1–3 = ระดับจำลอง */
  kyc_tier: 0 | 1 | 2 | 3;
  terms_consent_at: string | null;
  internal_note: string;
  doc_front_placeholder: DocPlaceholderStatus;
  doc_back_placeholder: DocPlaceholderStatus;
  last_reviewed_at: string | null;
  last_reviewed_by: string;
};

export type MockMember = Member & { kyc: MemberKycProfile };

export function createDefaultKyc(displayName: string): MemberKycProfile {
  return {
    legal_name: displayName,
    date_of_birth: "",
    nationality: "TH",
    residence_country: "TH",
    id_doc_type: "national_id",
    id_doc_number: "",
    id_doc_expires_at: "",
    kyc_status: "draft",
    address_line: "",
    pep_status: "unknown",
    sanctions_checked_at: null,
    sanctions_clear: null,
    risk_tier: "low",
    risk_note: "",
    service_purpose: "",
    source_of_funds_note: "",
    kyc_tier: 0,
    terms_consent_at: null,
    internal_note: "",
    doc_front_placeholder: "none",
    doc_back_placeholder: "none",
    last_reviewed_at: null,
    last_reviewed_by: "",
  };
}

function mergeKyc(
  name: string,
  partial?: Partial<MemberKycProfile>,
): MemberKycProfile {
  return { ...createDefaultKyc(name), ...partial };
}

/** Normalize stored row (legacy without `kyc`) to MockMember */
export function normalizeMockMember(
  m: Member & { kyc?: Partial<MemberKycProfile> },
): MockMember {
  return {
    ...m,
    kyc: mergeKyc(m.name, m.kyc),
  };
}
