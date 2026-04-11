"use client";

import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import type { AdminLocale } from "@/lib/admin/translations";

export default function AdminLangSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useAdminLanguage();

  const btn = (l: AdminLocale) => (
    <button
      key={l}
      type="button"
      onClick={() => setLocale(l)}
      className={[
        "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
        locale === l
          ? "bg-brand text-white"
          : "text-muted hover:text-foreground hover:bg-surface",
      ].join(" ")}
    >
      {t.lang[l]}
    </button>
  );

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface/80 p-0.5 ${className}`}
      role="group"
      aria-label="Language"
    >
      {btn("th")}
      {btn("en")}
    </div>
  );
}
