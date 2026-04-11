"use client";

import SiteImage from "@/components/site/SiteImage";
import { useLanguage } from "@/lib/i18n";
import BranchNearbySection from "@/components/sections/BranchNearbySection";
import HeroFillImage from "@/components/site/HeroFillImage";

const imgBase =
  "/exchangerate/หน้า Money Exchange/LINE_ALBUM_ภาพประกอบ_260307_";

const sendStepImages = [
  `${imgBase}4.jpg`,
  `${imgBase}3.jpg`,
  `${imgBase}5.jpg`,
  `${imgBase}7.jpg`,
];

const receiveStepImages = [
  `${imgBase}2.jpg`,
  `${imgBase}1.jpg`,
  `${imgBase}10.jpg`,
  `${imgBase}6.jpg`,
];

function StepCard({
  step,
  title,
  desc,
  img,
}: {
  step: string;
  title: string;
  desc: string;
  img: string;
}) {
  return (
    <div className="group">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-100 border border-[#E5E7EB]">
        <SiteImage
          src={img}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover"
          placeholderSize="400×400"
        />
      </div>
      <div className="mt-4">
        <p className="flex items-center gap-2 text-site-accent font-bold text-base">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-site-accent text-white text-[10px] font-bold">
            ✓
          </span>
          Step {step}
        </p>

        <h3 className="mt-1.5 text-xl sm:text-lg font-bold text-surface-800">
          {title}
        </h3>
        <p className="mt-1 text-base sm:text-sm text-surface-500 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function SprMoneyTransferPage() {
  const { t } = useLanguage();

  const sendSteps = [
    {
      step: "01",
      title: t.moneyTransfer.sendStep1Title,
      desc: t.moneyTransfer.sendStep1Desc,
      img: sendStepImages[0],
    },
    {
      step: "02",
      title: t.moneyTransfer.sendStep2Title,
      desc: t.moneyTransfer.sendStep2Desc,
      img: sendStepImages[1],
    },
    {
      step: "03",
      title: t.moneyTransfer.sendStep3Title,
      desc: t.moneyTransfer.sendStep3Desc,
      img: sendStepImages[2],
    },
    {
      step: "04",
      title: t.moneyTransfer.sendStep4Title,
      desc: t.moneyTransfer.sendStep4Desc,
      img: sendStepImages[3],
    },
  ];

  const receiveSteps = [
    {
      step: "01",
      title: t.moneyTransfer.recvStep1Title,
      desc: t.moneyTransfer.recvStep1Desc,
      img: receiveStepImages[0],
    },
    {
      step: "02",
      title: t.moneyTransfer.recvStep2Title,
      desc: t.moneyTransfer.recvStep2Desc,
      img: receiveStepImages[1],
    },
    {
      step: "03",
      title: t.moneyTransfer.recvStep3Title,
      desc: t.moneyTransfer.recvStep3Desc,
      img: receiveStepImages[2],
    },
    {
      step: "04",
      title: t.moneyTransfer.recvStep4Title,
      desc: t.moneyTransfer.recvStep4Desc,
      img: receiveStepImages[3],
    },
  ];

  const benefits = [
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: t.moneyTransfer.feeTitle,
      desc: t.moneyTransfer.feeDesc,
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: t.moneyTransfer.safeTitle,
      desc: t.moneyTransfer.safeDesc,
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      title: t.moneyTransfer.proTitle,
      desc: t.moneyTransfer.proDesc,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative z-0 min-h-[200px]">
        <HeroFillImage
          src="/ranfer/Money Tranfer.png"
          alt="Money Transfer"
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
              Money Transfer
            </h1>
            <p className="mt-2 text-base sm:text-lg font-medium text-white/90">
              {t.moneyTransfer.coverageTitle}
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-20 max-w-7xl mx-auto px-4 lg:px-6 -mt-16 sm:-mt-24 flex justify-center">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-[0_16px_40px_rgba(15,23,42,0.16)] px-6 sm:px-8 py-6 sm:py-8 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-site-accent">
            Money Transfer
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            {t.moneyTransfer.pageTitle}
          </p>
          <p className="mt-3 text-sm sm:text-base text-surface-600 leading-relaxed">
            {t.moneyTransfer.pageDesc}
          </p>
        </div>
      </div>

      {/* Send steps */}
      <section className="bg-surface-0 pt-16 pb-10 lg:pt-20 lg:pb-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-center text-lg sm:text-xl font-bold text-surface-800 mb-8 lg:mb-10">
            {t.moneyTransfer.sendStepsTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {sendSteps.map((s) => (
              <StepCard
                key={s.step}
                step={s.step}
                title={s.title}
                desc={s.desc}
                img={s.img}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Receive steps */}
      <section className="bg-[#F0FDFA] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-center text-lg sm:text-xl font-bold text-surface-800 mb-8 lg:mb-10">
            {t.moneyTransfer.receiveStepsTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {receiveSteps.map((s, i) => (
              <StepCard
                key={s.step}
                step={String(i + 1).padStart(2, "0")}
                title={s.title}
                desc={s.desc}
                img={s.img}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-surface-0 py-14 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 lg:px-6">
          <div className="space-y-8">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-full bg-site-subtle border-2 border-site-accent text-site-accent flex items-center justify-center shrink-0">
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-surface-800">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-sm text-surface-500 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branch nearby */}
      <BranchNearbySection />
    </>
  );
}
