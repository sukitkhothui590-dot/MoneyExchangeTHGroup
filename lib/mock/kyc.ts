"use client";

const KEY = "mxth_mock_kyc";

export type KycStatus = "pending" | "verified" | "rejected";

export type KycRecord = {
  sessionId: string;
  memberId: string;
  fullName: string;
  idNumber: string;
  status: KycStatus;
  updatedAt: string;
};

function read(): Record<string, KycRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, KycRecord>;
  } catch {
    return {};
  }
}

function write(data: Record<string, KycRecord>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function getKycSession(sessionId: string): KycRecord | null {
  return read()[sessionId] ?? null;
}

export function upsertKyc(rec: KycRecord) {
  const all = read();
  all[rec.sessionId] = rec;
  write(all);
}

export function setKycStatus(sessionId: string, status: KycStatus) {
  const cur = getKycSession(sessionId);
  if (!cur) return;
  upsertKyc({ ...cur, status, updatedAt: new Date().toISOString() });
}
