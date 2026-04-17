"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePosSession } from "@/lib/context/PosSessionContext";
import type { Member } from "@/lib/types/database";

export default function PosCustomerDirectoryPage() {
  const router = useRouter();
  const { userEmail, ready, posAccess } = usePosSession();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [rows, setRows] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = posAccess?.role === "admin";

  useEffect(() => {
    if (!ready) return;
    if (!userEmail) router.replace("/pos/login");
  }, [ready, userEmail, router]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(q.trim()), 320);
    return () => window.clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (debounced) params.set("q", debounced);
      const res = await fetch(`/api/pos/members?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "โหลดไม่สำเร็จ");
        setRows([]);
        return;
      }
      setRows(json.data ?? []);
    } catch {
      setError("เกิดข้อผิดพลาด");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [debounced, isAdmin]);

  useEffect(() => {
    if (!ready || !userEmail || !isAdmin) return;
    void load();
  }, [ready, userEmail, isAdmin, load]);

  if (!ready || !userEmail) return null;

  if (!posAccess) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-28 rounded-2xl pos-card-saas" />
        <div className="h-12 rounded-xl pos-card-saas" />
        <div className="h-48 rounded-2xl pos-card-saas" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-4 min-w-0">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-center">
          <p className="text-sm font-medium text-amber-950">
            หน้านี้ใช้ได้เฉพาะผู้ดูแลระบบ
          </p>
          <p className="mt-2 text-xs text-amber-900/80">
            พนักงานค้นหาลูกค้าได้จากหน้าแลกเงินหรือประวัติธุรกรรม
          </p>
          <Link
            href="/pos/exchange"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-blue-900 px-5 text-sm font-medium text-white hover:bg-blue-950"
          >
            ไปหน้าแลกเงิน
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <section className="relative overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 px-5 py-5 sm:px-6 text-white shadow-lg shadow-blue-950/30">
        <div className="pointer-events-none absolute -right-20 -top-16 h-48 w-48 rounded-full bg-blue-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/90">
              POS · ผู้ดูแลระบบ
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              ค้นหาลูกค้า
            </h1>
            <p className="mt-2 max-w-xl text-sm text-blue-100/90">
              ค้นด้วยชื่อ อีเมล เบอร์ รหัส UUID หรือ identity key — จากนั้นเปิดรายละเอียดสมาชิก
            </p>
          </div>
        </div>
      </section>

      <div className="pos-card-saas rounded-xl border border-blue-100/70 p-3 sm:p-4">
        <label className="mb-2 block text-[10px] font-semibold uppercase text-slate-500">
          คำค้น
        </label>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="เช่น ชื่อ เบอร์ อีเมล หรือวาง UUID…"
          className="h-10 w-full max-w-xl rounded-lg border border-slate-200 px-3 text-sm"
          autoComplete="off"
        />
        <p className="mt-2 text-[11px] text-slate-500">
          แสดงสูงสุด 100 รายการล่าสุด — พิมพ์เพื่อค้นแบบย่อข้อมูล
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-xl pos-card-saas" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 pos-card-saas shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-slate-200/90 bg-slate-50/95 text-left text-xs text-slate-500 backdrop-blur-sm">
                <th className="px-3 py-2">ชื่อ</th>
                <th className="px-3 py-2">อีเมล</th>
                <th className="px-3 py-2">โทรศัพท์</th>
                <th className="px-3 py-2">สถานะ</th>
                <th className="px-3 py-2 w-28"> </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
                >
                  <td className="px-3 py-2 font-medium text-slate-900">{m.name}</td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-xs text-slate-600">
                    {m.email || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs tabular-nums text-slate-600">
                    {m.phone || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs capitalize">{m.status}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/pos/customer/${m.id}`}
                      className="text-xs font-medium text-blue-700 hover:underline"
                    >
                      รายละเอียด
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 pos-card-saas">
          {debounced
            ? "ไม่พบผลตามคำค้น"
            : "ยังไม่มีรายการ — ลองพิมพ์ค้นหา หรือตรวจการเชื่อมต่อ"}
        </p>
      ) : null}
    </div>
  );
}
