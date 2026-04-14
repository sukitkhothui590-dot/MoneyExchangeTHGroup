"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SiteImage from "@/components/site/SiteImage";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchCurrencies } from "@/lib/api";
import { useLanguage, type Locale } from "@/lib/i18n";
import { currencyCodeToFlagCountry } from "@/lib/currencyFlagCountry";
import { getRatesSync } from "@/lib/mock/rates";
import HeaderAccountButtons from "@/components/layout/HeaderAccountButtons";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import type { CurrencyRate } from "@/lib/types/rate";
import { SITE_NAVBAR_LOGO_SRC } from "@/lib/siteLogo";

/** ความสูงแถบขาว (tier 2) — คงที่; โลโก้ใหญ่กว่านี้ได้โดยล้นออกด้านบน/ล่าง */
const NAVBAR_ROW_PX = 60;
/** ขนาดแสดงผลโลโก้ (ใหญ่กว่าแถบ — ไม่ดันความสูงแถบ) */
const NAVBAR_LOGO_PX = 92;

function NavbarLogoMark({
  priority = false,
  className,
}: {
  priority?: boolean;
  className?: string;
}) {
  return (
    <span
      className={[
        "relative inline-flex shrink-0 items-center justify-center overflow-visible",
        className ?? "",
      ].join(" ")}
      style={{
        width: NAVBAR_LOGO_PX,
        height: NAVBAR_ROW_PX,
      }}
    >
      <SiteImage
        src={SITE_NAVBAR_LOGO_SRC}
        alt="MoneyExchangeTHGroup"
        width={NAVBAR_LOGO_PX}
        height={NAVBAR_LOGO_PX}
        className="absolute left-1/2 top-1/2 object-contain"
        style={{
          width: NAVBAR_LOGO_PX,
          height: NAVBAR_LOGO_PX,
          maxWidth: NAVBAR_LOGO_PX,
          maxHeight: NAVBAR_LOGO_PX,
          transform: "translate(-50%, -50%)",
        }}
        priority={priority}
        bypassPlaceholder
      />
    </span>
  );
}

function useNavLinks() {
  const { t } = useLanguage();
  return [
    { key: "home", href: "/", label: t.nav.home, hasDropdown: false as const },
    {
      key: "rate",
      href: "/exchange-rate",
      label: t.nav.exchangeRate,
      hasDropdown: true as const,
      dropdownItems: [
        { href: "/exchange-rate", label: t.nav.exchangeRate },
        { href: "/trip-budget-guide", label: t.nav.tripBudget },
      ],
    },
    {
      key: "services",
      href: "/services",
      label: t.nav.services,
      hasDropdown: true as const,
      dropdownItems: [
        { href: "/spr-money-exchange", label: t.nav.sprExchange },
        { href: "/spr-money-transfer", label: t.nav.sprTransfer },
        { href: "/vip-foreign-exchange-room", label: t.nav.vipRoom },
      ],
    },
    {
      key: "bookQueue",
      href: "/customer/book",
      label: t.nav.bookQueue,
      hasDropdown: false as const,
    },
    { key: "news", href: "/news", label: t.nav.news, hasDropdown: false as const },
    {
      key: "contact",
      href: "/contact",
      label: t.nav.contact,
      hasDropdown: true as const,
      dropdownItems: [
        { href: "/contact", label: t.nav.contact },
        { href: "/about", label: t.nav.about },
        { href: "/faq", label: t.nav.faq },
      ],
    },
  ];
}

