"use client";

import { useState, useEffect } from "react";
import SiteImage from "@/components/site/SiteImage";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { fetchArticlesPublic } from "@/lib/api";
import type { NewsItem } from "@/lib/types/news";

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-site-accent text-white">
      {category}
    </span>
  );
}

const PAGE_SIZE = 6;

export default function NewsPage() {
  const { t, locale } = useLanguage();
  const [allNews, setAllNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchArticlesPublic(locale).then(setAllNews);
  }, [locale]);

  const currentPage = 1;
  const pageCount = Math.max(1, Math.ceil(allNews.length / PAGE_SIZE));
  const items = allNews.slice(0, PAGE_SIZE);

  return (
    <>
      {/* Hero */}
      <section className="relative z-0 bg-gradient-to-br from-site-accent to-site-accent-hover min-h-[140px] sm:min-h-[160px] lg:min-h-0" style={{ aspectRatio: "1440/400" }}>
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 h-full flex items-center">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-[0.16em] uppercase text-white">
              MoneyExchangeTHGroup
            </p>
            <h1 className="mt-1 text-4xl sm:text-5xl lg:text-[52px] font-extrabold leading-tight text-white">
              News
            </h1>
            <p className="mt-3 text-base sm:text-lg font-medium text-white/90">
              {t.news.title}
            </p>
          </div>
        </div>
      </section>

      {/* News cards grid */}
      <section className="bg-surface-0 pb-16 pt-10 lg:pt-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-site-subtle flex items-center justify-center">
                <svg className="w-10 h-10 text-site-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-surface-700">{t.news.empty}</p>
              <p className="mt-2 text-sm text-surface-500">{t.news.emptyDesc}</p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-site-accent text-white text-sm font-semibold px-6 py-2.5 hover:bg-site-accent-hover transition-colors"
              >
                {t.common.backHome}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(15,23,42,0.15)] overflow-hidden flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative w-full h-[190px] sm:h-[210px] bg-gray-100 overflow-hidden">
                      {item.image ? (
                        <SiteImage
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                          placeholderSize="400×210"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
                          400×220
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-3 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryBadge category={item.category} />
                        <span className="text-[11px] text-surface-500">
                          {item.date}
                        </span>
                      </div>
                      <h2 className="text-sm sm:text-base font-bold text-surface-700 leading-snug line-clamp-2 mb-1.5">
                        {item.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-surface-600 leading-relaxed line-clamp-3 flex-1">
                        {item.excerpt}
                      </p>
                    </div>

                    {/* Bottom button */}
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 bg-white">
                      <Link
                        href={`/news/${item.slug}`}
                        className="w-full inline-flex items-center justify-center rounded-lg bg-site-accent text-white text-xs sm:text-sm font-semibold py-2.5 hover:bg-site-accent-hover transition-colors"
                      >
                        {t.news.readMore}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="mt-10 flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-site-accent text-site-accent bg-white px-4 py-1.5 shadow-sm cursor-default"
                    aria-disabled="true"
                  >
                    <span className="text-xs">&larr;</span>
                    <span className="text-sm">{t.news.prev}</span>
                  </button>

                  <div className="flex items-center gap-2 text-surface-500">
                    {Array.from({ length: pageCount }).map((_, idx) => {
                      const page = idx + 1;
                      const isActive = page === currentPage;
                      return (
                        <button
                          key={page}
                          type="button"
                          className={[
                            "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium",
                            isActive
                              ? "bg-site-subtle text-site-accent"
                              : "text-surface-500 hover:bg-surface-50",
                          ].join(" ")}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-site-accent text-site-accent bg-white px-4 py-1.5 shadow-sm"
                  >
                    <span className="text-sm">{t.news.next}</span>
                    <span className="text-xs">&rarr;</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
