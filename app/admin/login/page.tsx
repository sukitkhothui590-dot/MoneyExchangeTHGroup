"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteImage from "@/components/site/SiteImage";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import { SITE_LOGO_SRC } from "@/lib/siteLogo";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import AdminLangSwitcher from "../components/AdminLangSwitcher";

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useAdminLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? t.login.invalidCreds
            : authError.message,
        );
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError(t.login.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 pb-10 pt-6">
      <div className="w-full max-w-[380px] flex justify-end mb-4">
        <AdminLangSwitcher />
      </div>

      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-10">
          <SiteImage
            src={SITE_LOGO_SRC}
            alt="MoneyExchangeTHGroup"
            width={180}
            height={56}
            className="object-contain max-h-14 w-auto"
            bypassPlaceholder
          />
        </div>

        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="h-1 bg-brand" />
          <div className="p-7">
            <div className="text-center mb-6">
              <h1 className="text-lg font-semibold text-foreground">
                {t.login.title}
              </h1>
              <p className="text-sm text-muted mt-1">{t.login.subtitle}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-danger text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  {t.login.email}
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@moneyexchangethgroup.com"
                    className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  {t.login.password}
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong focus:border-brand"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-border accent-brand"
                  />
                  <span className="text-xs text-muted">{t.login.rememberMe}</span>
                </label>
                <button
                  type="button"
                  className="text-xs text-brand hover:text-brand-dark transition-colors cursor-pointer"
                >
                  {t.login.forgotPassword}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? t.login.submitting : t.login.submit}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted/60 mt-8">
          {t.common.copyright}
        </p>
      </div>
    </div>
  );
}
