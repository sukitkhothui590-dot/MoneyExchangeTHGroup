"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import DropdownSelect from "@/components/ui/DropdownSelect";
import { THAI_PROVINCES } from "@/lib/book/thai-provinces";
import {
  FALLBACK_BRANCHES,
  filterByProvince,
  filterBySearch,
  withProvince,
  type BranchRow,
} from "@/lib/book/branch-data";
import BookingForm from "@/components/book/BookingForm";
import type { Locale } from "@/lib/i18n";

type CountryId = "TH" | "SG" | "MY";

function branchHoursForLocale(b: BranchRow, locale: Locale) {
  if (locale === "th") return b.hours_th;
  if (locale === "cn") return b.hours_cn || b.hours || b.hours_th;
  return b.hours || b.hours_th;
}

const PAGE_SIZE = 6;

function hashRating(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return 4.5 + (Math.abs(h) % 50) / 100;
}

export default function BookExchangePage() {
  const { t, locale } = useLanguage();
  const p = t.portal;
  const [country, setCountry] = useState<CountryId>("TH");
  const [provinceId, setProvinceId] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<(BranchRow & { provinceId: string })[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [detailBranch, setDetailBranch] = useState<
    (BranchRow & { provinceId: string }) | null
  >(null);
  const [bookBranch, setBookBranch] = useState<
    (BranchRow & { provinceId: string }) | null
  >(null);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch("/api/branches");
      const json = (await res.json()) as { data?: BranchRow[]; error?: string };
      if (!res.ok || !json.data) {
        setLoadError(true);
        setRows(FALLBACK_BRANCHES.map(withProvince));
        return;
      }
      const list = json.data.filter((b) => b.status === "active");
      if (list.length === 0) {
        setRows(FALLBACK_BRANCHES.map(withProvince));
      } else {
        setRows(list.map(withProvince));
      }
    } catch {
      setLoadError(true);
      setRows(FALLBACK_BRANCHES.map(withProvince));
    }
  }, []);

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  const filtered = useMemo(() => {
    if (country !== "TH") return [];
    const byP = filterByProvince(rows, provinceId);
    return filterBySearch(byP, search);
  }, [rows, country, provinceId, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const slice = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    setPage(1);
  }, [provinceId, search, country]);

  const provLabel = (id: string) => {
    const row = THAI_PROVINCES.find((x) => x.id === id);
    if (!row) return id;
    return locale === "th" ? row.nameTh : row.nameEn;
  };

  const countryOptions = useMemo(
    () => [
      { value: "TH", label: p.bookCountryThailand },
      {
        value: "SG",
        label: `${p.bookCountrySingapore} (${p.bookCountrySoon})`,
      },
      {
        value: "MY",
        label: `${p.bookCountryMalaysia} (${p.bookCountrySoon})`,
      },
    ],
    [p],
  );

  const provinceOptions = useMemo(
    () =>
      THAI_PROVINCES.map((prov) => ({
        value: prov.id,
        label: locale === "th" ? prov.nameTh : prov.nameEn,
      })),
    [locale],
  );

  return (
    <div className="bg-surface-50 min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">
              {p.bookPageTitle}
            </h1>
            <p className="mt-1 text-surface-600 text-sm sm:text-base max-w-xl">
              {p.bookPageSubtitle}
            </p>
          </div>
          <div className="flex rounded-full border border-border bg-white shadow-sm overflow-hidden max-w-md w-full sm:w-auto">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={p.bookSearchPlaceholder}
              className="flex-1 min-w-0 h-11 px-4 text-sm bg-transparent outline-none placeholder:text-surface-400"
              aria-label={p.bookSearchPlaceholder}
            />
            <button
              type="button"
              className="shrink-0 px-5 h-11 rounded-full bg-surface-900 text-white text-sm font-semibold hover:bg-surface-800 m-0.5"
            >
              {p.bookSearchButton}
            </button>
          </div>
        </div>

        {loadError && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 mb-6">
            {p.bookLoadFallback}
          </p>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <aside className="w-full lg:w-72 shrink-0 space-y-5">
            <DropdownSelect
              id="book-country"
              label={p.bookCategoryCountry}
              value={country}
              onChange={(v) => setCountry(v as CountryId)}
              options={countryOptions}
            />
            <DropdownSelect
              id="book-province"
              label={p.bookCategoryProvince}
              value={provinceId}
              onChange={setProvinceId}
              options={provinceOptions}
              disabled={country !== "TH"}
            />
          </aside>

          <div className="flex-1 min-w-0">
            {country !== "TH" ? (
              <p className="text-surface-600 text-center py-20 rounded-3xl border border-dashed border-border bg-white">
                {p.bookCountryEmpty}
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-surface-600 text-center py-20 rounded-3xl border border-dashed border-border bg-white">
                {p.bookNoBranches}
              </p>
            ) : (
              <>
                <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {slice.map((b) => {
                    const rating = hashRating(b.id);
                    const tag = provLabel(b.provinceId);
                    return (
                      <li
                        key={b.id}
                        className="rounded-3xl border border-border bg-white p-4 shadow-sm flex flex-col"
                      >
                        <div className="relative aspect-[4/3] rounded-2xl bg-surface-100 mb-4 flex items-center justify-center overflow-hidden">
                          <span className="text-surface-300 text-4xl select-none" aria-hidden>
                            💱
                          </span>
                          <span className="absolute top-3 right-3 rounded-full bg-white/95 border border-border px-2.5 py-0.5 text-[11px] font-medium text-surface-700 shadow-sm">
                            {tag}
                          </span>
                        </div>
                        <h3 className="font-bold text-surface-900 text-base leading-snug line-clamp-2">
                          {locale === "th" ? b.name_th : b.name}
                        </h3>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            <span aria-hidden>★</span>
                            <span className="font-medium tabular-nums">
                              {rating.toFixed(1)}
                            </span>
                            <span className="text-surface-500">
                              {p.bookReviewsHint}
                            </span>
                          </p>
                        </div>
                        <p className="mt-2 text-xs text-surface-500 line-clamp-2 min-h-[2.5rem]">
                          {locale === "th" ? b.address_th : b.address}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailBranch(b)}
                            className="h-10 rounded-xl border border-surface-300 text-sm font-semibold text-surface-800 hover:bg-surface-50"
                          >
                            {p.bookViewDetails}
                          </button>
                          <button
                            type="button"
                            onClick={() => setBookBranch(b)}
                            className="h-10 rounded-xl bg-surface-900 text-white text-sm font-semibold hover:bg-surface-800"
                          >
                            {p.bookReserveNow}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((n) => Math.max(1, n - 1))}
                    className="h-10 px-4 rounded-xl border border-border bg-white text-sm font-medium text-surface-800 hover:bg-surface-50 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {p.bookPrev}
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={`min-w-[2.5rem] h-10 rounded-xl text-sm font-semibold ${
                          n === safePage
                            ? "bg-surface-200 text-surface-900"
                            : "text-surface-600 hover:bg-surface-100"
                        }`}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={safePage >= pageCount}
                    onClick={() =>
                      setPage((n) => Math.min(pageCount, n + 1))
                    }
                    className="h-10 px-4 rounded-xl border border-border bg-white text-sm font-medium text-surface-800 hover:bg-surface-50 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {p.bookNext}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {detailBranch && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal
          aria-labelledby="branch-detail-title"
          onClick={() => setDetailBranch(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <h2 id="branch-detail-title" className="text-lg font-bold text-surface-900">
                {locale === "th" ? detailBranch.name_th : detailBranch.name}
              </h2>
              <button
                type="button"
                onClick={() => setDetailBranch(null)}
                className="shrink-0 rounded-full w-9 h-9 flex items-center justify-center hover:bg-surface-100 text-surface-600"
                aria-label={p.bookClose}
              >
                ×
              </button>
            </div>
            <p className="text-sm text-surface-600 whitespace-pre-wrap">
              {locale === "th" ? detailBranch.address_th : detailBranch.address}
            </p>
            <p className="mt-4 text-sm text-surface-700">
              <span className="font-medium">{p.bookHoursLabel} </span>
              {branchHoursForLocale(detailBranch, locale)}
            </p>
            <button
              type="button"
              onClick={() => {
                setDetailBranch(null);
                setBookBranch(detailBranch);
              }}
              className="mt-6 w-full h-12 rounded-xl bg-surface-900 text-white font-semibold hover:bg-surface-800"
            >
              {p.bookReserveNow}
            </button>
          </div>
        </div>
      )}

      {bookBranch && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal
          onClick={() => setBookBranch(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl shadow-slate-900/10 ring-1 ring-black/[0.04] p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4 mb-5">
              <h2 className="text-xl font-bold text-surface-900 tracking-tight">
                {p.bookTitle}
              </h2>
              <button
                type="button"
                onClick={() => setBookBranch(null)}
                className="shrink-0 rounded-full w-9 h-9 flex items-center justify-center hover:bg-surface-100 text-surface-600"
                aria-label={p.bookClose}
              >
                ×
              </button>
            </div>
            <p className="text-sm text-surface-600 mb-1">
              {locale === "th" ? bookBranch.name_th : bookBranch.name}
            </p>
            <p className="text-xs text-surface-500 mb-4">
              <span className="font-medium text-surface-600">
                {p.bookHoursLabel}{" "}
              </span>
              {branchHoursForLocale(bookBranch, locale)}
            </p>
            <BookingForm
              branchId={bookBranch.id}
              branchLabel={
                locale === "th" ? bookBranch.name_th : bookBranch.name
              }
              branchHours={branchHoursForLocale(bookBranch, locale)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
