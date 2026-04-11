"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePosMockAuth } from "@/lib/context/PosMockAuth";
import { getTransactions } from "@/lib/mock/store";

export default function PosHistoryPage() {
  const { staffLabel, branchId } = usePosMockAuth();
  const router = useRouter();
  useEffect(() => {
    if (!staffLabel) router.replace("/pos/login");
  }, [staffLabel, router]);

  const rows = useMemo(
    () =>
      getTransactions().filter(
        (t) => t.branch_id === branchId || t.staff_label === staffLabel,
      ),
    [branchId, staffLabel],
  );

  if (!staffLabel) return null;

  return (
    <div className="space-y-4 min-w-0">
      <h1 className="text-xl font-semibold">ประวัติธุรกรรม</h1>
      <p className="text-xs text-muted">
        แสดงรายการที่ตรงกับสาขาปัจจุบันหรือชื่อพนักงาน
      </p>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs text-muted">
              <th className="px-3 py-2">เวลา</th>
              <th className="px-3 py-2">ลูกค้า</th>
              <th className="px-3 py-2">CCY</th>
              <th className="px-3 py-2 text-right">จำนวน</th>
              <th className="px-3 py-2 text-right">THB</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  {new Date(t.created_at).toLocaleString("th-TH")}
                </td>
                <td className="px-3 py-2 min-w-0 max-w-[180px]">
                  <span className="truncate block">{t.member_name}</span>
                </td>
                <td className="px-3 py-2">{t.currency_code}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {t.amount.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-medium">
                  ฿{t.total_thb.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="text-sm text-muted text-center py-8">ยังไม่มีรายการ</p>
      )}
    </div>
  );
}
