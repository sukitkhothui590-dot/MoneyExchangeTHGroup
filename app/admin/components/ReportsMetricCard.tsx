"use client";

import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

type Props = {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  detailHref?: string;
  detailAriaLabel?: string;
  className?: string;
};

export default function ReportsMetricCard({
  label,
  icon,
  children,
  detailHref,
  detailAriaLabel,
  className = "",
}: Props) {
  return (
    <div
      className={`relative flex min-h-[148px] flex-col justify-between rounded-3xl border border-black/[0.06] bg-white p-5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.1)] transition-[box-shadow,transform] duration-300 motion-safe:hover:-translate-y-0.5 hover:shadow-[0_14px_44px_-14px_rgba(0,0,0,0.14)] sm:p-6 ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-subtle via-white to-brand-subtle/70 text-brand shadow-inner ring-1 ring-brand/15">
          {icon}
        </div>
        {detailHref ? (
          <Link
            href={detailHref}
            className="rounded-full border border-border/60 p-2 text-muted transition-colors hover:border-brand/35 hover:bg-brand-subtle/70 hover:text-brand"
            aria-label={detailAriaLabel ?? "Open detail"}
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <div className="mt-5 min-w-0">
        <p className="text-sm font-medium leading-snug text-muted">{label}</p>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
