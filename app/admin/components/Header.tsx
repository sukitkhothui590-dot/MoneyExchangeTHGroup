"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import AdminLangSwitcher from "./AdminLangSwitcher";
import { useAdminSidebarOptional } from "./AdminSidebarContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const router = useRouter();
  const { profile } = useUser();
  const { t } = useAdminLanguage();
  const sidebarCtx = useAdminSidebarOptional();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const displayName = profile?.name || t.header.adminUser;
  const initials = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border/80 bg-white/85 backdrop-blur-md backdrop-saturate-150 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 shadow-sm shadow-black/[0.03]">
      <div className="flex items-center gap-3 min-w-0">
        {sidebarCtx ? (
          <button
            type="button"
            onClick={sidebarCtx.toggleDesktopSidebar}
            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-surface-100/90 transition-colors cursor-pointer flex-shrink-0"
            aria-label={
              sidebarCtx.desktopCollapsed
                ? t.sidebar.toggleShow
                : t.sidebar.toggleHide
            }
            title={
              sidebarCtx.desktopCollapsed
                ? t.sidebar.toggleShow
                : t.sidebar.toggleHide
            }
          >
            {sidebarCtx.desktopCollapsed ? (
              <ChevronDoubleRightIcon className="w-5 h-5" />
            ) : (
              <ChevronDoubleLeftIcon className="w-5 h-5" />
            )}
          </button>
        ) : null}
        {/* Hamburger — mobile only */}
        <button
          type="button"
          data-menu-toggle
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-surface-100/90 transition-colors cursor-pointer flex-shrink-0"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-foreground leading-tight truncate tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted mt-0.5 truncate hidden sm:block max-w-2xl leading-snug">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:block">
          <AdminLangSwitcher />
        </div>
        {actions && (
          <>
            <div className="hidden sm:contents">{actions}</div>
            <div className="hidden sm:block w-px h-6 bg-border/90 mx-1" />
          </>
        )}
        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
            }}
            className="flex items-center gap-2 h-9 pl-1.5 pr-2 rounded-xl hover:bg-surface-100/90 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center shadow-sm ring-2 ring-white">
              <span className="text-white text-[11px] font-semibold">
                {initials}
              </span>
            </div>
            <span className="text-xs font-medium text-foreground hidden sm:block">
              {displayName}
            </span>
            <ChevronDownIcon className="w-3 h-3 text-muted hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white/95 backdrop-blur-sm border border-border/80 rounded-xl shadow-lg shadow-black/5 overflow-hidden z-50">
              <Link
                href="/admin/dashboard/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-foreground hover:bg-surface transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <UserCircleIcon className="w-4 h-4 text-muted" />
                โปรไฟล์
              </Link>
              <div className="border-t border-border" />
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-danger hover:bg-red-50 transition-colors w-full cursor-pointer"
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                {t.header.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
