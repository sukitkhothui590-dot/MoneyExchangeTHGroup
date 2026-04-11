"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";
import type { User } from "@supabase/supabase-js";

type Props = {
  user: User | null;
};

export default function HeaderAccountButtons({ user }: Props) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 pl-2 xl:pl-3 border-l border-border shrink-0">
        <Link
          href="/customer/profile"
          className={[
            "rounded-full border px-3 py-1.5 text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors whitespace-nowrap",
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
          className="rounded-full border border-border bg-white px-2.5 sm:px-3 py-1.5 text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.1em] text-surface-700 whitespace-nowrap shadow-sm hover:bg-surface-50 transition-colors"
        >
          {t.portal.signOut}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 pl-2 xl:pl-3 border-l border-border shrink-0">
      <Link
        href="/customer/register"
        className={[
          "rounded-full border px-3 py-1.5 text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors whitespace-nowrap",
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
          "rounded-full px-3 py-1.5 text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors whitespace-nowrap text-white",
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
