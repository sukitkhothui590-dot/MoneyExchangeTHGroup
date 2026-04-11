"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function CustomerHomeClient() {
  const { t } = useLanguage();
  const p = t.portal;
  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-surface-900">{p.homeTitle}</h1>
      <p className="mt-2 text-surface-600">{p.homeSubtitle}</p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link
          href="/customer/book"
          className="inline-flex justify-center rounded-xl bg-site-accent px-8 py-4 text-white font-semibold hover:bg-site-accent-hover transition-colors"
        >
          {p.bookNow}
        </Link>
        <Link
          href="/customer/profile"
          className="inline-flex justify-center rounded-xl border-2 border-site-accent text-site-accent px-8 py-4 font-semibold hover:bg-site-subtle transition-colors"
        >
          {p.myProfile}
        </Link>
        <Link
          href="/customer/login"
          className="inline-flex justify-center rounded-xl border border-surface-200 px-8 py-4 font-medium text-surface-700 hover:bg-white"
        >
          {t.auth.linkLogin}
        </Link>
      </div>
    </div>
  );
}
