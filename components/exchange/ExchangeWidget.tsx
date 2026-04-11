"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import TwemojiFlag from "@/components/ui/TwemojiFlag";
import {
  fetchCurrencies,
  fetchBranches,
  fetchBranchMargins,
  applyMarginsToRates,
  BranchInfo,
} from "@/lib/api";
import { CurrencyRate, RateData } from "@/lib/types/rate";
import { useLanguage } from "@/lib/i18n";

const REFRESH_INTERVAL = 30_000; // 30 seconds

const emptyRateData: RateData = { rates: [], lastUpdated: "", branch: "" };

function SmallChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TinyArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="18"
      viewBox="0 0 16 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0.898438 4.98568L10.3041 4.98568M10.3041 4.98568L6.88387 8.40592M10.3041 4.98568L6.88387 1.56543M0.898438 13.5363L14.5794 13.5363M14.5794 13.5363L11.1592 16.9565M14.5794 13.5363L11.1592 10.116"
        stroke="var(--site-accent)"
        strokeWidth="1.78935"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusMinusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx="3"
        stroke="#A7ADB6"
        strokeWidth="1.3"
      />
      <path
        d="M5 7.99996H11"
        stroke="#A7ADB6"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M8 5.00003V11"
        stroke="#A7ADB6"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CurrencyFlag({
  code,
  flag,
}: {
  code: string;
  flag?: string;
}) {
  const displayFlag = flag?.trim() || "💱";
  return (
    <div
      className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center shadow-[0_0_0_1px_rgba(0,0,0,0.04)] text-lg"
      aria-label={code}
      title={code}
    >
      <TwemojiFlag
        emoji={displayFlag}
        className="inline-flex items-center [&>img]:w-5 [&>img]:h-5"
      />
    </div>
  );
}

