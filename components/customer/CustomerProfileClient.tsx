"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { BookingStatus } from "@/lib/types/database";
import {
  getCustomerBookingsForUser,
  getTransactionsForUser,
  seedTransactionsForUserIfEmpty,
} from "@/lib/mock/store";
import { customerBookingToBooking } from "@/lib/mock/bookingAdapter";
import type { MockTxn } from "@/lib/mock/store";
import type { Booking } from "@/lib/types/database";
import { bookingDisplayReference } from "@/lib/book/bookingReference";
import { USE_MOCK_DATA } from "@/lib/config";
import { useLanguage } from "@/lib/i18n";
import { formatDateTime, type Locale } from "@/lib/api";

type Tab = "profile" | "bookings" | "exchanges";

const statusTh: Record<BookingStatus, string> = {
  pending_payment: "รอชำระเงิน",
  pending_review: "รอตรวจสอบ",
  approved: "อนุมัติแล้ว",
  completed: "สำเร็จ",
};

export default function CustomerProfileClient() {
  const { t, locale } = useLanguage();
  const loc = locale as Locale;
  const p = t.portal;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("profile");
  const [name, setName] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [txns, setTxns] = useState<MockTxn[]>([]);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (!u) {
      router.replace("/customer/login?next=/customer/profile");
      return;
    }
    setUser(u);
    const { data: prof } = await supabase
      .from("profiles")
      .select("name,avatar_url,notification_email")
      .eq("id", u.id)
      .maybeSingle();
    if (prof) {
      setName(prof.name ?? "");
      setAvatarUrl(prof.avatar_url);
      setNotifyEmail(prof.notification_email ?? "");
    } else {
      setName(
        (u.user_metadata?.full_name as string) ||
          u.email?.split("@")[0] ||
          "",
      );
    }
    seedTransactionsForUserIfEmpty(
      u.id,
      (u.user_metadata?.full_name as string) || "ลูกค้า",
    );
    let bookingRows: Booking[] = [];
    try {
      const res = await fetch("/api/customer/bookings");
      if (res.ok) {
        const json = (await res.json()) as { data?: Booking[] };
        bookingRows = json.data ?? [];
      }
    } catch {
      /* fall through */
    }
    if (bookingRows.length === 0 && USE_MOCK_DATA) {
      bookingRows = getCustomerBookingsForUser(u.id).map(
        customerBookingToBooking,
      );
    }
    setBookings(bookingRows);
    setTxns(getTransactionsForUser(u.id));
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name: name.trim() || "ลูกค้า",
        email: user.email ?? "",
        avatar_url: avatarUrl,
        notification_email: notifyEmail.trim() || null,
        role: "customer",
      });
      if (error) throw error;
      await supabase.auth.updateUser({
        data: { full_name: name.trim() },
      });
      setMsg(p.saved);
    } catch {
      setMsg(t.auth.genericError);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user || pw1.length < 6) return;
    if (pw1 !== pw2) {
      setMsg(t.auth.passwordMismatch);
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setPw1("");
      setPw2("");
      setMsg(p.changePassword + " ✓");
    } catch {
      setMsg(t.auth.genericError);
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(file: File) {
    if (!user || !file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) return;
    const supabase = createClient();
    const path = `${user.id}/avatar-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (error) {
      setMsg(t.auth.genericError);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl;
    setAvatarUrl(url);
    await supabase.from("profiles").upsert({
      id: user.id,
      name: name.trim() || "ลูกค้า",
      email: user.email ?? "",
      avatar_url: url,
      role: "customer",
    });
  }

  if (loading || !user) {
    return (
      <div className="bg-surface-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center text-surface-500">
          …
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-50 min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">
            {p.profileTitle}
          </h1>
          <p className="mt-1 text-surface-600 text-sm sm:text-base max-w-xl">
            {p.homeSubtitle}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-white shadow-sm p-5 sm:p-8">
          <div className="flex gap-2 border-b border-border mb-6 overflow-x-auto no-scrollbar">
            {(
              [
                ["profile", p.tabProfile],
                ["bookings", p.tabBookings],
                ["exchanges", p.tabExchanges],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors shrink-0 ${
                  tab === k
                    ? "border-site-accent text-site-accent"
                    : "border-transparent text-surface-500 hover:text-surface-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "profile" && (
        <div className="space-y-8">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden bg-surface-200 ring-2 ring-border">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-surface-400">
                    {(name || "?").slice(0, 1)}
                  </div>
                )}
              </div>
              <label className="text-sm">
                <span className="block font-medium text-surface-700 mb-1">
                  {p.avatarHint}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="text-xs"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAvatar(f);
                  }}
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                {p.displayName}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 rounded-xl bg-surface-100 border-0 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                {p.notifyEmail}
              </label>
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                className="w-full h-11 rounded-xl bg-surface-100 border-0 px-3 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-site-accent text-white px-6 py-2.5 text-sm font-semibold hover:bg-site-accent-hover disabled:opacity-60"
            >
              {saving ? "…" : p.save}
            </button>
          </form>

          <form onSubmit={changePassword} className="space-y-4 pt-6 border-t border-border">
            <h2 className="font-semibold text-surface-900">{p.changePassword}</h2>
            <input
              type="password"
              autoComplete="new-password"
              placeholder={p.newPassword}
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              className="w-full h-11 rounded-xl bg-surface-100 border-0 px-3 text-sm"
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder={p.confirmNewPassword}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="w-full h-11 rounded-xl bg-surface-100 border-0 px-3 text-sm"
            />
            <button
              type="submit"
              disabled={saving || pw1.length < 6}
              className="rounded-xl border border-site-accent text-site-accent px-6 py-2.5 text-sm font-semibold hover:bg-site-subtle"
            >
              {p.changePassword}
            </button>
          </form>

          {msg && <p className="text-sm text-site-accent">{msg}</p>}
        </div>
          )}

          {tab === "bookings" && (
        <ul className="space-y-3">
          {bookings.length === 0 ? (
            <p className="text-surface-500">{p.bookingsEmpty}</p>
          ) : (
            bookings.map((b) => (
              <li
                key={b.id}
                className="rounded-2xl border border-border/80 bg-surface-50 p-4 text-sm"
              >
                <div className="flex justify-between gap-2">
                  <span className="font-medium">
                    <span className="block text-xs font-mono text-site-accent mb-1">
                      {p.bookConfirmationCode}:{" "}
                      {bookingDisplayReference(b)}
                    </span>
                    {b.currency_code} {b.amount?.toLocaleString()} →{" "}
                    {b.total_thb?.toLocaleString()} THB
                  </span>
                  <span className="text-surface-500">
                    {statusTh[b.status]}
                  </span>
                </div>
                <p className="text-surface-600 mt-1">
                  {p.bookingBranch}: {b.branch_name ?? "—"}
                  {b.branch_id ? (
                    <span className="text-surface-400"> ({b.branch_id})</span>
                  ) : null}
                </p>
                {b.pickup_date ? (
                  <p className="text-surface-600 mt-0.5">
                    {p.bookVisitTime}:{" "}
                    {formatDateTime(b.pickup_date, loc)}
                  </p>
                ) : null}
                {b.note ? (
                  <p className="text-surface-500 mt-1 text-xs whitespace-pre-wrap">
                    {b.note}
                  </p>
                ) : null}
                <p className="text-xs text-surface-400 mt-1">
                  {p.bookingDate}: {new Date(b.created_at).toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
          )}

          {tab === "exchanges" && (
        <ul className="space-y-3">
          {txns.length === 0 ? (
            <p className="text-surface-500">{p.exchangesEmpty}</p>
          ) : (
            txns.map((x) => (
              <li
                key={x.id}
                className="rounded-2xl border border-border/80 bg-surface-50 p-4 text-sm"
              >
                <div className="font-medium">
                  {x.currency_code} {x.amount} @ {x.rate} → {x.total_thb} THB
                </div>
                <p className="text-surface-600 mt-1">
                  {p.txnBranch}: {x.branch_id} · {x.staff_label}
                </p>
                <p className="text-xs text-surface-400">
                  {new Date(x.created_at).toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
          )}
        </div>
      </div>
    </div>
  );
}
