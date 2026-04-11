"use client";

import React, { useState, useEffect } from "react";
import SiteImage from "@/components/site/SiteImage";
import Link from "next/link";
import { fetchArticlesPublic } from "@/lib/api";
import { NewsItem } from "@/lib/types/news";
import Skeleton from "@/components/ui/Skeleton";
import { useLanguage } from "@/lib/i18n";

function NewsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5">
        <Skeleton className="w-full h-[280px] sm:h-[340px] lg:h-[420px] rounded-2xl" />
        <Skeleton className="w-1/3 h-4 mt-4" />
        <Skeleton className="w-3/4 h-5 mt-2" />
        <Skeleton className="w-full h-3 mt-2" />
      </div>
      <div className="lg:col-span-7 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-[120px] sm:w-[180px] h-[90px] sm:h-[120px] rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 py-2">
              <Skeleton className="w-1/4 h-3" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function imageNeedsUnoptimized(src: string) {
  return src.startsWith("data:") || src.startsWith("blob:");
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-site-accent text-white">
      {category}
    </span>
  );
}

export default function NewsPreviewSection() {
  const { t, locale } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticlesPublic(locale).then((data) => {
      setNews(data);
      setLoading(false);
    });
  }, [locale]);

  const featured = news[0];
  const sideNews = news.slice(1);

  return (
    <section className="py-16 lg:py-20 bg-[#FFF8F3]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-site-accent">
            {t.newsPreview.title}
          </h2>
          <Link
            href="/news"
            className="text-sm font-medium text-surface-600 hover:text-site-accent transition-colors"
          >
            {t.newsPreview.viewMore}
          </Link>
        </div>

        {loading ? (
          <NewsSkeleton />
        ) : news.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-site-subtle flex items-center justify-center">
              <svg
                className="w-8 h-8 text-site-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-surface-700">
              {t.newsPreview.empty}
            </p>
            <p className="mt-1 text-sm text-surface-500">
              {t.newsPreview.emptyDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Featured (left column) */}
            {featured && (
              <div className="lg:col-span-7">
                <Link href={`/news/${featured.slug}`} className="group block">
                  {/* Featured image */}
                  <div className="relative w-full h-[280px] sm:h-[340px] lg:h-[420px] rounded-2xl overflow-hidden bg-gray-100">
                    {featured.image ? (
                      <SiteImage
                        src={featured.image}
                        alt={featured.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={imageNeedsUnoptimized(featured.image)}
                        placeholderSize="600×420"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                        600×420
                      </div>
                    )}
                  </div>

                  {/* Featured info */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryBadge category={featured.category} />
                      <span className="text-xs text-surface-500">
                        {featured.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-site-accent leading-snug line-clamp-2">
                      {featured.title}
                    </h3>
                    <p className="mt-2 text-sm text-surface-500 leading-relaxed line-clamp-3">
                      {featured.excerpt}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Side news (right column) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {sideNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="group flex gap-4 rounded-2xl overflow-hidden hover:bg-white/60 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-[160px] sm:w-[200px] h-[120px] sm:h-[140px] shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {item.image ? (
                      <SiteImage
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={imageNeedsUnoptimized(item.image)}
                        placeholderSize="200×140"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
                        200×140
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 py-2 pr-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <CategoryBadge category={item.category} />
                      <span className="text-xs text-surface-500">
                        {item.date}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-site-accent leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-surface-500 leading-relaxed line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
