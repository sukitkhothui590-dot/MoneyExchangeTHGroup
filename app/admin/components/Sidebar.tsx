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
import { SITE_LOGO_SRC } from "@/lib/siteLogo";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import AdminLangSwitcher from "./AdminLangSwitcher";

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

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useAdminLanguage();

  const sidebarContent = (
    <aside className="w-[240px] min-h-screen border-r border-border/80 bg-gradient-to-b from-white via-white to-surface-50 flex flex-col shadow-[4px_0_24px_-8px_rgba(0,0,0,0.06)]">
      <div className="h-16 flex items-center justify-between gap-2 px-4 border-b border-border/70">
        <Link href="/admin/dashboard" className="min-w-0 flex-1">
          <SiteImage
            src={SITE_LOGO_SRC}
            alt="MoneyExchangeTHGroup"
            width={130}
            height={44}
            className="object-contain object-left max-h-10 w-auto max-w-[160px]"
            bypassPlaceholder
          />
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 pt-3 pb-2 border-b border-border/70">
        <AdminLangSwitcher className="w-full justify-center" />
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted/60 uppercase tracking-wider px-3 mb-2">
          {t.sidebar.mainMenu}
        </p>
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
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand text-white shadow-md shadow-brand/25"
                    : "text-muted hover:text-foreground hover:bg-white/80 border border-transparent hover:border-border/60 hover:shadow-sm hover:translate-x-0.5"
                }`}
              >
                <item.icon
                  className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-white" : ""}`}
                />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block flex-shrink-0">{sidebarContent}</div>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-[240px] h-full shadow-xl animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
