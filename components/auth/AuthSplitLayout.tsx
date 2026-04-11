"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

const paneEase =
  "transition-[left,top] duration-500 ease-[cubic-bezier(0.22,1,0.32,1)] motion-reduce:transition-none";

type Props = {
  view: "login" | "register";
  onSwitchView: () => void;
  heroTitle: string;
  heroSubtitle: string;
  switchLabel: string;
  children: ReactNode;
};

export default function AuthSplitLayout({
  view,
  onSwitchView,
  heroTitle,
  heroSubtitle,
  switchLabel,
  children,
}: Props) {
  const { t } = useLanguage();
  const isLogin = view === "login";

  /* ล็อกอิน: ฟอร์มซ้าย / แดงขวา — สมัคร: แดงซ้าย / ฟอร์มขวา (สลับตำแหน่งจริง ไม่ใช่แค่ flex-reverse) */
  const formPaneClass = [
    "absolute z-10 flex flex-col justify-start overflow-x-hidden overflow-y-auto overscroll-contain bg-white px-8 py-10 sm:px-12 sm:py-14 md:py-16",
    "w-full md:w-1/2",
    paneEase,
    isLogin
      ? "left-0 top-0 h-1/2 md:h-full md:min-h-0"
      : "left-0 top-1/2 h-1/2 md:left-1/2 md:top-0 md:h-full md:min-h-0",
  ].join(" ");

  const redPaneClass = [
    "absolute z-20 flex flex-col justify-center overflow-x-hidden bg-site-accent px-8 py-12 text-center text-white sm:py-16",
    "w-full md:w-1/2",
    paneEase,
    isLogin
      ? "left-0 top-1/2 h-1/2 md:left-1/2 md:top-0 md:h-full md:min-h-0"
      : "left-0 top-0 h-1/2 md:left-0 md:top-0 md:h-full md:min-h-0",
  ].join(" ");

  return (
    <div className="w-full max-w-[920px] mx-auto px-4 sm:px-6">
      <div
        className="relative h-[min(96svh,880px)] min-h-[720px] w-full overflow-hidden rounded-[28px] shadow-[0_25px_55px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.04] md:h-[min(700px,92vh)] md:min-h-[580px]"
        style={{ isolation: "isolate" }}
      >
        <div className={formPaneClass}>
          <div className="mx-auto flex w-full max-w-[400px] flex-col justify-start py-1 md:min-h-0 md:py-2">
            {children}
          </div>
        </div>

        <aside className={redPaneClass}>
          <div className="mx-auto flex w-full max-w-[320px] flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tight leading-tight sm:text-4xl">
              {heroTitle}
            </h2>
            <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-white/90 sm:text-base">
              {heroSubtitle}
            </p>
            <button
              type="button"
              onClick={onSwitchView}
              className="mt-8 inline-flex items-center justify-center rounded-full border-2 border-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-white/10 active:scale-[0.98] sm:mt-10 sm:text-sm motion-safe:hover:scale-[1.02]"
            >
              {switchLabel}
            </button>
          </div>
        </aside>
      </div>
      <p className="mt-10 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-surface-200 bg-white px-8 py-3.5 text-sm font-semibold text-surface-700 shadow-sm transition-all hover:border-site-accent/40 hover:bg-site-subtle hover:text-site-accent hover:shadow-md active:scale-[0.98]"
        >
          {t.auth.backHome}
        </Link>
      </p>
    </div>
  );
}
