"use client";

import SiteImage from "@/components/site/SiteImage";
import { useLanguage } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useLanguage();
  const partnersTitle = t.about.partnersTitle;
  const partnersTitleBreakIndex = partnersTitle.indexOf("(");
  const partnersTitleLine1 =
    partnersTitleBreakIndex > 0
      ? partnersTitle.slice(0, partnersTitleBreakIndex).trim()
      : partnersTitle;
  const partnersTitleLine2 =
    partnersTitleBreakIndex > 0
      ? partnersTitle.slice(partnersTitleBreakIndex).trim()
      : "";

  return (
    <>
      {/* Hero */}
      <section className="relative z-0 bg-site-accent py-12 sm:py-16 lg:py-20">
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold leading-tight text-white">
              {t.about.heroTitle}
            </h1>
            <p className="mt-3 text-sm sm:text-base lg:text-lg font-medium text-white/90">
              {t.about.heroDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: History + main image + highlight stat */}
      <section className="bg-surface-0 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] gap-10 lg:gap-14 items-stretch">
          {/* Left image */}
          <div className="flex">
            <div className="relative rounded-2xl overflow-hidden bg-surface-50 border border-[#E5E7EB] w-full min-h-[240px] lg:min-h-[320px]">
              <SiteImage
                src="/หน้าเกี่ยวกับ/28040.jpg"
                alt={t.about.historySection}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
                placeholderSize="800×600"
              />
            </div>
          </div>

          {/* Right content */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-site-accent">
              {t.about.historyTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-surface-700 leading-relaxed">
              {t.about.historyText}
            </p>
            <p className="mt-3 text-sm sm:text-base text-surface-700 leading-relaxed">
              {t.about.historyGoal}
            </p>
            <p className="mt-3 text-sm sm:text-base text-surface-700 leading-relaxed">
              {t.about.historyFuture}
            </p>

            <div className="mt-6 rounded-2xl bg-site-subtle px-5 py-4">
              <p className="text-sm font-semibold text-site-accent mb-1">
                {t.about.officeLabel}
              </p>
              <p className="text-xs sm:text-sm text-surface-700 leading-relaxed">
                {t.about.officeAddress}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Metrics cards */}
      <section className="bg-white py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {/* Section title */}
          <div className="text-center mb-10">
            <p className="text-lg sm:text-xl font-semibold text-surface-700">
              {t.about.strengthTitle}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-site-accent">
              {t.about.strengthBrand}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl border border-[#F0E0D0] bg-white overflow-hidden shadow-sm">
              <div className="bg-gradient-to-br from-site-accent to-site-accent px-5 py-7 text-center text-white min-h-[170px] flex flex-col items-center justify-center">
                <p className="text-sm font-semibold tracking-wide">
                  {t.about.expLabel}
                </p>
                <p className="mt-1 text-5xl font-extrabold leading-none">
                  10<span className="text-3xl align-top">+</span>
                </p>
                <p className="mt-1 text-base font-semibold">
                  {t.about.expYears}
                </p>
              </div>
              <div className="px-5 py-5 text-center">
                <p className="text-sm font-bold text-site-accent mb-2">
                  {t.about.expTitle}
                </p>
                <p className="text-xs text-surface-500 leading-relaxed">
                  {t.about.expDesc}
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-[#F0E0D0] bg-white overflow-hidden shadow-sm">
              <div className="bg-gradient-to-br from-site-accent to-site-accent px-5 py-7 text-center text-white min-h-[170px] flex flex-col items-center justify-center">
                <p className="text-sm font-semibold tracking-wide">
                  {t.about.branchLabel}
                </p>
                <p className="mt-2 text-lg font-bold leading-snug">
                  {t.about.branchCount}
                </p>
              </div>
              <div className="px-5 py-5 text-center">
                <p className="text-sm font-bold text-site-accent mb-2">
                  {t.about.branchTitle}
                </p>
                <p className="text-xs text-surface-500 leading-relaxed">
                  {t.about.branchDesc}
                </p>
              </div>
            </div>

            {/* Card 3 - บริการด้วยใจ */}
            <div className="rounded-2xl border border-[#F0E0D0] bg-white overflow-hidden shadow-sm">
              <div className="bg-gradient-to-br from-site-accent to-site-accent px-5 py-8 text-center text-white flex flex-col items-center justify-center min-h-[170px]">
                <SiteImage
                  src="/0235.png"
                  alt={t.about.serviceLabel}
                  width={120}
                  height={120}
                  className="h-14 w-auto mb-2 mx-auto"
                />
                <p className="mt-1.5 text-lg font-extrabold">
                  {t.about.serviceLabel}
                </p>
              </div>
              <div className="px-5 py-5 text-center">
                <p className="text-sm font-bold text-site-accent mb-2">
                  {t.about.serviceTitle}
                </p>
                <p className="text-xs text-surface-500 leading-relaxed">
                  {t.about.serviceDesc}
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-[#F0E0D0] bg-white overflow-hidden shadow-sm">
              <div className="bg-gradient-to-br from-site-accent to-site-accent px-5 py-7 text-center text-white min-h-[170px] flex flex-col items-center justify-center">
                <p className="text-sm font-semibold tracking-wide">
                  {t.about.staffLabel}
                </p>
                <p className="mt-2 text-lg font-bold leading-snug">
                  {t.about.staffCount}
                </p>
              </div>
              <div className="px-5 py-5 text-center">
                <p className="text-sm font-bold text-site-accent mb-2">
                  {t.about.staffTitle}
                </p>
                <p className="text-xs text-surface-500 leading-relaxed">
                  {t.about.staffDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Vision & Mission */}
      <section className="bg-[#F8FAFB] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-site-accent">
                {t.about.visionTitle}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-surface-700 leading-relaxed">
                {t.about.visionText}
              </p>

              <h2 className="mt-8 text-2xl sm:text-3xl font-bold text-site-accent">
                {t.about.missionTitle}
              </h2>
              <ol className="mt-3 space-y-2 text-sm sm:text-base text-surface-700 leading-relaxed list-decimal list-inside">
                <li>{t.about.mission1}</li>
                <li>{t.about.mission2}</li>
                <li>{t.about.mission3}</li>
                <li>{t.about.mission4}</li>
              </ol>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg mx-auto max-w-[90%]">
              <SiteImage
                src="/หน้าเกี่ยวกับ/2.png"
                alt={t.about.visionTitle}
                width={1200}
                height={800}
                className="w-full h-auto"
                sizes="(max-width: 1024px) 90vw, 42vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Key Strengths */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-lg mx-auto max-w-[90%]">
              <SiteImage
                src="/หน้าเกี่ยวกับ/3.png"
                alt={t.about.keyStrengthsTitle}
                width={1200}
                height={800}
                className="w-full h-auto"
                sizes="(max-width: 1024px) 90vw, 42vw"
              />
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-site-accent">
                {t.about.keyStrengthsTitle}
              </h2>
              <ul className="mt-4 space-y-3">
                {[
                  t.about.strength1,
                  t.about.strength2,
                  t.about.strength3,
                  t.about.strength4,
                  t.about.strength5,
                  t.about.strength6,
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm sm:text-base text-surface-700"
                  >
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-site-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Our Services */}
      <section className="bg-[#F8FAFB] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-site-accent">
                {t.about.ourServicesTitle}
              </h2>
              <ul className="mt-4 space-y-3">
                {[
                  t.about.service1,
                  t.about.service2,
                  t.about.service3,
                  t.about.service4,
                  t.about.service5,
                  t.about.service6,
                  t.about.service7,
                  t.about.service8,
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm sm:text-base text-surface-700"
                  >
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-site-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg mx-auto max-w-[90%]">
              <SiteImage
                src="/หน้าเกี่ยวกับ/4.png"
                alt={t.about.ourServicesTitle}
                width={1200}
                height={800}
                className="w-full h-auto"
                sizes="(max-width: 1024px) 90vw, 42vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Vision of chairman */}
      <section className="bg-site-accent py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {t.about.chairmanTitle}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/90 leading-relaxed">
            {t.about.chairmanText1}
          </p>
          <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
            {t.about.chairmanText2}
          </p>
          <div className="mt-5">
            <p className="text-xs text-white/80">{t.about.chairmanRole}</p>
          </div>
        </div>
      </section>

      {/* Section: Clients & Partners */}
      <section className="bg-[#F8FAFB] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-site-accent">
              <span className="sm:hidden block">{partnersTitleLine1}</span>
              <span className="sm:hidden block">
                {partnersTitleLine2 || "\u00A0"}
              </span>
              <span className="hidden sm:inline">{partnersTitle}</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-surface-600">
              {t.about.partnersSubtitle}
            </p>
          </div>

          {/* COMBINED GRID: Single array handles the wrapping flawlessly. */}
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-3xl">
              {[
                { name: "Agoda", logo: "/about/Agoda_logo_2019.svg.png" },
                { name: "Booking.com", logo: "/about/booking.jpg" },
                { name: "Expedia", logo: "/about/Expedia_2012_logo.svg.png" },
                { name: "HotelBeds", logo: "/about/hb_logo_7.png" },
                {
                  name: "GM Holidays",
                  logo: "/about/gmholidays_720_px_removebg_preview.webp",
                },
                { name: "Meituan", logo: "/about/meituan-img.webp" },
              ].map((p) => (
                <div
                  key={p.name}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-4 sm:p-6 h-24 sm:h-28 hover:shadow-md transition-shadow"
                >
                  <SiteImage
                    src={p.logo}
                    alt={p.name}
                    width={150}
                    height={56}
                    className="max-h-12 sm:max-h-14 max-w-[120px] sm:max-w-[150px] w-auto h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section: Security & Compliance */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <SiteImage
                src="/หน้าเกี่ยวกับ/unnamed.jpg"
                alt={t.about.securityTitle}
                width={1200}
                height={800}
                className="w-full h-auto"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-site-accent">
                {t.about.securityTitle}
              </h2>

              <ul className="mt-5 space-y-3">
                {[
                  t.about.security1,
                  t.about.security2,
                  t.about.security3,
                  t.about.security4,
                  t.about.security5,
                  t.about.security6,
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm sm:text-base text-surface-700"
                  >
                    <svg
                      className="mt-1 w-4 h-4 text-site-accent shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Bottom CTA cards */}
      <section className="bg-surface-0 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <a
            href="/exchange-rate"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-site-accent to-site-accent px-6 py-8 sm:px-8 sm:py-9 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
              MoneyExchangeTHGroup
            </p>
            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold">
              {t.about.ctaRateTitle}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-white/90 max-w-sm">
              {t.about.ctaRateDesc}
            </p>
            <span className="mt-4 inline-flex items-center text-sm font-semibold">
              {t.about.ctaDetail}
              <svg
                className="ml-2 w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
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
            </span>
          </a>

          <a
            href="/spr-money-transfer"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-site-accent to-site-accent px-6 py-8 sm:px-8 sm:py-9 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
              MoneyExchangeTHGroup
            </p>
            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold">
              {t.about.ctaTransferTitle}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-white/90 max-w-sm">
              {t.about.ctaTransferDesc}
            </p>
            <span className="mt-4 inline-flex items-center text-sm font-semibold">
              {t.about.ctaDetail}
              <svg
                className="ml-2 w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
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
            </span>
          </a>
        </div>
      </section>
    </>
  );
}
