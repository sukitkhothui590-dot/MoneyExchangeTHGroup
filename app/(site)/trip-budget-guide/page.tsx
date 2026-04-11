"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function TripBudgetGuidePage() {
  const { t } = useLanguage();
  const { tripGuide } = t;

  const renderHighlightText = (text: string, highlight: string) => {
    if (!highlight) return text;
    const parts = text.split(highlight);
    if (parts.length === 1) return text;
    return (
      <>
        {parts[0]}
        <span className="font-bold text-site-accent">{highlight}</span>
        {parts.slice(1).join(highlight)}
      </>
    );
  };

  const quickStats = tripGuide.stats.items.map((item, idx) => ({
    ...item,
    cardClass:
      idx === 2
        ? "border border-[#E5E7EB] bg-[#FBFCFC]"
        : idx === 3
          ? "border border-[#D2EFEA] bg-[#F0FDFA]"
          : "border border-[#D2EFEA] bg-site-subtle",
  }));

  return (
    <>
      <section className="relative z-0 bg-gradient-to-br from-site-accent via-site-accent-hover to-site-accent-hover">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="absolute right-[8%] top-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 left-[12%] h-24 w-24 rounded-full bg-[#5EEAD4]/20 blur-2xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 pt-14 pb-24 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32">
          <div className="max-w-3xl text-white">
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] uppercase text-white/80">
                {tripGuide.hero.eyebrow}
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold leading-[1.15] sm:leading-[1.12]">
                {tripGuide.hero.title}
              </h1>
              <p className="mt-2 text-lg sm:text-xl text-white/90 font-medium">
                {tripGuide.hero.subtitle}
              </p>
              <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/85 leading-relaxed">
                {tripGuide.hero.desc}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {tripGuide.hero.chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-white/90 backdrop-blur-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 -mt-12 px-4 sm:-mt-16 lg:-mt-20">
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-[#E5E7EB] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:px-6 sm:py-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {quickStats.map((item) => (
              <div
                key={item.label}
                className={`group rounded-xl px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${item.cardClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-surface-500">{item.label}</p>
                  <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-site-accent shadow-sm">
                    {item.badge}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-site-accent">
                  {item.value}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-surface-500">
                  {item.hint}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-[#B8E6DE] bg-[#F8FCFB] px-4 py-3 text-sm text-surface-600">
            <span className="font-semibold text-site-accent">
              {tripGuide.stats.tipLabel}
            </span>{" "}
            {tripGuide.stats.tipText}
          </div>
        </div>
      </div>

      <section className="bg-surface-0 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-6 lg:gap-8">
            <div className="relative overflow-hidden rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-site-accent/5 blur-2xl" />
              <p className="text-sm font-semibold tracking-[0.14em] uppercase text-site-accent">
                {tripGuide.step1.label}
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-surface-800">
                {tripGuide.step1.title}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-surface-600 leading-relaxed">
                {tripGuide.step1.desc}
              </p>
              <div className="mt-5 rounded-2xl bg-gradient-to-r from-site-accent to-site-accent-hover px-5 py-5 text-white">
                <p className="text-sm font-semibold text-white/80">
                  {tripGuide.step1.formulaLabel}
                </p>
                <p className="mt-2 text-lg sm:text-xl font-bold leading-relaxed">
                  {tripGuide.step1.formulaText}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {tripGuide.step1.tags.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full bg-site-subtle px-3 py-1.5 text-xs font-medium text-site-accent"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-[#D2EFEA] p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="text-sm font-semibold tracking-[0.14em] uppercase text-site-accent">
                {tripGuide.quickSummary.eyebrow}
              </p>
              <h3 className="mt-2 text-xl sm:text-2xl font-bold text-surface-800">
                {tripGuide.quickSummary.title}
              </h3>
              <p className="mt-3 text-sm sm:text-base text-surface-600 leading-relaxed">
                {tripGuide.quickSummary.desc}
              </p>
              <ul className="mt-5 space-y-2.5 text-sm sm:text-base text-surface-700">
                {tripGuide.quickSummary.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-site-accent shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl border border-[#E5F3F0] bg-[#F8FCFB] px-4 py-4">
                <p className="text-xs font-semibold tracking-[0.14em] uppercase text-site-accent">
                  {tripGuide.quickSummary.mindsetLabel}
                </p>
                <p className="mt-2 text-sm sm:text-base text-surface-700 leading-relaxed">
                  {tripGuide.quickSummary.mindsetText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F7FBFB] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-surface-800">
              {tripGuide.example.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-surface-600 leading-relaxed">
              {tripGuide.example.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {tripGuide.example.items.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white border border-[#E5E7EB] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-site-accent">
                    {item.label}
                  </p>
                  <span className="rounded-full bg-site-subtle px-2.5 py-1 text-[10px] font-semibold text-site-accent">
                    {item.share}
                  </span>
                </div>
                <p className="mt-2 text-sm text-surface-500">{item.value}</p>
                <p className="mt-3 text-3xl font-extrabold text-surface-800">
                  {item.total}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E6F4F1]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-site-accent to-site-accent"
                    style={{ width: item.share }}
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-surface-500">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-white border border-[#D2EFEA] p-5 sm:p-6 shadow-sm">
            <p className="text-sm sm:text-base text-surface-700 leading-relaxed">
              {renderHighlightText(
                tripGuide.example.totalText,
                tripGuide.example.totalHighlight,
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-0 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="rounded-[28px] border border-[#D2EFEA] bg-[linear-gradient(135deg,#FFFFFF_0%,#F4FBF9_55%,#ECFDF5_100%)] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold tracking-[0.14em] uppercase text-site-accent">
                  {tripGuide.framework.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-surface-800">
                  {tripGuide.framework.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-surface-600 leading-relaxed">
                  {tripGuide.framework.desc}
                </p>
              </div>
              <div className="inline-flex items-center rounded-full border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-site-accent shadow-sm">
                {tripGuide.framework.badge}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tripGuide.framework.buckets.map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white bg-white/90 px-5 py-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-site-accent text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-site-accent">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-surface-800">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-surface-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-0 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="relative overflow-hidden rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-site-accent/5 blur-2xl" />
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-site-accent">
              {tripGuide.step2.label}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-surface-800">
              {tripGuide.step2.title}
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#D2EFEA] bg-site-subtle px-4 py-4">
                <p className="text-xs text-surface-500">{tripGuide.step2.cashLabel}</p>
                <p className="mt-1 text-2xl font-extrabold text-site-accent">
                  {tripGuide.stats.items[0]?.value ?? "40-60%"}
                </p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FBFCFC] px-4 py-4">
                <p className="text-xs text-surface-500">{tripGuide.step2.cardLabel}</p>
                <p className="mt-1 text-2xl font-extrabold text-surface-800">
                  {tripGuide.step2.cardValue}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm sm:text-base text-surface-600 leading-relaxed">
              {tripGuide.step2.cashHint}
            </p>
            <div className="mt-5 rounded-2xl border border-[#E5F3F0] bg-[#F8FCFB] px-4 py-4">
              <p className="text-sm font-semibold text-site-accent">
                {tripGuide.step2.insightTitle}
              </p>
              <p className="mt-2 text-sm text-surface-600 leading-relaxed">
                {tripGuide.step2.insightDesc}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-site-accent/10" />
            <p className="text-sm font-semibold tracking-[0.14em] uppercase text-site-accent">
              {tripGuide.step3.label}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-surface-800">
              {tripGuide.step3.title}
            </h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-[#D2EFEA] bg-site-subtle px-4 py-4">
                <p className="text-sm font-semibold text-site-accent">
                  {tripGuide.step3.option1}
                </p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FBFCFC] px-4 py-4">
                <p className="text-sm font-semibold text-surface-800">
                  {tripGuide.step3.option2}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm sm:text-base text-surface-600 leading-relaxed">
              {tripGuide.step3.desc}
            </p>
            <div className="mt-5 inline-flex items-center rounded-full bg-site-subtle px-3 py-1.5 text-xs font-semibold text-site-accent">
              {tripGuide.step3.badge}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F7FBFB] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-surface-800">
              {tripGuide.rateChecks.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-surface-600 leading-relaxed">
              {tripGuide.rateChecks.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {tripGuide.rateChecks.items.map((item, index) => (
              <div
                key={item.title}
                className="group rounded-2xl bg-white border border-[#E5E7EB] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-10 h-10 rounded-full bg-site-subtle border-2 border-site-accent text-site-accent flex items-center justify-center text-sm font-bold transition-transform duration-300 group-hover:scale-105">
                  {index + 1}
                </div>
                <p className="mt-4 text-sm sm:text-base font-semibold text-surface-800 leading-relaxed">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-surface-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-[#D2EFEA] bg-white p-5 shadow-sm">
            <p className="text-sm sm:text-base text-surface-700 leading-relaxed">
              {tripGuide.rateChecks.note}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-0 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] gap-6 lg:gap-8">
            <div className="rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="text-sm font-semibold tracking-[0.14em] uppercase text-site-accent">
                {tripGuide.step5.label}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-surface-800">
                {tripGuide.step5.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {tripGuide.step5.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm sm:text-base text-surface-700"
                  >
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-site-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-site-subtle border border-[#D2EFEA] p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="text-sm font-semibold tracking-[0.14em] uppercase text-site-accent">
                {tripGuide.emergency.eyebrow}
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-site-accent">
                {tripGuide.emergency.title}
              </h3>
              <p className="mt-4 text-sm sm:text-base text-surface-600 leading-relaxed">
                {tripGuide.emergency.desc}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {tripGuide.emergency.tags.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-site-accent shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-r from-site-accent to-site-accent-hover py-12 lg:py-16">
        <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-[#5EEAD4]/15 blur-3xl" />
        <div className="max-w-5xl mx-auto px-4 lg:px-6 text-white">
          <div className="relative rounded-2xl border border-white/15 bg-white/5 px-6 py-8 sm:px-8 backdrop-blur-sm">
            <h2 className="text-2xl sm:text-3xl font-bold">{tripGuide.cta.title}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {tripGuide.cta.chips.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {tripGuide.cta.highlights.map((h) => (
                <div key={h} className="rounded-xl bg-white/10 px-4 py-4 text-sm font-medium">
                  {h}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm sm:text-base text-white/85 leading-relaxed">
              {tripGuide.cta.desc}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/exchange-rate"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-site-accent text-sm font-semibold px-5 py-3 hover:bg-site-subtle transition-colors"
              >
                <span>{tripGuide.cta.rateBtn}</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white text-white text-sm font-semibold px-5 py-3 hover:bg-white/10 transition-colors"
              >
                <span>{tripGuide.cta.contactBtn}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
