"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_BRANCHES } from "@/lib/mock/branches";
import { usePosMockAuth } from "@/lib/context/PosMockAuth";

export default function PosLoginPage() {
  const { staffLabel, setSession } = usePosMockAuth();
  const router = useRouter();
  const [staff, setStaff] = useState("แคชเชียร์ A");
  const [branch, setBranch] = useState<string>(MOCK_BRANCHES[0].id);

  useEffect(() => {
    if (staffLabel) router.replace("/pos/dashboard");
  }, [staffLabel, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSession(staff.trim() || "Staff", branch);
    router.push("/pos/dashboard");
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h1 className="text-xl font-semibold">เข้าสู่ระบบ POS</h1>
        <p className="text-sm text-muted mt-1">โหมดจำลอง — ไม่เชื่อมฐานข้อมูลจริง</p>
      </div>
      <form
        onSubmit={submit}
        className="space-y-4 bg-white border border-border rounded-xl p-4"
      >
        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            ชื่อพนักงาน (แสดงในธุรกรรม)
          </label>
          <input
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-border text-sm min-w-0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            สาขา
          </label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-border text-sm"
          >
            {MOCK_BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name_th}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full h-11 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-dark"
        >
          เข้าสู่ระบบ
        </button>
      </form>
      <p className="text-xs text-muted text-center">
        <Link href="/" className="text-brand hover:underline">
          กลับหน้าหลัก
        </Link>
      </p>
    </div>
  );
}
