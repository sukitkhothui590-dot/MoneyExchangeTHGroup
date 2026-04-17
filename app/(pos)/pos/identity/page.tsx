"use client";

import {
  CameraIcon,
  CreditCardIcon,
  IdentificationIcon,
  DocumentTextIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { IdentityResolved } from "@/lib/identity/parseScan";
import { getPhoneCountryOptions } from "@/lib/phone/countryOptions";
import { usePosSession } from "@/lib/context/PosSessionContext";
import type { Member } from "@/lib/types/database";
import type { CountryCode } from "libphonenumber-js";
import CameraScanner, { type CapturedImage } from "./CameraScanner";
import CardReaderListener, { type CardReadResult } from "./CardReaderListener";
import { resolveCardReaderData } from "@/lib/identity/parseScan";

type TabId = "camera" | "cardreader" | "manual" | "key";
type Step = "input" | "processing" | "review" | "result";

const TABS: { id: TabId; label: string; shortLabel: string; icon: ReactNode }[] = [
  { id: "camera", label: "แสกนด้วยกล้อง", shortLabel: "กล้อง", icon: <CameraIcon className="h-4 w-4" /> },
  { id: "cardreader", label: "เสียบบัตร", shortLabel: "บัตร", icon: <CreditCardIcon className="h-4 w-4" /> },
  { id: "manual", label: "วาง MRZ / เลข ปชช.", shortLabel: "วาง", icon: <DocumentTextIcon className="h-4 w-4" /> },
  { id: "key", label: "คีย์ตรง", shortLabel: "คีย์", icon: <KeyIcon className="h-4 w-4" /> },
];

export default function PosIdentityPage() {
  const { branch, userEmail, userDisplayName, ready } = usePosSession();
  const router = useRouter();

  const [tab, setTab] = useState<TabId>("camera");
  const [step, setStep] = useState<Step>("input");
  const [member, setMember] = useState<Member | null>(null);
  const [doneMsg, setDoneMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // OCR
  const [capturedImg, setCapturedImg] = useState<CapturedImage | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrPassLabel, setOcrPassLabel] = useState("");
  const [ocrRawText, setOcrRawText] = useState("");
  const [ocrEditing, setOcrEditing] = useState(false);
  const [ocrEditText, setOcrEditText] = useState("");

  // Manual NID input (camera review fallback)
  const [manualNid, setManualNid] = useState("");
  // Manual paste tab
  const [rawPaste, setRawPaste] = useState("");
  // Key tab
  const [scannerKey, setScannerKey] = useState("");
  const [scannerFullName, setScannerFullName] = useState("");

  // Identity result
  const [idScanLoading, setIdScanLoading] = useState(false);
  const [idEnrollLoading, setIdEnrollLoading] = useState(false);
  const [idResolved, setIdResolved] = useState<IdentityResolved | null>(null);
  const [idEnrollName, setIdEnrollName] = useState("");
  const [idEnrollCountry, setIdEnrollCountry] = useState<CountryCode>("TH");
  const [idEnrollNational, setIdEnrollNational] = useState("");

  const greet = userDisplayName?.trim() || userEmail?.split("@")[0] || "พนักงาน";
  const phoneCountryOptions = useMemo(() => getPhoneCountryOptions(), []);

  /** ยกเลิก OCR / lookup ที่ค้าง — เพิ่มเมื่อเริ่มรอบใหม่หรือ reset */
  const flowSessionRef = useRef(0);

  useEffect(() => {
    if (ready && !userEmail) router.replace("/pos/login");
  }, [ready, userEmail, router]);

  // ── Camera capture → multi-pass OCR ──────────────────────────
  const runOcr = useCallback(async (img: CapturedImage) => {
    const runId = ++flowSessionRef.current;
    setCapturedImg(img);
    setStep("processing");
    setOcrProgress(0);
    setOcrPassLabel("กำลังเริ่ม…");
    setOcrRawText("");
    setOcrEditing(false);
    setErrorMsg("");
    setDoneMsg("");
    setIdResolved(null);
    setMember(null);

    try {
      const { multiPassOcr } = await import("@/lib/identity/ocrEngine");
      const result = await multiPassOcr(img.dataUrl, (pct, label) => {
        if (flowSessionRef.current !== runId) return;
        setOcrProgress(pct);
        setOcrPassLabel(label);
      });

      if (runId !== flowSessionRef.current) return;

      setOcrRawText(result.bestRawText);
      setOcrEditText(result.bestRawText);

      if (result.bestMatch) {
        setStep("review");
        setIdResolved(result.bestMatch);
        setIdEnrollName(result.bestMatch.fullName);
        await lookupWithResolved(result.bestMatch, result.bestRawText);
        if (runId !== flowSessionRef.current) return;
      } else if (result.bestRawText) {
        setStep("review");
        setErrorMsg(
          "ไม่พบ MRZ หรือเลข ปชช. ที่ถูกต้อง — ลองแก้ไขข้อความด้านล่างแล้วกดตรวจอีกครั้ง หรือถ่ายใหม่ให้ชัดขึ้น",
        );
      } else {
        setStep("review");
        setErrorMsg(
          "OCR อ่านไม่ได้ข้อความเลย — ลองถ่ายใหม่ให้ตัวหนังสือชัดขึ้น (ห้ามเบลอ, ไม่มีแสงสะท้อน)",
        );
      }
    } catch (e) {
      if (runId !== flowSessionRef.current) return;
      setStep("input");
      setErrorMsg(`OCR ล้มเหลว: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }, []);

  // ── Lookup identity (from any source) ────────────────────────
  const lookupIdentity = async (payload: Record<string, string>) => {
    const opId = flowSessionRef.current;
    setIdScanLoading(true);
    setDoneMsg("");
    setErrorMsg("");
    setIdResolved(null);
    setMember(null);
    try {
      console.log("[identity-page] lookupIdentity payload:", payload);
      const res = await fetch("/api/pos/identity/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      console.log("[identity-page] scan response:", res.status, json);
      if (!res.ok) {
        if (opId !== flowSessionRef.current) return;
        setErrorMsg(json.error ?? "ค้นหาไม่สำเร็จ");
        return;
      }
      const d = json.data as {
        status: string;
        member?: Member & { visit_count?: number };
        resolved?: IdentityResolved;
        _debug?: Record<string, unknown>;
      };
      if (d._debug) {
        console.log("[identity-page] debug info:", d._debug);
      }
      if (opId !== flowSessionRef.current) return;
      if (d.status === "member_found" && d.member) {
        setMember(d.member);
        setIdResolved(null);
        setStep("result");
        setDoneMsg(
          `พบสมาชิกแล้ว — ${d.member.name} (ธุรกรรม ${d.member.visit_count ?? 0} ครั้ง)`,
        );
      } else if (d.status === "new_identity" && d.resolved) {
        setMember(null);
        setIdResolved(d.resolved);
        setIdEnrollName(d.resolved.fullName);
        setIdEnrollCountry("TH");
        setIdEnrollNational("");
        setStep("result");
      }
    } catch (e) {
      console.error("[identity-page] lookupIdentity error:", e);
      if (opId !== flowSessionRef.current) return;
      setErrorMsg("เกิดข้อผิดพลาด — ลองอีกครั้ง");
    } finally {
      if (opId === flowSessionRef.current) {
        setIdScanLoading(false);
      }
    }
  };

  const lookupWithResolved = async (resolved: IdentityResolved, rawText?: string) => {
    const raw = rawText ?? ocrRawText;
    await lookupIdentity({
      identity_lookup_key: resolved.identityKey,
      raw,
      full_name: resolved.fullName,
    });
  };

  // ── Manual NID lookup (from camera review) ─────────────────
  const handleManualNidLookup = () => {
    const digits = manualNid.replace(/\D/g, "");
    if (digits.length < 13) return;
    const nid = digits.slice(0, 13);
    void lookupIdentity({
      identity_lookup_key: `TH-NID|${nid}`,
      raw: nid,
      full_name: "",
    });
  };

  // ── Manual / Key submits ─────────────────────────────────────
  const handleManualSubmit = () => {
    const text = rawPaste.trim();
    if (!text) return;
    void lookupIdentity({ raw: text });
  };

  const handleKeySubmit = () => {
    const key = scannerKey.trim();
    if (!key) return;
    void lookupIdentity({
      identity_lookup_key: key,
      full_name: scannerFullName.trim(),
    });
  };

  // ── Card reader ────────────────────────────────────────────
  const handleCardRead = useCallback(
    (result: CardReadResult) => {
      setErrorMsg("");
      setDoneMsg("");
      const resolved = resolveCardReaderData(result.rawData);
      if (resolved) {
        setIdResolved(resolved);
        setIdEnrollName(resolved.fullName);
        setStep("result");
        void lookupIdentity({
          identity_lookup_key: resolved.identityKey,
          raw: result.rawData,
          full_name: resolved.fullName,
        });
      } else {
        setErrorMsg(
          `ข้อมูลจากเครื่องอ่านบัตรไม่สามารถแปลงได้ — ลองเสียบใหม่ หรือใช้แท็บอื่น\n\nข้อมูลดิบ: ${result.rawData.slice(0, 200)}`,
        );
      }
    },
    [],
  );

  // ── Enroll ───────────────────────────────────────────────────
  const [enrollError, setEnrollError] = useState("");

  const enrollFromIdentity = async () => {
    if (!idResolved) return;
    setIdEnrollLoading(true);
    setDoneMsg("");
    setErrorMsg("");
    setEnrollError("");
    try {
      const hasPhone = idEnrollNational.replace(/\D/g, "").length > 0;
      const payload = {
        identity_lookup_key: idResolved.identityKey,
        full_name: (idEnrollName.trim() || idResolved.fullName).slice(0, 120),
        phoneCountry: hasPhone ? idEnrollCountry : "",
        phoneNational: hasPhone ? idEnrollNational.trim() : "",
      };
      console.log("[identity-page] enroll payload:", payload);
      const res = await fetch("/api/pos/identity/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      console.log("[identity-page] enroll response:", res.status, json);
      if (!res.ok) {
        setEnrollError(json.error ?? "สร้างสมาชิกไม่สำเร็จ");
        return;
      }
      setMember(json.data as Member);
      setIdResolved(null);
      setStep("result");
      setDoneMsg("สมัครสมาชิกสำเร็จ — สามารถไปแลกเงินได้เลย");
    } catch (e) {
      console.error("[identity-page] enroll error:", e);
      setEnrollError("เกิดข้อผิดพลาดในการสมัคร — ลองอีกครั้ง");
    } finally {
      setIdEnrollLoading(false);
    }
  };

  // ── Reset ────────────────────────────────────────────────────
  const resetAll = () => {
    flowSessionRef.current += 1;
    setStep("input");
    setMember(null);
    setIdResolved(null);
    setCapturedImg(null);
    setOcrRawText("");
    setOcrEditText("");
    setOcrEditing(false);
    setDoneMsg("");
    setErrorMsg("");
    setEnrollError("");
    setManualNid("");
    setScannerKey("");
    setScannerFullName("");
    setRawPaste("");
  };

  /** จากฟอร์มสมัคร กลับไปขั้นก่อนหน้า — แท็บกล้อง = ตรวจผล OCR; แท็บอื่น = หน้า input ของแท็บนั้น */
  const backFromEnrollToReview = () => {
    flowSessionRef.current += 1;
    setMember(null);
    setDoneMsg("");
    setErrorMsg("");
    setEnrollError("");
    setIdScanLoading(false);
    setStep(tab === "camera" ? "review" : "input");
  };

  if (!ready || !userEmail) return null;

  const isPlaceholderPhone = (p: string) =>
    (p.startsWith("guest-") || p.startsWith("identity-")) && p.length < 28;

  const sourceLabel = (r: IdentityResolved) => {
    if (r.source === "mrz") return "MRZ (พาสปอร์ต/บัตร)";
    if (r.source === "th_national_id") return "เลขบัตร ปชช. ไทย";
    if (r.source === "card_reader") return "เครื่องเสียบบัตร";
    return "คีย์ตรง";
  };

  return (
    <div className="space-y-5 min-w-0 max-w-3xl">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-950 via-slate-900 to-slate-900 px-5 py-5 sm:px-7 text-white">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/25 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/60">
              <IdentificationIcon className="h-4 w-4 text-violet-300" />
              ยืนยันตัวตนลูกค้า
            </p>
            <h1 className="mt-1 text-lg sm:text-xl font-semibold tracking-tight">
              สวัสดี {greet}
            </h1>
            <p className="text-xs text-white/75 mt-1">
              {branch?.name_th ? (
                <>สาขา <span className="font-medium text-white">{branch.name_th}</span></>
              ) : (
                <span className="text-amber-200">ยังไม่ได้เลือกสาขา</span>
              )}
            </p>
          </div>
          <Link
            href="/pos/exchange"
            className="shrink-0 text-center text-xs font-medium text-violet-200 hover:text-white underline underline-offset-2"
          >
            ไปหน้าแลกเงิน →
          </Link>
        </div>
      </section>

      {/* ── Step indicator (camera tab only) ── */}
      {tab === "camera" ? (
        <div className="flex items-center gap-1 text-[11px] font-medium">
          {(["input", "processing", "review", "result"] as Step[]).map((s, i) => {
            const labels = ["ถ่ายภาพ", "OCR อ่าน", "ตรวจผล", "เสร็จสิ้น"];
            const active = s === step;
            const done =
              (["input", "processing", "review", "result"] as Step[]).indexOf(step) > i;
            return (
              <div key={s} className="flex items-center gap-1">
                {i > 0 ? (
                  <div className={`w-6 h-px ${done || active ? "bg-violet-400" : "bg-slate-200"}`} />
                ) : null}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                    active
                      ? "bg-violet-100 text-violet-800"
                      : done
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-50 text-slate-400"
                  }`}
                >
                  {done ? <CheckCircleIcon className="h-3 w-3" /> : null}
                  {labels[i]}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ── Tab bar ── */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              if (step !== "result") setStep("input");
              setErrorMsg("");
              setDoneMsg("");
            }}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors ${
              tab === t.id
                ? "bg-white text-violet-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* ════════ Camera Tab ════════ */}
      {tab === "camera" && step === "input" ? (
        <section className="pos-card-saas rounded-2xl p-4 sm:p-6 space-y-4 border-t-4 border-t-violet-500/50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CameraIcon className="h-5 w-5 text-violet-600" />
              ขั้นตอนที่ 1: ถ่ายภาพเอกสาร
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              เปิดกล้องแล้ววางเอกสารให้อยู่ในกรอบ — ถ่ายให้ชัด ไม่เบลอ ไม่มีแสงสะท้อน
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-violet-50 text-[10px] font-medium text-violet-800">
                พาสปอร์ต (MRZ)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-[10px] font-medium text-blue-800">
                บัตร ปชช. ไทย
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600">
                ID Card (TD1/TD2)
              </span>
            </div>
          </div>

          <CameraScanner
            onCapture={(img) => void runOcr(img)}
            disabled={false}
          />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-slate-100">
            <Link
              href="/pos/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-violet-700"
            >
              <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden />
              กลับแดชบอร์ด
            </Link>
            <Link
              href="/pos/exchange"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-violet-700"
            >
              <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden />
              กลับหน้าแลกเงิน
            </Link>
          </div>
        </section>
      ) : null}

      {tab === "camera" && step === "processing" ? (
        <section className="pos-card-saas rounded-2xl p-5 sm:p-7 space-y-5 border-t-4 border-t-violet-500/50">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin text-violet-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            ขั้นตอนที่ 2: ระบบกำลังอ่านเอกสาร
          </h2>

          {capturedImg ? (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImg.dataUrl} alt="ภาพที่ถ่าย" className="w-full max-h-40 object-contain" />
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-violet-800 font-medium">{ocrPassLabel}</span>
              <span className="text-slate-400 tabular-nums">{ocrProgress}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ระบบจะลองอ่านหลายวิธี (MRZ zone, full image, binarize, enhance) เพื่อความแม่นยำสูงสุด
            </p>
          </div>

          <button
            type="button"
            onClick={() => resetAll()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden />
            กลับ / ยกเลิกการอ่าน (กลับไปถ่ายภาพ)
          </button>
        </section>
      ) : null}

      {tab === "camera" && step === "review" ? (
        <section className="pos-card-saas rounded-2xl p-4 sm:p-6 space-y-4 border-t-4 border-t-violet-500/50">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <PencilIcon className="h-5 w-5 text-violet-600" />
            ขั้นตอนที่ 3: ตรวจสอบผลลัพธ์
          </h2>

          {capturedImg ? (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImg.dataUrl} alt="ภาพที่ถ่าย" className="w-full max-h-36 object-contain" />
            </div>
          ) : null}

          {/* Manual NID input — always visible, prominent when OCR fails */}
          <div className={`rounded-xl p-4 space-y-3 ${
            !idResolved && !idScanLoading
              ? "bg-amber-50 border-2 border-amber-300"
              : "bg-slate-50 border border-slate-200"
          }`}>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                {!idResolved && !idScanLoading
                  ? "⚠️ OCR อ่านเลขบัตร ปชช. ไม่ชัด — กรุณาพิมพ์เลข 13 หลักเอง"
                  : "พิมพ์เลขบัตร ปชช. ด้วยตัวเอง (แม่นที่สุด)"}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                ดูเลข 13 หลักจากบัตรแล้วพิมพ์ตรงนี้ ระบบจะค้นหาสมาชิกได้แม่นยำ 100%
              </p>
            </div>
            <div className="flex gap-2">
              <input
                inputMode="numeric"
                maxLength={17}
                value={manualNid}
                onChange={(e) => setManualNid(e.target.value.replace(/[^0-9\s-]/g, ""))}
                placeholder="X XXXX XXXXX XX X"
                className="flex-1 h-12 px-4 rounded-xl border-2 border-violet-400 text-center text-lg font-mono tracking-widest tabular-nums focus:outline-none focus:ring-2 focus:ring-violet-300"
                autoFocus={!idResolved && !idScanLoading}
              />
              <button
                type="button"
                onClick={handleManualNidLookup}
                disabled={idScanLoading || manualNid.replace(/\D/g, "").length < 13}
                className="h-12 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors shrink-0"
              >
                {idScanLoading ? "…" : "ค้นหา"}
              </button>
            </div>
          </div>

          {/* OCR text (collapsible) */}
          <details className="group">
            <summary className="text-[11px] text-slate-500 cursor-pointer hover:text-slate-700">
              ดูข้อความที่ OCR อ่านได้ (สำหรับ debug)
            </summary>
            <pre className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
              {ocrRawText || "(ไม่มีข้อความ)"}
            </pre>
          </details>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={resetAll}
              className="flex-1 h-11 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden />
              กลับไปถ่ายภาพใหม่
            </button>
          </div>
        </section>
      ) : null}

      {/* ════════ Card Reader Tab ════════ */}
      {tab === "cardreader" ? (
        <section className="pos-card-saas rounded-2xl p-4 sm:p-6 space-y-4 border-t-4 border-t-teal-500/50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5 text-teal-600" />
              ยืนยันตัวตนด้วยเครื่องเสียบบัตร
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              รองรับ 2 ระบบ: เครื่องอ่านบัตรแบบ USB (keyboard wedge) และเชื่อมต่อ Serial port โดยตรง
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-teal-50 text-[10px] font-medium text-teal-800">
                บัตร ปชช. ไทย (Smart Card)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-50 text-[10px] font-medium text-cyan-800">
                Passport Reader (MRZ)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600">
                Magnetic Stripe
              </span>
            </div>
          </div>

          <CardReaderListener
            active={tab === "cardreader"}
            onRead={handleCardRead}
            disabled={idScanLoading}
          />
        </section>
      ) : null}

      {/* ════════ Manual Tab ════════ */}
      {tab === "manual" ? (
        <section className="pos-card-saas rounded-2xl p-4 sm:p-6 space-y-4 border-t-4 border-t-blue-500/50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
              วาง MRZ หรือเลขบัตร ปชช.
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              วาง MRZ 2-3 บรรทัดจากพาสปอร์ต หรือเลข ปชช. ไทย 13 หลัก
            </p>
          </div>
          <textarea
            value={rawPaste}
            onChange={(e) => setRawPaste(e.target.value)}
            rows={5}
            placeholder={"ตัวอย่าง MRZ:\nP<USASMITH<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<\nAB12345674USA8001014M2501017<<<<<<<<<<<<<<04\n\nหรือเลข ปชช.: 1100600XXXXXX"}
            className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="button"
            onClick={handleManualSubmit}
            disabled={idScanLoading || !rawPaste.trim()}
            className="w-full h-12 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {idScanLoading ? "กำลังตรวจ…" : "ค้นหา / ตรวจเอกสาร"}
          </button>
        </section>
      ) : null}

      {/* ════════ Key Tab ════════ */}
      {tab === "key" ? (
        <section className="pos-card-saas rounded-2xl p-4 sm:p-6 space-y-4 border-t-4 border-t-amber-500/50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <KeyIcon className="h-5 w-5 text-amber-600" />
              ค้นหาด้วยคีย์ตรง
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              ใส่ identity key ที่ตรงกับฐานข้อมูล เช่น <code className="text-[10px] bg-slate-100 px-1 rounded">ICAO|TD3|USA|AB123456</code>
            </p>
          </div>
          <input
            value={scannerKey}
            onChange={(e) => setScannerKey(e.target.value)}
            placeholder="ICAO|TD3|USA|AB123456"
            className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-mono"
          />
          <input
            value={scannerFullName}
            onChange={(e) => setScannerFullName(e.target.value)}
            placeholder="ชื่อ (ไม่บังคับ)"
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
          />
          <button
            type="button"
            onClick={handleKeySubmit}
            disabled={idScanLoading || !scannerKey.trim()}
            className="w-full h-12 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {idScanLoading ? "กำลังค้นหา…" : "ค้นหาสมาชิก"}
          </button>
        </section>
      ) : null}

      {/* ════════ Messages ════════ */}
      {errorMsg ? (
        <div className="flex gap-3 items-start text-sm text-red-800 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <span className="break-words">{errorMsg}</span>
        </div>
      ) : null}
      {doneMsg && !errorMsg ? (
        <div className="flex gap-3 items-start text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          <CheckCircleIcon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <span className="break-words">{doneMsg}</span>
        </div>
      ) : null}

      {/* ════════ Enrollment Form (หลังค้นหา — ไม่แสดงค้างระหว่าง review + กำลังค้นหา) ════════ */}
      {step === "result" && idResolved && !member ? (
        <section className="pos-card-saas rounded-2xl p-4 sm:p-6 space-y-4 border-t-4 border-t-indigo-500/50">
          <button
            type="button"
            onClick={backFromEnrollToReview}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs font-medium text-indigo-900 hover:bg-indigo-100/80"
          >
            <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden />
            {tab === "camera" ?
              "กลับไปขั้นตอนตรวจผล (แก้เลข / ถ่ายใหม่)"
            : "กลับไปขั้นตอนก่อนหน้า"}
          </button>
          <div>
            <h2 className="text-sm font-semibold text-indigo-950 flex items-center gap-2">
              <IdentificationIcon className="h-5 w-5 text-indigo-600" />
              ยังไม่มีสมาชิก — สมัครให้เลย
            </h2>
            <div className="mt-2 rounded-lg bg-indigo-50/80 p-3 space-y-1 text-xs text-slate-600">
              <p>
                <span className="font-medium text-indigo-800">แหล่งข้อมูล:</span>{" "}
                {sourceLabel(idResolved)}
              </p>
              <p className="font-mono text-[10px] break-all text-slate-500">
                คีย์: {idResolved.identityKey}
              </p>
              {idResolved.source === "mrz" ? (
                <p>เลขเอกสาร: {idResolved.documentNumber} | ประเทศ: {idResolved.issuingState} | {idResolved.format}</p>
              ) : null}
              {idResolved.source === "th_national_id" ? (
                <p className="tabular-nums">เลข ปชช.: {idResolved.nationalId}</p>
              ) : null}
              {idResolved.source === "card_reader" && idResolved.nationalId ? (
                <p className="tabular-nums">เลข ปชช.: {idResolved.nationalId}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ชื่อ-นามสกุล
            </label>
            <input
              value={idEnrollName}
              onChange={(e) => setIdEnrollName(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">แก้ไขได้ถ้าชื่อจาก OCR ไม่ถูกต้อง</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              เบอร์โทร (ไม่บังคับ)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={idEnrollCountry}
                onChange={(e) => setIdEnrollCountry(e.target.value as CountryCode)}
                className="h-11 px-2 rounded-xl border border-slate-200 text-xs bg-white"
                aria-label="ประเทศเบอร์โทร"
              >
                {phoneCountryOptions.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.labelTh} (+{o.callingCode})
                  </option>
                ))}
              </select>
              <input
                inputMode="tel"
                value={idEnrollNational}
                onChange={(e) => setIdEnrollNational(e.target.value)}
                placeholder="เลขท้องถิ่น"
                className="h-11 px-3 rounded-xl border border-slate-200 text-sm tabular-nums"
              />
            </div>
          </div>

          {enrollError ? (
            <div className="flex gap-3 items-start text-sm text-red-800 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">สมัครไม่สำเร็จ!</p>
                <p className="text-xs mt-1 break-words">{enrollError}</p>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void enrollFromIdentity()}
            disabled={idEnrollLoading || !idEnrollName.trim()}
            className="w-full h-12 rounded-xl bg-indigo-700 text-white text-sm font-semibold hover:bg-indigo-800 disabled:opacity-50 transition-colors"
          >
            {idEnrollLoading ? "กำลังสมัคร…" : "สมัครสมาชิก"}
          </button>
        </section>
      ) : null}

      {/* ════════ Found / Enrolled Member ════════ */}
      {member ? (
        <section className="pos-card-saas rounded-2xl p-5 border-2 border-emerald-200 bg-emerald-50/40 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-8 w-8 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase text-emerald-700">ลูกค้าพร้อม</p>
              <p className="font-semibold text-slate-900 text-lg mt-0.5">{member.name}</p>
              <p className="text-xs text-slate-500 break-all">{member.email}</p>
              {member.phone && !isPlaceholderPhone(member.phone) ? (
                <p className="text-xs text-slate-700 tabular-nums mt-0.5">{member.phone}</p>
              ) : member.identity_lookup_key ? (
                <p className="text-xs text-slate-500 mt-0.5">ยืนยันด้วยเอกสาร</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              href={`/pos/exchange?memberId=${encodeURIComponent(member.id)}`}
              className="flex-1 inline-flex justify-center items-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              ไปแลกเงินกับลูกค้านี้ →
            </Link>
            <Link
              href={`/pos/customer/${member.id}`}
              className="inline-flex justify-center items-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ดูโปรไฟล์
            </Link>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex justify-center items-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 gap-1.5"
            >
              <ArrowPathIcon className="h-4 w-4" />
              แสกนคนใหม่
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