function formatRateNum(n: number): string {
  if (n >= 100) return n.toFixed(2);
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

function ChevronDown({ className = "w-3 h-3" }: { className?: string }) {
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

function PhoneIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
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
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function LineIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M24 10.304C24 4.614 18.627.2 12 .2S0 4.614 0 10.304c0 5.003 4.434 9.192 10.424 9.984.406.088.96.268 1.1.616.126.316.082.81.04 1.128l-.178 1.068c-.054.326-.254 1.276 1.118.696 1.372-.58 7.396-4.356 10.09-7.454C24.22 14.466 24 12.432 24 10.304zM8.004 13.08a.444.444 0 01-.442.442H4.758a.442.442 0 01-.442-.442V8.112c0-.244.198-.442.442-.442.244 0 .442.198.442.442v4.526h2.362c.244 0 .442.198.442.442zm1.662 0c0 .244-.198.442-.442.442a.444.444 0 01-.442-.442V8.112c0-.244.198-.442.442-.442.244 0 .442.198.442.442v4.968zm5.086 0c0 .194-.114.37-.292.448a.426.426 0 01-.15.028.44.44 0 01-.354-.18L11.37 10.2v2.88c0 .244-.198.442-.442.442a.444.444 0 01-.442-.442V8.112c0-.194.114-.37.292-.448a.438.438 0 01.504.152l2.586 3.176V8.112c0-.244.198-.442.442-.442.244 0 .442.198.442.442v4.968zm3.734-3.528a.444.444 0 01-.442.442h-1.386v.876h1.386c.244 0 .442.198.442.442s-.198.442-.442.442h-1.386v.876h1.386c.244 0 .442.198.442.442s-.198.442-.442.442H16.6a.442.442 0 01-.442-.442V8.112c0-.244.198-.442.442-.442h1.886c.244 0 .442.198.442.442s-.198.442-.442.442H17.04v.876h1.446c.244 0 .442.198.442.442z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function WeChatIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.68 4.025c-3.655 0-6.622 2.428-6.622 5.425 0 3 2.967 5.425 6.622 5.425.813 0 1.594-.114 2.318-.33a.706.706 0 01.585.08l1.556.91a.267.267 0 00.136.044.242.242 0 00.237-.241c0-.059-.023-.117-.039-.174l-.318-1.211a.483.483 0 01.174-.543c1.497-1.1 2.45-2.727 2.45-4.536 0-2.997-2.967-5.425-6.622-5.425h-.477zm-2.59 2.833c.525 0 .95.433.95.964a.957.957 0 01-.95.965.957.957 0 01-.95-.965c0-.531.425-.964.95-.964zm4.753 0c.524 0 .949.433.949.964a.957.957 0 01-.95.965.957.957 0 01-.949-.965c0-.531.425-.964.95-.964z" />
    </svg>
  );
}

function GlobeIcon({ className = "w-4 h-4" }: { className?: string }) {
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
        strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  );
}

const languages = [
  { code: "th", label: "ไทย", country: "th" },
  { code: "en", label: "English", country: "gb" },
  { code: "cn", label: "中文", country: "cn" },
] as const;

function FlagImg({ country, size = 20 }: { country: string; size?: number }) {
  const h = Math.round(size * 0.75);
  return (
    <SiteImage
      src={`https://flagcdn.com/w40/${country}.png`}
      alt={country.toUpperCase()}
      width={size}
      height={h}
      className="rounded-sm object-cover"
      style={{ width: size, height: h }}
      bypassPlaceholder
    />
  );
}

type NavLinkItem = ReturnType<typeof useNavLinks>[number];

function isNavLinkActive(pathname: string, link: NavLinkItem): boolean {
  if (link.key === "bookQueue") {
    return pathname.startsWith("/customer/book");
  }
  return pathname === link.href;
}

/** รายการในเมนูย่อยตรงกับหน้าปัจจุบัน */
function isNavDropdownItemActive(pathname: string, itemHref: string): boolean {
  if (itemHref === "/") return pathname === "/";
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}

const navDropdownPanelClass =
  "rounded-xl border border-border/90 bg-white p-1 shadow-lg shadow-surface-900/[0.06] ring-1 ring-black/[0.03] min-w-[13.5rem] max-w-[min(20rem,calc(100vw-2rem))]";

function navDropdownItemClass(active: boolean) {
  return [
    "block rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
    active
      ? "bg-[var(--site-subtle)] font-medium text-site-accent"
      : "text-surface-700 hover:bg-surface-50",
  ].join(" ");
}

const langDropdownPanelClass =
  "rounded-xl border border-border/90 bg-white p-1 shadow-lg shadow-surface-900/[0.06] ring-1 ring-black/[0.03]";

