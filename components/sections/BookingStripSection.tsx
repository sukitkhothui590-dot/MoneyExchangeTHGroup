"use client";

import React from "react";
import Link from "next/link";
import HeroFillImage from "@/components/site/HeroFillImage";
import { useLanguage } from "@/lib/i18n";

export default function BookingStripSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[160px] sm:min-h-[200px] lg:min-h-0" style={{ aspectRatio: "1440/300" }}>
      <HeroFillImage
        src="/exchangerate/Hero Banner Exchange Rate.png"
        alt="Exchange Rates"
        sizes="(max-width: 1536px) 100vw, 1440px"
        placeholderSize="1440×300"
      />
      <div className="absolute inset-0 bg-site-accent/35" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 h-full flex flex-col sm:flex-row justify-center sm:justify-between items-start sm:items-center gap-4 py-8 sm:py-0">
        <div className="text-white">
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-white/80">
            MoneyExchangeTHGroup
          </p>
          <h2 className="mt-1 text-2xl md:text-3xl font-bold">
            Exchange Rates
          </h2>
          <p className="mt-1 text-sm md:text-base font-medium text-white/80">
            {t.booking.stripText}
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full sm:w-auto min-w-0">
          <Link
            href="/customer"
            className="px-5 py-2.5 rounded-lg bg-white text-site-accent text-sm font-semibold hover:bg-site-subtle transition-colors shrink-0 text-center"
          >
            {t.booking.bookOnline}
          </Link>
          <Link
            href="/exchange-rate"
            className="px-6 py-2.5 rounded-lg border border-white text-white text-sm font-semibold hover:bg-white/10 transition-colors shrink-0 text-center"
          >
            {t.booking.viewRates}
          </Link>
        </div>
      </div>
    </section>
  );
}
