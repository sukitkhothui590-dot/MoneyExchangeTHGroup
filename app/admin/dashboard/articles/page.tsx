"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import AdminPageHelp from "../../components/AdminPageHelp";
import type { Article } from "@/lib/types/database";
import SiteImage from "@/components/site/SiteImage";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";

export default function ArticlesPage() {
  const { t } = useAdminLanguage();
  const p = t.pages.articles;
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "published" | "draft"
  >("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        const json = await res.json();
        setArticles(json.data ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const filtered = articles.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ? true : a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    const prev = [...articles];
    setArticles((cur) => cur.filter((a) => a.id !== id));
    setDeleteConfirm(null);

    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) setArticles(prev);
    } catch {
      setArticles(prev);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const article = articles.find((a) => a.id === id);
    if (!article) return;
    const newStatus = article.status === "published" ? "draft" : "published";
    const prev = [...articles];
    setArticles((cur) =>
      cur.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    );

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) setArticles(prev);
    } catch {
      setArticles(prev);
    }
  };

  const publishedCount = articles.filter(
    (a) => a.status === "published",
  ).length;
  const draftCount = articles.filter((a) => a.status === "draft").length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr.replace(" ", "T"));
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Header
        title={p.title}
        subtitle={p.subtitle}
        actions={
          <button
            onClick={() => router.push("/admin/dashboard/articles/editor")}
            className="h-9 px-3.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            {p.newArticle}
          </button>
        }
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <AdminPageHelp
          idPrefix="articles"
          title={p.helpTitle}
          expandLabel={t.common.helpExpand}
          collapseLabel={t.common.helpCollapse}
          sections={p.helpSections}
        />
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Top bar: filters + search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              {/* Status tabs */}
              <div className="flex items-center gap-1">
                {(
                  [
                    { key: "all", label: "ทั้งหมด", count: articles.length },
                    {
                      key: "published",
                      label: "เผยแพร่แล้ว",
                      count: publishedCount,
                    },
                    { key: "draft", label: "ฉบับร่าง", count: draftCount },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterStatus(f.key)}
                    className={`h-8 px-3.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      filterStatus === f.key
                        ? "text-foreground bg-white border border-border shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {f.label}
                    <span
                      className={`ml-1.5 text-xs ${filterStatus === f.key ? "text-muted" : "text-muted/50"}`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="ค้นหาบทความ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              {filtered.length === 0 ? (
                <div className="py-24 flex flex-col items-center gap-3">
                  <DocumentTextIcon className="w-10 h-10 text-muted/20" />
                  <p className="text-sm text-muted">
                    {search
                      ? `ไม่พบบทความที่ตรงกับ "${search}"`
                      : "ยังไม่มีบทความ"}
                  </p>
                  {!search && (
                    <button
                      onClick={() =>
                        router.push("/admin/dashboard/articles/editor")
                      }
                      className="mt-1 h-8 px-4 bg-brand text-white text-xs font-medium rounded-lg hover:bg-brand-dark transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      สร้างบทความแรก
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Header row */}
                  <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-5 py-2.5 border-b border-border bg-surface">
                    <span className="text-xs font-medium text-muted uppercase tracking-wider">
                      บทความ
                    </span>
                    <span className="text-xs font-medium text-muted uppercase tracking-wider w-20 text-center">
                      ภาษา
                    </span>
                    <span className="text-xs font-medium text-muted uppercase tracking-wider w-24 text-center">
                      สถานะ
                    </span>
                    <span className="text-xs font-medium text-muted uppercase tracking-wider w-28 text-center">
                      วันที่
                    </span>
                    <span className="text-xs font-medium text-muted uppercase tracking-wider w-36 text-center">
                      การจัดการ
                    </span>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-border">
                    {filtered.map((article) => (
                      <div
                        key={article.id}
                        className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center px-4 sm:px-5 py-4 hover:bg-surface/50 transition-colors group"
                      >
                        {/* Title + meta */}
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0 sm:pr-6">
                          {/* Thumbnail */}
                          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-border shrink-0 bg-surface">
                            {article.thumbnail ? (
                              <SiteImage
                                src={article.thumbnail}
                                alt={article.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                                unoptimized={article.thumbnail.startsWith(
                                  "data:",
                                )}
                                placeholderSize="48×48"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <DocumentTextIcon className="w-5 h-5 text-muted/30" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/dashboard/articles/editor?id=${article.id}`,
                                )
                              }
                              className="font-semibold text-foreground text-sm hover:text-brand transition-colors text-left line-clamp-1 cursor-pointer"
                            >
                              {article.title}
                            </button>
                            <p className="text-xs text-muted mt-0.5 line-clamp-1">
                              {article.excerpt || (
                                <span className="italic text-muted/40">
                                  ไม่มีคำอธิบาย
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-muted/40 mt-0.5 font-mono hidden sm:block">
                              /articles/{article.slug}
                            </p>

                            {/* Mobile-only: status + date + actions */}
                            <div className="flex items-center gap-2 mt-2.5 sm:hidden">
                              {article.status === "published" ? (
                                <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-success/10 text-success text-[11px] font-semibold shrink-0">
                                  <CheckBadgeIcon className="w-3 h-3" />
                                  เผยแพร่
                                </span>
                              ) : (
                                <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-gray-100 text-muted text-[11px] font-medium shrink-0">
                                  ร่าง
                                </span>
                              )}
                              <span className="text-[11px] text-muted">
                                {formatDate(article.created_at)}
                              </span>
                              <div className="flex items-center gap-1.5 ml-auto">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/admin/dashboard/articles/editor?id=${article.id}`,
                                    )
                                  }
                                  className="h-7 px-2.5 text-xs font-medium rounded-md border border-border text-muted hover:text-brand hover:border-brand inline-flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <PencilSquareIcon className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(article.id)}
                                  className={`h-7 px-2.5 text-xs font-medium rounded-md border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                    article.status === "published"
                                      ? "border-border text-muted hover:text-foreground hover:border-border-strong"
                                      : "border-brand/30 text-brand hover:bg-brand/5"
                                  }`}
                                >
                                  <CloudArrowUpIcon className="w-3 h-3" />
                                </button>
                                {deleteConfirm === article.id ? (
                                  <>
                                    <button
                                      onClick={() => handleDelete(article.id)}
                                      className="h-7 px-2 bg-danger text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                                    >
                                      ยืนยัน
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="h-7 px-2 border border-border text-xs text-muted rounded-md hover:text-foreground transition-colors cursor-pointer"
                                    >
                                      ยกเลิก
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(article.id)}
                                    className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-danger hover:border-danger transition-colors cursor-pointer"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Language badges – desktop only */}
                        <div className="hidden sm:flex w-20 justify-center gap-1">
                          <span
                            className="inline-flex items-center h-5 px-1.5 rounded bg-blue-50 text-blue-600 text-[10px] font-medium"
                            title="Thai"
                          >
                            TH
                          </span>
                          {(article as Record<string, unknown>).title_en ? (
                            <span
                              className="inline-flex items-center h-5 px-1.5 rounded bg-green-50 text-green-600 text-[10px] font-medium"
                              title="English"
                            >
                              EN
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center h-5 px-1.5 rounded bg-gray-50 text-gray-300 text-[10px] font-medium"
                              title="No English"
                            >
                              EN
                            </span>
                          )}
                          {(article as Record<string, unknown>).title_cn ? (
                            <span
                              className="inline-flex items-center h-5 px-1.5 rounded bg-red-50 text-red-500 text-[10px] font-medium"
                              title="Chinese"
                            >
                              CN
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center h-5 px-1.5 rounded bg-gray-50 text-gray-300 text-[10px] font-medium"
                              title="No Chinese"
                            >
                              CN
                            </span>
                          )}
                        </div>

                        {/* Status – desktop only */}
                        <div className="hidden sm:flex w-24 justify-center">
                          {article.status === "published" ? (
                            <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-success/10 text-success text-[11px] font-semibold">
                              <CheckBadgeIcon className="w-3 h-3" />
                              เผยแพร่
                            </span>
                          ) : (
                            <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-gray-100 text-muted text-[11px] font-medium">
                              ร่าง
                            </span>
                          )}
                        </div>

                        {/* Date – desktop only */}
                        <div className="hidden sm:block w-28 text-center">
                          <p className="text-xs text-muted">
                            {formatDate(article.created_at)}
                          </p>
                        </div>

                        {/* Actions – desktop only */}
                        <div className="hidden sm:flex w-36 items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/dashboard/articles/editor?id=${article.id}`,
                              )
                            }
                            className="h-7 px-2.5 text-xs font-medium rounded-md border border-border text-muted hover:text-brand hover:border-brand inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <PencilSquareIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(article.id)}
                            className={`h-7 px-2.5 text-xs font-medium rounded-md border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                              article.status === "published"
                                ? "border-border text-muted hover:text-foreground hover:border-border-strong"
                                : "border-brand/30 text-brand hover:bg-brand/5"
                            }`}
                          >
                            <CloudArrowUpIcon className="w-3 h-3" />
                          </button>
                          {deleteConfirm === article.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(article.id)}
                                className="h-7 px-2 bg-danger text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                              >
                                ยืนยัน
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="h-7 px-2 border border-border text-xs text-muted rounded-md hover:text-foreground transition-colors cursor-pointer"
                              >
                                ยกเลิก
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(article.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-danger hover:border-danger transition-colors cursor-pointer"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
