"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n";

export default function ContactStrip() {
  const { t } = useLanguage();
  return (
    <section className="bg-yellow-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 lg:py-20">
        <div className="flex flex-col items-center text-center min-h-[180px] justify-center gap-5">
          <h2 className="text-2xl lg:text-3xl font-bold text-surface-700">
            {t.contactStrip.title}
          </h2>
          <p className="text-surface-700/70 max-w-md">
            {t.contactStrip.desc1}
            <br />
            {t.contactStrip.desc2}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 text-surface-700/70">
            <a
              href="tel:026113185"
              className="flex items-center gap-2 hover:text-site-accent transition-colors"
            >
              <span className="text-lg">📞</span>
              <span className="text-lg font-semibold text-surface-700">
                02-6113185
              </span>
            </a>
            <span className="hidden sm:inline text-surface-300">|</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">✉️</span>
              <a href="mailto:moneyexchangethgroup@gmail.com" className="text-sm font-medium text-surface-700 hover:text-site-accent transition-colors">
                moneyexchangethgroup@gmail.com
              </a>
            </div>
            <span className="hidden sm:inline text-surface-300">|</span>
            <a
              href="https://lin.ee/mGYJgia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-site-accent transition-colors"
            >
              <span className="text-lg">💬</span>
              <span className="text-sm font-medium text-surface-700">
                LINE Official @298ickaf
              </span>
            </a>
          </div>
          <Button
            variant="primary"
            size="lg"
            href="/contact"
            aria-label={t.contactStrip.contactBtn}
          >
            {t.contactStrip.contactBtn}
          </Button>
        </div>
      </div>
    </section>
  );
}
