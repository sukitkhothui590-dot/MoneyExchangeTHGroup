"use client";

import React from "react";
import SiteImage from "@/components/site/SiteImage";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { SITE_LOGO_SRC } from "@/lib/siteLogo";

function SocialIcon({ children, href = "#", label }: { children: React.ReactNode; href?: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-lg border border-white/40 bg-site-accent flex items-center justify-center text-white hover:bg-site-accent-hover transition-colors"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const { t } = useLanguage();

  const sitemapLinks = [
    { href: "/", label: t.nav.home },
    { href: "/contact", label: t.footer.allBranches },
    { href: "/news", label: t.nav.news },
    { href: "/contact", label: t.nav.contact },
  ];
  const exchangeLinks = [
    { href: "/exchange-rate", label: t.footer.exchangeRate },
    { href: "/trip-budget-guide", label: t.footer.tripBudget },
  ];
  const serviceLinks = [
    { href: "/spr-money-exchange", label: t.nav.sprExchange },
    { href: "/spr-money-transfer", label: t.nav.sprTransfer },
    { href: "/vip-foreign-exchange-room", label: t.nav.vipRoom },
  ];
  const contactLinks = [
    { href: "/about", label: t.footer.aboutUs },
    { href: "/faq", label: t.footer.faq },
    { href: "#", label: t.footer.terms },
  ];

  return (
    <footer>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-col items-start gap-2 mb-4">
                <Link href="/" className="block max-w-full" aria-label={t.aria.backHome}>
                  <SiteImage
                    src={SITE_LOGO_SRC}
                    alt="MoneyExchangeTHGroup"
                    width={200}
                    height={200}
                    className="h-28 w-auto max-w-[220px] object-contain object-left"
                    bypassPlaceholder
                  />
                </Link>
                <div>
                  <div className="text-surface-700 font-bold text-base">
                    MoneyExchangeTHGroup
                  </div>
                  <div className="text-surface-700/70 text-xs">
                    {t.header.currencyExchange}
                  </div>
                </div>
              </div>
              <p className="text-sm text-surface-700/80 leading-relaxed mb-3">
                {t.footer.address}
              </p>
              <div className="space-y-1.5 text-sm text-surface-700/80 mb-5">
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <a
                    href="tel:026113185"
                    className="hover:text-site-accent transition-colors"
                  >
                    02-6113185
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span>✉️</span>
                  <a href="mailto:moneyexchangethgroup@gmail.com" className="hover:text-site-accent transition-colors">
                    moneyexchangethgroup@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-surface-700 mb-4">{t.footer.sitemap}</h3>
              <ul className="space-y-2.5">
                {sitemapLinks.map((link, i) => (
                  <li key={`${link.href}-${i}`}>
                    <Link href={link.href} className="text-sm text-surface-700/80 hover:text-site-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-surface-700 mb-4">{t.footer.exchangeRate}</h3>
              <ul className="space-y-2.5">
                {exchangeLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm text-surface-700/80 hover:text-site-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-surface-700 mb-4">{t.footer.ourServices}</h3>
              <ul className="space-y-2.5">
                {serviceLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm text-surface-700/80 hover:text-site-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-surface-700 mb-4">{t.footer.contactUs}</h3>
              <ul className="space-y-2.5">
                {contactLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm text-surface-700/80 hover:text-site-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
          
            </div>
          </div>
        </div>
      </div>

      <div className="bg-site-accent">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white text-center md:text-left">
              {t.footer.copyright}
            </p>
            <div className="flex items-center gap-2">
              <SocialIcon href="https://lin.ee/mGYJgia" label="LINE">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 10.304C24 4.614 18.627.2 12 .2S0 4.614 0 10.304c0 5.003 4.434 9.192 10.424 9.984.406.088.96.268 1.1.616.126.316.082.81.04 1.128l-.178 1.068c-.054.326-.254 1.276 1.118.696 1.372-.58 7.396-4.356 10.09-7.454C24.22 14.466 24 12.432 24 10.304z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://www.facebook.com/profile.php?id=61585201603842" label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </SocialIcon>
              
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
