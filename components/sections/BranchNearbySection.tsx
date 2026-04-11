"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { fetchBranches, type BranchInfo } from "@/lib/api";

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export default function BranchNearbySection() {
  const { t, locale } = useLanguage();
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [selected, setSelected] = useState<BranchInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches().then((data) => {
      setBranches(data);
      const hq = data.find((b) => b.id === "head-office");
      setSelected(hq ?? data[0] ?? null);
      setLoading(false);
    });
  }, []);

  const displayName = (b: BranchInfo) => {
    if (b.id === "head-office") return t.branch.headOfficeName;
    return locale === "th" ? b.name_th || b.name : b.name;
  };

  const displayAddress = (b: BranchInfo) => {
    if (locale === "th") return b.address_th || b.address;
    if (locale === "cn") return b.address_cn || b.address;
    return b.address || b.address_th;
  };

  const displayHours = (b: BranchInfo) => {
    if (locale === "th") return b.hours_th || b.hours;
    if (locale === "cn") return b.hours_cn || b.hours;
    return b.hours || b.hours_th;
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-20 bg-surface-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 h-[400px] bg-gray-200 rounded-2xl" />
              <div className="lg:col-span-5 space-y-3">
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!selected || branches.length === 0) return null;

  const mapQuery = encodeURIComponent(
    `${displayName(selected)} ${displayAddress(selected)}`,
  );
  const phoneNumber = t.header.phone;
  const phoneHref = `tel:${phoneNumber.replace(/[^0-9]/g, "")}`;
  const phoneLabel = t.branch.phoneContact.replace("{phone}", phoneNumber);
  const callNowLabel = t.branch.callNow.replace("{phone}", phoneNumber);

  return (
    <section className="py-16 lg:py-20 bg-surface-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <h2 className="text-xl lg:text-4xl font-bold text-site-accent">
            {t.branch.nearbyTitle}
          </h2>
          <Link
            href="/contact"
            className="text-sm font-medium text-surface-600 hover:text-site-accent transition-colors"
          >
            {t.branch.contactBtn}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Map */}
          <div className="lg:col-span-7">
            <div className="w-full h-[350px] sm:h-[440px] lg:h-[520px] rounded-2xl overflow-hidden">
              <iframe
                title={`${t.branchData.mapTitle.replace("{name}", displayName(selected))}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Branch info */}
          <div className="lg:col-span-5">
            {/* Branch selector */}
            <div className="relative mb-6">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded-xl border border-[#EFF0F2] bg-white px-4 py-3 text-[14px] cursor-pointer hover:border-site-accent transition-colors"
              >
                <span className="text-surface-500">
                  {displayName(selected)}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-site-accent transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#EFF0F2] bg-white shadow-lg overflow-hidden">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      className={[
                        "w-full text-left px-4 py-3 text-[14px] hover:bg-site-subtle cursor-pointer transition-colors",
                        selected.id === branch.id
                          ? "text-site-accent font-semibold bg-site-subtle"
                          : "text-surface-700",
                      ].join(" ")}
                      onClick={() => {
                        setSelected(branch);
                        setOpen(false);
                      }}
                    >
                      {displayName(branch)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Branch details */}
            <div>
              <h3 className="text-xl font-bold text-surface-700 mb-4">
                {displayName(selected)}
              </h3>

              <div className="space-y-3 text-[14px]">
                <div>
                  <span className="font-semibold text-site-accent">
                    {t.branch.address}
                  </span>
                  <p className="mt-0.5 text-surface-600 leading-relaxed">
                    {displayAddress(selected)}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-site-accent">
                    {t.branch.hours}
                  </span>
                  <p className="mt-0.5 text-surface-600">
                    {displayHours(selected)}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-site-accent">
                    {t.branch.status}
                  </span>
                  <p className="mt-0.5 text-surface-600">
                    {t.branch.statusOpen}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-site-accent">
                    {t.branch.contactChannel}
                  </span>
                  <div className="mt-0.5 space-y-1">
                    <a
                      href={phoneHref}
                      className="block text-surface-600 hover:text-site-accent transition-colors"
                    >
                      {phoneLabel}
                    </a>
                    <p className="text-surface-600">LINE : @298ickaf</p>
                    <a
                      href="mailto:moneyexchangethgroup@gmail.com"
                      className="text-surface-600"
                    >
                      E-mail : moneyexchangethgroup@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 space-y-3">
                <a
                  href={phoneHref}
                  className="block w-full py-3 rounded-xl bg-site-accent text-white text-sm font-semibold hover:bg-site-accent-hover transition-colors text-center"
                >
                  {callNowLabel}
                </a>
                <a
                  href="https://lin.ee/mGYJgia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 rounded-xl border border-site-accent text-site-accent text-sm font-semibold bg-white hover:bg-site-subtle transition-colors text-center"
                >
                  {t.branch.lineContact}
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 rounded-xl border border-site-accent text-site-accent text-sm font-semibold bg-white hover:bg-site-subtle transition-colors text-center"
                >
                  {t.branch.openMap}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
