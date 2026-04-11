"use client";

import { useState } from "react";
import SiteImage from "@/components/site/SiteImage";
import { useLanguage } from "@/lib/i18n";
import HeroFillImage from "@/components/site/HeroFillImage";

export default function FaqPage() {
  const { t } = useLanguage();
  const faqs = t.faqData.map((item) => ({ question: item.q, answer: item.a }));
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative z-0 min-h-[200px]">
        <HeroFillImage
          src="/FAQ/FAQ TOP Banner.png"
          alt="FAQ Banner"
          priority
          placeholderSize="1440×400"
        />
        <div className="absolute inset-0 bg-site-accent/40" />

        {/* Removed aspect ratio and fixed heights. Replaced with natural padding (py-16) to comfortably wrap text on mobile. */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 py-16 sm:py-20 lg:py-24">
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white drop-shadow-lg">
              {t.faq.heroTitle}
            </h1>
            <p className="mt-2 text-base sm:text-lg font-medium text-white drop-shadow-md">
              {t.faq.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ CONTENT */}
      <section className="bg-surface-0 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-site-accent">
            {t.faq.heroTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-surface-600 max-w-2xl">
            {t.faq.heroSubtitle}
          </p>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.4fr)] gap-8 lg:gap-10 items-start">
            {/* Left: Image + CTA card */}
            <div>
              <div className="rounded-2xl overflow-hidden bg-site-accent aspect-[3/4] relative">
                <SiteImage
                  src="/FAQ/FAQ Bottom.png"
                  alt="FAQ"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  placeholderSize="900×1200"
                />
              </div>

              <div className="mt-4 rounded-2xl bg-white shadow-[0_8px_20px_rgba(15,23,42,0.12)] px-6 py-5">
                <h3 className="text-base sm:text-lg font-bold text-surface-800">
                  {t.faq.moreQuestions}
                </h3>
                <p className="mt-1.5 text-sm text-surface-600">
                  {t.faq.moreQuestionsDesc}
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                  <a
                    href="tel:026113185"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-site-accent text-white text-sm font-semibold px-5 py-2.5 hover:bg-site-accent-hover transition-colors"
                  >
                    โทร 02-6113185
                  </a>
                  <a
                    href="https://lin.ee/mGYJgia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-site-accent text-site-accent text-sm font-semibold px-5 py-2.5 hover:bg-site-subtle transition-colors"
                  >
                    LINE Official @298ickaf
                  </a>
                </div>
              </div>
            </div>

            {/* Right: FAQ Accordion */}
            <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(15,23,42,0.12)] divide-y divide-[#E5E7EB]">
              {faqs.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={item.question}>
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-5 sm:px-6 py-4 text-left hover:bg-surface-50 transition-colors"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-site-subtle text-site-accent flex-shrink-0">
                        <span className="font-bold text-base">Q</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-semibold text-surface-800">
                          {item.question}
                        </p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-surface-400 flex-shrink-0 transition-transform duration-150 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-4 text-sm text-surface-600 leading-relaxed bg-surface-0">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
