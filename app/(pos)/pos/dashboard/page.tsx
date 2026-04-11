"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePosMockAuth } from "@/lib/context/PosMockAuth";
import { MOCK_BRANCHES } from "@/lib/mock/branches";

export default function PosDashboardPage() {
  const { staffLabel, branchId, logout } = usePosMockAuth();
  const router = useRouter();

  useEffect(() => {
    if (!staffLabel) router.replace("/pos/login");
  }, [staffLabel, router]);

  const branchName =
    MOCK_BRANCHES.find((b) => b.id === branchId)?.name_th ?? "—";

  if (!staffLabel) return null;

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">แดชบอร์ด POS</h1>
          <p className="text-sm text-muted mt-1 break-words">
            {staffLabel} · {branchName}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/pos/login");
          }}
          className="text-xs text-muted hover:text-brand flex-shrink-0"
        >
          ออกจากระบบ
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/pos/exchange"
          className="block rounded-xl border border-border bg-white p-4 hover:border-brand"
        >
          <p className="font-medium">แลกเงิน</p>
          <p className="text-xs text-muted mt-1">บันทึกธุรกรรมหน้าเคาน์เตอร์</p>
        </Link>
        <Link
          href="/pos/queue"
          className="block rounded-xl border border-border bg-white p-4 hover:border-brand"
        >
          <p className="font-medium">คิว / จอง</p>
          <p className="text-xs text-muted mt-1">ดูสถานะคำขอจากลูกค้า</p>
        </Link>
        <Link
          href="/pos/history"
          className="block rounded-xl border border-border bg-white p-4 hover:border-brand"
        >
          <p className="font-medium">ประวัติธุรกรรม</p>
          <p className="text-xs text-muted mt-1">กรองตามสาขา/พนักงาน</p>
        </Link>
      </div>
    </div>
  );
}
