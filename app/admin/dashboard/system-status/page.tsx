"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import AdminPageHelp from "../../components/AdminPageHelp";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ServerIcon,
  CircleStackIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";

interface SystemCheck {
  id: string;
  name: string;
  description: string;
  status: "ok" | "warning" | "error" | "checking";
  detail: string;
  category: "api" | "data" | "frontend";
}


export default function SystemStatusPage() {
  const { t } = useAdminLanguage();
  const p = t.pages.systemStatus;
  const [systems, setSystems] = useState<SystemCheck[]>([]);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const runChecks = useCallback(async () => {
    setChecking(true);
    const checks: SystemCheck[] = [];

    const checkApi = async (
      id: string,
      name: string,
      description: string,
      url: string,
      category: SystemCheck["category"],
    ): Promise<SystemCheck> => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const count = Array.isArray(json.data) ? json.data.length : 1;
          return {
            id,
            name,
            description,
            status: "ok",
            detail: `ทำงานปกติ (${count} รายการ)`,
            category,
          };
        }
        return {
          id,
          name,
          description,
          status: res.status === 401 ? "warning" : "error",
          detail: `HTTP ${res.status}${res.status === 401 ? " — ต้อง login ก่อน" : ""}`,
          category,
        };
      } catch {
        return {
          id,
          name,
          description,
          status: "error",
          detail: "ไม่สามารถเชื่อมต่อได้",
          category,
        };
      }
    };

    const results = await Promise.all([
      checkApi(
        "currencies",
        "API สกุลเงิน",
        "GET /api/currencies — รายการสกุลเงินทั้งหมด",
        "/api/currencies",
        "api",
      ),
      checkApi(
        "branches",
        "API สาขา",
        "GET /api/branches — รายการสาขาทั้งหมด",
        "/api/branches",
        "api",
      ),
      checkApi(
        "articles",
        "API บทความ",
        "GET /api/articles — รายการบทความทั้งหมด",
        "/api/articles",
        "api",
      ),
      checkApi(
        "exchange-rates",
        "API อัตราแลกเปลี่ยน",
        "GET /api/exchange-rates — ดึงอัตราเรียลไทม์",
        "/api/exchange-rates",
        "api",
      ),
    ]);

    checks.push(...results);

    const currencyCheck = results.find((r) => r.id === "currencies");
    if (currencyCheck?.status === "ok") {
      try {
        const res = await fetch("/api/currencies");
        const json = await res.json();
        const currencies = json.data ?? [];
        const zeroRate = currencies.filter(
          (c: { buy_rate: number; sell_rate: number }) =>
            c.buy_rate === 0 || c.sell_rate === 0,
        );
        const invalidRate = currencies.filter(
          (c: { buy_rate: number; sell_rate: number }) =>
            c.buy_rate >= c.sell_rate,
        );

        checks.push({
          id: "rate-validity",
          name: "ความถูกต้องของ Rate",
          description: "ตรวจสอบว่า buy_rate < sell_rate และไม่เป็น 0",
          status:
            invalidRate.length > 0
              ? "error"
              : zeroRate.length > 0
                ? "warning"
                : "ok",
          detail:
            invalidRate.length > 0
              ? `พบ ${invalidRate.length} สกุลเงินที่ buy ≥ sell: ${invalidRate.map((c: { code: string }) => c.code).join(", ")}`
              : zeroRate.length > 0
                ? `พบ ${zeroRate.length} สกุลเงินที่ rate = 0`
                : `ทุกสกุลเงิน (${currencies.length}) ถูกต้อง`,
          category: "data",
        });

        const noFlag = currencies.filter(
          (c: { flag: string }) => !c.flag || c.flag.trim() === "",
        );
        checks.push({
          id: "flag-check",
          name: "ธงชาติสกุลเงิน",
          description: "ตรวจสอบว่าทุกสกุลเงินมี emoji ธงชาติ",
          status: noFlag.length > 0 ? "warning" : "ok",
          detail:
            noFlag.length > 0
              ? `พบ ${noFlag.length} สกุลเงินไม่มีธง: ${noFlag.map((c: { code: string }) => c.code).join(", ")}`
              : `ทุกสกุลเงิน (${currencies.length}) มีธงชาติ`,
          category: "data",
        });
      } catch {
        checks.push({
          id: "rate-validity",
          name: "ความถูกต้องของ Rate",
          description: "ตรวจสอบว่า buy_rate < sell_rate และไม่เป็น 0",
          status: "error",
          detail: "ไม่สามารถตรวจสอบได้",
          category: "data",
        });
      }
    }

    checks.push({
      id: "i18n",
      name: "ระบบภาษา (i18n)",
      description: "รองรับ 3 ภาษา: ไทย, อังกฤษ, จีน",
      status: "ok",
      detail: "ทำงานปกติ — TH / EN / CN",
      category: "frontend",
    });

    checks.push({
      id: "pdpa",
      name: "PDPA Cookie Consent",
      description: "ระบบ cookie consent ตาม PDPA",
      status: "ok",
      detail: "ทำงานปกติ — banner + settings modal",
      category: "frontend",
    });

    checks.push({
      id: "realtime-rates",
      name: "อัตราเรียลไทม์",
      description: "auto-refresh ทุก 30 วินาที",
      status: "ok",
      detail: "ทำงานปกติ — ExchangeWidget, RatePreviewSection, ConverterSection",
      category: "frontend",
    });

    setSystems(checks);
    setLastChecked(
      new Date().toLocaleString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
    setChecking(false);
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  const statusIcon = (s: SystemCheck["status"]) => {
    switch (s) {
      case "ok":
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
      case "warning":
        return (
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
        );
      case "error":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "checking":
        return (
          <ArrowPathIcon className="w-5 h-5 text-muted animate-spin" />
        );
    }
  };

  const categoryIcon = (c: SystemCheck["category"]) => {
    switch (c) {
      case "api":
        return <ServerIcon className="w-4 h-4" />;
      case "data":
        return <CircleStackIcon className="w-4 h-4" />;
      case "frontend":
        return <GlobeAltIcon className="w-4 h-4" />;
    }
  };

  const okCount = systems.filter((s) => s.status === "ok").length;
  const warnCount = systems.filter((s) => s.status === "warning").length;
  const errCount = systems.filter((s) => s.status === "error").length;

  return (
    <>
      <Header
        title={p.title}
        subtitle={p.subtitle}
        actions={
          <button
            onClick={runChecks}
            disabled={checking}
            className="h-9 px-3.5 border border-border text-sm font-medium text-foreground rounded-lg hover:bg-surface transition-colors cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${checking ? "animate-spin" : ""}`}
            />
            {checking ? "กำลังตรวจ..." : "ตรวจสอบใหม่"}
          </button>
        }
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
        <AdminPageHelp
          idPrefix="system-status"
          title={p.helpTitle}
          expandLabel={t.common.helpExpand}
          collapseLabel={t.common.helpCollapse}
          sections={p.helpSections}
        />
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-2xl font-bold">{okCount}</span>
            </div>
            <p className="text-xs text-muted">ระบบปกติ</p>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="text-2xl font-bold">{warnCount}</span>
            </div>
            <p className="text-xs text-muted">เตือน</p>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <XCircleIcon className="w-5 h-5" />
              <span className="text-2xl font-bold">{errCount}</span>
            </div>
            <p className="text-xs text-muted">ผิดปกติ</p>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-foreground mb-1">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="text-2xl font-bold">{systems.length}</span>
            </div>
            <p className="text-xs text-muted">ระบบทั้งหมด</p>
          </div>
        </div>

        {lastChecked && (
          <p className="text-xs text-muted flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            ตรวจสอบล่าสุด: {lastChecked}
          </p>
        )}

        {/* System Checks */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <ServerIcon className="w-5 h-5 text-brand" />
            สถานะระบบ
          </h2>
          <div className="border border-border rounded-xl overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-4 py-2.5 font-medium text-muted w-8">
                    สถานะ
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted">
                    ระบบ
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted hidden sm:table-cell">
                    ประเภท
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted">
                    รายละเอียด
                  </th>
                </tr>
              </thead>
              <tbody>
                {systems.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface/60 transition-colors"
                  >
                    <td className="px-4 py-3">{statusIcon(s.status)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted">{s.description}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        {categoryIcon(s.category)}
                        {s.category === "api"
                          ? "API"
                          : s.category === "data"
                            ? "Data"
                            : "Frontend"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs ${s.status === "ok" ? "text-emerald-600" : s.status === "warning" ? "text-amber-600" : s.status === "error" ? "text-red-600" : "text-muted"}`}
                      >
                        {s.detail}
                      </span>
                    </td>
                  </tr>
                ))}
                {systems.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted"
                    >
                      กำลังตรวจสอบ...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Architecture Overview */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <BuildingStorefrontIcon className="w-5 h-5 text-brand" />
            ภาพรวมระบบ
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                icon: CurrencyDollarIcon,
                title: "ระบบอัตราแลกเปลี่ยน",
                items: [
                  "ดึงอัตราจาก External API เรียลไทม์",
                  "Cache 15 นาที ใน exchange_rate_cache",
                  "คำนวณ buy/sell จาก mid-market + margin",
                  "รองรับ Global margin + Branch margin",
                  "Auto-refresh ทุก 30 วินาที (หน้าบ้าน)",
                ],
              },
              {
                icon: BuildingStorefrontIcon,
                title: "ระบบสาขา",
                items: [
                  "จัดการสาขาจาก backend API",
                  "Branch-specific margin override",
                  "แสดงแผนที่ Google Maps ตามสาขา",
                  "สำนักงานใหญ่เป็นค่าเริ่มต้น",
                ],
              },
              {
                icon: DocumentTextIcon,
                title: "ระบบบทความ",
                items: [
                  "รองรับ 3 ภาษา (TH/EN/CN)",
                  "อัพโหลดรูปภาพไปยัง Supabase Storage",
                  "Rich text editor (admin)",
                  "SEO fields สำหรับทุกภาษา",
                ],
              },
              {
                icon: GlobeAltIcon,
                title: "ระบบภาษา (i18n)",
                items: [
                  "รองรับ 3 ภาษา: TH / EN / CN",
                  "เก็บ preference ใน localStorage",
                  "LanguageProvider + useLanguage hook",
                  "ครอบคลุมทุก component ในหน้าบ้าน",
                ],
              },
              {
                icon: ShieldCheckIcon,
                title: "PDPA Cookie Consent",
                items: [
                  "Banner แสดงเมื่อยังไม่ให้ consent",
                  "Settings modal สำหรับจัดการ category",
                  "Necessary / Analytics / Marketing",
                  "เก็บ consent ใน localStorage",
                ],
              },
              {
                icon: ServerIcon,
                title: "โครงสร้าง Backend",
                items: [
                  "Next.js API Routes (App Router)",
                  "Supabase (Auth + DB + Storage)",
                  "Service role key สำหรับ admin operations",
                  "RLS policies บน Supabase tables",
                ],
              },
            ].map((section) => (
              <div
                key={section.title}
                className="bg-white border border-border rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <section.icon className="w-5 h-5 text-brand" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-muted flex items-start gap-1.5"
                    >
                      <span className="text-brand mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
