"use client";

import { useLanguage } from "@/lib/i18n";
import Button from "@/components/ui/Button";

export default function ServicesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-surface-700 mb-2">
        {t.services.title}
      </h1>
      <p className="text-surface-700/60 mb-6">
        {t.services.wip}
      </p>
      <Button variant="secondary" href="/" aria-label={t.services.backHome}>
        {t.services.backHome}
      </Button>
    </div>
  );
}
