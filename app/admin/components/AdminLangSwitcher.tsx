"use client";

import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import type { AdminLocale } from "@/lib/admin/translations";

export default function AdminLangSwitcher({
  className = "",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const { locale, setLocale, t } = useAdminLanguage();

  const btn = (l: AdminLocale) => (
    <button
      key={l}
      type="button"
      onClick={() => setLocale(l)}
      className={[
        "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
        variant === "dark"
          ? locale === l
            ? "bg-white text-brand shadow-sm"
            : "text-white/80 hover:text-white hover:bg-white/10"
          : locale === l
            ? "bg-brand text-white"
            : "text-muted hover:text-foreground hover:bg-surface",
      ].join(" ")}
    >
      {t.lang[l]}
    </button>
  );

  return (
    <div
      className={[
        "inline-flex items-center gap-0.5 rounded-lg border p-0.5",
        variant === "dark"
          ? "border-white/20 bg-black/15"
          : "border-border bg-surface/80",
        className,
      ].join(" ")}
      role="group"
      aria-label="Language"
    >
      {btn("th")}
      {btn("en")}
    </div>
  );
}
