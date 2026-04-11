"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeAuthNext } from "@/lib/customerAuthPaths";
import { isEmailLike, normalizeEmail } from "@/lib/authIdentifier";
import {
  isValidThaiMobile,
  normalizeThaiMobile,
  phoneToAuthEmail,
  toE164Thai,
} from "@/lib/phoneAuth";
import { useLanguage } from "@/lib/i18n";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

const MIN_PASSWORD = 6;

const inputClass =
  "w-full h-12 rounded-xl bg-surface-100 border-0 text-sm text-surface-800 placeholder:text-surface-400 focus:ring-2 focus:ring-site-accent/30 outline-none px-4 transition-shadow";

function buildAuthPath(mode: "login" | "register", nextRaw: string | null) {
  const base = mode === "login" ? "/customer/login" : "/customer/register";
  if (!nextRaw) return base;
  return `${base}?next=${encodeURIComponent(nextRaw)}`;
}

function postAuthPath(nextRaw: string | null): string {
  if (nextRaw) return sanitizeAuthNext(nextRaw);
  return "/customer";
}

type Props = {
  initialView: "login" | "register";
};

export default function CustomerAuthForm({ initialView }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");

  const [view, setView] = useState<"login" | "register">(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const [phone, setPhone] = useState("");
  /** Login screen only: email or Thai mobile (register still uses `phone`). */
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpHint, setOtpHint] = useState("");
  const [otpChannel, setOtpChannel] = useState<"email" | "sms" | null>(null);

  const handleSwitchView = useCallback(() => {
    setError("");
    setInfo("");
    const next = view === "login" ? "register" : "login";
    setView(next);
    setTimeout(() => {
      window.history.replaceState(null, "", buildAuthPath(next, nextRaw));
    }, 0);
  }, [view, nextRaw]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const raw = loginId.trim();
    let emailForAuth: string;
    if (isEmailLike(raw)) {
      emailForAuth = normalizeEmail(raw);
    } else {
      const mobile = normalizeThaiMobile(raw);
      if (!isValidThaiMobile(mobile)) {
        setError(t.auth.invalidPhone);
        return;
      }
      emailForAuth = phoneToAuthEmail(mobile);
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: emailForAuth,
        password,
      });
      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? t.auth.invalidCredentials
            : authError.message,
        );
        return;
      }
      router.push(postAuthPath(nextRaw));
      router.refresh();
    } catch {
      setError(t.auth.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp() {
    setError("");
    setOtpHint("");
    setOtpChannel(null);
    const raw = loginId.trim();
    setOtpBusy(true);
    try {
      const supabase = createClient();
      if (isEmailLike(raw)) {
        const email = normalizeEmail(raw);
        const { error: e } = await supabase.auth.signInWithOtp({ email });
        if (e) {
          setError(e.message);
          return;
        }
        setOtpChannel("email");
        setOtpHint(t.auth.otpSentEmail);
        return;
      }
      const mobile = normalizeThaiMobile(raw);
      if (!isValidThaiMobile(mobile)) {
        setError(t.auth.invalidPhone);
        return;
      }
      const { error: e } = await supabase.auth.signInWithOtp({
        phone: toE164Thai(mobile),
      });
      if (e) {
        setError(e.message);
        return;
      }
      setOtpChannel("sms");
      setOtpHint(t.auth.otpSent);
    } catch {
      setError(t.auth.genericError);
    } finally {
      setOtpBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = otpCode.trim();
    const raw = loginId.trim();
    const channel =
      otpChannel ?? (isEmailLike(raw) ? "email" : "sms");
    if (token.length < 4) {
      setError(t.auth.genericError);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      let verifyError;
      if (channel === "email") {
        if (!isEmailLike(raw)) {
          setError(t.auth.invalidEmail);
          return;
        }
        const result = await supabase.auth.verifyOtp({
          email: normalizeEmail(raw),
          token,
          type: "email",
        });
        verifyError = result.error;
      } else {
        const mobile = normalizeThaiMobile(raw);
        if (!isValidThaiMobile(mobile)) {
          setError(t.auth.invalidPhone);
          return;
        }
        const result = await supabase.auth.verifyOtp({
          phone: toE164Thai(mobile),
          token,
          type: "sms",
        });
        verifyError = result.error;
      }
      const e = verifyError;
      if (e) {
        setError(e.message);
        return;
      }
      router.push(postAuthPath(nextRaw));
      router.refresh();
    } catch {
      setError(t.auth.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!termsAccepted) {
      setError(t.auth.mustAcceptTerms);
      return;
    }
    const mobile = normalizeThaiMobile(phone);
    if (!isValidThaiMobile(mobile)) {
      setError(t.auth.invalidPhone);
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(t.auth.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(t.auth.passwordMismatch);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      const { data, error: signErr } = await supabase.auth.signUp({
        email: phoneToAuthEmail(mobile),
        password,
        options: {
          data: {
            full_name: name.trim() || undefined,
            phone: mobile,
            app_role: "customer",
            terms_accepted_at: now,
          },
        },
      });
      if (signErr) {
        setError(signErr.message);
        return;
      }
      if (data.session) {
        router.push(postAuthPath(nextRaw));
        router.refresh();
        return;
      }
      setInfo(t.auth.checkAfterRegister);
    } catch {
      setError(t.auth.genericError);
    } finally {
      setLoading(false);
    }
  }

  const isLogin = view === "login";

  return (
    <AuthSplitLayout
      view={view}
      onSwitchView={handleSwitchView}
      heroTitle={
        isLogin ? t.auth.splitLoginHeroTitle : t.auth.splitRegisterHeroTitle
      }
      heroSubtitle={
        isLogin
          ? t.auth.splitLoginHeroSubtitle
          : t.auth.splitRegisterHeroSubtitle
      }
      switchLabel={isLogin ? t.auth.ctaSignUp : t.auth.ctaSignIn}
    >
      {isLogin ? (
        <div className="max-w-[380px] mx-auto w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 text-center tracking-tight">
            {t.auth.loginTitle}
          </h1>
          <p className="text-center text-sm text-surface-500 mt-4 mb-10 leading-relaxed">
            {t.auth.formHintLogin}
          </p>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100"
              role="alert"
            >
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="login-id" className="sr-only">
                {t.auth.placeholderEmailOrPhone}
              </label>
              <input
                id="login-id"
                type="text"
                autoComplete="username"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder={t.auth.placeholderEmailOrPhone}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="sr-only">
                {t.auth.password}
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.placeholderPassword}
                className={inputClass}
              />
            </div>

            <p className="text-center pt-1">
              <Link
                href="/customer/forgot"
                className="text-sm text-surface-500 hover:text-site-accent transition-colors"
              >
                {t.auth.forgotPassword}
              </Link>
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-1 rounded-xl bg-site-accent text-white text-sm font-bold uppercase tracking-[0.15em] hover:bg-site-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t.auth.loggingIn : t.auth.submitLogin}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-border">
            <p className="text-center text-xs font-semibold text-surface-500 uppercase tracking-wider mb-5">
              {t.auth.otpHeading}
            </p>
            <div className="space-y-5">
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpBusy}
                className="w-full h-12 rounded-xl border-2 border-site-accent/40 text-site-accent text-sm font-semibold hover:bg-site-subtle disabled:opacity-60"
              >
                {otpBusy ? t.auth.otpBusy : t.auth.otpSend}
              </button>
              {otpHint && (
                <p className="text-xs text-center text-surface-600 leading-relaxed px-1">
                  {otpHint}
                </p>
              )}
              <form
                onSubmit={verifyOtp}
                className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3"
              >
                <input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder={t.auth.otpCodePlaceholder}
                  className={`${inputClass} min-h-[48px] sm:flex-1`}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 shrink-0 rounded-xl bg-surface-200 px-5 text-sm font-semibold text-surface-800 hover:bg-surface-300 disabled:opacity-60 sm:min-w-[7.5rem]"
                >
                  {t.auth.otpVerify}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[380px] mx-auto w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 text-center tracking-tight">
            {t.auth.createAccountTitle}
          </h1>
          <p className="text-center text-sm text-surface-500 mt-4 mb-10 leading-relaxed">
            {t.auth.formHintRegister}
          </p>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100"
              role="alert"
            >
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}
          {info && (
            <div className="mb-6 p-4 rounded-xl bg-site-subtle border border-site-subtle-border">
              <p className="text-sm text-site-accent text-center">{info}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="reg-name" className="sr-only">
                {t.auth.displayName}
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.auth.placeholderName}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="reg-phone" className="sr-only">
                {t.auth.phone}
              </label>
              <input
                id="reg-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.auth.placeholderPhone}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="sr-only">
                {t.auth.password}
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.placeholderPassword}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="reg-confirm" className="sr-only">
                {t.auth.confirmPassword}
              </label>
              <input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={t.auth.placeholderConfirmPassword}
                className={inputClass}
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer text-sm text-surface-600">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 rounded border-border text-site-accent focus:ring-site-accent"
              />
              <span>
                {t.auth.termsAccept}{" "}
                <Link
                  href="/faq"
                  className="text-site-accent font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.auth.termsLink}
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !termsAccepted}
              className="w-full h-12 rounded-xl bg-site-accent text-white text-sm font-bold uppercase tracking-[0.15em] hover:bg-site-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? t.auth.registering : t.auth.submitRegister}
            </button>
          </form>
        </div>
      )}
    </AuthSplitLayout>
  );
}
