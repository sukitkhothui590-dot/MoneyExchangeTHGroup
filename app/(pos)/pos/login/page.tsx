"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { usePosSession } from "@/lib/context/PosSessionContext";
import type { PosBranchSelection } from "@/lib/context/PosSessionContext";

type Step = "credentials" | "branch";

export default function PosLoginPage() {
  const router = useRouter();
  const { setBranch, userEmail, refreshUser } = usePosSession();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [allowedBranches, setAllowedBranches] = useState<PosBranchSelection[]>(
    [],
  );
  const [branchId, setBranchId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) {
      router.replace("/pos/dashboard");
    }
  }, [userEmail, router]);

  const finishWithBranch = async (b: PosBranchSelection) => {
    setBranch(b);
    await refreshUser();
    router.push("/pos/dashboard");
    router.refresh();
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : authError.message,
        );
        return;
      }

      const meRes = await fetch("/api/pos/me");
      if (!meRes.ok) {
        if (meRes.status === 403) {
          setError("บัญชีนี้ไม่สามารถใช้ POS ได้");
        } else {
          setError("ไม่สามารถโหลดข้อมูลสิทธิ์ได้");
        }
        await supabase.auth.signOut();
        return;
      }

      const meJson = await meRes.json();
      const list = (meJson.data?.allowedBranches ?? []) as PosBranchSelection[];

      if (!list.length) {
        setError(
          "ยังไม่มีสาขาในระบบให้เลือก หรือบัญชีของคุณยังไม่ได้รับมอบหมายสาขา — ติดต่อผู้ดูแลระบบ",
        );
        await supabase.auth.signOut();
        return;
      }

      if (list.length === 1) {
        await finishWithBranch(list[0]);
        return;
      }

      setAllowedBranches(list);
      setBranchId(list[0].id);
      setStep("branch");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const submitBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const b = allowedBranches.find((x) => x.id === branchId);
    if (!b) {
      setError("กรุณาเลือกสาขา");
      return;
    }
    setLoading(true);
    try {
      await finishWithBranch(b);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-[42%] xl:w-[44%] bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between px-8 py-10 lg:py-14 lg:px-12 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(37,99,235,0.35) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 space-y-4 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/90">
            พนักงานหน้าเคาน์เตอร์
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-snug">
            ระบบ POS
            <span className="block text-white/75 text-lg sm:text-xl font-normal mt-1">
              Money Exchange T.H. Group
            </span>
          </h1>
          <p className="text-sm text-white/65 leading-relaxed">
            เข้าสู่ระบบด้วยบัญชีองค์กร เลือกสาขาที่ทำงาน และจัดการแลกเงิน คิวจอง
            และประวัติธุรกรรมในที่เดียว
          </p>
        </div>
        <p className="relative z-10 text-[11px] text-white/40 mt-10 lg:mt-0">
          © {new Date().getFullYear()} Money Exchange T.H. Group
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:px-8 bg-[#f5f8ff]">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <h2 className="text-xl font-semibold text-slate-900">
              {step === "credentials" ? "เข้าสู่ระบบ" : "เลือกสาขา"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {step === "credentials"
                ? "พนักงาน — บัญชีองค์กร"
                : "สาขาที่ได้รับมอบหมาย"}
            </p>
          </div>
          <div className="hidden lg:block mb-8">
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
              {step === "credentials" ? "เข้าสู่ระบบ" : "เลือกสาขา"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {step === "credentials"
                ? "ใช้อีเมลและรหัสผ่านที่ได้รับจากผู้ดูแลระบบ"
                : "เลือกสาขาที่ทำงานในวันนี้"}
            </p>
          </div>

          {step === "credentials" ? (
            <form
              onSubmit={submitCredentials}
              className="space-y-4 pos-card-saas rounded-2xl p-6 sm:p-7 shadow-sm"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  อีเมล
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-blue-100 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-blue-100 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500"
                  required
                />
              </div>
              {error ? (
                <p className="text-xs text-red-700 text-center bg-red-50 border border-red-100 rounded-xl py-2.5 px-3">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 shadow-md shadow-blue-600/20"
              >
                {loading ? "กำลังเข้าสู่ระบบ…" : "ถัดไป"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={submitBranch}
              className="space-y-4 pos-card-saas rounded-2xl p-6 sm:p-7 shadow-sm"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  สาขาที่ทำงาน
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-blue-100 bg-white text-sm text-slate-900"
                >
                  {allowedBranches.map((br) => (
                    <option key={br.id} value={br.id}>
                      {br.name_th}
                    </option>
                  ))}
                </select>
              </div>
              {error ? (
                <p className="text-xs text-red-700 text-center bg-red-50 border border-red-100 rounded-xl py-2.5 px-3">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setError("");
                    void createClient().auth.signOut();
                  }}
                  className="flex-1 h-11 rounded-xl border border-blue-100 text-sm font-medium text-slate-700 hover:bg-blue-50"
                >
                  กลับ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 shadow-md shadow-blue-600/20"
                >
                  {loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
                </button>
              </div>
            </form>
          )}

          <p className="text-xs text-slate-500 text-center mt-6">
            <Link
              href="/"
              className="text-blue-600 font-medium hover:underline hover:text-blue-700"
            >
              กลับหน้าหลักเว็บไซต์
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
