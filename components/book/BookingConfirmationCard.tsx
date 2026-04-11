"use client";

import { useCallback, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { useLanguage } from "@/lib/i18n";
import type { Locale } from "@/lib/api";

export type BookingConfirmationSnapshot = {
  reference: string;
  branchLabel: string;
  pickupIso: string;
  memberName: string;
  currencyCode: string;
  amountFx: number;
  totalThb: number;
  directionLabel: string;
};

function formatPickup(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const loc =
    locale === "cn" ? "zh-CN" : locale === "en" ? "en-GB" : "th-TH";
  return new Intl.DateTimeFormat(loc, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

type Props = {
  snapshot: BookingConfirmationSnapshot;
};

export default function BookingConfirmationCard({ snapshot }: Props) {
  const { t, locale } = useLanguage();
  const p = t.portal;
  const loc = locale as Locale;
  const captureRef = useRef<HTMLDivElement>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const qrPayload = snapshot.reference;

  const saveImage = useCallback(async () => {
    const el = captureRef.current;
    if (!el) return;
    setSaveBusy(true);
    try {
      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `MXTH-booking-${snapshot.reference.replace(/[^A-Z0-9-]/gi, "_")}.png`;
      a.click();
    } catch {
      window.alert(p.bookSaveImageError);
    } finally {
      setSaveBusy(false);
    }
  }, [p.bookSaveImageError, snapshot.reference]);

  const copyRef = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snapshot.reference);
      setCopyFeedback(true);
      window.setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      /* ignore */
    }
  }, [snapshot.reference]);

  const nf = (n: number, maxFrac = 2) =>
    n.toLocaleString(loc === "cn" ? "zh-CN" : loc === "en" ? "en-GB" : "th-TH", {
      maximumFractionDigits: maxFrac,
    });

  return (
    <div className="space-y-3 pt-1 border-t border-border/80">
      <p className="text-sm font-medium text-surface-900">{p.bookConfirmTitle}</p>

      <div
        ref={captureRef}
        className="rounded-xl border border-border bg-white px-4 py-5 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="flex justify-center sm:justify-start shrink-0">
            <div className="rounded-lg border border-border bg-white p-2">
              <QRCode
                value={qrPayload}
                size={112}
                level="M"
                fgColor="#1f2937"
                bgColor="#ffffff"
                className="h-auto max-w-full"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <p className="text-xs text-surface-500 mb-1">{p.bookConfirmationCode}</p>
              <p className="font-mono text-lg font-semibold text-surface-900 tracking-wide break-all">
                {snapshot.reference}
              </p>
            </div>

            <dl className="text-sm space-y-2 text-surface-700">
              <div className="flex justify-between gap-4">
                <dt className="text-surface-500 shrink-0">{p.bookingBranch}</dt>
                <dd className="text-right font-medium text-surface-900">
                  {snapshot.branchLabel}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-surface-500 shrink-0">{p.bookVisitTime}</dt>
                <dd className="text-right text-surface-900">
                  {formatPickup(snapshot.pickupIso, loc)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-surface-500 shrink-0">{p.bookEstimateFx}</dt>
                <dd className="text-right tabular-nums">
                  {nf(snapshot.amountFx, 6)} {snapshot.currencyCode}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-surface-500 shrink-0">{p.bookEstimateThb}</dt>
                <dd className="text-right tabular-nums font-medium">
                  {nf(snapshot.totalThb)} THB
                </dd>
              </div>
            </dl>

            <p className="text-xs text-surface-500 leading-relaxed">
              {p.bookRefHint}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={copyRef}
          className="flex-1 h-11 rounded-xl border border-border bg-white text-sm font-medium text-surface-800 hover:bg-surface-50 transition-colors"
        >
          {copyFeedback ? p.bookCopied : p.bookCopyRef}
        </button>
        <button
          type="button"
          onClick={saveImage}
          disabled={saveBusy}
          className="flex-1 h-11 rounded-xl border border-site-accent/40 bg-site-subtle text-sm font-medium text-site-accent hover:bg-white transition-colors disabled:opacity-60"
        >
          {saveBusy ? p.bookSaveImageBusy : p.bookSaveImage}
        </button>
      </div>
    </div>
  );
}
