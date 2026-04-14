"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  EyeIcon,
  CheckCircleIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import SiteImage from "@/components/site/SiteImage";
import AdminPageHelp from "../../../components/AdminPageHelp";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";

type Lang = "th" | "en" | "cn";

const LANG_LABELS: Record<Lang, string> = {
  th: "🇹🇭 ไทย",
  en: "🇬🇧 English",
  cn: "🇨🇳 中文",
};

interface ArticleForm {
  // Thai (default)
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  article_type: "บทความ" | "ข่าว";
  status: "draft" | "published";
  meta_title: string;
  meta_description: string;
  image_alt_text: string;
  focus_keyword: string;
  // English
  title_en: string;
  excerpt_en: string;
  content_en: string;
  meta_title_en: string;
  meta_description_en: string;
  image_alt_text_en: string;
  // Chinese
  title_cn: string;
  excerpt_cn: string;
  content_cn: string;
  meta_title_cn: string;
  meta_description_cn: string;
  image_alt_text_cn: string;
}

function ArticleEditor() {
  const { t } = useAdminLanguage();
  const help = t.pages.articleEditor;
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(!!articleId);
  const [activeLang, setActiveLang] = useState<Lang>("th");

  const [form, setForm] = useState<ArticleForm>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    thumbnail: "",
    article_type: "บทความ",
    status: "draft",
    meta_title: "",
    meta_description: "",
    image_alt_text: "",
    focus_keyword: "",
    // English
    title_en: "",
    excerpt_en: "",
    content_en: "",
    meta_title_en: "",
    meta_description_en: "",
    image_alt_text_en: "",
    // Chinese
    title_cn: "",
    excerpt_cn: "",
    content_cn: "",
    meta_title_cn: "",
    meta_description_cn: "",
    image_alt_text_cn: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load article data if editing
  useEffect(() => {
    if (!articleId) return;
    (async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}`);
        if (res.ok) {
          const json = await res.json();
          const found = json.data;
          if (found) {
            setForm({
              title: found.title ?? "",
              slug: found.slug ?? "",
              excerpt: found.excerpt ?? "",
              content: found.content ?? "",
              thumbnail: found.thumbnail ?? "",
              article_type:
                found.article_type === "ข่าว" || found.article_type === "news"
                  ? "ข่าว"
                  : "บทความ",
              status: found.status ?? "draft",
              meta_title: found.meta_title ?? "",
              meta_description: found.meta_description ?? "",
              image_alt_text: found.image_alt_text ?? "",
              focus_keyword: found.focus_keyword ?? "",
              // English
              title_en: found.title_en ?? "",
              excerpt_en: found.excerpt_en ?? "",
              content_en: found.content_en ?? "",
              meta_title_en: found.meta_title_en ?? "",
              meta_description_en: found.meta_description_en ?? "",
              image_alt_text_en: found.image_alt_text_en ?? "",
              // Chinese
              title_cn: found.title_cn ?? "",
              excerpt_cn: found.excerpt_cn ?? "",
              content_cn: found.content_cn ?? "",
              meta_title_cn: found.meta_title_cn ?? "",
              meta_description_cn: found.meta_description_cn ?? "",
              image_alt_text_cn: found.image_alt_text_cn ?? "",
            });
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingArticle(false);
      }
    })();
  }, [articleId]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const set = (field: keyof ArticleForm, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "title" && !articleId) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSaved(false);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "กรุณากรอกหัวข้อบทความ";
    if (!form.content.trim()) e.content = "กรุณากรอกเนื้อหาบทความ";
    return e;
  };

  const handleSave = async (status?: "draft" | "published") => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setSaving(true);

    const articleData = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      excerpt: form.excerpt,
      content: form.content,
      thumbnail: form.thumbnail,
      article_type: form.article_type,
      status: status || form.status,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      image_alt_text: form.image_alt_text,
      focus_keyword: form.focus_keyword,
      // English
      title_en: form.title_en,
      excerpt_en: form.excerpt_en,
      content_en: form.content_en,
      meta_title_en: form.meta_title_en,
      meta_description_en: form.meta_description_en,
      image_alt_text_en: form.image_alt_text_en,
      // Chinese
      title_cn: form.title_cn,
      excerpt_cn: form.excerpt_cn,
      content_cn: form.content_cn,
      meta_title_cn: form.meta_title_cn,
      meta_description_cn: form.meta_description_cn,
      image_alt_text_cn: form.image_alt_text_cn,
    };

    try {
      if (articleId) {
        const res = await fetch(`/api/articles/${articleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
        });
        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } else {
        const res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
        });
        if (res.ok) {
          router.push("/admin/dashboard/articles");
        }
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/articles/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        set("thumbnail", json.data?.url ?? json.url);
      } else {
        alert(`อัพโหลดไม่สำเร็จ: ${json.error ?? res.statusText}`);
      }
    } catch (err) {
      alert(`อัพโหลดผิดพลาด: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setUploading(false);
    }
  };

  const wordCount = form.content
    .trim()
    .split(/\s+/)
    .filter((w) => w).length;
  const charCount = form.content.length;

  // Language-specific field helpers
  const suffix = (lang: Lang) => (lang === "th" ? "" : `_${lang}`);
  const getField = (base: string, lang: Lang) => {
    const key = `${base}${suffix(lang)}` as keyof ArticleForm;
    return (form[key] as string) ?? "";
  };
  const setField = (base: string, lang: Lang, value: string) => {
    const key = `${base}${suffix(lang)}` as keyof ArticleForm;
    set(key, value);
  };

  const activeTitle = getField("title", activeLang);
  const activeExcerpt = getField("excerpt", activeLang);
  const activeContent = getField("content", activeLang);
  const activeMetaTitle = getField("meta_title", activeLang);
  const activeMetaDesc = getField("meta_description", activeLang);
  const activeAltText = getField("image_alt_text", activeLang);
  const activeWordCount = activeContent
    .trim()
    .split(/\s+/)
    .filter((w) => w).length;
  const activeCharCount = activeContent.length;

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Top bar */}
      <div className="h-14 border-b border-border bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/articles"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div className="w-px h-5 bg-border" />
          <h1 className="text-sm font-semibold text-foreground">
            {articleId ? "แก้ไขบทความ" : "สร้างบทความใหม่"}
          </h1>
          {saved && (
            <div className="flex items-center gap-1 text-success text-xs font-medium animate-in fade-in">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              บันทึกแล้ว
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center gap-1 mr-2 border border-border rounded-lg p-0.5">
            {(["th", "en", "cn"] as Lang[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`h-7 px-2.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeLang === lang
                    ? "bg-brand text-white"
                    : "text-muted hover:text-foreground hover:bg-surface"
                }`}
              >
                {LANG_LABELS[lang]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPreview(!preview)}
            className={`h-8 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
              preview
                ? "bg-brand/10 text-brand border-brand/30"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            <EyeIcon className="w-3.5 h-3.5" />
            ดูตัวอย่าง
          </button>
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="h-8 px-3.5 border border-border text-xs font-medium text-foreground rounded-lg hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
          >
            บันทึกร่าง
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="h-8 px-3.5 bg-brand text-white text-xs font-medium rounded-lg hover:bg-brand-dark transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <CloudArrowUpIcon className="w-3.5 h-3.5" />
            เผยแพร่
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 pt-6">
          <AdminPageHelp
            idPrefix="article-editor"
            title={help.helpTitle}
            expandLabel={t.common.helpExpand}
            collapseLabel={t.common.helpCollapse}
            sections={help.helpSections}
          />
        </div>
        {loadingArticle ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted">กำลังโหลดบทความ...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto p-8">
            <div className="grid grid-cols-[1fr_320px] gap-8">
              {/* Main editor column */}
              <div className="space-y-6">
                {/* Language indicator */}
                <div className="flex items-center gap-2 text-xs text-muted">
                  <LanguageIcon className="w-4 h-4" />
                  <span>
                    Editing in:{" "}
                    <strong className="text-foreground">
                      {LANG_LABELS[activeLang]}
                    </strong>
                  </span>
                  {activeLang !== "th" && !activeTitle && (
                    <span className="text-amber-500 ml-2">
                      ⚠ No translation yet
                    </span>
                  )}
                </div>

                {/* Title */}
                <div>
                  <input
                    type="text"
                    value={activeTitle}
                    onChange={(e) =>
                      setField("title", activeLang, e.target.value)
                    }
                    placeholder={
                      activeLang === "th"
                        ? "หัวข้อบทความ..."
                        : activeLang === "en"
                          ? "Article title..."
                          : "文章标题..."
                    }
                    className={`w-full text-2xl font-bold text-foreground placeholder:text-muted/30 bg-transparent border-0 outline-none py-2 ${
                      errors.title && activeLang === "th"
                        ? "ring-2 ring-red-400 rounded-lg px-3"
                        : ""
                    }`}
                  />
                  {errors.title && activeLang === "th" && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <textarea
                    value={activeExcerpt}
                    onChange={(e) =>
                      setField("excerpt", activeLang, e.target.value)
                    }
                    placeholder={
                      activeLang === "th"
                        ? "คำอธิบายย่อ — สรุปเนื้อหาบทความสั้นๆ สำหรับแสดงในรายการ..."
                        : activeLang === "en"
                          ? "Short description — a brief summary for listing..."
                          : "简短描述 — 用于列表显示的简要摘要..."
                    }
                    rows={2}
                    className="w-full text-sm text-muted placeholder:text-muted/30 bg-transparent border-0 outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="h-px bg-border" />

                {/* Content editor or preview */}
                {preview ? (
                  <div className="bg-white border border-border rounded-xl p-8">
                    <article className="prose prose-sm max-w-none">
                      <h1 className="text-xl font-bold text-foreground mb-3">
                        {activeTitle || "ยังไม่มีหัวข้อ"}
                      </h1>
                      {activeExcerpt && (
                        <p className="text-muted text-sm mb-6 italic">
                          {activeExcerpt}
                        </p>
                      )}
                      {form.thumbnail && (
                        <div className="relative mb-6 h-56 w-full overflow-hidden rounded-xl border border-border">
                          <SiteImage
                            src={form.thumbnail}
                            alt={activeAltText || activeTitle}
                            fill
                            sizes="(max-width: 768px) 100vw, 768px"
                            className="object-cover"
                            unoptimized={form.thumbnail.startsWith("data:")}
                            placeholderSize="768×224"
                          />
                        </div>
                      )}
                      <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                        {activeContent || "ยังไม่มีเนื้อหา"}
                      </div>
                    </article>
                  </div>
                ) : (
                  <div>
                    <div className="bg-white border border-border rounded-xl overflow-hidden">
                      {/* Mini toolbar */}
                      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-surface/50">
                        <span className="text-[10px] text-muted font-medium uppercase tracking-wider">
                          {activeLang === "th"
                            ? "เนื้อหาบทความ"
                            : activeLang === "en"
                              ? "Article Content"
                              : "文章内容"}
                        </span>
                        <div className="flex-1" />
                        <span className="text-[10px] text-muted">
                          {activeCharCount} ตัวอักษร · {activeWordCount} คำ
                        </span>
                      </div>
                      <textarea
                        value={activeContent}
                        onChange={(e) =>
                          setField("content", activeLang, e.target.value)
                        }
                        placeholder={
                          activeLang === "th"
                            ? "เริ่มเขียนเนื้อหาบทความที่นี่...\n\nคุณสามารถเขียนเนื้อหาได้ตามปกติ ขึ้นบรรทัดใหม่ด้วย Enter\nระบบจะแสดงเนื้อหาตามที่คุณพิมพ์"
                            : activeLang === "en"
                              ? "Start writing article content here...\n\nType normally, press Enter for new lines.\nContent will be displayed as you type."
                              : "在此开始撰写文章内容...\n\n正常输入，按 Enter 换行。\n内容将按您输入的方式显示。"
                        }
                        className={`w-full min-h-[400px] px-6 py-5 text-sm text-foreground placeholder:text-muted/30 bg-white outline-none resize-y leading-[1.8] ${
                          errors.content && activeLang === "th"
                            ? "ring-2 ring-red-400"
                            : ""
                        }`}
                      />
                    </div>
                    {errors.content && activeLang === "th" && (
                      <p className="text-xs text-red-500 mt-2">
                        {errors.content}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar settings */}
              <div className="space-y-5">
                {/* Thumbnail card */}
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-xs font-semibold text-foreground">
                      ภาพปก
                    </h3>
                  </div>
                  <div className="p-4">
                    {form.thumbnail ? (
                      <div className="relative group">
                        <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
                          <SiteImage
                            src={form.thumbnail}
                            alt={form.image_alt_text || "Thumbnail"}
                            fill
                            sizes="320px"
                            className="object-cover"
                            unoptimized={form.thumbnail.startsWith("data:")}
                            placeholderSize="320×180"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => set("thumbnail", "")}
                            className="w-8 h-8 bg-white/90 text-foreground rounded-full flex items-center justify-center hover:bg-white cursor-pointer"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-brand flex flex-col items-center justify-center gap-2 text-muted hover:text-brand transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <PhotoIcon className="w-8 h-8" />
                        <span className="text-xs font-medium">
                          {uploading ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลด"}
                        </span>
                        <span className="text-[10px] text-muted/60">
                          JPG, PNG · ขนาดแนะนำ 1200×630
                        </span>
                      </button>
                    )}
                    <div className="mt-3">
                      <input
                        type="text"
                        value={form.thumbnail}
                        onChange={(e) => set("thumbnail", e.target.value)}
                        placeholder="หรือวาง URL ภาพ..."
                        className="w-full h-8 px-2.5 rounded-md border border-border bg-white text-xs text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong"
                      />
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {/* Status card */}
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-xs font-semibold text-foreground">
                      สถานะ
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, status: "draft" }))
                      }
                      className={`w-full h-10 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        form.status === "draft"
                          ? "bg-surface text-foreground border-2 border-foreground/20"
                          : "border border-border text-muted hover:text-foreground hover:border-border-strong"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${form.status === "draft" ? "bg-muted" : "bg-border"}`}
                      />
                      ฉบับร่าง
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, status: "published" }))
                      }
                      className={`w-full h-10 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        form.status === "published"
                          ? "bg-brand/10 text-brand border-2 border-brand/30"
                          : "border border-border text-muted hover:text-foreground hover:border-border-strong"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${form.status === "published" ? "bg-brand" : "bg-border"}`}
                      />
                      เผยแพร่
                    </button>

                    <div className="pt-1">
                      <label className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1 block">
                        ประเภทบทความ
                      </label>
                      <select
                        value={form.article_type}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            article_type: e.target
                              .value as ArticleForm["article_type"],
                          }))
                        }
                        className="w-full h-9 px-2.5 rounded-md border border-border bg-white text-xs text-foreground transition-colors hover:border-border-strong"
                      >
                        <option value="บทความ">บทความ</option>
                        <option value="ข่าว">ข่าว</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SEO / Slug card */}
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-xs font-semibold text-foreground">
                      URL / Slug
                    </h3>
                  </div>
                  <div className="p-4">
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => set("slug", e.target.value)}
                      placeholder="auto-generated"
                      className="w-full h-8 px-2.5 rounded-md border border-border bg-white text-xs text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong font-mono"
                    />
                    {form.slug && (
                      <p className="text-[10px] text-muted mt-1.5 truncate">
                        /articles/{form.slug}
                      </p>
                    )}
                  </div>
                </div>

                {/* SEO Settings card */}
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-xs font-semibold text-foreground">
                      SEO Settings ({LANG_LABELS[activeLang]})
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Meta Title */}
                    <div>
                      <label className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1 block">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={activeMetaTitle}
                        onChange={(e) =>
                          setField("meta_title", activeLang, e.target.value)
                        }
                        placeholder={
                          activeLang === "th"
                            ? "ชื่อบทความสำหรับ Google..."
                            : activeLang === "en"
                              ? "Article title for Google..."
                              : "Google 搜索标题..."
                        }
                        className="w-full h-8 px-2.5 rounded-md border border-border bg-white text-xs text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong"
                      />
                      <p
                        className={`text-[10px] mt-1 ${activeMetaTitle.length > 60 ? "text-red-500" : "text-muted/60"}`}
                      >
                        {activeMetaTitle.length}/60 ตัวอักษร
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <label className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1 block">
                        Meta Description
                      </label>
                      <textarea
                        value={activeMetaDesc}
                        onChange={(e) =>
                          setField(
                            "meta_description",
                            activeLang,
                            e.target.value,
                          )
                        }
                        placeholder={
                          activeLang === "th"
                            ? "คำอธิบายบทความสำหรับผลการค้นหา Google..."
                            : activeLang === "en"
                              ? "Article description for Google search results..."
                              : "Google 搜索结果描述..."
                        }
                        rows={3}
                        className="w-full px-2.5 py-2 rounded-md border border-border bg-white text-xs text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong resize-none leading-relaxed"
                      />
                      <p
                        className={`text-[10px] mt-1 ${activeMetaDesc.length > 160 ? "text-red-500" : "text-muted/60"}`}
                      >
                        {activeMetaDesc.length}/160 ตัวอักษร
                      </p>
                    </div>

                    {/* Image Alt Text */}
                    <div>
                      <label className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1 block">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={activeAltText}
                        onChange={(e) =>
                          setField("image_alt_text", activeLang, e.target.value)
                        }
                        placeholder={
                          activeLang === "th"
                            ? "อธิบายภาพปกสำหรับ SEO..."
                            : activeLang === "en"
                              ? "Describe the cover image for SEO..."
                              : "描述封面图片用于 SEO..."
                        }
                        className="w-full h-8 px-2.5 rounded-md border border-border bg-white text-xs text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong"
                      />
                    </div>

                    {/* Focus Keyword — only shown for Thai (shared) */}
                    {activeLang === "th" && (
                      <div>
                        <label className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1 block">
                          Focus Keyword (คำค้นหาหลัก)
                        </label>
                        <input
                          type="text"
                          value={form.focus_keyword}
                          onChange={(e) => set("focus_keyword", e.target.value)}
                          placeholder="เช่น แลกเงิน, อัตราแลกเปลี่ยน..."
                          className="w-full h-8 px-2.5 rounded-md border border-border bg-white text-xs text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArticleEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-surface">
          <div className="text-sm text-muted">กำลังโหลด...</div>
        </div>
      }
    >
      <ArticleEditor />
    </Suspense>
  );
}
