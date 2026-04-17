"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";
import type { User } from "@supabase/supabase-js";

type Props = {
  user: User | null;
  /** ข้อความภาษาอังกฤษยาว — ลด padding/ตัวอักษรให้พอดีแถบเดียว */
  compact?: boolean;
};

export default function HeaderAccountButtons({ user, compact }: Props) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const btnBase = compact
    ? "text-[9px] xl:text-[10px] tracking-[0.06em] px-2 py-1.5"
    : "text-[10px] xl:text-[11px] tracking-[0.1em] px-3 py-1.5";

  if (user) {
    return (
      <div
        className={[
          "flex items-center border-l border-border shrink-0",
          compact ? "gap-1 pl-1.5 xl:pl-2" : "gap-1.5 sm:gap-2 pl-2 xl:pl-3",
        ].join(" ")}
      >
        <Link
          href="/customer/profile"
          className={[
            "rounded-full border font-semibold uppercase transition-colors whitespace-nowrap",
            btnBase,
            pathname === "/customer/profile" || pathname.startsWith("/customer/profile")
              ? "border-site-accent bg-site-subtle text-site-accent"
              : "border-site-accent/45 text-site-accent hover:bg-site-subtle",
          ].join(" ")}
        >
          {t.portal.myProfile}
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className={[
            "rounded-full border border-border bg-white font-semibold uppercase text-surface-700 whitespace-nowrap shadow-sm hover:bg-surface-50 transition-colors",
            compact ? "px-2 py-1.5 text-[9px] xl:text-[10px] tracking-[0.06em]" : "px-2.5 sm:px-3 py-1.5 text-[10px] xl:text-[11px] tracking-[0.1em]",
          ].join(" ")}
        >
          {t.portal.signOut}
        </button>
      </div>
    );
  }

  return (
    <div
      className={[
        "flex items-center border-l border-border shrink-0",
        compact ? "gap-1 pl-1.5 xl:pl-2" : "gap-2 pl-2 xl:pl-3",
      ].join(" ")}
    >
      <Link
        href="/customer/register"
        className={[
          "rounded-full border font-semibold uppercase transition-colors whitespace-nowrap",
          btnBase,
          pathname === "/customer/register"
            ? "border-site-accent bg-site-subtle text-site-accent"
            : "border-site-accent/45 text-site-accent hover:bg-site-subtle",
        ].join(" ")}
      >
        {t.header.register}
      </Link>
      <Link
        href="/customer/login"
        className={[
          "rounded-full font-semibold uppercase transition-colors whitespace-nowrap text-white",
          compact
            ? "px-2 py-1.5 text-[9px] xl:text-[10px] tracking-[0.06em]"
            : "px-3 py-1.5 text-[10px] xl:text-[11px] tracking-[0.1em]",
          pathname === "/customer/login"
            ? "bg-site-accent-hover"
            : "bg-site-accent hover:bg-site-accent-hover",
        ].join(" ")}
      >
        {t.header.login}
      </Link>
    </div>
  );
}
