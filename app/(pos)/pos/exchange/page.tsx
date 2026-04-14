"use client";

import {
  BanknotesIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPhoneCountryOptions } from "@/lib/phone/countryOptions";
import { usePosSession } from "@/lib/context/PosSessionContext";
import type { Currency, Member } from "@/lib/types/database";
import type { CountryCode } from "libphonenumber-js";

function PosExchangeInner() {
  const { branch, userEmail, userDisplayName, ready } = usePosSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [walkinCountry, setWalkinCountry] = useState<CountryCode>("TH");
  const [walkinNational, setWalkinNational] = useState("");
  const [walkinName, setWalkinName] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [doneMsg, setDoneMsg] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  /** ผลลัพธ์ล่าสุดจากปุ่มค้นหา (แสดงจำนวน / รายการให้เลือก) */
  const [lookupMatches, setLookupMatches] = useState<Member[]>([]);
  /** คำค้นที่เพิ่งยิง API สำเร็จ — ใช้แยก “ยังไม่ค้นหา” กับ “ค้นหาแล้วไม่พบ” */
  const [lastSearchQ, setLastSearchQ] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [customerPanelTab, setCustomerPanelTab] = useState<"search" | "walkin">(
    "search",
  );

  useEffect(() => {
    if (!ready) return;
    if (!userEmail) router.replace("/pos/login");
  }, [ready, userEmail, router]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/currencies");
      if (res.ok) {
        const json = await res.json();
        const rows = (json.data ?? []) as Currency[];
        setCurrencies(rows);
        if (rows.length) {
          setCurrency((c) => (rows.find((r) => r.code === c) ? c : rows[0].code));
        }
      }
    })();
  }, []);

  const memberIdFromUrl = searchParams.get("memberId")?.trim() ?? "";

  useEffect(() => {
    if (!memberIdFromUrl || !ready || !userEmail) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/members/${encodeURIComponent(memberIdFromUrl)}`);
      if (!res.ok || cancelled) return;
      const json = await res.json();
      if (cancelled) return;
      setMember(json.data as Member);
      setDoneMsg("โหลดลูกค้าจากหน้ายืนยันตัวตนแล้ว");
      router.replace("/pos/exchange", { scroll: false });
    })();
    return () => {
      cancelled = true;
    };
  }, [memberIdFromUrl, ready, userEmail, router]);

  const rateRow = useMemo(
    () => currencies.find((r) => r.code === currency),
    [currencies, currency],
  );
  const buyRate = rateRow?.buy_rate ?? 0;
  const amountNum = Number(amount.replace(/,/g, "")) || 0;
  const totalThb = Math.round(amountNum * buyRate * 100) / 100;

  const greet =
    userDisplayName?.trim() || userEmail?.split("@")[0] || "พนักงาน";

  const phoneCountryOptions = useMemo(() => getPhoneCountryOptions(), []);

  const selectSearchMember = (m: Member) => {
    setMember(m);
    setLookupMatches([]);
    setLastSearchQ(null);
  };

  /** ใช้ token กันผลค้นหาเก่าทับผลใหม่ (พิมพ์เร็ว / debounce) */
  const searchTokenRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executeMemberSearch = useCallback((rawQuery: string) => {
    const q = rawQuery.replace(/\s/g, "");
    const token = ++searchTokenRef.current;
    if (!q) {
      setMember(null);
      setLookupMatches([]);
      setLastSearchQ(null);
      setLookupLoading(false);
      return;
    }
    setLookupLoading(true);
    setMember(null);
    setLookupMatches([]);
    setLastSearchQ(null);
    setDoneMsg("");
    void (async () => {
      try {
        const res = await fetch(
          `/api/members?q=${encodeURIComponent(q)}&status=active`,
        );
        if (token !== searchTokenRef.current) return;
        if (!res.ok) return;
        const json = await res.json();
        const rows = (json.data ?? []) as Member[];
        if (token !== searchTokenRef.current) return;
        setLookupMatches(rows);
        setLastSearchQ(q);
        if (rows.length === 1) setMember(rows[0]);
      } finally {
        if (token === searchTokenRef.current) setLookupLoading(false);
      }
    })();
  }, []);

  /** พิมพ์แล้วค้นหาแบบเรียลไทม์ (debounce ~280ms) — ข้อมูลจากตาราง members เดียวกับแอดมิน */
  useEffect(() => {
    if (!ready || !userEmail) return;

    const q = phone.replace(/\s/g, "");
    if (!q) {
      searchTokenRef.current += 1;
      setMember(null);
      setLookupMatches([]);
      setLastSearchQ(null);
      setLookupLoading(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      executeMemberSearch(phone);
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [phone, ready, userEmail, executeMemberSearch]);

  const lookup = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    executeMemberSearch(phone);
  };

  const createGuest = async () => {
    setGuestLoading(true);
    setDoneMsg("");
    try {
      const hasPhone = walkinNational.replace(/\D/g, "").length > 0;
      const res = await fetch("/api/pos/guest-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: walkinName.trim() || "ลูกค้า Walk-in",
          phoneCountry: hasPhone ? walkinCountry : "",
          phoneNational: hasPhone ? walkinNational.trim() : "",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setDoneMsg(json.error ?? "สร้างลูกค้าไม่สำเร็จ");
        return;
      }
      setMember(json.data as Member);
      if (json.existing) {
        setDoneMsg("พบสมาชิกเบอร์นี้ในระบบแล้ว — ใช้ข้อมูลเดิม");
      } else {
        setDoneMsg(
          hasPhone ?
            "สร้างสมาชิกจากเบอร์นี้แล้ว — ดำเนินการแลกได้"
          : "สร้างบัญชี Walk-in ชั่วคราวแล้ว — ดำเนินการแลกได้",
        );
      }
    } catch {
      setDoneMsg("เกิดข้อผิดพลาด");
    } finally {
      setGuestLoading(false);
    }
  };

  const submitTxn = async () => {
    if (!userEmail || !branch || !member || !rateRow) return;
    setSubmitting(true);
    setDoneMsg("");
    try {
      const res = await fetch("/api/pos/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: member.id,
          branch_id: branch.id,
          currency_code: currency,
          amount: amountNum,
          rate: buyRate,
          total_thb: totalThb,
          note: note.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setDoneMsg(json.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      const id = json.data?.id as string | undefined;
      setDoneMsg(id ? `บันทึกแล้ว (${id.slice(0, 8)}…)` : "บันทึกแล้ว");
      setConfirmOpen(false);
    } catch {
      setDoneMsg("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || !userEmail) return null;

  const isPlaceholderPhone = (p: string) =>
    (p.startsWith("guest-") || p.startsWith("identity-")) && p.length < 28;

  const qPhone = phone.replace(/\s/g, "");
  const showLookupResult =
    qPhone.length > 0 && lastSearchQ === qPhone && !lookupLoading;

  return (
    <div className="space-y-8 min-w-0">
      <section className="relative overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 px-5 py-5 sm:px-6 text-white">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/55">
              แลกเงินหน้าเคาน์เตอร์
            </p>
            <h2 className="text-lg font-semibold tracking-tight truncate">
              สวัสดี {greet}
            </h2>
            <p className="text-sm text-white/75 mt-0.5">
              {branch?.name_th ? (
                <>
                  สาขา{" "}
                  <span className="font-medium text-white">{branch.name_th}</span>
                </>
              ) : (
                <span className="text-amber-200">ยังไม่ได้เลือกสาขา</span>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <BanknotesIcon className="h-8 w-8 text-blue-300/90" />
              <span className="max-w-[220px] leading-snug">
                ค้นหาสมาชิก หรือเปิดแท็บ Walk-in เพื่อสร้าง/โหลดลูกค้า
              </span>
            </div>
            <Link
              href="/pos/identity"
              className="text-xs font-medium text-blue-200/95 hover:text-white underline underline-offset-2"
            >
              ยืนยันตัวตนด้วยพาสปอร์ต / บัตร →
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <section
            className="pos-card-saas rounded-2xl overflow-hidden"
            aria-label="เลือกลูกค้า"
          >
            <div
              className="flex p-1.5 gap-1 border-b border-blue-100/90 bg-gradient-to-r from-slate-50/95 to-blue-50/40"
              role="tablist"
              aria-label="โหมดลูกค้า"
            >
              <button
                type="button"
                role="tab"
                aria-selected={customerPanelTab === "search"}
                id="tab-search"
                onClick={() => setCustomerPanelTab("search")}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                  customerPanelTab === "search" ?
                    "bg-white text-blue-800 shadow-sm border border-blue-200/80"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                }`}
              >
                <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">ค้นหาสมาชิก</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={customerPanelTab === "walkin"}
                id="tab-walkin"
                onClick={() => setCustomerPanelTab("walkin")}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                  customerPanelTab === "walkin" ?
                    "bg-white text-blue-800 shadow-sm border border-blue-200/80"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                }`}
              >
                <UserPlusIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">ลูกค้า Walk-in</span>
              </button>
            </div>

            <div
              className="p-4 sm:p-5 space-y-4"
              role="tabpanel"
              aria-labelledby={
                customerPanelTab === "search" ? "tab-search" : "tab-walkin"
              }
            >
              {customerPanelTab === "search" ? (
                <>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    พิมพ์ทีละตัวอักษรได้เลย — ดึงจากฐานสมาชิกเดียวกับแอดมิน (แสดงเฉพาะ
                    active) · กด Enter หรือปุ่มเพื่อค้นหาทันที
                  </p>
                  <div className="flex flex-col gap-2 min-w-0">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void lookup();
                      }}
                      placeholder="เบอร์โทร / อีเมล / ชื่อ"
                      className="w-full min-w-0 h-11 px-3 rounded-xl border border-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() => void lookup()}
                      disabled={lookupLoading}
                      className="h-11 w-full px-4 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-50 shadow-sm shadow-blue-600/20 hover:bg-blue-700"
                    >
                      {lookupLoading ? "ค้นหา…" : "ค้นหา"}
                    </button>
                  </div>

                  {lookupLoading ? (
                    <p className="text-xs text-slate-500" aria-live="polite">
                      กำลังค้นหา…
                    </p>
                  ) : null}

                  {showLookupResult && lookupMatches.length === 0 ? (
                    <p className="text-xs text-slate-600 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                      ไม่พบลูกค้า — ลองคำค้นอื่น หรือเปิดแท็บ{" "}
                      <button
                        type="button"
                        onClick={() => setCustomerPanelTab("walkin")}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        ลูกค้า Walk-in
                      </button>
                    </p>
                  ) : null}

                  {showLookupResult && lookupMatches.length === 1 && member ? (
                    <div
                      className="rounded-xl border border-blue-200 bg-blue-50/90 px-3 py-2.5 text-xs text-blue-950"
                      role="status"
                    >
                      <span className="font-semibold text-blue-900">
                        พบผลการค้นหา 1 รายการ
                      </span>
                      <span className="text-blue-800/95"> — {member.name}</span>
                    </div>
                  ) : null}

                  {showLookupResult && lookupMatches.length > 1 ? (
                    <div className="space-y-2 min-w-0">
                      <p className="text-xs font-medium text-slate-700">
                        พบผลการค้นหา {lookupMatches.length} รายการ —{" "}
                        <span className="text-blue-700">แตะเลือกลูกค้า</span>
                      </p>
                      <ul
                        className="max-h-52 overflow-y-auto space-y-1 rounded-xl border border-blue-100 bg-white p-2 shadow-sm"
                        aria-label="รายชื่อที่พบจากการค้นหา"
                      >
                        {lookupMatches.map((m) => (
                          <li key={m.id}>
                            <button
                              type="button"
                              onClick={() => selectSearchMember(m)}
                              className="w-full min-w-0 text-left rounded-lg px-3 py-2 text-xs border border-transparent hover:bg-blue-50 hover:border-blue-100 transition-colors"
                            >
                              <span className="font-semibold text-slate-900">{m.name}</span>
                              {m.phone ? (
                                <span className="block text-slate-600 tabular-nums mt-0.5">
                                  {m.phone}
                                </span>
                              ) : null}
                              <span className="block text-slate-500 truncate mt-0.5">
                                {m.email}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <strong className="text-slate-700">เลือกประเทศ</strong> แล้วใส่
                    <strong className="text-slate-700"> เลขท้องถิ่นเท่านั้น </strong>
                    (ไม่ต้องพิมพ์รหัสประเทศในช่องเบอร์ — ระบบใส่ให้ตามประเทศที่เลือก)
                    ถ้ามีเบอร์นี้แล้วจะโหลดข้อมูลเดิม หรือเว้นว่างทั้งคู่แล้วกดสร้างแบบชั่วคราว
                  </p>
                  <div className="space-y-2">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                        <DevicePhoneMobileIcon className="h-5 w-5 text-slate-400" />
                        ประเทศ / รหัสโทร
                      </label>
                      <select
                        value={walkinCountry}
                        onChange={(e) =>
                          setWalkinCountry(e.target.value as CountryCode)
                        }
                        className="w-full h-11 px-3 rounded-xl border border-blue-100 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200"
                        aria-label="ประเทศของเบอร์โทร"
                      >
                        {phoneCountryOptions.map((o) => (
                          <option key={o.code} value={o.code}>
                            {o.labelTh} (+{o.callingCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        เลขท้องถิ่น (ไม่ใส่ +)
                      </label>
                      <input
                        inputMode="tel"
                        autoComplete="tel-national"
                        value={walkinNational}
                        onChange={(e) => setWalkinNational(e.target.value)}
                        placeholder={
                          walkinCountry === "TH" ?
                            "เช่น 0812345678 หรือ 812345678"
                          : walkinCountry === "US" ?
                            "เช่น 4155550123"
                          : "เบอร์มือถือ/บ้านในประเทศนั้น"
                        }
                        className="w-full h-11 px-3 rounded-xl border border-blue-100 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        ชื่อเรียก (ไม่บังคับ)
                      </label>
                      <input
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                        placeholder="เช่น คุณสมชาย"
                        className="w-full h-10 px-3 rounded-xl border border-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void createGuest()}
                    disabled={guestLoading}
                    className="w-full h-11 rounded-xl border-2 border-blue-500/35 bg-blue-50/90 text-blue-950 text-sm font-semibold hover:bg-blue-100/90 disabled:opacity-50 transition-colors"
                  >
                    {guestLoading ? "กำลังสร้าง…" : "สร้าง / โหลดสมาชิก Walk-in"}
                  </button>
                </>
              )}
            </div>
          </section>

          {member ? (
            <div className="pos-card-saas rounded-2xl p-4 border border-blue-200/80 bg-blue-50/50">
              <p className="text-[11px] font-semibold uppercase text-blue-800/90 mb-1">
                ลูกค้าที่เลือก
              </p>
              <p className="font-semibold text-slate-900">{member.name}</p>
              <p className="text-xs text-slate-600 break-all mt-0.5">{member.email}</p>
              {member.phone && !isPlaceholderPhone(member.phone) ? (
                <p className="text-xs text-slate-700 tabular-nums mt-1">{member.phone}</p>
              ) : member.identity_lookup_key ? (
                <p className="text-xs text-slate-600 mt-1">
                  ยืนยันตัวตนจากเอกสาร (ไม่มีเบอร์)
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">Walk-in ชั่วคราว (ไม่มีเบอร์)</p>
              )}
              <Link
                href={`/pos/customer/${member.id}`}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline inline-block mt-2"
              >
                ดูโปรไฟล์ / จำนวนครั้งเข้าใช้บริการ
              </Link>
            </div>
          ) : null}
        </div>

        <section className="xl:col-span-2 pos-card-saas rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-blue-100/80">
            <BanknotesIcon className="h-6 w-6 text-blue-700" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">รายการแลก</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                เลือกสกุลเงิน จำนวน และยืนยันก่อนบันทึก
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">สกุลเงิน</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm bg-white"
              >
                {currencies.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.flag} {r.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                จำนวน ({currency})
              </label>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-blue-100 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-200"
              />
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/60 border border-blue-100/90 px-4 py-3">
            <p className="text-[11px] text-blue-700/80 uppercase tracking-wide font-medium">
              สรุปยอด
            </p>
            <p className="text-sm text-slate-700 mt-1">
              เรทรับ (ซื้อ){" "}
              <span className="font-semibold tabular-nums">{buyRate.toLocaleString()}</span>
            </p>
            <p className="text-2xl font-bold text-blue-950 tabular-nums mt-1">
              ฿{totalThb.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">หมายเหตุ (ถ้ามี)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น อ้างอิงใบเสร็จ"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <button
            type="button"
            disabled={!member || !branch || submitting}
            onClick={() => setConfirmOpen(true)}
            className="w-full h-12 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-40 shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
          >
            ตรวจสอบและยืนยัน
          </button>

          {!branch ? (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              ยังไม่มีสาขาในเซสชัน — ออกจากระบบแล้วเข้าใหม่พร้อมเลือกสาขา
            </p>
          ) : null}

          {!member ? (
            <p className="text-xs text-slate-500 text-center py-2 border border-dashed border-slate-200 rounded-xl">
              เลือกหรือสร้างลูกค้าก่อน แล้วจึงบันทึกธุรกรรม
            </p>
          ) : null}

          {doneMsg ? (
            <p className="text-sm text-blue-900 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 break-words">
              {doneMsg}
            </p>
          ) : null}
        </section>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl pos-card-saas p-5 max-w-md w-full shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">ยืนยันธุรกรรม</h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>
                ลูกค้า: <span className="font-medium text-slate-900">{member?.name}</span>
              </li>
              {member?.phone && !isPlaceholderPhone(member.phone) ? (
                <li className="tabular-nums">เบอร์: {member.phone}</li>
              ) : null}
              <li>
                สกุล: {currency} จำนวน {amountNum.toLocaleString()} · เรท{" "}
                {buyRate.toLocaleString()}
              </li>
              <li className="font-semibold text-slate-900">
                รวม THB ฿{totalThb.toLocaleString()}
              </li>
              {note.trim() ? <li>หมายเหตุ: {note.trim()}</li> : null}
            </ul>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 h-10 rounded-xl border border-blue-100 text-sm text-slate-700 hover:bg-blue-50"
              >
                แก้ไข
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitTxn()}
                className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-blue-700 shadow-sm shadow-blue-600/15"
              >
                {submitting ? "กำลังบันทึก…" : "ยืนยันบันทึก"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function PosExchangePage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-slate-500 py-8 text-center">กำลังโหลด…</div>
      }
    >
      <PosExchangeInner />
    </Suspense>
  );
}
