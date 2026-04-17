"use client";

import Link from "next/link";
import SiteImage from "@/components/site/SiteImage";
import { usePathname } from "next/navigation";
import {
  Squares2X2Icon,
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
  ServerStackIcon,
  UsersIcon,
  CalendarDaysIcon,
  ArrowsRightLeftIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import { SITE_LOGO_ON_DARK_CLASS, SITE_LOGO_SRC } from "@/lib/siteLogo";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import { useAdminSidebar } from "./AdminSidebarContext";

const navConfig = [
  { key: "dashboard" as const, href: "/admin/dashboard", icon: Squares2X2Icon },
  { key: "customers" as const, href: "/admin/dashboard/customers", icon: UsersIcon },
  { key: "bookings" as const, href: "/admin/dashboard/bookings", icon: CalendarDaysIcon },
  { key: "transactions" as const, href: "/admin/dashboard/transactions", icon: ArrowsRightLeftIcon },
  { key: "reports" as const, href: "/admin/dashboard/reports", icon: PresentationChartLineIcon },
  { key: "rates" as const, href: "/admin/dashboard/rates", icon: ChartBarIcon },
  { key: "branches" as const, href: "/admin/dashboard/branches", icon: BuildingStorefrontIcon },
  { key: "articles" as const, href: "/admin/dashboard/articles", icon: DocumentTextIcon },
  { key: "adminUsers" as const, href: "/admin/dashboard/admin-users", icon: ShieldCheckIcon },
  { key: "systemStatus" as const, href: "/admin/dashboard/system-status", icon: ServerStackIcon },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function SidebarPanel({
  collapsed,
  onClose,
}: {
  collapsed: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useAdminLanguage();

  return (
    <aside className="w-full min-h-full min-w-0 border-r border-brand-dark/40 bg-gradient-to-b from-brand via-brand to-brand-dark flex flex-col shadow-[4px_0_24px_-8px_rgba(0,0,0,0.2)]">
      <div
        className={[
          "relative h-16 flex items-center border-b border-white/10 shrink-0",
          collapsed ? "justify-center px-2" : "justify-center px-4",
        ].join(" ")}
      >
        <Link
          href="/admin/dashboard"
          className={[
            "flex min-w-0 items-center max-w-full",
            collapsed ? "justify-center" : "justify-center",
          ].join(" ")}
          title={collapsed ? "Dashboard" : undefined}
        >
          <SiteImage
            src={SITE_LOGO_SRC}
            alt="MoneyExchangeTHGroup"
            width={collapsed ? 40 : 130}
            height={collapsed ? 40 : 44}
            className={`object-contain object-center shrink-0 ${SITE_LOGO_ON_DARK_CLASS} ${
              collapsed ? "max-h-10 max-w-10 w-10 h-10 rounded-lg" : "max-h-10 w-auto max-w-[160px]"
            }`}
            bypassPlaceholder
          />
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-white/85 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 px-2 py-4 overflow-y-auto scrollbar-hide min-h-0">
        {!collapsed ? (
          <p className="text-[10px] font-semibold text-white/45 uppercase tracking-wider px-3 mb-2">
            {t.sidebar.mainMenu}
          </p>
        ) : (
          <div className="h-px w-6 mx-auto mb-2 bg-white/15 rounded-full" aria-hidden />
        )}
        <div className="space-y-1">
          {navConfig.map((item) => {
            const label = t.sidebar.nav[item.key];
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === "/admin/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? label : undefined}
                className={[
                  "flex items-center rounded-xl text-[13px] font-medium transition-all duration-200",
                  collapsed
                    ? "justify-center px-2 py-2.5"
                    : "gap-2.5 px-3 py-2.5",
                  isActive
                    ? "bg-white text-brand shadow-md shadow-black/15"
                    : collapsed
                      ? "text-white/88 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                      : "text-white/88 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 hover:translate-x-0.5",
                ].join(" ")}
              >
                <item.icon
                  className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-brand" : "text-white/90"}`}
                />
                {!collapsed ? <span className="truncate min-w-0">{label}</span> : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { desktopCollapsed } = useAdminSidebar();

  return (
    <>
      <div
        className={[
          "hidden lg:flex flex-shrink-0 min-w-0 overflow-hidden transition-[width] duration-200 ease-out",
          desktopCollapsed ? "lg:w-16" : "lg:w-[240px]",
        ].join(" ")}
      >
        <SidebarPanel collapsed={desktopCollapsed} />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-[240px] h-full shadow-xl animate-slide-in-left">
            <SidebarPanel collapsed={false} onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
}
