"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  BookingFxDirection,
  BookingAmountInputUnit,
} from "@/lib/mock/store";
import { computeBookingEstimates } from "@/lib/book/booking-math";
import {
  currencyCodeToFlagCountry,
  currencyCodeToFlagEmoji,
} from "@/lib/currencyFlagCountry";
import { useLanguage } from "@/lib/i18n";
import type { Locale } from "@/lib/api";
import DropdownSelect from "@/components/ui/DropdownSelect";
import BookingConfirmationCard, {
  type BookingConfirmationSnapshot,
} from "@/components/book/BookingConfirmationCard";

type ApiCurrency = {
  code: string;
  flag: string;
  buy_rate: number;
  sell_rate: number;
};

const FALLBACK_CURRENCIES: ApiCurrency[] = [
  { code: "USD", flag: currencyCodeToFlagEmoji("USD"), buy_rate: 35.2, sell_rate: 35.6 },
  { code: "EUR", flag: currencyCodeToFlagEmoji("EUR"), buy_rate: 38.0, sell_rate: 38.5 },
  { code: "JPY", flag: currencyCodeToFlagEmoji("JPY"), buy_rate: 0.232, sell_rate: 0.238 },
];

const AML_THB_THRESHOLD = 500_000;

/** ธงเป็นภาพ (flagcdn) — ไม่พึ่งค่า flag ในฐานข้อมูลที่อาจเป็น us/eu แบบตัวหนังสือ */
function CurrencyFlagImg({
  currencyCode,
  className = "h-4 w-[1.375rem] rounded-sm object-cover border border-border/50 bg-white shrink-0",
}: {
  currencyCode: string;
  className?: string;
}) {
  const cc = currencyCodeToFlagCountry(currencyCode);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ธงจาก CDN ตามที่ใช้ใน Header
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      alt=""
      width={22}
      height={16}
      className={className}
    />
  );
}

function defaultPickupLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputMin(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type BookingFormProps = {
  branchId: string;
  branchLabel: string;
  /** แสดงใต้ชื่อสาขา (เช่น เวลาเปิด) */
  branchHours?: string;
  branchSelector?: React.ReactNode;
  loginNextPath?: string;
};

export default function BookingForm({
  branchId,
  branchLabel,
  branchHours,
  branchSelector,
  loginNextPath = "/customer/book",
}: BookingFormProps) {
  const { t, locale } = useLanguage();
  const p = t.portal;
  const router = useRouter();
  const loc = locale as Locale;

  const [currencies, setCurrencies] = useState<ApiCurrency[]>(FALLBACK_CURRENCIES);
  const [direction, setDirection] = useState<BookingFxDirection>("buy_fx");
  const [amountUnit, setAmountUnit] = useState<BookingAmountInputUnit>("fx");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [pickupLocal, setPickupLocal] = useState(defaultPickupLocal);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  /** บัตรยืนยันหลังส่งสำเร็จ (QR + รหัส) */
  const [confirmed, setConfirmed] = useState<BookingConfirmationSnapshot | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/currencies");
        const json = (await res.json()) as { data?: ApiCurrency[] };
        if (!res.ok || !json.data?.length) return;
        if (!cancelled) {
          setCurrencies(
            json.data.map((c) => {
              const code = String(c.code ?? "").trim().toUpperCase();
              return {
                code,
                flag: currencyCodeToFlagEmoji(code),
                buy_rate: Number(c.buy_rate) || 0,
                sell_rate: Number(c.sell_rate) || 0,
              };
            }),
          );
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (currencies.length === 0) return;
    const exists = currencies.some((c) => c.code === currency);
    if (!exists) setCurrency(currencies[0].code);
  }, [currencies, currency]);

  const cur = useMemo(
    () => currencies.find((c) => c.code === currency) ?? currencies[0],
    [currencies, currency],
  );

  const estimates = useMemo(() => {
    const raw = Number(amount);
    if (!cur || !Number.isFinite(raw) || raw <= 0) {
      return { amountFx: 0, totalThb: 0, rateUsed: 0 };
    }
    return computeBookingEstimates(
      direction,
      amountUnit,
      raw,
      cur.buy_rate,
      cur.sell_rate,
    );
  }, [amount, amountUnit, cur, direction]);

  const directionOptions = useMemo(
    () => [
      { value: "buy_fx" as const, label: p.bookDirectionBuyFx },
      { value: "sell_fx" as const, label: p.bookDirectionSellFx },
    ],
    [p.bookDirectionBuyFx, p.bookDirectionSellFx],
  );

  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => ({
        value: c.code,
        label: c.code,
        labelContent: (
          <span className="inline-flex items-center gap-2.5 min-w-0">
            <CurrencyFlagImg currencyCode={c.code} />
            <span className="font-medium tabular-nums">{c.code}</span>
          </span>
        ),
      })),
    [currencies],
  );

  const amountUnitOptions = useMemo(
    () => [
      { value: "fx" as const, label: p.bookAmountUnitFx },
      { value: "thb" as const, label: p.bookAmountUnitThb },
    ],
    [p.bookAmountUnitFx, p.bookAmountUnitThb],
  );

  const showAml = estimates.totalThb >= AML_THB_THRESHOLD;

  const resetForm = useCallback(() => {
    setAmount("");
    setNote("");
    setPickupLocal(defaultPickupLocal());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setConfirmed(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/customer/login?next=${encodeURIComponent(loginNextPath)}`);
        return;
      }
      const raw = Number(amount);
      if (!Number.isFinite(raw) || raw <= 0) {
        setMsg(t.auth.genericError);
        setLoading(false);
        return;
      }
      const pickupDate = new Date(pickupLocal);
      if (
        Number.isNaN(pickupDate.getTime()) ||
        pickupDate.getTime() < Date.now()
      ) {
        setMsg(p.bookPickupInvalid);
        setLoading(false);
        return;
      }

      const { amountFx, totalThb, rateUsed } = computeBookingEstimates(
        direction,
        amountUnit,
        raw,
        cur.buy_rate,
        cur.sell_rate,
      );
      if (!amountFx || !totalThb) {
        setMsg(t.auth.genericError);
        setLoading(false);
        return;
      }

      const meta = user.user_metadata as { full_name?: string; phone?: string };
      const memberName =
        meta.full_name?.trim() ||
        user.user_metadata?.full_name?.toString() ||
        "ลูกค้า";
      const flag = currencyCodeToFlagEmoji(currency);
      const directionLabel =
        direction === "buy_fx"
          ? p.bookDirectionBuyFx
          : p.bookDirectionSellFx;
      const noteLines = [
        note.trim(),
        `${p.bookDirection}: ${directionLabel} · ${p.bookAmountUnit}: ${amountUnit === "fx" ? p.bookAmountUnitFx : p.bookAmountUnitThb}`,
      ].filter(Boolean);

      const res = await fetch("/api/customer/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: branchId,
          branch_name: branchLabel,
          currency_code: currency,
          currency_flag: flag,
          amount: Math.round(amountFx * 1e6) / 1e6,
          rate: rateUsed,
          total_thb: Math.round(totalThb * 100) / 100,
          pickup_method: "branch",
          pickup_date: pickupDate.toISOString(),
          status: "pending_payment",
          note: noteLines.join("\n"),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(
          typeof payload.error === "string"
            ? payload.error
            : t.auth.genericError,
        );
        setLoading(false);
        return;
      }
      const created = payload.data as {
        id: string;
        confirmation_code?: string;
      };
      const reference =
        created?.confirmation_code?.trim() || created?.id || "";
      setConfirmed({
        reference,
        branchLabel,
        pickupIso: pickupDate.toISOString(),
        memberName,
        currencyCode: currency,
        amountFx,
        totalThb,
        directionLabel,
      });
      resetForm();
    } catch {
      setMsg(t.auth.genericError);
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full h-12 rounded-2xl border border-border/80 bg-white px-4 text-sm text-surface-900 shadow-sm transition-shadow outline-none focus:border-site-accent/40 focus:ring-2 focus:ring-site-accent/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {branchSelector ? (
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            {p.bookBranch}
          </label>
          {branchSelector}
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              {p.bookBranch}
            </label>
            <p className="text-sm font-semibold text-surface-900 py-2.5 px-4 rounded-2xl bg-gradient-to-br from-surface-50 to-surface-100 ring-1 ring-border/60">
              {branchLabel}
            </p>
          </div>
          {branchHours ? (
            <p className="text-xs text-surface-600">
              <span className="font-medium">{p.bookHoursLabel} </span>
              {branchHours}
            </p>
          ) : null}
          <p className="text-[11px] text-surface-500">
            {p.bookBranchIdLabel}: {branchId}
          </p>
        </div>
      )}

      <DropdownSelect
        id="book-direction"
        label={p.bookDirection}
        value={direction}
        onChange={(v) => setDirection(v as BookingFxDirection)}
        options={directionOptions}
      />

      <DropdownSelect
        id="book-currency"
        label={p.bookCurrency}
        value={currency}
        onChange={setCurrency}
        options={currencyOptions}
      />

      {cur ? (
        <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-surface-50 to-white px-4 py-3 text-xs space-y-1 shadow-sm">
          <p className="font-semibold text-surface-800">{p.bookRefRateTitle}</p>
          <p className="text-surface-700">
            {p.bookRateShopBuy}: {cur.buy_rate.toLocaleString(loc === "cn" ? "zh-CN" : loc === "en" ? "en-GB" : "th-TH")}
          </p>
          <p className="text-surface-700">
            {p.bookRateShopSell}: {cur.sell_rate.toLocaleString(loc === "cn" ? "zh-CN" : loc === "en" ? "en-GB" : "th-TH")}
          </p>
          <p className="text-surface-500 mt-1 pt-1 border-t border-border/80">
            {p.bookRateDisclaimer}
          </p>
        </div>
      ) : null}

      <DropdownSelect
        id="book-amount-unit"
        label={p.bookAmountUnit}
        value={amountUnit}
        onChange={(v) => setAmountUnit(v as BookingAmountInputUnit)}
        options={amountUnitOptions}
      />

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1">
          {amountUnit === "fx" ? (
            <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span>{p.bookAmount}</span>
              <span className="inline-flex items-center gap-1.5">
                (
                <CurrencyFlagImg
                  currencyCode={currency}
                  className="h-4 w-[1.375rem] rounded-sm object-cover border border-border/50 bg-white shrink-0"
                />
                <span>{currency})</span>
              </span>
            </span>
          ) : (
            <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span>{p.bookAmount}</span>
              <span className="inline-flex items-center gap-1.5">
                (
                <CurrencyFlagImg
                  currencyCode="THB"
                  className="h-4 w-[1.375rem] rounded-sm object-cover border border-border/50 bg-white shrink-0"
                />
                <span>THB)</span>
              </span>
            </span>
          )}
        </label>
        <input
          type="number"
          step="any"
          min={0}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full h-12 rounded-2xl border border-border/80 bg-surface-50 px-4 text-sm shadow-inner outline-none focus:border-site-accent/40 focus:ring-2 focus:ring-site-accent/20"
        />
      </div>

      {estimates.totalThb > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-[var(--site-subtle)] to-white border border-site-subtle-border px-4 py-3 text-xs text-surface-800 space-y-0.5 shadow-sm">
          <p className="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5">
            <span>
              {p.bookEstimateFx}: {estimates.amountFx.toLocaleString()}{" "}
            </span>
            <span className="inline-flex items-center gap-1">
              <CurrencyFlagImg
                currencyCode={currency}
                className="h-3.5 w-5 rounded-sm object-cover border border-border/40 bg-white shrink-0"
              />
              <span>{currency}</span>
            </span>
          </p>
          <p>
            {p.bookEstimateThb}:{" "}
            {estimates.totalThb.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            THB
          </p>
        </div>
      )}

      {showAml ? (
        <p className="text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {p.bookAmlHint}
        </p>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1">
          {p.bookPickupDate}
        </label>
        <input
          type="datetime-local"
          required
          min={localInputMin()}
          value={pickupLocal}
          onChange={(e) => setPickupLocal(e.target.value)}
          className={inputBase}
        />
        <p className="text-xs text-surface-500 mt-1">{p.bookPickupHint}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1">
          {p.bookNote}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-border/80 bg-surface-50 px-4 py-3 text-sm shadow-inner outline-none focus:border-site-accent/40 focus:ring-2 focus:ring-site-accent/20"
        />
      </div>

      {confirmed ? <BookingConfirmationCard snapshot={confirmed} /> : null}

      {msg && (
        <p className="text-sm text-site-accent bg-site-subtle border border-site-subtle-border rounded-lg px-3 py-2">
          {msg}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-2xl bg-site-accent text-white font-semibold shadow-md shadow-site-accent/25 hover:bg-site-accent-hover hover:shadow-lg transition-all disabled:opacity-60"
      >
        {loading ? "…" : p.bookSubmit}
      </button>
    </form>
  );
}
