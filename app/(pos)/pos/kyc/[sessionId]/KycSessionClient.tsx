"use client";

/* eslint-disable react-hooks/set-state-in-effect -- one-time KYC form hydration from localStorage mock */

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteImage from "@/components/site/SiteImage";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePosMockAuth } from "@/lib/context/PosMockAuth";
import {
  getKycSession,
  upsertKyc,
  setKycStatus,
  type KycRecord,
} from "@/lib/mock/kyc";

export default function KycSessionClient() {
  const params = useParams();
  const sessionId = String(params.sessionId ?? "");
  const searchParams = useSearchParams();
  const memberId = searchParams.get("memberId") ?? "";
  const router = useRouter();
  const { staffLabel } = usePosMockAuth();
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [rec, setRec] = useState<KycRecord | null>(null);

  useEffect(() => {
    if (!staffLabel) router.replace("/pos/login");
  }, [staffLabel, router]);

  /* Hydrate from localStorage mock once session/member are known; avoids SSR mismatch. */
  useEffect(() => {
    if (!memberId || !sessionId) return;
    const existing = getKycSession(sessionId);
    if (existing) {
      setRec(existing);
      setFullName(existing.fullName);
      setIdNumber(existing.idNumber);
      return;
    }
    const initial: KycRecord = {
      sessionId,
      memberId,
      fullName: "",
      idNumber: "",
      status: "pending",
      updatedAt: new Date().toISOString(),
    };
    upsertKyc(initial);
    setRec(initial);
  }, [memberId, sessionId]);

  const saveDraft = () => {
    if (!memberId) return;
    const next: KycRecord = {
      sessionId,
      memberId,
      fullName,
      idNumber,
      status: rec?.status ?? "pending",
      updatedAt: new Date().toISOString(),
    };
    upsertKyc(next);
    setRec(next);
  };

  const submitReview = () => {
    saveDraft();
    setKycStatus(sessionId, "pending");
    setRec((r) => (r ? { ...r, status: "pending" } : r));
  };

  const mockApprove = () => {
    setKycStatus(sessionId, "verified");
    setRec((r) => (r ? { ...r, status: "verified" } : r));
  };

  const mockReject = () => {
    setKycStatus(sessionId, "rejected");
    setRec((r) => (r ? { ...r, status: "rejected" } : r));
  };

  if (!staffLabel) return null;

  if (!memberId) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">ไม่พบ memberId ใน URL</p>
        <Link href="/pos/exchange" className="text-brand text-sm">
          กลับ
        </Link>
      </div>
    );
  }

  const statusLabel =
    rec?.status === "verified"
      ? "ยืนยันแล้ว (จำลอง)"
      : rec?.status === "rejected"
        ? "ไม่ผ่าน (จำลอง)"
        : "รอตรวจสอบ";

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h1 className="text-xl font-semibold">KYC (จำลอง)</h1>
        <p className="text-xs text-muted mt-1 break-all">
          Session: {sessionId}
        </p>
        <p className="text-sm mt-2">
          สถานะ: <span className="font-medium">{statusLabel}</span>
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl p-4 space-y-3">
        <div>
          <label className="block text-xs text-muted mb-1">ชื่อ–สกุล</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-border text-sm min-w-0"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">
            เลขบัตรประชาชน (จำลอง)
          </label>
          <input
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-border text-sm tabular-nums"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">
            แนบรูปเอกสาร (แสดงตัวอย่างเท่านั้น)
          </label>
          <input
            type="file"
            accept="image/*"
            className="text-xs w-full min-w-0"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) {
                setDocPreview(null);
                return;
              }
              setDocPreview(URL.createObjectURL(f));
            }}
          />
          {docPreview ? (
            <div className="relative mt-2 h-48 w-full max-w-md">
              <SiteImage
                src={docPreview}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 28rem) 100vw, 28rem"
                className="rounded-lg border border-border object-contain object-left"
                placeholderSize="448×192"
              />
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={submitReview}
          className="w-full h-11 rounded-lg bg-brand text-white text-sm font-medium"
        >
          ส่งตรวจ (จำลอง)
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={mockApprove}
          className="flex-1 h-10 rounded-lg border border-border text-sm hover:border-brand"
        >
          จำลอง: อนุมัติ
        </button>
        <button
          type="button"
          onClick={mockReject}
          className="flex-1 h-10 rounded-lg border border-border text-sm hover:border-border-strong"
        >
          จำลอง: ปฏิเสธ
        </button>
      </div>

      <Link
        href={`/pos/customer/${memberId}`}
        className="block text-center text-sm text-brand"
      >
        ← กลับลูกค้า
      </Link>
    </div>
  );
}