function CurrencyDropdown({
  rates,
  onSelect,
}: {
  rates: CurrencyRate[];
  onSelect: (code: string) => void;
}) {
  return (
    <div className="absolute z-30 mt-1 w-full rounded-xl border border-[#EFF0F2] bg-white shadow-lg max-h-64 overflow-auto">
      {rates.map((rate) => (
        <button
          key={rate.code}
          type="button"
          className="w-full flex items-center px-3 py-2.5 text-[13px] hover:bg-site-subtle cursor-pointer"
          onClick={() => onSelect(rate.code)}
        >
          <span className="flex items-center gap-2.5">
            <CurrencyFlag code={rate.code} flag={rate.flag} />
            <span className="font-semibold text-surface-700">{rate.code}</span>
            <span className="text-[12px] text-surface-500">{rate.name}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export default function ExchangeWidget({ maxRates = 14, defaultTab = "calc" as "rate" | "calc", externalCurrency }: { maxRates?: number; defaultTab?: "rate" | "calc"; externalCurrency?: string } = {}) {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<"rate" | "calc">(defaultTab);
  const [calcMode, setCalcMode] = useState<"toTHB" | "fromTHB">("toTHB");
  const [foreignCode, setForeignCode] = useState("USD");
  const [foreignOpen, setForeignOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [baseRateData, setBaseRateData] = useState<RateData>(emptyRateData);
  const [rateData, setRateData] = useState<RateData>(emptyRateData);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branchOpen, setBranchOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshRates = useCallback(async () => {
    const data = await fetchCurrencies(locale);
    if (data.rates.length > 0) {
      setBaseRateData(data);
    }
  }, [locale]);

  const displayBranchName = (b: BranchInfo | undefined) => {
    if (!b) return "";
    if (b.id === "head-office") return t.branch.headOfficeName;
    return locale === "th" ? b.name_th || b.name : b.name;
  };

  useEffect(() => {
    refreshRates().finally(() => setLoading(false));
    fetchBranches().then((data) => {
      setBranches(data);
    });

    const interval = setInterval(refreshRates, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refreshRates]);

  useEffect(() => {
    if (externalCurrency) {
      setActiveTab("calc");
      setCalcMode("toTHB");
      setForeignCode(externalCurrency);
      setAmount("");
    }
  }, [externalCurrency]);

  useEffect(() => {
    if (!selectedBranch) {
      setRateData(baseRateData);
      return;
    }
    fetchBranchMargins(selectedBranch).then((margins) => {
      if (margins.length === 0) {
        setRateData(baseRateData);
        return;
      }
      setRateData({
        ...baseRateData,
        rates: applyMarginsToRates(baseRateData.rates, margins),
        branch:
          branches.find((b) => b.id === selectedBranch)?.id === "head-office"
            ? t.branch.headOfficeName
            : locale === "th"
              ? branches.find((b) => b.id === selectedBranch)?.name_th ??
                baseRateData.branch
              : branches.find((b) => b.id === selectedBranch)?.name ??
                baseRateData.branch,
      });
    });
  }, [selectedBranch, baseRateData, branches, locale, t.branch.headOfficeName]);

  const topRates = rateData.rates.slice(0, maxRates);
  const activeRate = rateData.rates.find((r) => r.code === foreignCode);

  const fromCode = calcMode === "toTHB" ? foreignCode : "THB";
  const toCode = calcMode === "toTHB" ? "THB" : foreignCode;

  const numAmount = parseFloat(amount);
  const intl = locale === "cn" ? "zh-CN" : locale === "en" ? "en-GB" : "th-TH";
  const result = (() => {
    if (!activeRate || isNaN(numAmount) || numAmount <= 0) return "";
    if (calcMode === "toTHB") {
      // Customer sells foreign currency → receives THB (always 2 decimals)
      return (numAmount * activeRate.buy).toLocaleString(intl, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    // Customer pays THB → receives foreign currency
    const val = numAmount / activeRate.sell;
    return val.toLocaleString(intl, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  })();

  const rateText = (() => {
    if (!activeRate) return "—";
    const rate = calcMode === "toTHB" ? activeRate.buy : activeRate.sell;
    const decimals = rate < 0.1 ? 4 : rate < 10 ? 3 : 2;
    return `1 ${foreignCode} = ${rate.toFixed(decimals)} THB`;
  })();

  const handleSelectFromTable = (code: string) => {
    setActiveTab("calc");
    setCalcMode("toTHB");
    setForeignCode(code);
    setForeignOpen(false);
    setAmount("");
  };

  const handleModeSwitch = (mode: "toTHB" | "fromTHB") => {
    setCalcMode(mode);
    setForeignOpen(false);
    setAmount("");
  };

  return (
    <div>
      {/* Tabs */}
      <div className="inline-flex rounded-t-2xl overflow-hidden text-[13px] sm:text-[14px] ml-3 sm:ml-4">
        <button
          type="button"
          onClick={() => setActiveTab("rate")}
            className={[
              "px-4 sm:px-6 py-2 font-medium transition-colors cursor-pointer",
              activeTab === "rate"
                ? "bg-site-accent text-white"
                : "bg-site-subtle text-site-accent",
            ].join(" ")}
        >
          {t.widget.rateTab}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("calc")}
            className={[
              "px-4 sm:px-6 py-2 font-medium transition-colors cursor-pointer",
              activeTab === "calc"
                ? "bg-site-accent text-white"
                : "bg-[#F4F5F7] text-surface-500",
            ].join(" ")}
        >
          {t.widget.calcTab}
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm px-4 pt-5 pb-6 sm:px-7 sm:pt-6 sm:pb-7 lg:px-8 lg:pt-7 lg:pb-8">
        {activeTab === "rate" ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[1.45rem] font-bold text-surface-700 leading-snug">
                  {t.widget.latestRates}
                </div>
                <p className="mt-1 text-[14px] font-medium text-surface-700/80">
                  {t.widget.rateRanking}
                </p>
              </div>
              {branches.length > 0 && (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setBranchOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-xl border border-[#DDE0E5] bg-white px-3 py-2 text-[13px] cursor-pointer hover:border-site-accent transition-colors"
                  >
                    <svg className="w-4 h-4 text-site-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="font-medium text-surface-700">
                      {selectedBranch
                        ? displayBranchName(
                            branches.find((b) => b.id === selectedBranch),
                          ) || t.widget.branch
                        : t.widget.allBranchesGlobal}
                    </span>
                    <SmallChevronDown className="w-3.5 h-3.5 text-surface-400" />
                  </button>
                  {branchOpen && (
                    <div className="absolute z-30 mt-1 right-0 min-w-[200px] rounded-xl border border-[#EFF0F2] bg-white shadow-lg max-h-64 overflow-auto">
                      <button
                        type="button"
                        className={[
                          "w-full flex items-center px-3 py-2.5 text-[13px] hover:bg-site-subtle cursor-pointer",
                          !selectedBranch ? "bg-site-subtle font-semibold" : "",
                        ].join(" ")}
                        onClick={() => { setSelectedBranch(""); setBranchOpen(false); }}
                      >
                        <span className="text-surface-700">{t.widget.allBranchesGlobal}</span>
                      </button>
                      {branches.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          className={[
                            "w-full flex items-center px-3 py-2.5 text-[13px] hover:bg-site-subtle cursor-pointer",
                            selectedBranch === b.id ? "bg-site-subtle font-semibold" : "",
                          ].join(" ")}
                          onClick={() => { setSelectedBranch(b.id); setBranchOpen(false); }}
                        >
                          <span className="text-surface-700">
                            {displayBranchName(b)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Last updated + link */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-surface-400">
              <span>
                {t.widget.lastUpdated}{" "}
                <span className="font-medium text-surface-600">
                  {rateData.lastUpdated}
                </span>
                {selectedBranch && (
                  <span className="ml-2 text-site-accent font-medium">
                    (
                    {displayBranchName(
                      branches.find((b) => b.id === selectedBranch),
                    )}
                    )
                  </span>
                )}
              </span>
              <Link
                href="/exchange-rate"
                className="inline-flex items-center gap-1 text-[13px] text-site-accent hover:text-site-accent underline decoration-1 underline-offset-2"
              >
                <span>{t.widget.viewAll}</span>
                <TinyArrowRight />
              </Link>
            </div>

            {/* Rates table */}
            <div className="mt-5 rounded-2xl border border-[#EFF0F2] overflow-hidden bg-surface-0">
              <div className="flex items-center px-3 sm:px-4 py-2.5 text-[12px] sm:text-[13px] font-semibold text-white bg-site-accent">
                <span className="flex-1">{t.widget.currency}</span>
                <span className="hidden sm:block w-10" />
                <span className="w-16 sm:w-20 text-right">{t.widget.buy}</span>
                <span className="w-16 sm:w-20 text-right">{t.widget.sell}</span>
              </div>
              <div className="overflow-hidden">
                {topRates.map((rate) => (
                  <div
                    key={rate.code}
                    className="flex items-center px-3 sm:px-4 py-2.5 text-[12px] sm:text-[13px] border-t border-[#EFF0F2] hover:bg-site-subtle cursor-pointer"
                    onClick={() => handleSelectFromTable(rate.code)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectFromTable(rate.code);
                      }
                    }}
                  >
                    <div className="flex-1 flex items-center gap-2 sm:gap-3">
                      <CurrencyFlag code={rate.code} flag={rate.flag} />
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-medium text-surface-700">
                          {rate.code}
                        </span>
                        <span className="text-[10px] sm:text-xs text-surface-500 hidden sm:block">
                          {rate.name}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="hidden sm:flex w-8 h-8 rounded-md bg-surface-0 border border-[#EFF0F2] items-center justify-center mr-1 hover:bg-[#F4F5F7] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFromTable(rate.code);
                      }}
                      aria-label={t.widget.calcFor.replace("{code}", rate.code)}
                    >
                      <PlusMinusIcon className="w-4 h-4" />
                    </button>
                    <div className="w-16 sm:w-20 text-right text-xs sm:text-sm font-semibold text-site-accent">
                      {rate.buy.toFixed(2)}
                    </div>
                    <div className="w-16 sm:w-20 text-right text-xs sm:text-sm font-semibold text-site-accent">
                      {rate.sell.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-5">
              <div className="text-center sm:text-left">
                <div className="text-[1.45rem] font-bold text-surface-700 leading-snug">
                  {t.widget.calcTitle}
                </div>
                <p className="mt-1 text-[14px] font-medium text-surface-700/80">
                  {t.widget.calcSubtitle}
                </p>
              </div>
              {branches.length > 0 && (
                <div className="relative shrink-0 flex justify-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setBranchOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-xl border border-[#DDE0E5] bg-white px-3 py-2 text-[13px] cursor-pointer hover:border-site-accent transition-colors"
                  >
                    <svg className="w-4 h-4 text-site-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="font-medium text-surface-700">
                      {selectedBranch
                        ? displayBranchName(
                            branches.find((b) => b.id === selectedBranch),
                          ) || t.widget.branch
                        : t.widget.allBranchesGlobal}
                    </span>
                    <SmallChevronDown className="w-3.5 h-3.5 text-surface-400" />
                  </button>
                  {branchOpen && (
                    <div className="absolute z-30 mt-9 right-0 min-w-[200px] rounded-xl border border-[#EFF0F2] bg-white shadow-lg max-h-64 overflow-auto">
                      <button
                        type="button"
                        className={[
                          "w-full flex items-center px-3 py-2.5 text-[13px] hover:bg-site-subtle cursor-pointer",
                          !selectedBranch ? "bg-site-subtle font-semibold" : "",
                        ].join(" ")}
                        onClick={() => { setSelectedBranch(""); setBranchOpen(false); }}
                      >
                        <span className="text-surface-700">{t.widget.allBranchesGlobal}</span>
                      </button>
                      {branches.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          className={[
                            "w-full flex items-center px-3 py-2.5 text-[13px] hover:bg-site-subtle cursor-pointer",
                            selectedBranch === b.id ? "bg-site-subtle font-semibold" : "",
                          ].join(" ")}
                          onClick={() => { setSelectedBranch(b.id); setBranchOpen(false); }}
                        >
                          <span className="text-surface-700">
                            {displayBranchName(b)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Inner mode tabs */}
                <div className="inline-flex flex-wrap rounded-full bg-[#F4F5F7] p-1 text-[11px] sm:text-[13px] mb-5">
              <button
                type="button"
                onClick={() => handleModeSwitch("toTHB")}
                  className={[
                    "px-3 sm:px-4 py-1.5 rounded-full font-medium transition-colors cursor-pointer",
                    calcMode === "toTHB"
                      ? "bg-site-accent text-white"
                      : "text-surface-600",
                  ].join(" ")}
              >
                {t.widget.toTHB}
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch("fromTHB")}
                  className={[
                    "px-3 sm:px-4 py-1.5 rounded-full font-medium transition-colors cursor-pointer",
                    calcMode === "fromTHB"
                      ? "bg-site-accent text-white"
                      : "text-surface-600",
                  ].join(" ")}
              >
                {t.widget.fromTHB}
              </button>
            </div>

            {/* Calculator card */}
            <div className="mt-2 rounded-2xl border border-[#EFF0F2] bg-surface-0 px-4 py-5 sm:px-6 sm:py-6">
              {/* Currency row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6">
                {/* From currency */}
                <div className="relative flex-1">
                  {calcMode === "toTHB" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setForeignOpen((v) => !v)}
                        className="w-full flex items-center justify-between rounded-xl border border-[#DDE0E5] bg-white px-4 py-3 text-[14px] cursor-pointer hover:border-site-accent transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <CurrencyFlag code={foreignCode} flag={activeRate?.flag} />
                          <span className="font-semibold text-surface-700">{foreignCode}</span>
                        </span>
                        <SmallChevronDown className="w-3.5 h-3.5 text-surface-400" />
                      </button>
                      {foreignOpen && (
                        <CurrencyDropdown
                          rates={rateData.rates}
                          onSelect={(code) => { setForeignCode(code); setForeignOpen(false); }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full flex items-center rounded-xl border border-[#EFF0F2] bg-[#F9FAFB] px-4 py-3 text-[14px]">
                      <span className="flex items-center gap-2.5">
                        <CurrencyFlag code="THB" flag="🇹🇭" />
                        <span className="font-semibold text-surface-700">THB</span>
                        <span className="text-[12px] text-surface-400 ml-1">Thai Baht</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow / swap button */}
                <button
                  type="button"
                  onClick={() => handleModeSwitch(calcMode === "toTHB" ? "fromTHB" : "toTHB")}
                  className="flex items-center justify-center cursor-pointer group"
                  aria-label={t.widget.switchDirection}
                >
                  <div className="w-9 h-9 rounded-full bg-site-accent text-white flex items-center justify-center shadow-md group-hover:bg-site-accent-hover transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </button>

                {/* To currency */}
                <div className="relative flex-1">
                  {calcMode === "fromTHB" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setForeignOpen((v) => !v)}
                        className="w-full flex items-center justify-between rounded-xl border border-[#DDE0E5] bg-white px-4 py-3 text-[14px] cursor-pointer hover:border-site-accent transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <CurrencyFlag code={foreignCode} flag={activeRate?.flag} />
                          <span className="font-semibold text-surface-700">{foreignCode}</span>
                        </span>
                        <SmallChevronDown className="w-3.5 h-3.5 text-surface-400" />
                      </button>
                      {foreignOpen && (
                        <CurrencyDropdown
                          rates={rateData.rates}
                          onSelect={(code) => { setForeignCode(code); setForeignOpen(false); }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full flex items-center rounded-xl border border-[#EFF0F2] bg-[#F9FAFB] px-4 py-3 text-[14px]">
                      <span className="flex items-center gap-2.5">
                        <CurrencyFlag code="THB" flag="🇹🇭" />
                        <span className="font-semibold text-surface-700">THB</span>
                        <span className="text-[12px] text-surface-400 ml-1">Thai Baht</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount inputs */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-surface-600 mb-1.5">
                    {t.widget.amountLabel.replace("{code}", fromCode)}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-[#DDE0E5] bg-white px-4 py-2.5 text-[14px] text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-site-accent/70 focus:border-site-accent"
                    placeholder={t.widget.amountPlaceholder.replace("{code}", fromCode)}
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-surface-600 mb-1.5">
                    {t.widget.resultLabel.replace("{code}", toCode)}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={result}
                    className="w-full rounded-xl border border-[#EFF0F2] bg-[#F9FAFB] px-4 py-2.5 text-[14px] text-site-accent font-semibold"
                    placeholder={t.widget.resultPlaceholder}
                  />
                </div>
              </div>

              {/* Rate display */}
              <div className="mt-5 text-center">
                <div className="text-[14px] font-semibold text-site-accent">
                  {t.widget.exchangeRateLabel}
                </div>
                <div className="mt-1 text-[15px] font-bold text-surface-700">
                  {rateText}
                </div>
                <p className="mt-2 text-[12px] text-surface-500">
                  {t.widget.rateNote}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

