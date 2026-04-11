"use client";

import { useState, useEffect } from "react";
import SiteImage from "@/components/site/SiteImage";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { fetchArticlesPublic } from "@/lib/api";
import type { NewsItem } from "@/lib/types/news";

export default function NewsDetailPage() {
  const { t, locale } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticlesPublic(locale).then((articles) => {
      const found = articles.find((a) => a.slug === slug) ?? null;
      setArticle(found);
      setLoading(false);
    });
  }, [slug, locale]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-surface-500">{t.common.loading}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-surface-500">{t.news.contentNotReady}</p>
        <Link href="/news" className="text-sm font-semibold text-site-accent hover:underline">
          {t.news.backToNews}
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-site-accent to-site-accent">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-10">
          <div className="max-w-3xl">
            <Link
              href="/news"
              className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-4 transition-colors"
            >
              {t.news.backToNews}
            </Link>
            <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white/20 text-white mb-3">
              {article.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold leading-tight text-white">
              {article.title}
            </h1>
            <p className="mt-3 text-sm text-white/70">{article.date}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-surface-0 py-10 lg:py-14">
        <div className="max-w-3xl mx-auto px-4 lg:px-6">
          {article.image && (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-gray-100">
              <SiteImage
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-cover"
                priority
                placeholderSize="1280×720"
              />
            </div>
          )}

          {article.excerpt && (
            <p className="text-lg text-surface-600 leading-relaxed mb-6 font-medium">
              {article.excerpt}
            </p>
          )}

          {article.content ? (
            <div
              className="prose prose-lg max-w-none text-surface-700"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <p className="text-surface-500 text-center py-12">
              {t.news.contentNotReady}
            </p>
          )}

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-site-accent hover:underline"
            >
              {t.news.backToAll}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
