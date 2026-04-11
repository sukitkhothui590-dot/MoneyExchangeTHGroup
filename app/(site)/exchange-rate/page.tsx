"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { fetchCurrencies } from "@/lib/api";
import type { RateData } from "@/lib/types/rate";
import { useLanguage } from "@/lib/i18n";
import BranchNearbySection from "@/components/sections/BranchNearbySection";
import HeroFillImage from "@/components/site/HeroFillImage";
import ExchangeWidget from "@/components/exchange/ExchangeWidget";
import TwemojiFlag from "@/components/ui/TwemojiFlag";

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
      className="w-9 h-9 rounded-full bg-surface-0 flex items-center justify-center shadow-[0_0_0_1px_rgba(15,23,42,0.08)] shrink-0 text-xl"
      aria-label={code}
      title={code}
    >
      <TwemojiFlag
        emoji={displayFlag}
        className="inline-flex items-center [&>img]:w-6 [&>img]:h-6"
      />
    </div>
  );
}

function fmtRate(v: number) {
  if (v < 0.1) return v.toFixed(4);
  if (v < 10) return v.toFixed(3);
  return v.toFixed(2);
}

export default function ExchangeRatePage() {
  const { t, locale } = useLanguage();
  const [data, setData] = useState<RateData | null>(null);
  const [calcCurrency, setCalcCurrency] = useState<string | undefined>();
  const widgetRef = useRef<HTMLDivElement>(null);
  const calcBumpRef = useRef(0);

  const refreshRates = useCallback(async () => {
    const result = await fetchCurrencies(locale);
    if (result.rates.length > 0) {
      setData(result);
    }
  }, [locale]);

  useEffect(() => {
    refreshRates();
    const interval = setInterval(refreshRates, 30_000);
    return () => clearInterval(interval);
  }, [refreshRates]);

  const handleCalcClick = (code: string) => {
    calcBumpRef.current += 1;
    setCalcCurrency(`${code}:${calcBumpRef.current}`);
    widgetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (!data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-surface-600">
        {t.common.loading}
      </div>
    );
  }

  return (
    <>
      {/* Hero banner */}
      <section className="relative z-0 min-h-[220px] sm:min-h-[300px] lg:min-h-0" style={{ aspectRatio: "1440/560" }}>
        <HeroFillImage
          src="/exchangerate/Hero Banner Exchange Rate.png"
          alt="Exchange Rate Banner"
          priority
          placeholderSize="1440×560"
        />
        <div className="absolute inset-0 bg-site-accent/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 h-full flex items-start pt-10 sm:pt-14 lg:pt-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-[0.16em] uppercase text-white">
              MoneyExchangeTHGroup
            </p>
            <h1 className="mt-1 text-4xl sm:text-5xl lg:text-[52px] font-extrabold leading-tight text-white">
              Exchange rate
            </h1>
            <p className="mt-2 text-base sm:text-lg font-medium text-white/90">
              {t.exchange.heroTitle}
            </p>
          </div>
        </div>

      </section>

      {/* Exchange Widget — flows in the document, pulled up into hero via negative margin */}
      <div ref={widgetRef} className="relative z-30 -mt-10 sm:-mt-16 lg:-mt-[290px]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="max-w-[640px]">
            <ExchangeWidget externalCurrency={calcCurrency?.split(":")[0]} key={calcCurrency} />
          </div>
        </div>
      </div>

      {/* Rates table */}
      <section className="bg-surface-0 pt-8 sm:pt-10 lg:pt-12 pb-10 lg:pb-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 lg:mb-8">
            <div className="order-2 md:order-1 text-xs md:text-sm text-surface-500">
              <p>
                {t.widget.lastUpdated}{" "}
                <span className="font-semibold text-surface-700">
                  {data.lastUpdated}
                </span>
              </p>
            </div>

            <div className="order-1 md:order-2 md:text-right">
              <h2 className="mt-1 text-sm sm:text-base md:text-lg font-semibold text-surface-600">
                {t.exchange.tagline}
              </h2>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-site-accent leading-tight">
                {t.exchange.tableTitle}
              </h2>
              <p className="mt-1 text-xs sm:text-sm md:text-base text-surface-600">
                {t.exchange.tableSubtitle}
              </p>
            </div>
          </div>

          {/* Table card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]">
            {/* Orange header */}
            <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[2fr_1fr_1fr_1fr_100px] gap-x-3 sm:gap-x-2 px-3 sm:px-6 py-3.5 bg-site-accent text-white text-xs sm:text-sm font-semibold">
              <div>{t.widget.currency}</div>
              <div className="hidden sm:block text-right">{t.exchange.denomination}</div>
              <div className="text-right min-w-[52px] sm:min-w-0">
                {t.widget.buy} <span className="hidden sm:inline text-white/80">①</span>
              </div>
              <div className="text-right min-w-[52px] sm:min-w-0">
                {t.widget.sell} <span className="hidden sm:inline text-white/80">②</span>
              </div>
              <div className="hidden sm:block" />
            </div>

            {/* Body */}
            <div>
              {data.rates.map((rate, rIdx) => {
                const denoms = rate.denominations ?? [
                  { denom: "—", buy: rate.buy, sell: rate.sell },
                ];

                return (
                  <div
                    key={rate.code}
                    className={rIdx > 0 ? "border-t border-[#E5E7EB]" : ""}
                  >
                    {denoms.map((d, dIdx) => {
                      const isFirst = dIdx === 0;
                      return (
                        <div
                          key={`${rate.code}-${dIdx}`}
                          className={[
                            "grid grid-cols-[1fr_auto_auto] sm:grid-cols-[2fr_1fr_1fr_1fr_100px] gap-x-3 sm:gap-x-2 px-3 sm:px-6 items-center text-xs sm:text-sm",
                            isFirst ? "py-3" : "py-2",
                            dIdx > 0 ? "border-t border-[#F5F5F5]" : "",
                            "hover:bg-site-subtle transition-colors",
                          ].join(" ")}
                        >
                          {isFirst ? (
                            <div className="flex items-center gap-2 sm:gap-3">
                              <CurrencyFlag code={rate.code} flag={rate.flag} />
                              <div>
                                <span className="font-bold text-surface-800 text-sm sm:text-lg leading-tight">
                                  {rate.code}
                                </span>
                                <span className="hidden sm:inline ml-2 text-xs text-surface-400">
                                  {rate.name}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div />
                          )}

                          <div className="hidden sm:block text-right text-sm text-surface-700 tabular-nums font-medium">
                            {d.denom}
                          </div>

                          <div className="text-right font-semibold text-site-accent tabular-nums text-xs sm:text-sm min-w-[52px] sm:min-w-0">
                            {fmtRate(d.buy)}
                          </div>

                          <div className="text-right font-semibold text-site-accent tabular-nums text-xs sm:text-sm min-w-[52px] sm:min-w-0">
                            {fmtRate(d.sell)}
                          </div>

                          <div className="hidden sm:flex justify-end">
                            {isFirst ? (
                              <button
                                type="button"
                                onClick={() => handleCalcClick(rate.code)}
                                className="inline-flex items-center gap-1 rounded-lg bg-site-accent text-white text-xs font-semibold px-3.5 py-1.5 hover:bg-site-accent-hover transition-colors cursor-pointer"
                              >
                                {t.exchange.calculate}
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Note card */}
          <div className="mt-8 rounded-xl border border-[#E5E7EB] border-t-[3px] border-t-site-accent bg-white px-4 sm:px-6 py-5">
            <h3 className="text-sm font-bold text-surface-800 mb-3">{t.exchange.noteTitle}</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-surface-600 leading-relaxed">
              <li>{t.exchange.note1}</li>
              <li>{t.exchange.note2}</li>
              <li>{t.exchange.note3}</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Nearby branch section */}
      <BranchNearbySection />
    </>
  );
}
