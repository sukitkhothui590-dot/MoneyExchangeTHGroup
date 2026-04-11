"use client";

import SiteImage from "@/components/site/SiteImage";
import { useLanguage } from "@/lib/i18n";
import BranchNearbySection from "@/components/sections/BranchNearbySection";
import HeroFillImage from "@/components/site/HeroFillImage";

const imgBase =
  "/exchangerate/หน้า Money Exchange/LINE_ALBUM_ภาพประกอบ_260307_";

const stepImages = [
  `${imgBase}4.jpg`,
  `${imgBase}8.jpg`,
  `${imgBase}11.jpg`,
  `${imgBase}1.jpg`,
  `${imgBase}6.jpg`,
  `${imgBase}12.jpg`,
];

export default function SprMoneyExchangePage() {
  const { t } = useLanguage();

  const steps = [
    {
      step: "01",
      title: t.moneyExchange.step1Title,
      desc: t.moneyExchange.step1Desc,
      img: stepImages[0],
    },
    {
      step: "02",
      title: t.moneyExchange.step2Title,
      desc: t.moneyExchange.step2Desc,
      img: stepImages[1],
    },
    {
      step: "03",
      title: t.moneyExchange.step3Title,
      desc: t.moneyExchange.step3Desc,
      img: stepImages[2],
    },
    {
      step: "04",
      title: t.moneyExchange.step4Title,
      desc: t.moneyExchange.step4Desc,
      img: stepImages[3],
    },
    {
      step: "05",
      title: t.moneyExchange.step5Title,
      desc: t.moneyExchange.step5Desc,
      img: stepImages[4],
    },
    {
      step: "06",
      title: t.moneyExchange.step6Title,
      desc: t.moneyExchange.step6Desc,
      img: stepImages[5],
    },
  ];

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative z-0 min-h-[200px]">
        <HeroFillImage
          src="/serviceMoney/Service Money Exchange.png"
          alt="Money Exchange"
          priority
          placeholderSize="1440×560"
        />
        <div className="absolute inset-0 bg-site-accent/40" />

        {/* Removed rigid aspect ratio and used padding to establish natural height */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 pt-16 pb-28 sm:pt-20 sm:pb-36 lg:pt-28 lg:pb-44 flex items-start">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-[0.16em] uppercase text-white/80">
              MoneyExchangeTHGroup
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl lg:text-[48px] font-extrabold leading-tight text-white">
              Money Exchange
            </h1>
            <p className="mt-2 text-base sm:text-lg font-medium text-white/90">
              {t.moneyExchange.heroTitle}
            </p>
          </div>
        </div>
      </section>

      {/* OVERLAPPING INFO CARD: Removed absolute positioning and spacer div. Uses negative margin to pull it up so it never covers the text below it on mobile. */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 lg:px-6 -mt-16 sm:-mt-24 flex justify-center">
        {/* Added text-center sm:text-left for better mobile reading */}
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-[0_16px_40px_rgba(15,23,42,0.16)] px-6 sm:px-8 py-6 sm:py-8 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-site-accent">
            Money Exchange
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            {t.moneyExchange.pageTitle}
          </p>
          <p className="mt-3 text-sm sm:text-base text-surface-600 leading-relaxed">
            {t.moneyExchange.pageDesc}
          </p>
        </div>
      </div>

      {/* STEPS SECTION */}
      {/* Adjusted padding top to accommodate the overlap card properly without relying on a fixed spacer */}
      <section className="bg-surface-0 pt-16 pb-10 lg:pt-20 lg:pb-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-center text-lg sm:text-xl font-bold text-surface-800 mb-8 lg:mb-10">
            {t.moneyExchange.stepsTitle}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((s) => (
              <div key={s.step} className="group">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-100 border border-[#E5E7EB]">
                  <SiteImage
                    src={s.img}
                    alt={s.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                    placeholderSize="400×400"
                  />
                </div>
                {/* Step info */}
                <div className="mt-4">
                  <p className="flex items-center gap-2 text-site-accent font-bold text-base">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-site-accent text-white text-[10px] font-bold">
                      ✓
                    </span>
                    Step {s.step}
                  </p>
                  <h3 className="mt-1.5 text-xl sm:text-lg font-bold text-surface-800">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm sm:text-sm text-surface-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER SECTION */}
      <section className="relative z-0 overflow-hidden min-h-[200px]">
        <HeroFillImage
          src="/serviceMoney/Service Money Exchange Bot.png"
          alt="Exchange Rates CTA"
          placeholderSize="1440×320"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-site-accent/70 to-site-accent/50" />

        {/* Removed inline aspect ratio. Replaced with py-12/16/20 to naturally wrap the content height. */}
        <div className="relative z-10 w-full flex items-center max-w-7xl mx-auto px-4 lg:px-6 py-12 sm:py-16 lg:py-20">
          <div className="w-full max-w-lg mx-auto sm:ml-auto sm:mr-0 text-center sm:text-right">
            <p className="text-sm font-semibold tracking-[0.16em] uppercase text-white/80">
              MoneyExchangeTHGroup
            </p>
            <h2 className="mt-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Exchange Rates
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/90">
              {t.moneyExchange.ctaTitle}
            </p>

            {/* Made button full-width on mobile for better touch targets */}
            <div className="mt-6 flex flex-col sm:flex-row items-center sm:justify-end">
              <a
                href="/exchange-rate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white text-white text-sm font-semibold px-5 py-2.5 hover:bg-white hover:text-site-accent transition-colors"
              >
                {t.moneyExchange.ctaBtn}
                <svg
                  className="w-4 h-4"
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
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Branch nearby */}
      <BranchNearbySection />
    </>
  );
}