export default function Header() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();
  const authUser = useAuthUser();
  const navLinks = useNavLinks();
  const leftNav = navLinks.slice(0, 3);
  const rightNav = navLinks.slice(3);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
  const [openMobileDropdownKey, setOpenMobileDropdownKey] = useState<
    string | null
  >(null);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const mobileLangRef = useRef<HTMLDivElement>(null);
  const currentLang = languages.find((l) => l.code === locale)!;
  const [rateStrip, setRateStrip] = useState<CurrencyRate[]>(
    () => getRatesSync().rates,
  );

  useEffect(() => {
    let mounted = true;

    const loadRates = async () => {
      const live = await fetchCurrencies(locale);
      if (!mounted) return;
      if (live.rates.length > 0) {
        setRateStrip(live.rates);
      }
    };

    void loadRates();
    const timer = window.setInterval(() => {
      void loadRates();
    }, 30_000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [locale]);

  const rateMarqueeItems = (rates: CurrencyRate[], keyPrefix: string) =>
    rates.map((r, i) => (
      <span
        key={`${keyPrefix}-${r.code}-${i}`}
        className="inline-flex items-center gap-2 whitespace-nowrap text-[11px] sm:text-xs font-medium tabular-nums"
      >
        <FlagImg country={currencyCodeToFlagCountry(r.code)} size={18} />
        <span className="font-bold text-white">{r.code}</span>
        <span className="text-white/90">{formatRateNum(r.buy)}</span>
        <span className="text-white/50">/</span>
        <span className="text-white/90">{formatRateNum(r.sell)}</span>
      </span>
    ));

  useEffect(() => {
    if (!langOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        langRef.current && !langRef.current.contains(target) &&
        langPanelRef.current && !langPanelRef.current.contains(target)
      ) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langOpen]);

  useEffect(() => {
    if (!mobileLangOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileLangRef.current &&
        !mobileLangRef.current.contains(e.target as Node)
      ) {
        setMobileLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileLangOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdownKey(null);
    setOpenMobileDropdownKey(null);
    setLangOpen(false);
    setMobileLangOpen(false);
  }, [pathname]);

  const navClass = (active: boolean) =>
    [
      "uppercase tracking-[0.12em] text-[11px] xl:text-xs font-semibold transition-colors duration-200 border-b-2 pb-0.5",
      active
        ? "text-site-accent border-site-accent"
        : "text-surface-700 border-transparent hover:text-site-accent hover:border-site-accent/40",
    ].join(" ");

  function renderDesktopLink(
    link: NavLinkItem,
    dropdownAlign: "left" | "right",
  ) {
    const isActive = isNavLinkActive(pathname, link);
    const isOpen = openDropdownKey === link.key;
    const dropPos =
      dropdownAlign === "right"
        ? "absolute right-0 top-full pt-1 w-52 z-50"
        : "absolute left-0 top-full pt-1 w-52 z-50";

    if (!link.hasDropdown) {
      return (
        <Link
          key={link.key}
          href={link.href}
          className="inline-flex items-center px-2.5 xl:px-3 py-2 min-h-[44px]"
        >
          <span className={navClass(isActive)}>{link.label}</span>
        </Link>
      );
    }

    return (
      <div
        key={link.key}
        className="relative inline-flex items-center"
        onMouseEnter={() => setOpenDropdownKey(link.key)}
        onMouseLeave={() => setOpenDropdownKey(null)}
      >
        <button
          type="button"
          className={[
            "flex items-center gap-1 px-2.5 xl:px-3 py-2 min-h-[44px] rounded-lg transition-colors duration-150",
            isOpen ? "bg-site-subtle/70 ring-1 ring-site-accent/20" : "hover:bg-surface-50/90",
          ].join(" ")}
          onClick={() => setOpenDropdownKey(isOpen ? null : link.key)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className={navClass(isActive)}>{link.label}</span>
          <ChevronDown
            className={[
              "w-3 h-3 shrink-0 transition-transform duration-200",
              isOpen
                ? "rotate-180 text-site-accent"
                : "text-surface-500",
            ].join(" ")}
          />
        </button>
        {link.dropdownItems && isOpen && (
          <div className={dropPos}>
            <div className={navDropdownPanelClass}>
              {link.dropdownItems.map((item) => {
                const itemActive = isNavDropdownItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navDropdownItemClass(itemActive)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  const langBtnRef = useRef<HTMLButtonElement>(null);
  const langPanelRef = useRef<HTMLDivElement>(null);
  const [langPanelPos, setLangPanelPos] = useState<{
    top: number;
    right: number;
  } | null>(null);

  const updateLangPos = useCallback(() => {
    const btn = langBtnRef.current;
    if (!btn) {
      setLangPanelPos(null);
      return;
    }
    const rect = btn.getBoundingClientRect();
    setLangPanelPos({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    updateLangPos();
    window.addEventListener("scroll", updateLangPos, true);
    window.addEventListener("resize", updateLangPos);
    return () => {
      window.removeEventListener("scroll", updateLangPos, true);
      window.removeEventListener("resize", updateLangPos);
    };
  }, [langOpen, updateLangPos]);

  const langPortalPanel =
    langOpen && langPanelPos
      ? createPortal(
          <div
            ref={langPanelRef}
            style={{
              position: "fixed",
              top: langPanelPos.top,
              right: langPanelPos.right,
              width: 176,
              zIndex: 9999,
            }}
          >
            <div className={`${langDropdownPanelClass} w-full`} role="listbox">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={locale === l.code}
                  onClick={() => {
                    setLocale(l.code as Locale);
                    setLangOpen(false);
                  }}
                  className={[
                    "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150",
                    locale === l.code
                      ? "bg-[var(--site-subtle)] font-medium text-site-accent"
                      : "text-surface-700 hover:bg-surface-50",
                  ].join(" ")}
                >
                  <FlagImg country={l.country} size={22} />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )
      : null;

  const langDropdown = () => (
    <div className="relative" ref={langRef}>
      <button
        ref={langBtnRef}
        type="button"
        onClick={() => setLangOpen((v) => !v)}
        className={[
          "flex items-center gap-1.5 rounded-full border border-border/90 bg-white px-2.5 py-1.5 text-[11px] font-medium text-surface-700 shadow-sm transition-all duration-150",
          langOpen
            ? "ring-2 ring-white/40 bg-white/95"
            : "hover:bg-surface-50 hover:border-surface-300",
        ].join(" ")}
        aria-expanded={langOpen}
        aria-haspopup="listbox"
      >
        <FlagImg country={currentLang.country} size={18} />
        <span className="hidden sm:inline">{currentLang.label}</span>
        <ChevronDown
          className={[
            "w-2.5 h-2.5 transition-transform duration-200 shrink-0",
            langOpen ? "rotate-180 text-site-accent" : "text-surface-500",
          ].join(" ")}
        />
      </button>
    </div>
  );

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50 transition-shadow duration-300",
          scrolled ? "shadow-md" : "",
        ].join(" ")}
      >
        {/* Tier 1 — accent utility bar (swapped with rate strip) */}
        <div className="bg-site-accent text-white relative z-30 border-b border-white/15">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1 flex items-center justify-between gap-3">
            <a
              href="tel:026113185"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] text-white/90 hover:text-white shrink-0"
            >
              <PhoneIcon className="w-3.5 h-3.5" />
              <span className="font-semibold tabular-nums">02-6113185</span>
            </a>
            <div className="flex flex-1 justify-center items-center gap-5 sm:gap-6">
              <a
                href="https://lin.ee/mGYJgia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LINE"
                className="text-white/85 hover:text-white transition-colors"
              >
                <LineIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-white/85 hover:text-white transition-colors"
              >
                <WhatsAppIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WeChat"
                className="text-white/85 hover:text-white transition-colors"
              >
                <WeChatIcon className="w-[18px] h-[18px]" />
              </a>
            </div>
            <div className="hidden lg:block shrink-0">{langDropdown()}</div>
          </div>
        </div>

        {/* Tier 2 — white: logo center, menus left & right */}
        {/* z สูงกว่า tier 1 เล็กน้อย เพื่อให้โลโก้ที่ล้นขึ้นไปทาบแถบแดงได้ */}
        <div className="bg-surface-0 border-b border-border relative z-[35] overflow-visible">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 overflow-visible">
            {/* Mobile row */}
            <div className="flex lg:hidden items-center justify-between h-[60px] gap-2 overflow-visible">
              <button
                type="button"
                className="p-2 rounded-lg text-site-accent hover:bg-site-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-site-accent/30"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? t.aria.closeMenu : t.aria.openMenu}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
              <Link
                href="/"
                aria-label={t.aria.backHome}
                className="relative z-10 flex min-w-0 flex-1 items-center justify-center overflow-visible"
              >
                <NavbarLogoMark priority />
              </Link>
              <div className="relative shrink-0" ref={mobileLangRef}>
                <button
                  type="button"
                  onClick={() => setMobileLangOpen((v) => !v)}
                  aria-label="Language"
                  aria-expanded={mobileLangOpen}
                  className={[
                    "inline-flex items-center gap-1 rounded-full border border-border/90 bg-white px-2 py-2 text-[12px] shadow-sm transition-all",
                    mobileLangOpen
                      ? "ring-2 ring-site-accent/25 border-site-accent/30"
                      : "hover:bg-surface-50",
                  ].join(" ")}
                >
                  <FlagImg country={currentLang.country} size={18} />
                  <ChevronDown
                    className={[
                      "w-3 h-3 transition-transform duration-200",
                      mobileLangOpen
                        ? "rotate-180 text-site-accent"
                        : "text-surface-500",
                    ].join(" ")}
                  />
                </button>
                {mobileLangOpen && (
                  <div className="absolute right-0 top-full pt-2 w-44 z-[70]">
                    <div className={`${langDropdownPanelClass} w-full overflow-hidden`}>
                      {languages.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            setLocale(l.code as Locale);
                            setMobileLangOpen(false);
                          }}
                          className={[
                            "w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
                            locale === l.code
                              ? "bg-[var(--site-subtle)] font-medium text-site-accent"
                              : "text-surface-700 hover:bg-surface-50",
                          ].join(" ")}
                        >
                          <FlagImg country={l.country} size={20} />
                          <span>{l.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: one flex row so left | logo | right share the same vertical center */}
            <div className="hidden lg:flex lg:h-[60px] lg:min-h-0 lg:items-center lg:justify-between lg:gap-4 xl:gap-8 lg:py-0 overflow-visible">
              <nav
                className="flex flex-1 min-w-0 flex-wrap items-center justify-end gap-0.5"
                aria-label={t.aria.mainNav}
              >
                {leftNav.map((link) => renderDesktopLink(link, "left"))}
              </nav>

              <Link
                href="/"
                aria-label={t.aria.backHome}
                className="relative z-10 flex shrink-0 items-center justify-center overflow-visible min-w-[120px] max-w-[220px] lg:h-[60px]"
              >
                <NavbarLogoMark priority />
              </Link>

              <div className="flex flex-1 min-w-0 flex-wrap items-center justify-start gap-2 xl:gap-3">
                <nav className="flex flex-wrap items-center justify-start gap-0.5">
                  {rightNav.map((link) => renderDesktopLink(link, "right"))}
                </nav>
                <div aria-label={t.aria.accountNav}>
                  <HeaderAccountButtons user={authUser} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 3 — dark bar: scrolling live rates + flags (swapped with top bar) */}
        <div className="bg-[#1a1a1a] text-white relative z-10 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex items-stretch min-h-[40px]">
            <div className="hidden sm:flex shrink-0 items-center px-3 lg:px-4 relative pr-5 lg:pr-6">
              <span className="text-[10px] uppercase tracking-wider text-white/70 font-semibold whitespace-nowrap max-w-[7rem] sm:max-w-none leading-tight">
                {t.header.liveRates}
              </span>
              <span
                className="pointer-events-none absolute right-0 top-[14%] bottom-[14%] w-px bg-gradient-to-b from-transparent via-white/16 to-transparent"
                aria-hidden
              />
            </div>
            <div
              className="flex-1 min-w-0 overflow-hidden py-2 px-3 sm:px-0 sm:pr-2"
              aria-label={t.header.liveRates}
            >
              <div className="inline-flex min-w-max animate-rate-marquee">
                <div className="flex items-center gap-x-5 sm:gap-x-6 pr-10 shrink-0">
                  {rateMarqueeItems(rateStrip, "a")}
                </div>
                <div
                  className="flex items-center gap-x-5 sm:gap-x-6 pr-10 shrink-0"
                  aria-hidden
                >
                  {rateMarqueeItems(rateStrip, "b")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {langPortalPanel}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="absolute top-0 right-0 w-[80vw] max-w-72 h-full bg-surface-0 shadow-xl flex flex-col animate-[slideInRight_0.3s_ease-out]"
            aria-label={t.aria.mobileNav}
          >
            <div className="flex items-center justify-between px-5 py-4 bg-site-accent overflow-visible">
              <div className="flex min-w-0 items-center overflow-visible">
                <NavbarLogoMark />
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 shrink-0"
                aria-label={t.aria.closeMenu}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = isNavLinkActive(pathname, link);
                const isOpen = openMobileDropdownKey === link.key;

                if (!link.hasDropdown) {
                  return (
                    <Link
                      key={link.key}
                      href={link.href}
                      className={[
                        "flex items-center px-4 py-3 rounded-lg text-base transition-colors duration-200 uppercase tracking-wide font-semibold text-sm",
                        isActive
                          ? "bg-site-accent/10 text-site-accent"
                          : "text-surface-700 hover:bg-surface-50",
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                  );
                }

                return (
                  <div key={link.key} className="space-y-1">
                    <button
                      type="button"
                      className={[
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold uppercase tracking-wide text-sm transition-colors duration-150",
                        isOpen
                          ? "bg-site-subtle/80 text-site-accent ring-1 ring-site-accent/15"
                          : "text-surface-700 hover:bg-surface-50",
                      ].join(" ")}
                      onClick={() =>
                        setOpenMobileDropdownKey(isOpen ? null : link.key)
                      }
                      aria-expanded={isOpen}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={[
                          "w-3.5 h-3.5 shrink-0 transition-transform duration-200",
                          isOpen
                            ? "rotate-180 text-site-accent"
                            : "text-surface-500",
                        ].join(" ")}
                      />
                    </button>
                    {isOpen && link.dropdownItems && (
                      <div className="ml-3 pl-3 border-l-2 border-site-accent/25 space-y-0.5">
                        {link.dropdownItems.map((item) => {
                          const itemActive = isNavDropdownItemActive(
                            pathname,
                            item.href,
                          );
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={[
                                "block px-3 py-2 rounded-lg text-sm transition-colors duration-150",
                                itemActive
                                  ? "bg-site-subtle text-site-accent font-medium"
                                  : "text-surface-600 hover:bg-surface-50",
                              ].join(" ")}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className="px-4 py-3 flex flex-wrap gap-2 border-t border-border justify-center"
              aria-label={t.aria.accountNav}
              onClick={() => setMobileOpen(false)}
            >
              <HeaderAccountButtons user={authUser} />
            </div>

            <div className="px-4 py-3 border-t border-border space-y-3">
              {!authUser && (
                <Link
                  href="/customer"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-3 rounded-xl bg-site-accent text-white font-bold uppercase tracking-wider text-sm"
                >
                  {t.header.bookCta}
                </Link>
              )}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-surface-500 mb-1.5 flex items-center gap-1">
                  <GlobeIcon className="w-3.5 h-3.5" />
                  <span>Language</span>
                </p>
                <div className="flex items-center gap-1.5">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLocale(l.code as Locale)}
                      className={[
                        "flex-1 flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-medium border",
                        locale === l.code
                          ? "bg-site-accent text-white border-site-accent"
                          : "bg-white text-surface-700 border-border hover:bg-surface-50",
                      ].join(" ")}
                    >
                      <FlagImg country={l.country} size={16} />
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://lin.ee/mGYJgia"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LINE"
                  className="text-site-accent"
                >
                  <LineIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="text-site-accent"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WeChat"
                  className="text-site-accent"
                >
                  <WeChatIcon className="w-5 h-5" />
                </a>
              </div>
              <a
                href="tel:026113185"
                className="inline-flex items-center gap-1.5 text-sm text-site-accent font-medium"
              >
                <PhoneIcon className="w-3.5 h-3.5" />
                02-6113185
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
