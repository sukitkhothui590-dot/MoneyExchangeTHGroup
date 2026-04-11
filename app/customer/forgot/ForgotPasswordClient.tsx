"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function ForgotPasswordClient() {
  const { t } = useLanguage();
  const p = t.portal;
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold text-surface-900">{p.forgotTitle}</h1>
      <p className="mt-4 text-surface-600 leading-relaxed">{p.forgotBody}</p>
      <Link
        href="/customer/login"
        className="mt-8 inline-flex rounded-full bg-site-accent text-white px-8 py-3 font-semibold hover:bg-site-accent-hover"
      >
        {t.auth.linkLogin}
      </Link>
    </div>
  );
}
