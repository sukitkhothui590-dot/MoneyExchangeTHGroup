"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

type CookieCategory = "necessary" | "analytics" | "marketing";

type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "smx-cookie-consent-v1";

function loadConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || !parsed) return null;
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function saveConsent(value: CookieConsent) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function hasCookieConsent(category: CookieCategory): boolean {
  if (category === "necessary") return true;
  if (typeof window === "undefined") return false;
  const current = loadConsent();
  if (!current) return false;
  return !!current[category];
}

export default function CookieConsent() {
  const { t } = useLanguage();
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  // Load existing consent on mount
  useEffect(() => {
    const existing = loadConsent();
    if (existing) {
      setConsent(existing);
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  const applyAndSave = (next: { analytics: boolean; marketing: boolean }) => {
    const value: CookieConsent = {
      necessary: true,
      analytics: next.analytics,
      marketing: next.marketing,
      updatedAt: new Date().toISOString(),
    };
    setConsent(value);
    setAnalytics(value.analytics);
    setMarketing(value.marketing);
    saveConsent(value);
  };

  const handleAcceptAll = () => {
    applyAndSave({ analytics: true, marketing: true });
    setShowBanner(false);
    setShowPanel(false);
  };

  const handleRejectAll = () => {
    applyAndSave({ analytics: false, marketing: false });
    setShowBanner(false);
    setShowPanel(false);
  };

  const handleSave = () => {
    applyAndSave({ analytics, marketing });
    setShowBanner(false);
    setShowPanel(false);
  };

  const openSettings = () => {
    const current = loadConsent();
    if (current) {
      setAnalytics(current.analytics);
      setMarketing(current.marketing);
    }
    setShowPanel(true);
  };

  const closePanel = () => setShowPanel(false);

  const shouldShowMiniButton = !!consent && !showBanner;

  return (
    <>
      {/* Bottom banner (first visit) */}
      {showBanner && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="max-w-4xl mx-auto rounded-2xl bg-white shadow-[0_18px_45px_rgba(15,23,42,0.28)] border border-[#E5E7EB] p-4 sm:p-5 md:p-6">
            <div className="flex flex-col gap-3 md:gap-4">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-surface-800 mb-1">
                  {t.common.cookieTitle}
                </h2>
                <p className="text-xs sm:text-sm text-surface-600 leading-relaxed">
                  {t.common.cookieDesc}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto inline-flex justify-center items-center rounded-full bg-site-accent text-white text-xs sm:text-sm font-semibold px-4 py-2.5 hover:bg-site-accent-hover transition-colors"
                >
                  {t.common.cookieAcceptAll}
                </button>
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="w-full sm:w-auto inline-flex justify-center items-center rounded-full border border-[#CBD5E1] text-surface-700 text-xs sm:text-sm font-semibold px-4 py-2.5 bg-white hover:bg-surface-50 transition-colors"
                >
                  {t.common.cookieRejectAll}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPanel(true)}
                  className="w-full sm:w-auto inline-flex justify-center items-center rounded-full text-surface-600 text-[11px] sm:text-xs font-medium px-3 py-2 hover:text-site-accent underline decoration-1 underline-offset-2"
                >
                  {t.common.cookieCustomize}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings floating button (after consent given) */}
      {shouldShowMiniButton && !showPanel && (
        <button
          type="button"
          onClick={openSettings}
          className="fixed left-3 bottom-3 sm:left-4 sm:bottom-4 z-30 rounded-full bg-site-accent text-white text-[11px] sm:text-xs px-3.5 py-2 shadow-md hover:bg-site-accent-hover transition-colors"
          aria-label={t.common.cookieManage}
        >
          {t.common.cookieManage}
        </button>
      )}

      {/* Full settings panel / modal */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/40">
          <div className="max-w-lg w-full rounded-2xl bg-white shadow-2xl border border-[#E5E7EB] p-5 sm:p-6 md:p-7">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-surface-800">
                  {t.common.cookieTitle}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-surface-600 leading-relaxed">
                  {t.common.cookieDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="text-surface-400 hover:text-surface-600 transition-colors"
                aria-label="Close"
              >
                <span className="text-lg">×</span>
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div className="rounded-xl border border-[#E5E7EB] bg-surface-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-surface-800">
                      {t.common.cookieNecessary}
                    </p>
                    <p className="text-xs text-surface-600 mt-0.5">
                      {t.common.cookieNecessaryDesc}
                    </p>
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-surface-200 text-surface-600 font-medium">
                    ON
                  </span>
                </div>
              </div>

              <label className="flex items-start justify-between gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3 cursor-pointer hover:bg-surface-50">
                <div>
                  <p className="text-sm font-semibold text-surface-800">
                    {t.common.cookieAnalytics}
                  </p>
                  <p className="text-xs text-surface-600 mt-0.5">
                    {t.common.cookieAnalyticsDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 accent-site-accent"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
              </label>

              <label className="flex items-start justify-between gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3 cursor-pointer hover:bg-surface-50">
                <div>
                  <p className="text-sm font-semibold text-surface-800">
                    {t.common.cookieMarketing}
                  </p>
                  <p className="text-xs text-surface-600 mt-0.5">
                    {t.common.cookieMarketingDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 accent-site-accent"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={handleRejectAll}
                className="w-full sm:w-auto inline-flex justify-center items-center rounded-full border border-[#CBD5E1] text-surface-700 text-xs sm:text-sm font-semibold px-4 py-2.5 bg-white hover:bg-surface-50 transition-colors"
              >
                {t.common.cookieRejectAll}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto inline-flex justify-center items-center rounded-full bg-site-accent text-white text-xs sm:text-sm font-semibold px-5 py-2.5 hover:bg-site-accent-hover transition-colors"
              >
                {t.common.cookieSave}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

