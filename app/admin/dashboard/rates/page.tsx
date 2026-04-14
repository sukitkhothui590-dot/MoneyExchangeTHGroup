"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import Header from "../../components/Header";
import AdminPageHelp from "../../components/AdminPageHelp";
import RateTable from "../../components/RateTable";
import BranchMarginTable from "../../components/BranchMarginTable";
import MarginModal from "../../components/MarginModal";
import AddCurrencyModal from "../../components/AddCurrencyModal";
import type { Currency, Branch, BranchMarginEntry } from "@/lib/types/database";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  CloudArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";

export default function RatesPage() {
  const { t } = useAdminLanguage();
  const p = t.pages.rates;
  const { showToast } = useToast();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("global");
  const [branchMargins, setBranchMargins] = useState<BranchMarginEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchLoading, setBranchLoading] = useState(false);
  const [showMarginModal, setShowMarginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [pullingRates, setPullingRates] = useState(false);
  const [pendingCurrencyCodes, setPendingCurrencyCodes] = useState<string[]>([]);
  const [pendingBranchMarginCodes, setPendingBranchMarginCodes] = useState<string[]>([]);
  const pendingCurrencyRef = useRef<Set<string>>(new Set());
  const pendingBranchMarginRef = useRef<Set<string>>(new Set());

  const startPendingUpdate = (
    ref: MutableRefObject<Set<string>>,
    setter: Dispatch<SetStateAction<string[]>>,
    code: string,
  ) => {
    if (ref.current.has(code)) {
      return false;
    }
    ref.current.add(code);
    setter((prev) => (prev.includes(code) ? prev : [...prev, code]));
    return true;
  };

  const finishPendingUpdate = (
    ref: MutableRefObject<Set<string>>,
    setter: Dispatch<SetStateAction<string[]>>,
    code: string,
  ) => {
    ref.current.delete(code);
    setter((prev) => prev.filter((item) => item !== code));
  };

  const fetchCurrencies = useCallback(
    async (showErrorToast = false) => {
      try {
        const res = await fetch("/api/currencies");
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          if (showErrorToast) {
            showToast(
              "warn",
              "โหลดอัตราแลกเปลี่ยนไม่สำเร็จ",
              json.error ?? "กรุณาลองใหม่",
            );
          }
          return false;
        }

        const json = await res.json();
        setCurrencies(json.data ?? []);
        return true;
      } catch {
        if (showErrorToast) {
          showToast(
            "warn",
            "โหลดอัตราแลกเปลี่ยนไม่สำเร็จ",
            "เกิดข้อผิดพลาดในการเชื่อมต่อ",
          );
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch("/api/branches");
      if (res.ok) {
        const json = await res.json();
        setBranches(json.data ?? []);
      }
    } catch {}
  }, []);

  const fetchBranchMargins = useCallback(
    async (branchId: string, showErrorToast = false) => {
      setBranchLoading(true);
      try {
        const res = await fetch(`/api/branches/${branchId}/margins`);
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          if (showErrorToast) {
            showToast(
              "warn",
              "โหลดมาร์จิ้นสาขาไม่สำเร็จ",
              json.error ?? "กรุณาลองใหม่",
            );
          }
          return false;
        }

        const json = await res.json();
        setBranchMargins(json.data?.margins ?? []);
        return true;
      } catch {
        if (showErrorToast) {
          showToast(
            "warn",
            "โหลดมาร์จิ้นสาขาไม่สำเร็จ",
            "เกิดข้อผิดพลาดในการเชื่อมต่อ",
          );
        }
        return false;
      } finally {
        setBranchLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchCurrencies();
    fetchBranches();
  }, [fetchCurrencies, fetchBranches]);

  useEffect(() => {
    if (selectedBranch !== "global") {
      fetchBranchMargins(selectedBranch);
    }
  }, [selectedBranch, fetchBranchMargins]);

  const handleUpdateCurrency = async (index: number, updated: Currency) => {
    if (
      !startPendingUpdate(
        pendingCurrencyRef,
        setPendingCurrencyCodes,
        updated.code,
      )
    ) {
      return;
    }

    const prev = [...currencies];
    const next = [...currencies];
    next[index] = updated;
    setCurrencies(next);

    try {
      const res = await fetch(`/api/currencies/${updated.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buy_rate: updated.buy_rate,
          sell_rate: updated.sell_rate,
          buy_margin_percent: updated.buy_margin_percent,
          sell_margin_percent: updated.sell_margin_percent,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setCurrencies(prev);
        showToast(
          "warn",
          "อัปเดตสกุลเงินไม่สำเร็จ",
          json.error ?? "กรุณาลองใหม่",
        );
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (json?.data?.code) {
        setCurrencies((cur) =>
          cur.map((c) => (c.code === json.data.code ? json.data : c)),
        );
      }
    } catch {
      setCurrencies(prev);
      showToast(
        "warn",
        "อัปเดตสกุลเงินไม่สำเร็จ",
        "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      );
    } finally {
      finishPendingUpdate(
        pendingCurrencyRef,
        setPendingCurrencyCodes,
        updated.code,
      );
    }
  };

  const handleUpdateBranchMargin = async (
    currencyCode: string,
    buyMargin: number,
    sellMargin: number,
  ) => {
    if (
      !startPendingUpdate(
        pendingBranchMarginRef,
        setPendingBranchMarginCodes,
        currencyCode,
      )
    ) {
      return;
    }

    // Optimistic update
    setBranchMargins((prev) =>
      prev.map((m) =>
        m.currency_code === currencyCode
          ? {
              ...m,
              buy_margin_percent: buyMargin,
              sell_margin_percent: sellMargin,
              is_override: true,
            }
          : m,
      ),
    );

    try {
      const res = await fetch(`/api/branches/${selectedBranch}/margins`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency_code: currencyCode,
          buy_margin_percent: buyMargin,
          sell_margin_percent: sellMargin,
        }),
      });
      if (!res.ok) {
        // Revert on failure
        await fetchBranchMargins(selectedBranch);
        const json = await res.json().catch(() => ({}));
        showToast(
          "warn",
          "บันทึกมาร์จิ้นสาขาไม่สำเร็จ",
          json.error ?? "กรุณาลองใหม่",
        );
      }
    } catch {
      await fetchBranchMargins(selectedBranch);
      showToast(
        "warn",
        "บันทึกมาร์จิ้นสาขาไม่สำเร็จ",
        "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      );
    } finally {
      finishPendingUpdate(
        pendingBranchMarginRef,
        setPendingBranchMarginCodes,
        currencyCode,
      );
    }
  };

  const handleApplyGlobalMargin = async (
    buyMargin: number,
    sellMargin: number,
  ) => {
    const precision = 1_000_000;

    const recalculateGlobalRates = (currency: Currency) => {
      const buyRate =
        Math.round(
          currency.buy_rate *
            (1 + (buyMargin - (currency.buy_margin_percent || 0)) / 100) *
            precision,
        ) / precision;
      const sellRate =
        Math.round(
          currency.sell_rate *
            (1 + (sellMargin - (currency.sell_margin_percent || 0)) / 100) *
            precision,
        ) / precision;

      return { buyRate, sellRate };
    };

    if (selectedBranch === "global") {
      // Apply to all currencies globally
      const prev = [...currencies];
      setCurrencies((cur) =>
        cur.map((c) => {
          const { buyRate, sellRate } = recalculateGlobalRates(c);
          return {
            ...c,
            buy_rate: buyRate,
            sell_rate: sellRate,
            buy_margin_percent: buyMargin,
            sell_margin_percent: sellMargin,
          };
        }),
      );

      try {
        const results = await Promise.all(
          currencies.map(async (c) => {
            const { buyRate, sellRate } = recalculateGlobalRates(c);
            const res = await fetch(`/api/currencies/${c.code}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                buy_rate: buyRate,
                sell_rate: sellRate,
                buy_margin_percent: buyMargin,
                sell_margin_percent: sellMargin,
              }),
            });
            return res;
          }),
        );

        const failed = results.find((res) => !res.ok);
        if (failed) {
          const json = await failed.json().catch(() => ({}));
          setCurrencies(prev);
          showToast(
            "warn",
            "ตั้งมาร์จิ้นรวมไม่สำเร็จ",
            json.error ?? "กรุณาลองใหม่",
          );
          return;
        }

        showToast("success", "ตั้งมาร์จิ้นรวมสำเร็จ", "ระบบคำนวณอัตราใหม่แล้ว");
      } catch {
        setCurrencies(prev);
        showToast(
          "warn",
          "ตั้งมาร์จิ้นรวมไม่สำเร็จ",
          "เกิดข้อผิดพลาดในการเชื่อมต่อ",
        );
      }
    } else {
      // Apply to all currencies for this branch
      const marginUpdates = branchMargins.map((m) => ({
        currency_code: m.currency_code,
        buy_margin_percent: buyMargin,
        sell_margin_percent: sellMargin,
      }));

      setBranchMargins((prev) =>
        prev.map((m) => ({
          ...m,
          buy_margin_percent: buyMargin,
          sell_margin_percent: sellMargin,
          is_override: true,
        })),
      );

      try {
        const res = await fetch(`/api/branches/${selectedBranch}/margins`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ margins: marginUpdates }),
        });
        if (!res.ok) {
          await fetchBranchMargins(selectedBranch);
          const json = await res.json().catch(() => ({}));
          showToast(
            "warn",
            "ตั้งมาร์จิ้นสาขาไม่สำเร็จ",
            json.error ?? "กรุณาลองใหม่",
          );
          return;
        }
        await fetchBranchMargins(selectedBranch);
        showToast("success", "ตั้งมาร์จิ้นสาขาสำเร็จ");
      } catch {
        await fetchBranchMargins(selectedBranch);
        showToast(
          "warn",
          "ตั้งมาร์จิ้นสาขาไม่สำเร็จ",
          "เกิดข้อผิดพลาดในการเชื่อมต่อ",
        );
      }
    }
  };

  const handleDeleteCurrency = async (code: string) => {
    const prev = [...currencies];
    setCurrencies((cur) => cur.filter((c) => c.code !== code));

    try {
      const res = await fetch(`/api/currencies/${code}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setCurrencies(prev);
        showToast("warn", "ลบสกุลเงินไม่สำเร็จ", json.error ?? "กรุณาลองใหม่");
        return;
      }
      showToast("success", `ลบสกุลเงิน ${code} สำเร็จ`);
    } catch {
      setCurrencies(prev);
      showToast("warn", "ลบสกุลเงินไม่สำเร็จ", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleAddCurrency = async (currency: Currency) => {
    try {
      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: currency.code,
          name: currency.name,
          flag: currency.flag,
          buy_rate: currency.buy_rate,
          sell_rate: currency.sell_rate,
          buy_margin_percent: currency.buy_margin_percent,
          sell_margin_percent: currency.sell_margin_percent,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setCurrencies((prev) => [...prev, created.data]);
        showToast("success", "เพิ่มสกุลเงินสำเร็จ");
      } else {
        const json = await res.json().catch(() => ({}));
        showToast(
          "warn",
          "เพิ่มสกุลเงินไม่สำเร็จ",
          json.error ?? "กรุณาลองใหม่",
        );
      }
    } catch {
      showToast(
        "warn",
        "เพิ่มสกุลเงินไม่สำเร็จ",
        "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      );
    }
  };

  const handleReorder = async (reordered: Currency[]) => {
    const prev = [...currencies];
    setCurrencies(reordered);

    try {
      const res = await fetch("/api/currencies/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: reordered.map((c) => c.code),
        }),
      });
      if (!res.ok) {
        setCurrencies(prev);
        const json = await res.json().catch(() => ({}));
        showToast("warn", "จัดลำดับไม่สำเร็จ", json.error ?? "กรุณาลองใหม่");
      }
    } catch {
      setCurrencies(prev);
      showToast("warn", "จัดลำดับไม่สำเร็จ", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  /** ดึงจาก Frankfurter แบบบังคับ + เพิ่มสกุลที่ยังไม่มีในตาราง (เฉพาะ admin) */
  const handlePullNewRates = async () => {
    setPullingRates(true);
    try {
      const res = await fetch(
        "/api/exchange-rates?force=1&syncCurrencies=1",
        { cache: "no-store" },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(
          "warn",
          "ดึงเรทใหม่ไม่สำเร็จ",
          (json.error as string) ?? "กรุณาลองใหม่",
        );
        return;
      }
      const added = (json.data?.synced_currencies?.added ?? []) as string[];
      const reloaded = await fetchCurrencies(true);
      if (!reloaded) return;
      if (selectedBranch !== "global") {
        await fetchBranchMargins(selectedBranch, true);
      }
      showToast(
        "success",
        "ดึงเรทใหม่สำเร็จ",
        added.length > 0
          ? `เพิ่มสกุลใหม่: ${added.join(", ")}`
          : "อัปเดตเรทกลางแล้ว — ไม่มีสกุลใหม่ (มีครบในตารางแล้ว)",
      );
    } catch {
      showToast(
        "warn",
        "ดึงเรทใหม่ไม่สำเร็จ",
        "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      );
    } finally {
      setPullingRates(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Fetch live exchange rates first
      const res = await fetch("/api/exchange-rates?refresh=1", {
        cache: "no-store",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        showToast("warn", "รีเฟรชอัตราไม่สำเร็จ", json.error ?? "กรุณาลองใหม่");
        setLoading(false);
        return;
      }
      // Then reload currencies
      const reloadedCurrencies = await fetchCurrencies(true);
      if (!reloadedCurrencies) {
        return;
      }
      // If on a branch view, also reload branch margins
      if (selectedBranch !== "global") {
        const reloadedBranchMargins = await fetchBranchMargins(
          selectedBranch,
          true,
        );
        if (!reloadedBranchMargins) {
          return;
        }
      }
      showToast("success", "รีเฟรชอัตราแลกเปลี่ยนสำเร็จ");
    } catch {
      setLoading(false);
      showToast("warn", "รีเฟรชอัตราไม่สำเร็จ", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const selectedBranchObj = branches.find((b) => b.id === selectedBranch);
  const branchDisplayName =
    selectedBranch === "global"
      ? "ค่ากลาง (ทุกสาขา)"
      : `${selectedBranchObj?.name} (${selectedBranchObj?.name_th})`;

  if (loading) {
    return (
      <>
        <Header title={p.titleLoading} subtitle={p.subtitleLoading} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted">{t.common.loadingData}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={p.title}
        subtitle={p.subtitle}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handlePullNewRates()}
              disabled={pullingRates}
              title="บังคับดึงเรทจาก API ล่าสุด และเพิ่มสกุลเงินที่ยังไม่มีในตาราง (ต้องเป็นแอดมิน)"
              className="h-9 px-3.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CloudArrowDownIcon className="w-4 h-4 shrink-0" />
              {pullingRates ? "กำลังดึงเรท…" : "ดึงเรทใหม่"}
            </button>
            <button
              type="button"
              onClick={() => void handleRefresh()}
              className="h-9 px-3.5 border border-border text-sm font-medium text-foreground rounded-lg hover:bg-surface transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              รีเฟรช
            </button>
            <button
              onClick={() => setShowMarginModal(true)}
              className="h-9 px-3.5 border border-border text-sm font-medium text-foreground rounded-lg hover:bg-surface transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              ตั้งมาร์จิ้นรวม
            </button>
            {selectedBranch === "global" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="h-9 px-3.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                เพิ่มสกุลเงิน
              </button>
            )}
          </div>
        }
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <AdminPageHelp
          idPrefix="rates"
          title={p.helpTitle}
          expandLabel={t.common.helpExpand}
          collapseLabel={t.common.helpCollapse}
          sections={p.helpSections}
        />

        {/* Branch Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            <BuildingStorefrontIcon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            เลือกสาขา
          </label>
          <div className="relative w-full max-w-sm">
            <button
              type="button"
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="w-full flex items-center justify-between h-10 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground hover:border-border-strong transition-colors cursor-pointer"
            >
              <span
                className={
                  selectedBranch === "global"
                    ? "text-foreground font-medium"
                    : "text-foreground"
                }
              >
                {branchDisplayName}
              </span>
              <ChevronDownIcon
                className={`w-4 h-4 text-muted transition-transform duration-200 ${
                  branchDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {branchDropdownOpen && (
              <div className="absolute z-30 mt-1 w-full rounded-lg border border-border bg-white shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBranch("global");
                    setBranchDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm hover:bg-surface cursor-pointer transition-colors ${
                    selectedBranch === "global"
                      ? "text-brand font-semibold bg-brand-subtle"
                      : "text-foreground"
                  }`}
                >
                  ค่ากลาง (ทุกสาขา)
                </button>
                <div className="border-t border-border" />
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => {
                      setSelectedBranch(branch.id);
                      setBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-sm hover:bg-surface cursor-pointer transition-colors ${
                      selectedBranch === branch.id
                        ? "text-brand font-semibold bg-brand-subtle"
                        : "text-foreground"
                    }`}
                  >
                    {branch.name} ({branch.name_th})
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedBranch !== "global" && (
            <p className="mt-2 text-xs text-muted">
              กำลังแสดงมาร์จิ้นเฉพาะสาขา &ldquo;{selectedBranchObj?.name}&rdquo;
              — สกุลเงินที่ไม่ได้กำหนดจะใช้ค่ากลาง
            </p>
          )}
        </div>

        {/* Table: Global or Branch-specific */}
        {selectedBranch === "global" ? (
          <RateTable
            currencies={currencies}
            onUpdateCurrency={handleUpdateCurrency}
            onDeleteCurrency={handleDeleteCurrency}
            onReorder={handleReorder}
            pendingCurrencyCodes={pendingCurrencyCodes}
          />
        ) : branchLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-muted">กำลังโหลดมาร์จิ้นสาขา...</p>
          </div>
        ) : (
          <BranchMarginTable
            margins={branchMargins}
            branchName={branchDisplayName}
            onUpdateMargin={handleUpdateBranchMargin}
            pendingCurrencyCodes={pendingBranchMarginCodes}
          />
        )}
      </div>

      <MarginModal
        isOpen={showMarginModal}
        onClose={() => setShowMarginModal(false)}
        onApply={handleApplyGlobalMargin}
        branchName={selectedBranch !== "global" ? branchDisplayName : undefined}
      />

      <AddCurrencyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCurrency}
        existingCodes={currencies.map((c) => c.code)}
      />
    </>
  );
}
