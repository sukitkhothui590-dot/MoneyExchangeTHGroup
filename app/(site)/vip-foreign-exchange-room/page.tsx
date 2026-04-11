"use client";

import BranchNearbySection from "@/components/sections/BranchNearbySection";
import HeroFillImage from "@/components/site/HeroFillImage";
import { useLanguage } from "@/lib/i18n";

function StepCard({
  step,
  label,
  title,
  desc,
}: {
  step: string;
  label: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="group rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 text-site-accent font-bold text-sm">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-site-accent text-white text-[11px] font-bold">
          {step}
        </span>
        {label}
      </p>
      <h3 className="mt-3 text-base font-bold text-surface-800">{title}</h3>
      <p className="mt-2 text-sm text-surface-500 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function VipForeignExchangeRoomPage() {
  const { t } = useLanguage();
  const v = t.vipRoom;

  const steps = [
    { step: "01", title: v.step1Title, desc: v.step1Desc },
    { step: "02", title: v.step2Title, desc: v.step2Desc },
    { step: "03", title: v.step3Title, desc: v.step3Desc },
    { step: "04", title: v.step4Title, desc: v.step4Desc },
  ];

  const audiences = [
    { title: v.aud1Title, desc: v.aud1Desc },
    { title: v.aud2Title, desc: v.aud2Desc },
    { title: v.aud3Title, desc: v.aud3Desc },
    { title: v.aud4Title, desc: v.aud4Desc },
  ];

  const benefits = [
    { title: v.ben1Title, desc: v.ben1Desc },
    { title: v.ben2Title, desc: v.ben2Desc },
    { title: v.ben3Title, desc: v.ben3Desc },
  ];

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative z-0 min-h-[200px]">
        <HeroFillImage
          src="/all-service/3.png"
          alt={v.heroTitle}
          priority
          placeholderSize="1440×560"
        />
        <div className="absolute inset-0 bg-site-accent/45" />

        {/* Removed aspect ratio, using padding to dictate height naturally */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 pt-16 pb-28 sm:pt-20 sm:pb-36 lg:pt-28 lg:pb-44">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-[0.16em] uppercase text-white/80">
              {v.heroSubLabel}
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl lg:text-[48px] font-extrabold leading-tight text-white">
              {v.heroTitle}
            </h1>
            <p className="mt-2 text-base sm:text-lg font-medium text-white/90">
              {v.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* OVERLAPPING CARD: Removed absolute positioning and spacer div. Uses a negative margin (-mt) to pull it up over the hero section cleanly. */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 lg:px-6 -mt-16 sm:-mt-24 flex justify-center">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-[0_16px_40px_rgba(15,23,42,0.16)] px-6 sm:px-8 py-6 sm:py-8">
          <h2 className="text-xl sm:text-2xl font-bold text-site-accent">
            {v.cardTitle}
          </h2>
          <p className="mt-1 text-sm text-surface-500">{v.cardSubtitle}</p>
          <p className="mt-3 text-sm sm:text-base text-surface-600 leading-relaxed">
            {v.cardDesc}
          </p>
        </div>
      </div>

      {/* STEPS SECTION */}
      <section className="bg-surface-0 pt-16 pb-10 lg:pt-20 lg:pb-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-center text-lg sm:text-xl font-bold text-surface-800 mb-8 lg:mb-10">
            {v.stepsTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((item) => (
              <StepCard
                key={item.step}
                step={item.step}
                label={v.stepsLabel}
                title={item.title}
                desc={item.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCES SECTION */}
      <section className="bg-[#F0FDFA] py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-center text-lg sm:text-xl font-bold text-surface-800 mb-8 lg:mb-10">
            {v.audienceTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {audiences.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white border border-[#E5E7EB] p-5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-site-subtle border-2 border-site-accent text-site-accent flex items-center justify-center text-lg font-bold">
                  ✓
                </div>
                <h3 className="mt-4 text-base font-bold text-surface-800">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-surface-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="bg-surface-0 py-14 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 lg:px-6">
          <div className="space-y-8">
            {benefits.map((item, index) => (
              <div key={item.title} className="flex gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-full bg-site-subtle border-2 border-site-accent text-site-accent flex items-center justify-center shrink-0 text-lg font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-surface-800">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-surface-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-white border border-[#E5E7EB] p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-site-accent">
              {v.detailTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-surface-700 leading-relaxed">
              {v.detailP1}
            </p>
            <p className="mt-4 text-sm sm:text-base text-surface-700 leading-relaxed">
              {v.detailP2}
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/all-service/3.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-site-accent/80 to-site-accent/55" />

        {/* Removed inline aspect ratio. Replaced with py-12/16/20 to ensure it naturally wraps the content height without overflowing. */}
        <div className="relative z-10 w-full flex items-center max-w-7xl mx-auto px-4 lg:px-6 py-12 sm:py-16 lg:py-20">
          <div className="w-full max-w-lg mx-auto sm:ml-auto sm:mr-0 text-center sm:text-right">
            <p className="text-sm font-semibold tracking-[0.16em] uppercase text-white/80">
              {v.ctaSubLabel}
            </p>

            <h2 className="mt-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              {v.ctaTitle}
            </h2>

            <p className="mt-2 text-sm sm:text-base text-white/90">
              {v.ctaDesc}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center sm:justify-end gap-3">
              <a
                href="tel:026113185"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white text-white text-sm font-semibold px-5 py-2.5 hover:bg-white hover:text-site-accent transition-colors"
              >
                {v.ctaPhone}
              </a>

              <a
                href="https://lin.ee/mGYJgia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white text-site-accent text-sm font-semibold px-5 py-2.5 hover:bg-site-subtle transition-colors"
              >
                {v.ctaLine}
              </a>
            </div>
          </div>
        </div>
      </section>

      <BranchNearbySection />
    </>
  );
}
