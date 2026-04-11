"use client";

import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

export default function ReportSectionCard({ title, action, children }: Props) {
  return (
    <section className="flex flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_8px_32px_-12px_rgba(0,0,0,0.09)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-gradient-to-r from-white via-surface-50/80 to-brand-subtle/25 px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
