"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePosMockAuth } from "@/lib/context/PosMockAuth";
import { getRatesSync } from "@/lib/mock/rates";
import {
  addTransaction,
  getMembers,
  incrementVisit,
  newMockId,
  type MockTxn,
} from "@/lib/mock/store";
import type { Member } from "@/lib/types/database";

export default function PosExchangePage() {
  const { staffLabel, branchId } = usePosMockAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("100");
  const [doneMsg, setDoneMsg] = useState("");

  useEffect(() => {
    if (!staffLabel) router.replace("/pos/login");
  }, [staffLabel, router]);

  const rates = useMemo(() => getRatesSync().rates, []);
  const rateRow = useMemo(
    () => rates.find((r) => r.code === currency),
    [rates, currency],
  );
  const buyRate = rateRow?.buy ?? 0;
  const amountNum = Number(amount.replace(/,/g, "")) || 0;
  const totalThb = Math.round(amountNum * buyRate * 100) / 100;

  const lookup = () => {
    const q = phone.replace(/\s/g, "");
    const m = getMembers().find(
      (x) => x.phone.includes(q) || x.id === q || x.email.includes(q),
    );
    setMember(m ?? null);
  };

  const confirm = () => {
    if (!staffLabel || !branchId || !member || !rateRow) return;
    const t: MockTxn = {
      id: newMockId(),
      created_at: new Date().toISOString(),
      member_id: member.id,
      member_name: member.name,
      currency_code: currency,
      amount: amountNum,
      rate: buyRate,
      total_thb: totalThb,
      staff_label: staffLabel,
      branch_id: branchId,
    };
    addTransaction(t);
    incrementVisit(member.id);
    setDoneMsg(`บันทึก ${t.id.slice(0, 8)}… แล้ว`);
  };

  if (!staffLabel) return null;

  return (
    <div className="space-y-6 min-w-0">
      <h1 className="text-xl font-semibold">แลกเงิน</h1>

      <section className="bg-white border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold">ค้นหาลูกค้า</h2>
        <div className="flex flex-col sm:flex-row gap-2 min-w-0">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="เบอร์โทร / รหัส / อีเมล"
            className="flex-1 min-w-0 h-11 px-3 rounded-lg border border-border text-sm"
          />
          <button
            type="button"
            onClick={lookup}
            className="h-11 px-4 rounded-lg bg-brand text-white text-sm font-medium"
          >
            ค้นหา
          </button>
        </div>
        {member ? (
          <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm space-y-1">
            <p className="font-medium">{member.name}</p>
            <p className="text-xs text-muted break-all">{member.email}</p>
            <Link
              href={`/pos/customer/${member.id}`}
              className="text-xs text-brand hover:underline"
            >
              ดูโปรไฟล์ / KYC
            </Link>
          </div>
        ) : phone ? (
          <p className="text-xs text-muted">ไม่พบลูกค้า (ลองเบอร์ 0812345678)</p>
        ) : null}
      </section>

      <section className="bg-white border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold">รายการแลก</h2>
        <div>
          <label className="block text-xs text-muted mb-1">สกุลเงิน</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-border text-sm"
          >
            {rates.map((r) => (
              <option key={r.code} value={r.code}>
                {r.flag} {r.code}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">จำนวน ({currency})</label>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-border text-sm tabular-nums"
          />
          <p className="text-xs text-muted mt-1">
            เรทรับ (ซื้อ) {buyRate.toLocaleString()} · รวม THB{" "}
            <span className="font-semibold text-foreground tabular-nums">
              ฿{totalThb.toLocaleString()}
            </span>
          </p>
        </div>
        <button
          type="button"
          disabled={!member}
          onClick={confirm}
          className="w-full h-12 rounded-lg bg-brand text-white text-sm font-medium disabled:opacity-40"
        >
          ยืนยันธุรกรรม
        </button>
        {doneMsg ? (
          <p className="text-sm text-success break-words">{doneMsg}</p>
        ) : null}
      </section>
    </div>
  );
}
