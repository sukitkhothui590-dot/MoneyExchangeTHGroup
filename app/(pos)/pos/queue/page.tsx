"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePosMockAuth } from "@/lib/context/PosMockAuth";
import { getAdminBookings } from "@/lib/mock/store";
import type { BookingStatus } from "@/lib/types/database";

const statusTh: Record<BookingStatus, string> = {
  pending_payment: "รอชำระเงิน",
  pending_review: "รอตรวจสอบ",
  approved: "อนุมัติแล้ว",
  completed: "สำเร็จ",
};

export default function PosQueuePage() {
  const { staffLabel } = usePosMockAuth();
  const router = useRouter();

  useEffect(() => {
    if (!staffLabel) router.replace("/pos/login");
  }, [staffLabel, router]);

  const rows = getAdminBookings();

  if (!staffLabel) return null;

  return (
    <div className="space-y-4 min-w-0">
      <h1 className="text-xl font-semibold">คิว / การจอง</h1>
      <p className="text-xs text-muted">
        รายการจากพอร์ทัลลูกค้า (mock) — แหล่งเดียวกับแอดมิน
      </p>
      <ul className="space-y-2">
        {rows.map((b) => (
          <li
            key={b.id}
            className="rounded-xl border border-border bg-white p-3 text-sm min-w-0"
          >
            <div className="flex justify-between gap-2">
              <span className="font-mono text-xs break-all">{b.id}</span>
              <span className="text-xs text-muted flex-shrink-0">
                {statusTh[b.status]}
              </span>
            </div>
            <p className="text-xs text-muted mt-1 truncate">
              {b.customer_email} · {b.branch}
            </p>
            <p className="text-xs mt-0.5">
              {b.type === "queue" ? "จองคิว" : "จองเงิน"}
            </p>
          </li>
        ))}
      </ul>
      {rows.length === 0 && (
        <p className="text-sm text-muted text-center py-10 border border-dashed border-border rounded-xl">
          ยังไม่มีคำขอ
        </p>
      )}
    </div>
  );
}
