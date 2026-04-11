"use client";

import React, { useRef } from "react";
import SiteImage from "@/components/site/SiteImage";
import { mockServices } from "@/lib/mock/services";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n";

export default function ServicesSection() {
  const { t } = useLanguage();
  const rowRef = useRef<HTMLDivElement | null>(null);
  const cards = t.servicesSection.cards as {
    title: string;
    titleSub: string;
    description: string;
  }[];

  const scrollByCards = (direction: "left" | "right") => {
    const container = rowRef.current;
    if (!container) return;
    const cardWidth = 310; // approx lg width
    const amount = cardWidth * 2;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="pt-20 pb-16 lg:pt-32 lg:pb-20 bg-surface-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Section heading aligned to the right like reference */}
        <div className="flex items-baseline justify-center lg:justify-between mb-8 lg:mb-10">
          <div className="hidden lg:block" />
          <div className="text-center lg:text-right">
            <p className="text-lg lg:text-xl font-semibold text-surface-600">
              {t.servicesSection.subtitle}
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-site-accent">
              {t.servicesSection.allServices}
            </h2>
          </div>
        </div>

        {/* Services cards row */}
        <div className="relative">
          {/* Left arrow */}
          <button
            type="button"
            className="hidden lg:flex absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-site-accent items-center justify-center cursor-pointer hover:bg-surface-50 z-10"
            aria-label={t.servicesSection.prev}
            onClick={() => scrollByCards("left")}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 4L6 8L10 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            type="button"
            className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-site-accent items-center justify-center cursor-pointer hover:bg-surface-50 z-10"
            aria-label={t.servicesSection.next}
            onClick={() => scrollByCards("right")}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div
            ref={rowRef}
            className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-2 no-scrollbar"
          >
            {mockServices.map((service, idx) => {
              const card = cards[idx];
              return (
                <div
                  key={service.id}
                  className="flex flex-col flex-shrink-0 w-[270px] sm:w-[290px] lg:w-[310px] rounded-2xl bg-white overflow-hidden"
                >
                  <div className="relative h-[130px] sm:h-[140px] bg-gray-100 overflow-hidden">
                    {service.image ? (
                      <SiteImage
                        src={service.image}
                        alt={card?.title ?? service.title}
                        fill
                        sizes="(max-width: 640px) 270px, 310px"
                        className="object-cover"
                        placeholderSize="310×140"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
                        400×260
                      </div>
                    )}
                  </div>

                  <div className="bg-site-accent text-white px-6 py-6 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold leading-snug mb-1.5">
                        {card?.title ?? service.title}
                      </h3>
                      <p className="text-sm font-medium mb-1 opacity-90">
                        {card?.titleSub ?? service.titleTh}
                      </p>
                      <p className="text-sm leading-relaxed opacity-90 line-clamp-2">
                        {card?.description ?? service.description}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        href={service.link}
                        aria-label={t.servicesSection.viewMoreFor.replace(
                          "{title}",
                          card?.title ?? service.title,
                        )}
                        className="w-full border-white text-white hover:bg-white/10"
                      >
                        {t.servicesSection.viewMore}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Coming soon card */}
            <div className="flex-shrink-0 w-[270px] sm:w-[290px] lg:w-[310px] rounded-2xl bg-gradient-to-br from-site-accent to-site-accent flex items-center justify-center">
              <span className="text-white text-lg sm:text-xl font-semibold">
                {t.servicesSection.comingSoon}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
