"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import SiteImage from "@/components/site/SiteImage";
import ExchangeWidget from "@/components/exchange/ExchangeWidget";
import { useLanguage } from "@/lib/i18n";

const slides = [
  {
    id: 2,
    src: "/hero/2.png",
    titleKey: "slide1" as const,
    descKey: "slide1Desc" as const,
  },
  {
    id: 1,
    src: "/hero/1.png",
    titleKey: "slide2" as const,
    descKey: "slide1Desc" as const,
  },
  {
    id: 3,
    src: "/hero/3.png",
    titleKey: "slide3" as const,
    descKey: "slide3Desc" as const,
  },
];

const AUTOPLAY_MS = 4000;

function ArrowLeft({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

export default function HeroSection() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slideLabels = [t.hero.slide1, t.hero.slide2, t.hero.slide3];

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    setCurrent(0);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, current]);

  const widgetContent = <ExchangeWidget maxRates={6} defaultTab="rate" />;

  return (
    <div className="w-full">
      {/* Carousel section */}
      <section
        className="relative z-0 w-full bg-site-subtle"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-roledescription="carousel"
        aria-label={t.hero.promoTitle}
      >
        {/* Slides */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className="w-full shrink-0"
                role="group"
                aria-roledescription="slide"
                aria-label={t.hero.slideOf
                  .replace("{current}", String(idx + 1))
                  .replace("{total}", String(slides.length))}
              >
                <div
                  className="relative w-full min-h-[180px] sm:min-h-[280px] lg:min-h-0"
                  style={{ aspectRatio: "1440/560" }}
                >
                  <SiteImage
                    src={slide.src}
                    alt={slideLabels[idx] ?? t.hero.promoTitle}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={idx === 0}
                    placeholderSize="1440×560"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:hidden bg-gradient-to-t from-black/65 via-black/25 to-transparent text-white">
                    <div className="max-w-[92%] sm:max-w-[78%]">
                      <p className="text-sm sm:text-base font-semibold leading-snug">
                        {t.hero[slide.titleKey]}
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-white/90 leading-snug">
                        {t.hero[slide.descKey]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Exchange widget overlaid on carousel */}
        <div className="hidden lg:flex absolute inset-x-0 top-8 z-30 justify-start">
          <div className="w-full max-w-[840px] pl-32 xl:pl-48">
            {widgetContent}
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button
          type="button"
          onClick={prev}
          className="hidden sm:flex absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center border border-surface-200 transition-colors cursor-pointer"
          aria-label={t.hero.prevSlide}
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-site-accent" />
        </button>
        <button
          type="button"
          onClick={next}
          className="hidden sm:flex absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center border border-surface-200 transition-colors cursor-pointer"
          aria-label={t.hero.nextSlide}
        >
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-site-accent" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-12 lg:right-[180px] flex items-center gap-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(idx)}
              className={[
                "rounded-full transition-all duration-300 cursor-pointer",
                idx === current
                  ? "w-8 h-3 bg-white"
                  : "w-3 h-3 bg-white/50 hover:bg-white/70",
              ].join(" ")}
              aria-label={t.hero.goToSlide.replace("{num}", String(idx + 1))}
              aria-current={idx === current ? "true" : undefined}
            />
          ))}
        </div>
      </section>

      {/* Mobile/Tablet: Exchange widget below carousel in normal flow */}
      <div className="lg:hidden bg-site-subtle px-4 py-6">
        <div className="max-w-[560px] mx-auto">{widgetContent}</div>
      </div>
    </div>
  );
}
