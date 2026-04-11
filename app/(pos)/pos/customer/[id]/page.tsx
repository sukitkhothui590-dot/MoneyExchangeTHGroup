"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { usePosMockAuth } from "@/lib/context/PosMockAuth";
import { getMembers, getVisitCount, newMockId } from "@/lib/mock/store";

export default function PosCustomerPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const { staffLabel } = usePosMockAuth();

  useEffect(() => {
    if (!staffLabel) router.replace("/pos/login");
  }, [staffLabel, router]);

  const member = useMemo(() => getMembers().find((m) => m.id === id), [id]);
  const visits = useMemo(() => getVisitCount(id), [id]);

  const startKyc = () => {
    const sid = newMockId();
    router.push(`/pos/kyc/${sid}?memberId=${encodeURIComponent(id)}`);
  };

  if (!staffLabel) return null;

  if (!member) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">ไม่พบลูกค้า</p>
        <Link href="/pos/exchange" className="text-brand text-sm">
          กลับ
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      <h1 className="text-xl font-semibold truncate">{member.name}</h1>
      <dl className="bg-white border border-border rounded-xl p-4 text-sm space-y-2">
        <div>
          <dt className="text-xs text-muted">อีเมล</dt>
          <dd className="break-all">{member.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">โทรศัพท์</dt>
          <dd className="tabular-nums">{member.phone}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">สถานะบัญชี</dt>
          <dd>{member.status}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">ยืนยันตัวตน (ระบบ)</dt>
          <dd>{member.verified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Wallet (จำลอง)</dt>
          <dd className="tabular-nums">
            ฿{member.wallet_balance.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">เข้าใช้บริการ (นับจาก POS จำลอง)</dt>
          <dd className="tabular-nums">{visits} ครั้ง</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={startKyc}
        className="w-full h-11 rounded-lg border border-border text-sm font-medium hover:border-brand"
      >
        เริ่มขั้นตอน KYC (จำลอง)
      </button>
      <Link href="/pos/exchange" className="block text-center text-sm text-brand">
        ← กลับแลกเงิน
      </Link>
    </div>
  );
}
