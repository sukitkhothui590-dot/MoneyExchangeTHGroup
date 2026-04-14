"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteImage from "@/components/site/SiteImage";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePosSession } from "@/lib/context/PosSessionContext";
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
  const { userEmail } = usePosSession();
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [rec, setRec] = useState<KycRecord | null>(null);
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userEmail) router.replace("/pos/login");
  }, [userEmail, router]);

  useEffect(() => {
    if (!memberId || !sessionId) return;
    void (async () => {
      try {
        const res = await fetch(
          `/api/kyc/submissions?sessionKey=${encodeURIComponent(sessionId)}`,
        );
        if (res.ok) {
          const json = await res.json();
          const row = json.data;
          if (row) {
            setApiOk(true);
            setFullName(row.full_name ?? "");
            setIdNumber(row.id_number ?? "");
            setRec({
              sessionId,
              memberId,
              fullName: row.full_name ?? "",
              idNumber: row.id_number ?? "",
              status: row.status,
              updatedAt: row.updated_at ?? new Date().toISOString(),
            });
            return;
          }
        }
      } catch {
        /* fallback mock */
      }
      setApiOk(false);
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
    })();
  }, [memberId, sessionId]);

  const persistRemote = async (payload: {
    full_name: string;
    id_number: string;
    status: "pending" | "verified" | "rejected";
  }) => {
    try {
      await fetch("/api/kyc/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_key: sessionId,
          member_id: memberId,
          full_name: payload.full_name,
          id_number: payload.id_number,
          status: payload.status,
          note: "",
        }),
      });
    } catch {
      /* ignore */
    }
  };

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
    void persistRemote({
      full_name: fullName,
      id_number: idNumber,
      status: next.status,
    });
  };

  const submitReview = () => {
    saveDraft();
    setKycStatus(sessionId, "pending");
    setRec((r) => (r ? { ...r, status: "pending" } : r));
    void persistRemote({ full_name: fullName, id_number: idNumber, status: "pending" });
  };

  const mockApprove = () => {
    setKycStatus(sessionId, "verified");
    setRec((r) => (r ? { ...r, status: "verified" } : r));
    void persistRemote({ full_name: fullName, id_number: idNumber, status: "verified" });
  };

  const mockReject = () => {
    setKycStatus(sessionId, "rejected");
    setRec((r) => (r ? { ...r, status: "rejected" } : r));
    void persistRemote({ full_name: fullName, id_number: idNumber, status: "rejected" });
  };

  if (!userEmail) return null;

  if (!memberId) {
    return (
      <div className="space-y-3 pos-card-saas rounded-2xl p-4">
        <p className="text-sm text-slate-600">ไม่พบ memberId ใน URL</p>
        <Link href="/pos/exchange" className="text-[var(--site-accent)] text-sm font-medium">
          กลับ
        </Link>
      </div>
    );
  }

  const statusLabel =
    rec?.status === "verified"
      ? "ยืนยันแล้ว"
      : rec?.status === "rejected"
        ? "ไม่ผ่าน"
        : "รอตรวจสอบ";

  return (
    <div className="space-y-6 min-w-0">
      <div className="pos-card-saas rounded-2xl p-4 text-sm space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Session
        </p>
        <p className="text-xs text-slate-500 break-all font-mono">{sessionId}</p>
        <p className="text-xs text-slate-500">
          {apiOk ? "บันทึกแบบถาวร (ฐานข้อมูล)" : "จำลองในเบราว์เซอร์ (API ไม่พร้อม)"}
        </p>
        <p className="text-sm text-slate-800 pt-1">
          สถานะ: <span className="font-semibold">{statusLabel}</span>
        </p>
      </div>

      <div className="pos-card-saas rounded-2xl p-4 sm:p-5 space-y-3">
        <div>
          <label className="block text-xs text-slate-600 font-medium mb-1.5">ชื่อ–สกุล</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm min-w-0 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--site-accent)_25%,transparent)]"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 font-medium mb-1.5">
            เลขบัตรประชาชน (จำลอง)
          </label>
          <input
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--site-accent)_25%,transparent)]"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 font-medium mb-1.5">
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
                className="rounded-xl border border-slate-200 object-contain object-left"
                placeholderSize="448×192"
              />
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={submitReview}
          className="w-full h-11 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          ส่งตรวจ
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={mockApprove}
          className="flex-1 h-10 rounded-xl pos-card-saas text-sm text-slate-800 hover:shadow-sm"
        >
          จำลอง: อนุมัติ
        </button>
        <button
          type="button"
          onClick={mockReject}
          className="flex-1 h-10 rounded-xl pos-card-saas text-sm text-slate-800 hover:shadow-sm"
        >
          จำลอง: ปฏิเสธ
        </button>
      </div>

      <Link href={`/pos/customer/${memberId}`} className="block text-center text-sm text-[var(--site-accent)]">
        ← กลับลูกค้า
      </Link>
    </div>
  );
}
